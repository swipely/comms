Comms
===

Tiny functional async wrapper for response composition

```javascript
Comms()
  .add({ transport: $.ajax, key: 'foo', options: { url: '/foo.json', method: 'get' }})
  .add({ transport: $.ajax, key: 'bar', options: { url: '/bar.json', method: 'get' }})
  .forEveryResponse(function (responses) {
    // do something with responses.foo or responses.bar
  })
  .transmit();
```

# API

## forEveryResponse
the responders registered with `forEveryResponse` will be called every time a
request has completed, wether or not all of them have.

# Build

Build comms to your favourite module system.

```javascript
gulp build --type=yui
```
Available options are `amd`, `yui`, `cjs` (through [es6-module-transpiler](https://github.com/square/es6-module-transpiler))
