/* global describe, it */

(function () {
  'use strict';

  describe('Base64-Binary', function () {
    describe('base64 decoder', function () {
      it('should run here few assertions', function () {
        var encodedString = "SHlwZXJ2YXVsdCBGVFc=";
        var expectedDecodedString = new Uint8Array([72, 121, 112, 101, 114, 118, 97, 117, 108, 116, 32, 70, 84, 87]);
        var decodedString = Base64Binary.decode(encodedString);
        expect(decodedString).to.eql(expectedDecodedString);
      });
    });
  });

  describe('SJCL', function () {
    describe('codec library', function () {
      it('should convert from a UTF-8 string to Base 64', function () {
        var expectedBase64Msg = "VGhyb3VnaCBnYXppbmcgb24gdGhlIHVucXVpZXQgc2t5";
        var msg = "Through gazing on the unquiet sky"
        var msgBits = sjcl.codec.utf8String.toBits(msg);
        var base64Msg = sjcl.codec.base64.fromBits(msgBits);
        expect(base64Msg).to.eql(expectedBase64Msg);
      });
    });
  });

  describe('SJCL', function () {
    describe('codec library', function () {
      it('should convert from an Base 64 to a UTF-8 string', function () {
        var expectedMsg = "Through gazing on the unquiet sky"
        var base64Msg = "VGhyb3VnaCBnYXppbmcgb24gdGhlIHVucXVpZXQgc2t5";
        var msgBits = sjcl.codec.base64.toBits(base64Msg);
        var msg = sjcl.codec.utf8String.fromBits(msgBits)
        expect(msg).to.eql(expectedMsg);
      });
    });
  });

  describe('Vault code', function () {
    describe('stripDataPrefix should strip the prefix of a data url', function () {
      it('leaving only the data portion of the URL', function () {
        var dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
        var expectedResult = 'iVBORw0KGgoAAAANSUhEUgAAAAUA';
        var result = stripDataPrefix(dataUrl);
        expect(result).to.equal(expectedResult);
      });
    });
  });
})();

