var expect = require('expect.js'),
    Comms = require('../build/comms').default;

describe('Comms', function () {
  var subject, transmission;

  beforeEach(function () {
    transmission = {
      transport: function () {},
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

      it('it throws an exception', function () {
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
          },
          options: { url: '/foo.json' },
          key: 'foo'
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
