
//////////////////////////////////////////////////////////////////////////////////// Read file stuff
var globalFileData = {name:"", type:"", data:""};
var fileDataRaw = "";

function readFileData(fileObj, callback) {
  var reader = new FileReader();

  reader.onload = (function(theFile) {
    return function(e) {
      callback(theFile.name, theFile.type, e.target.result);
    };
  })(fileObj);

  // Read in the image file as a data URL.
  // reader.readAsArrayBuffer
  reader.readAsDataURL(fileObj);
}

function getFileData() {
  var fileList = document.getElementById("uploadInput").files;
  var file1 = fileList[0];
  readFileData(file1, function (fileName, fileType, fileData) {
      fileDataRaw = fileData;
      globalFileData['name'] = fileName;
      globalFileData['type'] = fileType;
      globalFileData['data'] = fileData;
      console.log('File name:' + fileName);
      console.log('File type:' + fileType);
      console.log(fileData);
  });
}

/////////////////////////////////////////////////////////////////////////////////// Encryption stuff
var cryptoParams = { 'iter': 10000, 'mode': 'ocb2', 'ks': 256 };

function hex2a(hex) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function encryptFileData(fileData, password) {
  var encrypted = sjcl.encrypt(password, fileData, cryptoParams);
  //var encrypted = CryptoJS.AES.encrypt(fileData, password);
  return encrypted;
}

function decryptFileData(cipherData, password) {
  var decrypted = sjcl.decrypt(password, cipherData, cryptoParams)
  return decrypted;
  //var decrypted = CryptoJS.AES.decrypt(cipherData, password);
  //return hex2a(decrypted.toString())
}

//////////////////////////////////////////////////////////////////////////////////// Vault rendering

function getVaultTemplate(callback) {
  url = "vault.html"
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(xhr.responseText);
    }
  }
  xhr.send();
}

function stripDataPrefix(dataUrl) {
  var firstCommaIndex = dataUrl.indexOf(',');
  return dataUrl.slice(firstCommaIndex+1);
}

function renderVault(fileName, fileType, fileData, callback) {
  getVaultTemplate(function (vaultTemplate) {
    // Replace the 3 placeholders with the file name, file type, and file data
    var vault = vaultTemplate.replace('REPLACE_WITH_FILE_NAME', fileName)
      .replace('REPLACE_WITH_FILE_TYPE', fileType)
      .replace('REPLACE_WITH_FILE_DATA', fileData);
    callback(vault);
  });
}

function saveVault(vaultData, vaultFileName) {
  var vaultBlob = new Blob([vaultData], {type: "text/html;charset=utf-8"});
  saveAs(vaultBlob, vaultFileName);
}

function createVault() {
  var password = document.getElementById('password_input').value;
  var base64FileData = stripDataPrefix(globalFileData['data']);
  var encryptedData = encryptFileData(base64FileData, password);

  renderVault(globalFileData['name'], globalFileData['type'], encryptedData, function (vaultData) {
    saveVault(vaultData, "vault1.html");
  });
}

