var expect  = require("expect.js"),
    Comms   = require('../comms');

describe('Comms', function () {
  var subject;

  beforeEach(function () {
    subject = Comms();
  });

  describe('#add', function () {
    it('adds a transmission to the queue', function () {
      expect( subject.add({ foo: 'bar' }).__queue ).to.eql([
        { foo: 'bar' }
      ]);
    });

    it('validates the transmission');
  });

  describe('#forEveryResponse', function () {
    it('adds a transmission responder', function () {
      var responder = function () {};

      expect( subject.forEveryResponse(responder).__responders ).to.eql([
        responder
      ]);
    });
  });

  describe('#transmit', function () {
    it('executes transmissions', function (done) {
      subject
        .add({
          transport: function (options) {
            expect( options ).to.eql({ url: '/foo.json' });
            done();
          },
          options: { url: '/foo.json' }
        })
        .transmit();
    });
  });

  describe('when a transmission responds', function () {
    it('passes all available responses to the responders', function (done) {
      subject
        .add({
          transport: function (options, callback) {
            callback('bar');
          },
          options: {},
          key: 'foo'
        })
        .forEveryResponse(function (responses) {
          expect( responses ).to.eql( { foo: 'bar' });
          done();
        })
        .transmit();
    });

    describe('and a transformer has been defined', function () {
      it('passes the response through the transformer before the callback', function (done) {
        subject
          .add({
            transport: function (options, callback) {
              callback('bar');
            },
            transform: function (resp) {
              expect( resp ).to.be('bar');
              done();
            },
            options: {},
            key: 'foo'
          })
          .transmit();
      });
    });
  });
});
