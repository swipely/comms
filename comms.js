/*jshint esnext:true */
/*jshint maxlen:80 */

/**
@module Comms
@example
  using jQuery's ajax as the transport

  var fooTransmission = {
    transport: $.ajax,
    options: { url: '/foo.json', method: 'get' }
  };

  var barTransmission = {
    transport: $.ajax,
    options: { url: '/bar.json', method: 'get' }
  };

  Comms()
    .add(fooTransmission)
    .add(barTransmission)
    .forEveryResponse(function (fooResponse, barResponse) {
      // do something with the responses
    })
**/

/**
Main public API.
Creates a Comms object to add transmissions on.

@method Comms
@return {Object}
**/
var Comms = function () {
  return build([], []);
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
@param {Array} responses
@return {Object}
**/
var build = function (queue, responses) {

  /**
  transmit all added transmissions

  @method transmit
  **/
  var transmit = function (responder) {
    queue.forEach(function (transmission, index) {
      var promise = transmission.transport(transmission.options);

      if (!isValidPromise(promise)) {
        throw new Comms.TransportError(
          "Please provide a Promise A+ based transport"
        );
      }

      // collect response and invoke responder
      var handler = function (resp) {
        var orderedResponses = new Array(queue.length);

        responses[index] = resp;

        responder.apply(null, responses);
      };

      promise.then(
        function (resp) {
          if (typeof transmission.transform === 'function') {
            handler(transmission.transform(resp));
          }
          else {
            handler(resp);
          }
        },
        function (resp) { handler(resp) }
      );
    });
  };

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
        build(queue.concat(transmission), responses)
      );
    },

    /**
    transmit with the given callback method

    @method forEveryResponse
    @param {Function} responder
    @return {Object}
    **/
    forEveryResponse: function (responder) {
      transmit(responder);
    }

  };
};

export default Comms;
