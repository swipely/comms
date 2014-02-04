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
      options: 'bar'
    };

    subject = Comms();
  });

  describe('.isValidTransmission', function () {
    describe('with an invalid transport', function () {
        expect( Comms.isValidTransmission({
          transport: 'invalid',
          options: {}
        }) ).to.be( false );
    });

    describe('with invalid options', function () {
      it('returns false', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
        }) ).to.be( false );
      });
    });

    describe('with an invalid transform', function () {
      it('returns false', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
          options: {},
          transform: 'nope'
        }) ).to.be( false );
      });
    });

    describe('with fully valid transmission', function () {
      it('returns true', function () {
        expect( Comms.isValidTransmission({
          transport: function () {},
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
    it('executes transmissions', function (done) {
      subject
        .add({
          transport: function (options) {
            expect( options ).to.eql({ url: '/foo.json' });
            done();
            return { then: function () {} };
          },
          options: { url: '/foo.json' },
        })
        .forEveryResponse(function () {});
    });

    describe('when the transport is not a promise', function () {
      it('throws TransportError', function () {
        expect(function () {
          subject
            .add({
              transport: function () {},
              options: {},
            })
            .forEveryResponse(function () {});
        }).to.throwException(function (ex) {
          console.log(ex);
          expect(ex instanceof Comms.TransportError).to.be(true);
        });
      });
    });

    describe('when a transmission responds', function () {
      it('passes all available responses to the responder', function (done) {
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
          })
          .add({
            transport: function (options) {
              return {
                then: function (callback) {
                  callback('foo');
                }
              };
            },
            options: {},
          })
          .forEveryResponse(function (barResponse, fooResponse) {
            if (barResponse && fooResponse) {
              expect( barResponse ).to.eql( 'bar' );
              expect( fooResponse ).to.eql( 'foo' );
            }
          });

          // can't put done() call in forEveryResponse
          // as it's called multiple times
          setTimeout(done, 300);
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
            })
            .forEveryResponse(function () {} );
        });
      });
    });
  });
});
