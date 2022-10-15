var path = require('path');

var express = require('express');
var logger = require('morgan');
var apiai = require('apiai')('6cf2ba7ca99f4371ac5aa47f71e49b84');

var app = express();

app
  // template-engine config
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'pug')
  // logger middleware
  .use(logger('dev'))
  // body-parser middleware
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  // static serve middleware
  .use(express.static(path.join(__dirname, 'public')))
  // routes middleware
  .use((...handlerArgs) =>
    express
      .Router()
      /* default endpoint to check the express server */
      .get('/', (_, res) => res.render('index', { title: 'Express' }))
      /* endpoint to deal with google dialogflow */
      .post('/chatbot', (req, res) => {
        var text = req.body.text;
        console.log('---', text);

        apiai
          .textRequest(text, {
            sessionId: '<unique session id>',
          })
          .on('response', (dialogFlowResponse) => {
            const dialogFlowResponsePayload = {
              userParole: dialogFlowResponse.result.resolvedQuery,
              intentName: dialogFlowResponse.result.metadata.intentName,
              chatBotStaticReponse:
                dialogFlowResponse.result.fulfillment.speech,
            };
            console.log('---', dialogFlowResponsePayload);
            res.status(200).json(dialogFlowResponsePayload);
          })
          .on('error', (error) => {
            console.log('---', error);

            res.status(500).json(error);
          })
          .end();
      })(...handlerArgs)
  );

module.exports = app;
