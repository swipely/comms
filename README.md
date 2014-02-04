Comms
===

Tiny functional async wrapper for response composition

```javascript
Comms()
  .add({ transport: $.ajax, options: { url: '/foo.json', method: 'get' }})
  .add({ transport: $.ajax, options: { url: '/bar.json', method: 'get' }})
  .forEveryResponse(function (fooResponse, barResponse) {
    // do something with the responses
  });
```

* The transport must be Promise A+ compatible.

# API

## add
Add transmissions to be sent.

A transmission should look like this:

```javascript`
var transmission = {
  transport: $.ajax, // Promise based transport
  options: { url: '/foo.json', method: 'get' }, // options for the transport
  transform: function (resp) {} // optional data transformer to be called on the response - it's return value will be passed to the `forEveryResponse` callback
};
```

Use `Comms.isValidTransmission` to verify your transmission.

## forEveryResponse
the responder registered with `forEveryResponse` will be called every time a
request has completed, whether or not all of them have.

# Build

Build comms to your favourite module system.

```
gulp build --type=yui
```
Available options are `amd`, `yui`, `cjs` (through [es6-module-transpiler](https://github.com/square/es6-module-transpiler))

# Test

Run the tests:
```
gulp test
```
