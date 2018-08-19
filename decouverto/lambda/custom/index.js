const Alexa = require('ask-sdk-core');
const request = require('sync-request');


const SKILL_NAME = 'Découverto';
const HELP_MESSAGE = 'Vous pouvez dire que puis-je visiter aujourd\'hui ou quelle balade est intéressante... En quoi puis-je vous aider ?';
const HELP_REPROMPT = 'En quoi puis-je vous aider ?';
const FALLBACK_MESSAGE = 'Découverto ne peut pas vous aider avec cela. Vous pouvez demander quelle balade est intéressante. En quoi puis-je vous aider ?';
const FALLBACK_REPROMPT = 'En quoi puis-je vous aider ?';
const STOP_MESSAGE = 'Goodbye!';

const walks = JSON.parse(request('GET', 'https://decouverto.fr/walks/index.json').getBody('utf8'));

const PickWalkHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'Pick_a_walk');
  },
  handle(handlerInput) {
        let walk = walks[Math.floor(Math.random()*walks.length)];

        const speechOutput = `Une balade intéressante pour vous serait: ${walk.title}. ${walk.description} Elle fait ${((walk.distance/1000).toFixed(1) + '').replace('.', ',')} km. Elle se situe dans le secteur de ${walk.zone}. Elle est axé sur le thème  ${walk.theme}.`;

        return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(speechOutput)
                .withSimpleCard(SKILL_NAME, speechOutput + " Voulez vous une autre balade?")
                .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Désolé une erreur a eu lieu.')
      .reprompt('Désolé une erreur a eu lieu.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PickWalkHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();