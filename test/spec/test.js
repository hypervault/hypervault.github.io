/* global describe, it */

(function () {
  'use strict';

  var plaintext = "Through gazing on the unquiet sky";
  var password = "metempsychosis";
  // Set mode to OCB2, keysize to 256 bits, and PBKDF2 iterations to 10000
  var cryptoParams = { 'iter': 10000, 'mode': 'ocb2', 'ks': 256 };

  describe('Hypervault', function () {
    describe('encryption function', function () {
      it('should encrypt data and output a base64 string', function (done) {
        encryptFileData(plaintext, password, function (err, encryptedData) {
          expect(encryptedData).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
          done();
        });
      });
    });
  });

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

