var hypervaultFormatVersion = 1;

var decryptionMode = false;
if (typeof _decryptionMode !== 'undefined') {
  decryptionMode = true;
}

// Embedded SVG Images
var downloadImage = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0' y='0' width='28' height='28' viewBox='0, 0, 100, 100'>" +
"<g id='Layer_1'>" +
    "<path d='M50.5,7.5 L50.5,82.5' fill-opacity='0' stroke='#FF4136' stroke-width='4'/>" +
    "<path d='M49.5,82.5 L80.5,45.5' fill-opacity='0' stroke='#FF4136' stroke-width='4'/>" +
    "<path d='M51.5,82.5 L20.5,45.5' fill-opacity='0' stroke='#FF4136' stroke-width='4'/>" +
    "<path d='M20.5,92.5 L80.5,92.5' fill-opacity='0' stroke='#FF4136' stroke-width='4'/>" +
  "</g>" +
"</svg>";

///////////////////////////////////////////////////////////////////// Global file storage variables

// Storage format for plainTextFileData
// [
//   { fileName: 'test.png', fileType: 'image/png', fileSize: 1337, fileData: 'base64 string' },
//   { fileName, 'test2.jpg', fileType: 'image/jpg', fileSize: 42000, fileData: 'base64 string' },
// ]

// Holds selected files in the structure shown above. Encryption happens by serializing this
// structure to a string, encrypting it, and storing it in the encryptedFileData.
var plainTextFileData = [];

// encryptedFileData stores the encrypted stringified version of stagedFileData.
var encryptedFileData = 'REPLACE_WITH_ENCRYPTED_DATA_';

//////////////////////////////////////////////////////////////////////////////// Progress indicator

// Progress hook
var progress = [];

var reset_progress = function () {
  progress = [];
  if (decryptionMode) {
    document.getElementById("decrypt-progress-summary").innerHTML = '';
  }
  else {
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
  document.getElementById("decrypt-progress-summary").innerHTML = h;
};

////////////////////////////////////////////////////////////////////////////////////////// File I/O

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
  reader.readAsDataURL(fileObj);
}

function humanFileSize(size) {
  var i = Math.floor( Math.log(size) / Math.log(1024) );
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

function displayFile(fileName, fileType, fileSize) {
  var filenameHash = fileName.hashCode();
  var fileDisplayHtml = '<div id="' + filenameHash + '" class="row fileDisplay"><div class="col-no-collapse c11"><div class="redText">'
    + fileName + '</div><div class="file-size orangeText">' + humanFileSize(fileSize)
    + '</div></div><div class="col-no-collapse c1"><button class="link-button delete-x" onclick="removeFile(\'' + fileName + '\')">X</button></div></div>';
  insertHtml(fileDisplayHtml, document.getElementById("dropAfterMe"));
}

function displayDecryptedFile(fileName, fileType, fileSize) {
  var filenameHash = fileName.hashCode();
  var fileDisplayHtml = '<div id="' + filenameHash + '" class="row fileDisplay"><div class="col-no-collapse c11"><div class="redText">'
    + fileName + '</div><div class="file-size orangeText">' + humanFileSize(fileSize)
    + '</div></div><div class="col-no-collapse c1"><button class="link-button download-file" onclick="downloadFile(\'' + fileName + '\')">' + downloadImage + '</button></div></div>';
  insertHtml(fileDisplayHtml, document.getElementById("add-after-me"));
}

function removeFileDisplay(filename) {
  var filenameHash = filename.hashCode();
  document.getElementById(filenameHash).remove();
}

function removeFile(filename) {
  console.log('Remove file: ' + filename);

  var indexToRemove = -1;
  for (var i = 0; i < plainTextFileData.length; i++) {
    if (plainTextFileData[i].fileName == filename) {
      indexToRemove = i;
      break;
    }
  }

  if (indexToRemove >= 0) {
    removeFileDisplay(filename);
    plainTextFileData.splice(i, 1);

    showOrHideDragDropMsgAndSelectFiles();
  }
}

function downloadFile(filename) {
  console.log('Download file: ' + filename);
  for (var i = 0; i < plainTextFileData.length; i++) {
    if (plainTextFileData[i].fileName == filename) {
      var blob = new Blob([Base64Binary.decode(plainTextFileData[i].fileData)], {
        type : plainTextFileData[i].fileType
      });
      saveAs(blob, filename);
      break;
    }
  }
}

function stripDataPrefix(dataUrl) {
  var firstCommaIndex = dataUrl.indexOf(',');
  return dataUrl.slice(firstCommaIndex+1);
}

function fileReadCallback(fileName, fileType, fileSize, fileData) {
  plainTextFileData.push({
    'fileName' : fileName,
    'fileType' : fileType,
    'fileSize' : fileSize,
    'fileData' : stripDataPrefix(fileData)
  });
  displayFile(fileName, fileType, fileSize);
  showOrHideDragDropMsgAndSelectFiles();
}

function alreadyHaveFile(fileObj) {
  // For now, just don't upload if the file name already exists;
  for (var i = 0; i < plainTextFileData.length; i++) {
    if (plainTextFileData[i].name == fileObj.name) {
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

// Grab the source file of this very file, which is used as the template into which to insert
// the cipherText.
var vaultTemplate = document.documentElement.outerHTML;

function renderVault(cipherText, callback) {
  // Set _decryptionMode variable and insert cipherText by replacing string.
  // String.fromCharCode(95) is used to represent '_', so that the cipherText isn't accidentally
  // inserted here.
  var vault = vaultTemplate
    .replace('<script>', '<script>var _decryptionMode = true;')
    .replace('REPLACE_WITH_ENCRYPTED_DATA' + String.fromCharCode(95), cipherText);

  callback(vault);
}

function saveVault(vaultData, vaultFileName) {
  var vaultBlob = new Blob([vaultData], {type: "text/html;charset=utf-8"});
  saveAs(vaultBlob, vaultFileName);
}

function createVault() {
  var password = document.getElementById('password_input').value;
  var plainText = JSON.stringify(plainTextFileData);

  encryptFileData(plainText, password, function (err, cipherText) {
    renderVault(cipherText, function (vaultData) {
      saveVault(vaultData, "locked_hypervault.html");
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

  // If they have previously decrypted, remove the displayed files before adding them back
  removeAllElementsByClass('fileDisplay');
  
  reset_progress();
  displayWrongPasswordMsg(false);
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

function decryptVault() {
  var password = document.getElementById('decrypt-password-input').value;

  decryptFileData(encryptedFileData, password, function (err, plainText) {
    displayDecryptMessage(false);
    plainTextFileData = JSON.parse(plainText);

    // Show container for decrypted files
    document.getElementById('decrypted-files').style.display = 'block';

    // Show each decrypted file
    for (var i=0; i<plainTextFileData.length; i++) {
      var fileName = plainTextFileData[i].fileName;
      var fileType = plainTextFileData[i].fileType;
      var fileSize = plainTextFileData[i].fileSize;
      displayDecryptedFile(fileName, fileType, fileSize);
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

// Misc Display

function showOrHideDragDropMsgAndSelectFiles() {
  console.log(plainTextFileData.length);
  if (plainTextFileData.length == 0) {
    document.getElementById('drag-msg-and-browse-button').style.display = 'block';
  }
  else {
    document.getElementById('drag-msg-and-browse-button').style.display = 'none';
  }
}

function displayDecryptMessage(display) {
  if (display) {
    document.getElementById('decrypt-helper-message').style.display = 'block';
  }
  else {
    document.getElementById('decrypt-helper-message').style.display = 'none';
  }
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

function removeAllElementsByClass(className) {
  [].forEach.call(document.querySelectorAll('.'+className),function(e){
    e.parentNode.removeChild(e);
  });
}

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

// Make Enter key Encrypt or Decrypt, depending on mode.

function inputKeyUp(e) {
  e.which = e.which || e.keyCode;
  if(e.which == 13) {
    if (decryptionMode) {
      decryptVault();
    }
    else {
      validateEncryptionFields() && createVault();
    }
    event.preventDefault();
    return false;
  }

}

var allInputs = document.getElementsByTagName('input');
for (var index = 0; index < allInputs.length; ++index) {
  allInputs[index].addEventListener("keydown", inputKeyUp);
}
