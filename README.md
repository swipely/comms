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

## forEveryResponse
the responders registered with `forEveryResponse` will be called every time a
request has completed, wether or not all of them have.
