
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
};

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

/////////////////////////////////////////////////////////////////////////////////// Read file stuff
var globalFileData = [];

// Read the file and call the callback in this format:
//    callback(fileName, fileType, fileSize, fileData)
function readFileData(fileObj, callback) {
  var reader = new FileReader();

  reader.onload = (function(theFile) {
    return function(e) {
      callback(theFile.name, theFile.type, theFile.size, e.target.result);
    };
  })(fileObj);

  // Read in the image file as a data URL.
  // reader.readAsArrayBuffer
  reader.readAsDataURL(fileObj);
}

function humanFileSize(size) {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

function displayFile(fileName, fileType, fileSize) {
  console.log(fileName + ' - ' + fileType + ' - ' + fileSize);
  var filenameHash = fileName.hashCode();
  var fileDisplayHtml = '<div id="' + filenameHash + '" class="row fileDisplay"><div class="col c8 thinRed"><span>'
    + fileName + '</span></div><div class="col c3 thinRed"><span>' + humanFileSize(fileSize)
    + '</span></div><button class="link-button" onclick="removeFile(\'' + fileName + '\')">X</button></div>';
  insertHtml(fileDisplayHtml, document.getElementById("dropAfterMe"));
}

function removeFileDisplay(filename) {
  var filenameHash = filename.hashCode();
  document.getElementById(filenameHash).remove();
}

function removeFile(filename) {
  console.log('Remove file: ' + filename);
  removeFileDisplay(filename);
  for (var i = 0; i < globalFileData.length; i++) {
    if (globalFileData[i].name == filename) {
      globalFileData.splice(i);
      break;
    }
  }
}

function fileReadCallback(fileName, fileType, fileSize, fileData) {
  globalFileData.push({
    'name' : fileName,
    'type' : fileType,
    'data' : stripDataPrefix(fileData)
  });
  displayFile(fileName, fileType, fileSize);
}

function alreadyHaveFile(fileObj) {
  // For now, just don't upload if the file name already exists;
  for (var i = 0; i < globalFileData.length; i++) {
    if (globalFileData[i].name == fileObj.name) {
      return true;
    }
  }
  return false;
}

function insertHtml(htmlStr, beforeNode) {
  var frag = document.createDocumentFragment(),
    temp = document.createElement('div');
  temp.innerHTML = htmlStr;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  beforeNode.parentNode.insertBefore(frag, beforeNode);
//  atNode.parentNode.insertBefore(frag, atNode.nextSibling);
}

function addFile(fileObj) {
  // TODO: if file size is different, upload and replace.
  if (!alreadyHaveFile(fileObj)) {
    readFileData(fileObj, fileReadCallback);
    console.log('Got it');

  }
  else {
    console.log('Already have that file bro!');
  }
}

function addFiles(fileList) {
  for (var i = 0; i < fileList.length; i++) {
    var thisFile = fileList[i];
    addFile(thisFile);
  }
}

function addSelectedFiles() {
  var fileList = document.getElementById("uploadInput").files;
  addFiles(fileList);
}

// Drag and drop
window.onload = function(){
  var dropzone = document.getElementsByTagName('body')[0];
  var container = document.getElementById('dropzone');
  dropzone.ondragover = function () {
    container.className = 'hover';
    return false;
  };
  dropzone.ondragend = function () {
    container.className = '';
    return false;
  };
  dropzone.ondragleave = function () {
    container.className = '';
    return false;
  };
  dropzone.ondrop = function (e) {
    e.preventDefault();
    container.className = '';
    addFiles(e.dataTransfer.files);
  };
};

//////////////////////////////////////////////////////////////////////////////////// Vault rendering

function stripDataPrefix(dataUrl) {
  var firstCommaIndex = dataUrl.indexOf(',');
  return dataUrl.slice(firstCommaIndex+1);
}

function renderVault(fileName, fileType, fileData, callback) {
  // Replace the 3 placeholders with the file name, file type, and file data
  var vaultTemplate = document.documentElement.outerHTML;
  // What is the String.fromCharCode(95) you ask? Well, this whole file is searched
  // for the replace strings below ('REPLACE_WITH_FILE_NAME_'), and the references
  // below, if they included the trailing '_' would be matched instead of the correct
  // location.
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

  var allData = '';
  for (var i = 0; i<globalFileData.length; i++){
      var to_append = globalFileData[i]['data'];
      if ( i == 0 ) {
          allData += to_append;
      } else {
          allData += ';' + to_append;
      }
  } 
  var base64FileData = allData;  

  var names = joinNames(globalFileData, 'name'),
      types = joinNames(globalFileData, 'type');
  encryptFileData(base64FileData, password, function (err, encryptedData) {
    renderVault(names, types, encryptedData, function (vaultData) {
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
    var fileNamesNew = fileName.split(';');
    var fileTypesNew = fileType.split(';');
    var plainData2 = plainData.split(';');
    for (var i=0; i<fileNamesNew.length; i++) {
        var blob = new Blob([Base64Binary.decode(plainData2[i])], {
            type : fileTypesNew[i]
        });
        saveAs(blob, fileNamesNew[i]);
    }
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

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = 0, len = this.length; i < len; i++) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
};

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

function joinNames(data, key) {
    var str = '';
    for (var i=0; i<data.length; i++) {
        str += data[i][key] + ';';
    }
    return str;
}
