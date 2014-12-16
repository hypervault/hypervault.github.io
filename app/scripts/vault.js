var fileName = 'REPLACE_WITH_FILE_NAME';
var fileType = 'REPLACE_WITH_FILE_TYPE;';
var cipherData = 'REPLACE_WITH_FILE_DATA';

function decryptFileData(cipherData, password, callback) {
  var data = new triplesec.Buffer(cipherData, 'base64');
  var key = new triplesec.Buffer(password);

  triplesec.decrypt({key:key, data:data}, function (err, plainData) {
    var plainDataBase64 = plainData.toString();     
    callback(err, plainDataBase64);
  });
}

function decryptAndDownload() {
  var password = document.getElementById('password_input').value;
  decryptFileData(cipherData, password, function (err, plainData) {
    var blob = new Blob([Base64Binary.decode(plainData)], {
        type: fileType
    });
    saveAs(blob, fileName);
  });
}
