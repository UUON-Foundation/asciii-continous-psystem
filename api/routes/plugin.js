'use strict';
// Plugin / Connector manifest endpoints
// These make the engine connectable from Claude, MCP, OpenAI plugins, and any external system
// Phillip Aguilar Ruiz III / UUON Foundation Inc. / SAL-1.0
const express = require('express');
const router  = express.Router();

// MCP-style manifest — for Claude / AI agent integration
router.get('/manifest', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    schema_version: 'v1',
    name_for_human: 'ASCIII Continuous Psystem',
    name_for_model: 'asciii_psystem',
    description_for_human: 'Renders any system state as a character-space field with provenance. Returns plain-text frames and Lyapunov exponent.',
    description_for_model: 'Use this to render numerical node/field state as an ASCIII character frame. Also returns Lyapunov chaos exponent and phase state. Post nodes with energy values, receive a text frame and temporal analysis.',
    auth: { type: 'none' },
    api: { type: 'openapi', url: `${base}/v1/plugin/openapi.json` },
    logo_url: `${base}/v1/plugin/logo.png`,
    contact_email: 'phi1@uuonfoundation.com',
    legal_info_url: 'https://uuon.world',
  });
});

// OpenAPI spec — for REST connector integration
router.get('/openapi.json', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({
    openapi: '3.0.1',
    info: {
      title: 'ASCIII Continuous Psystem API',
      version: '1.0.0',
      description: 'Character-space field rendering for the clouud biological OS',
      contact: { name:'Phillip Aguilar Ruiz III', email:'phi1@uuonfoundation.com' },
      license: { name:'SAL-1.0', url:'https://uuon.world' },
    },
    servers: [{ url: base }],
    paths: {
      '/v1/engines/asciii/render': {
        post: {
          operationId: 'renderField',
          summary: 'Render numerical state as an ASCIII character-space frame',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: {
              type:'object',
              properties: {
                mode:   { type:'string', enum:['field','variance','delta','menger','basin'], default:'field' },
                nodes:  { type:'array', items:{ type:'object', properties:{ x:{type:'number'}, y:{type:'number'}, E:{ type:'object', properties:{ value:{type:'number'} } } } } },
                params: { type:'object', properties:{ tick:{type:'integer'}, resolution:{type:'integer'}, frequency:{type:'number'}, density:{type:'number'}, palette:{type:'string'} } },
                words:  { type:'array', items:{type:'string'} },
              },
            }}},
          },
          responses: {
            '200': { description:'ASCIII frame + temporal analysis', content:{ 'application/json':{ schema:{
              type:'object',
              properties:{
                frame:     {type:'string', description:'Plain-text ASCIII field frame'},
                lyapunov:  {type:'number', description:'Lyapunov exponent — positive=chaos, negative=order'},
                phase:     {type:'string', enum:['CHAOS','ORDER','EDGE']},
                tick:      {type:'integer'},
                provenance:{type:'object'},
              },
            }}}},
          },
        },
      },
      '/v1/engines/asciii/lyapunov': {
        get: {
          operationId: 'getLyapunov',
          summary: 'Get current Lyapunov exponent and phase state',
          responses: { '200':{ description:'Chaos measurement', content:{'application/json':{ schema:{ type:'object', properties:{ lyapunov:{type:'number'}, phase:{type:'string'} } }}}}}
        },
      },
      '/v1/engines/asciii/word/{word}': {
        get: {
          operationId: 'scoreWord',
          summary: 'Get 11D axis-delta vector for a word',
          parameters: [{ name:'word', in:'path', required:true, schema:{type:'string'} }],
          responses: { '200':{ description:'Axis delta vector' } },
        },
      },
      '/health': {
        get: { operationId:'health', summary:'Health check', responses:{ '200':{ description:'ok' } } }
      },
    },
  });
});

module.exports = router;
