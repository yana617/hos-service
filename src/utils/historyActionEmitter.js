const EventEmitter = require('events');

const historyActionRepository = require('../repositories/HistoryActionRepository');

const myEmitter = new EventEmitter();

exports.emitter = myEmitter;

exports.startEmitter = (io) => {
  myEmitter.on('newHistoryAction', async (actionData) => {
    const newHistoryAction = await historyActionRepository.create(actionData);
    io.emit('newAction', newHistoryAction);
  });
};
