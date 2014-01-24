(function () {
  var Comms = function (queue, responses, responders) {
    return configure([], {}, []);
  };

  var configure = function (queue, responses, responders) {
    return {
      add: function (requestOptions, params) {
        return configure(queue.concat(requestOptions), responses, responders);
      },

      forEveryResponse: function (responder) {
        return configure(queue, responses, responders.concat(responder));
      },

      transmit: function () {
        queue.forEach(function (requestOptions) {
          // server responds
          var handler = function (resp) {
            responses[requestOptions.key] = resp;

            responders.forEach(function (responder) {
              responder(responses);
            });
          };

          requestOptions.transport(requestOptions.request, function (resp) {
            handler(requestOptions.transform(resp));
          });
        });
      }
    };
  };

  window.Comms = Comms;
}());
