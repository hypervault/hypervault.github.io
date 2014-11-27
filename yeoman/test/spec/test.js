/* global describe, it */

var expect = chai.expect;

(function () {
  'use strict';

  describe('Base64-Binary', function () {
    describe('should be able to decode in base64', function () {
      it('should run here few assertions', function () {
        var encodedString = "SHlwZXJ2YXVsdCBGVFc=";
        var expectedDecodedString = [72, 121, 112, 101, 114, 118, 97, 117, 108, 116, 32, 70, 84, 87];
        var decodedString = Base64Binary.decode(encodedString);
        expect(decodedString).to.equal(expectedDecodedString);
      });
    });
  });
})();
