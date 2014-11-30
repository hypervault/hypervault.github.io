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

