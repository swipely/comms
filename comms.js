/**
@module Comms
@example
  using jQuery's ajax as the transport

  var fooTransmission = {
    transport: $.ajax,
    key: 'foo',
    options: { url: '/foo.json', method: 'get' }
  };

  var barTransmission = {
    transport: $.ajax,
    key: 'bar',
    options: { url: '/bar.json', method: 'get' }
  };

  Comms()
    .add(fooTransmission)
    .add(barTransmission)
    .forEveryResponse(function (responses) {
      // do something with responses.foo or responses.bar
    })
    .transmit();
**/

"use strict";

var freeze = Object.freeze;

/**
@method build
@param {Array} queue
@param {Object} responses
@param {Array} responders
@return {Object}
**/
var build = function (queue, responses, responders) {
  return {
    /**
    @property __queue
    @private
    **/
    __queue: queue,

    /**
    @property __responses
    @private
    **/
    __responses: responses,

    /**
    @property __responders
    @private
    **/
    __responders: responders,

    /**
    add an async transmission

    @method add
    @param {Object} transmission
    @return {Object}
    **/
    add: function (transmission) {
      return freeze(build(queue.concat(transmission), responses, responders));
    },

    /**
    add an async transmission

    @method add
    @param {Object} transmission
    @return {Object}
    **/
    forEveryResponse: function (responder) {
      return freeze(build(queue, responses, responders.concat(responder)));
    },

    /**
    transmit all added transmissions

    @method transmit
    **/
    transmit: function () {
      queue.forEach(function (transmission) {
        // server responds
        var handler = function (resp) {
          responses[transmission.key] = resp;

          responders.forEach(function (responder) {
            responder(responses);
          });
        };

        transmission.transport(transmission.options, function (resp) {
          if (typeof transmission.transform === 'function') {
            handler(transmission.transform(resp));
          }
          else {
            handler(resp);
          }
        });
      });
    }
  };
};

module.exports = function () {
  return build([], {}, []);
};
