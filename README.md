Comms
===

Tiny functional async wrapper for response composition.

```javascript
Comms()
  .add({ transport: $.ajax, options: { url: '/foo.json', method: 'get' }})
  .add({ transport: $.ajax, options: { url: '/bar.json', method: 'get' }})
  .forEveryResponse(function (fooResponse, barResponse) {
    // do something with the responses
  });
```

* The transport must be Promise A+ compatible. [More details here.](http://promises-aplus.github.io/promises-spec/)

# API

Comms uses the concepts of a "transmission" to define an interface to a resource, and a "responder" to handle responses.

## add
Add transmissions to be sent.

A transmission should look like this:

```javascript
var transmission = {
  transport: $.ajax,
  options:   { url: '/foo.json', method: 'get' },
  transform: function (resp) { }
};
```
In the above transmission:
* `transport` Any Promise-based transport. Ie. Ajax, LocalStorage, SQLite, CouchDB, etc.
* `options` Options to be passed directly to the transport.
* `transform` An optional callback to transform the response. The transform's return value will be passed to the `forEveryResponse` callback.

See `Comms.isValidTransmission` to verify your transmission.


## forEveryResponse

A responder callback for all of the added transmissions.

```javascript
  .forEveryResponse(function (fooResponse, barResponse) {
    // do something with the responses
  });
```

The responder will be called every time a request has completed, whether or not all of them have. Existing responses are preserved between calls. Ie. The responder is called once for each transmission response; the 1st call would have 1 of the 2 responses, while the second call would include both responses.


## isValidTransmission

Returns a boolean based on simple validation of a transmission object.


# Build

Build Comms, optionally to your favourite module system. Comms defaults to CommonJS modules.

```
gulp
```
Or to create YUI modules:
```
gulp --type=yui
```
Available options are `amd`, `yui`, `cjs` (through [es6-module-transpiler](https://github.com/square/es6-module-transpiler))

# Test

Run the tests:
```
npm test
```
