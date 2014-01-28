var expect = require('expect.js'),
    Comms = require('../build/comms').default;

describe('Comms', function () {
  var subject, transmission, promise;

  beforeEach(function () {
    promise = function () {
      return { then: function () {} };
    };

    transmission = {
      transport: promise,
      key: 'foo',
      options: 'bar'
    };

    subject = Comms();
  });

  describe('.isValidTransmission', function () {
    describe('with an invalid transport', function () {
        expect( Comms.isValidTransmission({
          transport: 'invalid',
          key: 'foo',
          options: {}
        }) ).to.be( false );
    });

    describe('with an invalid key', function () {
      it('returns false', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
          key: function () {},
          options: {}
        }) ).to.be( false );
      });
    });

    describe('with invalid options', function () {
      it('returns false', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
          key: 'foo'
        }) ).to.be( false );
      });
    });

    describe('with an invalid transform', function () {
      it('returns false', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
          key: 'foo',
          options: {},
          transform: 'nope'
        }) ).to.be( false );
      });
    });

    describe('with fully valid transmission', function () {
      it('returns true', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
          key: 'foo',
          options: {},
          transform: function () {}
        }) ).to.be( true );
      });
    });
  });

  describe('#add', function () {
    it('adds a transmission to the queue', function () {

      expect( subject.add(transmission).__queue ).to.eql([
        transmission
      ]);
    });

    describe('when adding an invalid transmission', function () {
      var brokenTransmission = {
        foo: 'bar'
      };

      it('throws TransmissionError', function () {
        expect(function () {
          subject.add(brokenTransmission);
        }).to.throwException(function (ex) {
          expect(ex instanceof Comms.TransmissionError).to.be(true);
        });
      });
    });
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
            return { then: function () {} };
          },
          options: { url: '/foo.json' },
          key: 'foo'
        })
        .transmit();
    });

    describe('when the transport is not a promise', function () {
      it('throws TransportError', function () {
        expect(function () {
          subject
            .add({
              transport: function () {},
              options: {},
              key: 'foo'
            })
            .transmit();
        }).to.throwException(function (ex) {
          console.log(ex);
          expect(ex instanceof Comms.TransportError).to.be(true);
        });
      });
    });

    describe('when a transmission responds', function () {
      it('passes all available responses to the responders', function (done) {
        subject
          .add({
            transport: function (options) {
              return {
                then: function (callback) {
                  callback('bar');
                }
              };
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
              transport: function (options) {
                return {
                  then: function (callback) {
                    callback('bar');
                  }
                };
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
});
