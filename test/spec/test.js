/* global describe, it */

(function () {
  'use strict';

  var plaintext = "Through gazing on the unquiet sky";
  var password = "metempsychosis";

  describe('Triplesec', function (done) {
    describe('encryption function', function () {
      it('should encrypt data and decrypt data', function (done) {
        this.timeout(5000);

        var data = new triplesec.Buffer(plaintext);
        var key = new triplesec.Buffer(password);

        triplesec.encrypt({key:key, data:data}, function (err, cipherData) {
          var data2 = new triplesec.Buffer(cipherData, 'base64');
          triplesec.decrypt({key:key, data:data2}, function (err, plainData) {
            var plainDataBase64 = plainData.toString();     
            expect(plainDataBase64).to.equal(plaintex);
            done();
          });
        });

      });
    });
  });

  // describe('Hypervault', function () {
  //   describe('encryption function', function () {
  //     it('should encrypt data and output a base64 string', function (done) {
  //       this.timeout(5000);
  //
  //       encryptFileData(plaintext, password, function (err, encryptedData) {
  //         expect(encryptedData).to.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/);
  //         done();
  //       });
  //     });
  //   });
  // });

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

