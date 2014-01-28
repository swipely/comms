/*jshint esnext:true */
/*jshint maxlen:80 */

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

/**
Main public API.
Creates a Comms object to add transmissions on.

@method Comms
@return {Object}
**/
var Comms = function () {
  return build([], {}, []);
};

/**
@method isValidPromise
@param {Object}
@return {Boolean}
@private
**/
var isValidPromise = function (promise) {
  return (
    typeof promise !== 'undefined' &&
    typeof promise.then === 'function'
  );
};

/**
@method TransmissionError
@param {String} message
@return {TransmissionError}
@constructor
**/
Comms.TransmissionError = function (message) {
  this.message = message;
};
Comms.TransmissionError.prototype = new Error();

/**
@method TransportError
@param {String} message
@return {TransmissionError}
@constructor
**/
Comms.TransportError = function (message) {
  this.message = message;
};
Comms.TransportError.prototype = new Error();

/**
@method isValidTransmission
@param {Object} transmission
@return {Boolean}
@static
**/
Comms.isValidTransmission = function (transmission) {
  return (
    typeof transmission.transport === 'function'  &&
    typeof transmission.key       === 'string'    &&
    typeof transmission.options   !== 'undefined' &&
    (
      typeof transmission.transform === 'undefined' ||
      typeof transmission.transform === 'function'
    )
  );
};

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
      if (!Comms.isValidTransmission(transmission)) {
        throw new Comms.TransmissionError();
      }

      return Object.freeze(
        build(queue.concat(transmission), responses, responders)
      );
    },

    /**
    add an async transmission

    @method add
    @param {Object} transmission
    @return {Object}
    **/
    forEveryResponse: function (responder) {
      return Object.freeze(
        build(queue, responses, responders.concat(responder))
      );
    },

    /**
    transmit all added transmissions

    @method transmit
    **/
    transmit: function () {
      queue.forEach(function (transmission) {
        var promise = transmission.transport(transmission.options);

        if (!isValidPromise(promise)) {
          throw new Comms.TransportError(
            "Please provide a Promise A+ based transport"
          );
        }

        // collect response and invoke responders
        var handler = function (resp) {
          responses[transmission.key] = resp;

          responders.forEach(function (responder) {
            responder(responses);
          });
        };

        promise.then(function (resp) {
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

export default Comms;
