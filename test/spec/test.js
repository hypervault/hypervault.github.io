/* global describe, it */

(function () {
  'use strict';

  var plaintext = "Through gazing on the unquiet sky";
  var password = "metempsychosis";
  // Set mode to OCB2, keysize to 256 bits, and PBKDF2 iterations to 10000
  var cryptoParams = { 'iter': 10000, 'mode': 'ocb2', 'ks': 256 };

  describe('TripleSec', function () {
    describe('encryption library', function () {
      it('should encrypt data', function () {
        
      });
    });
  });

  describe('SJCL', function () {

    describe('codec library', function () {
      var correctBase64Msg = "VGhyb3VnaCBnYXppbmcgb24gdGhlIHVucXVpZXQgc2t5";
      it('should convert from a UTF-8 string to Base64', function () {
        var msgBits = sjcl.codec.utf8String.toBits(plaintext);
        var base64Msg = sjcl.codec.base64.fromBits(msgBits);
        expect(base64Msg).to.eql(correctBase64Msg);
      });

      it('should convert from an Base64 to a UTF-8 string', function () {
        var msgBits = sjcl.codec.base64.toBits(correctBase64Msg);
        var msg = sjcl.codec.utf8String.fromBits(msgBits)
        expect(msg).to.eql(plaintext);
      });
    });

    describe('encrypt function return value', function () {
      var cipherData = sjcl.encrypt(password, plaintext, cryptoParams);
      var parsedCipherData = JSON.parse(cipherData);

      it('should contain the ciphertext, salt, and IV', function () {
        expect(parsedCipherData).to.include.keys(['ct', 'iv', 'salt']);
      });

      it('should contain have mode set to OCB2', function () {
        expect(parsedCipherData.mode).to.equal('ocb2');
      });

      it('should contain have key size set to 256 bits', function () {
        expect(parsedCipherData.ks).to.equal(256);
      });

      it('should contain have PDKDF2 iteration number set to 10000', function () {
        expect(parsedCipherData.iter).to.equal(10000);
      });
    });

    describe('decrypt function', function () {
      var cipherData = sjcl.encrypt(password, plaintext, cryptoParams);
      var decryptedData = sjcl.decrypt(password, cipherData);

      it('should return plaintext string', function () {
        expect(decryptedData).to.equal(plaintext);
      });

      it('should throw a sjcl.exception.corrupt exception if the wrong password is used', function () {
        expect(function () {sjcl.decrypt("wrong_password", cipherData)}).to.throw(sjcl.exception.corrupt);
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

