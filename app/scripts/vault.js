var fileName = 'REPLACE_WITH_FILE_NAME';
var fileType = 'REPLACE_WITH_FILE_TYPE;';
var cipherData = 'REPLACE_WITH_FILE_DATA';

function hex2a(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function decryptFileData(cipherData, passcode) {
  var decrypted = CryptoJS.AES.decrypt(cipherData, passcode);
  return hex2a(decrypted.toString())
}

function decryptAndDownload() {
  var password = document.getElementById('password_input').value;
  var plainData = decryptFileData(cipherData, password);

  var blob = new Blob([Base64Binary.decode(plainData)], {
      type: fileType
  });

  saveAs(blob, fileName);
}

