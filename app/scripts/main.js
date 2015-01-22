
var decryptionMode = false;
if (typeof _decryptionMode !== 'undefined') {
  decryptionMode = true;
}

//////////////////////////////////////////////////////////////////////////// Encrypted embedded data
var fileName = 'REPLACE_WITH_FILE_NAME_';
var fileType = 'REPLACE_WITH_FILE_TYPE_';
var cipherData = 'REPLACE_WITH_FILE_DATA_';

///////////////////////////////////////////////////////////////////////////////// Progress indicator
var progressPath = null;
if (decryptionMode) {
  progressPath = document.getElementById('decrypt-progress-path');
} else {
  progressPath = document.getElementById('encrypt-progress-path');
}

var pathLength = progressPath.getTotalLength();
progressPath.style.transition = progressPath.style.WebkitTransition =
  'none';
progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
progressPath.style.strokeDashoffset = pathLength;
progressPath.getBoundingClientRect();
progressPath.style.transition = progressPath.style.WebkitTransition =
  'stroke-dashoffset 300ms linear';

var updateProgress = function (percent) {
  var progress = pathLength - pathLength*(percent/100.0);
  progressPath.style.strokeDashoffset = progress;
  if (decryptionMode) {
    document.getElementById("decrypt-percent").innerHTML = percent+"%";
  }
  else {
    document.getElementById("encrypt-percent").innerHTML = percent+"%";
  }
}

// Progress hook
var progress = [];

var reset_progress = function () {
  progress = [];
  updateProgress(0);
  if (decryptionMode) {
    document.getElementById("decrypt-percent").innerHTML = '';
    document.getElementById("decrypt-progress-summary").innerHTML = '';
  }
  else {
    document.getElementById("encrypt-percent").innerHTML = '';
    document.getElementById("encrypt-progress-summary").innerHTML = '';
  }
};

var progress_hook_encrypt = function(p) {
  var h, pr, _i, _len;
  var progressPercent = 0;
  if (progress.length && (progress[progress.length - 1].what === p.what)) {
    progress[progress.length - 1] = p;
  } else {
    progress.push(p);
  }
  h = "";
  for (_i = 0, _len = progress.length; _i < _len; _i++) {
    pr = progress[_i];
    h += "<li>" + pr.what + " " + pr.i + "/" + pr.total + "</li>";
    if (_i == 0) {
      progressPercent += (10.0 * (pr.i / pr.total));
    }
    else {
      progressPercent += (15.0 * (pr.i / pr.total));
    }
  }
  updateProgress(Math.floor(progressPercent));
  document.getElementById("encrypt-progress-summary").innerHTML = h;
};

var progress_hook_decrypt = function(p) {
  var h, pr, _i, _len;
  var progressPercent = 0;
  if (progress.length && (progress[progress.length - 1].what === p.what)) {
    progress[progress.length - 1] = p;
  } else {
    progress.push(p);
  }
  h = "";
  for (_i = 0, _len = progress.length; _i < _len; _i++) {
    pr = progress[_i];
    h += "<li>" + pr.what + " " + pr.i + "/" + pr.total + "</li>";
    if (_i == 0) {
      progressPercent += (10.0 * (pr.i / pr.total));
    }
    else {
      progressPercent += (18.0 * (pr.i / pr.total));
    }
  }
  updateProgress(Math.floor(progressPercent));
  document.getElementById("decrypt-progress-summary").innerHTML = h;
};

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
  });
}

// Drag and drop
// window.onload = function(){
//     var dropzone = document.getElementById('dropzone');
//     dropzone.addEventListener('dragover', function(e){
//         e.preventDefault();
//         return false;
//     })
//     .addEventListener('dragenter', function(e){
//         e.preventDefault();
//         return false;
//     })
//     .addEventListener('drop', function(e){
//         e.preventDefault();
//         var dt = e.dataTransfer;
//         var files = dt.files;
//         for(var i=0; i<files.length; i++){
//             var file = files[i],
//                 reader = new FileReader();
//             reader.onload = function(e){
//                 globalFileData['name'] = (globalFileData['name'] == '' ? file.name : globalFileData['name']);
//                 globalFileData['type'] = (globalFileData['type'] == '' ? file.type : globalFileData['type']);
//                 globalFileData['data'] = (globalFileData['data'] == '' ? e.target.result : globalFileData['data'] + ';' + e.target.result);
//             };    
//         }
//         return false;
//     });
// };
            
        
//////////////////////////////////////////////////////////////////////////////////// Vault rendering

function stripDataPrefix(dataUrl) {
  var firstCommaIndex = dataUrl.indexOf(',');
  return dataUrl.slice(firstCommaIndex+1);
}

function renderVault(fileName, fileType, fileData, callback) {
  // Replace the 3 placeholders with the file name, file type, and file data
  var vaultTemplate = document.documentElement.outerHTML;
  var vault = vaultTemplate.replace('<script>', '<script>var _decryptionMode = true;')
    .replace('REPLACE_WITH_FILE_NAME' + String.fromCharCode(95), fileName)
    .replace('REPLACE_WITH_FILE_TYPE' + String.fromCharCode(95), fileType)
    .replace('REPLACE_WITH_FILE_DATA' + String.fromCharCode(95), fileData);
  callback(vault);
}

function saveVault(vaultData, vaultFileName) {
  var vaultBlob = new Blob([vaultData], {type: "text/html;charset=utf-8"});
  saveAs(vaultBlob, vaultFileName);
}

function createVault() {
  var password = document.getElementById('password_input').value;
  var base64FileData = stripDataPrefix(globalFileData['data']);

  encryptFileData(base64FileData, password, function (err, encryptedData) {
    renderVault(globalFileData['name'], globalFileData['type'], encryptedData, function (vaultData) {
      saveVault(vaultData, "vault1.html");
    });
  });
}

/////////////////////////////////////////////////////////////////////////////////// Encryption stuff
function encryptFileData(fileData, password, callback) {
  var data = new triplesec.Buffer(fileData);
  var key = new triplesec.Buffer(password);

  reset_progress();
  triplesec.encrypt({key:key, progress_hook: progress_hook_encrypt, data:data}, function (err, encryptedData) {
    if (err) {
      console.log('Encryption error: ' + err.toString());
    }
    else {
      callback(err, encryptedData.toString('base64'));
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////// Decryption stuff
function decryptFileData(cipherData, password, callback) {
  var data = new triplesec.Buffer(cipherData, 'base64');
  var key = new triplesec.Buffer(password);

  reset_progress();
  triplesec.decrypt({key:key, progress_hook: progress_hook_decrypt, data:data}, function (err, plainData) {
    if (err) {
      // Reset progress and display "wrong password" message
      reset_progress();
      displayWrongPasswordMsg(true);

      console.log('Decryption error: ' + err.toString());
    }
    else {
      var plainDataBase64 = plainData.toString();     
      callback(err, plainDataBase64);
    }
  });
}

function decryptAndDownload() {
  var password = document.getElementById('decrypt-password-input').value;
  decryptFileData(cipherData, password, function (err, plainData) {
    var blob = new Blob([Base64Binary.decode(plainData)], {
        type: fileType
    });
    saveAs(blob, fileName);
  });
}

///////////////////////////////////////////////////////////////////////////////////////// Validation

var encryptPasswordInput1 = null;
var encryptPasswordInput2 = null;
var decryptPasswordInput = null;

// decryptionMode is set in the header of vault.html
if (decryptionMode) {
  decryptPasswordInput = document.getElementById('decrypt-password-input');
}
else {
  encryptPasswordInput1 = document.getElementById('password_input');
  encryptPasswordInput2 = document.getElementById('password_input2');
}

function validateRequiredField(element, requiredMsgId) {
  if (element.value === '') {
    document.getElementById(requiredMsgId).style.display = 'block';
    return false;
  }
  else {
    document.getElementById(requiredMsgId).style.display = 'none';
    return true;
  }
}

function validatePasswordsMatch() {
  if (encryptPasswordInput1.value == encryptPasswordInput2.value) {
    document.getElementById('pw-mismatch-msg').style.display = 'none';
    return true;
  }
  else {
    document.getElementById('pw-mismatch-msg').style.display = 'block';
    return false;
  }
}

function displayWrongPasswordMsg(display) {
  if (display) {
    document.getElementById('wrong-pw-msg').style.display = 'block';
  }
  else {
    document.getElementById('wrong-pw-msg').style.display = 'none';
  }
}

function validateEncryptionFields() {
  var allValid = true;
  allValid = validateRequiredField(encryptPasswordInput1, 'pw-required-msg') && allValid;
  allValid = validateRequiredField(encryptPasswordInput2, 'pw-required-msg2') && allValid;
  allValid = allValid && validatePasswordsMatch();
  return allValid;
}

function validateDecryptionFields() {
  // Ensure the "wrong password" message is hidden on submit
  displayWrongPasswordMsg(false);
  return validateRequiredField(decryptPasswordInput, 'decrypt-pw-required-msg');
}


////////////////////////////////////////////////////////////////////////////////////////// Utilities

function setClassDisplay(className, display) {
  var selected = document.getElementsByClassName(className);
  for (var i = 0; i < selected.length; ++i) {
    var item = selected[i];
    item.style.display = display;
  }
}

// Visibility

if (decryptionMode) {
  setClassDisplay('decryption-container', 'block');
  setClassDisplay('encryption-container', 'none');
}
else {
  setClassDisplay('decryption-container', 'none');
  setClassDisplay('encryption-container', 'block');
}

