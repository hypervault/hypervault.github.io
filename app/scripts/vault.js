// Progress indicator

// Set up SVG animation
// see http://jakearchibald.com/2013/animated-line-drawing-svg/
var progressPath = document.querySelector('.progress path');
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
  document.getElementById("percent").innerHTML = percent+"%";
}

// Progress hook
var progress = [];

var reset_progress = function () {
  progress = [];
  document.getElementById("progress-summary").innerHTML = '';
};

var progress_hook = function(p) {
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
  document.getElementById("progress-summary").innerHTML = h;
};

// Decryption

var fileName = 'REPLACE_WITH_FILE_NAME';
var fileType = 'REPLACE_WITH_FILE_TYPE;';
var cipherData = 'REPLACE_WITH_FILE_DATA';

function decryptFileData(cipherData, password, callback) {
  var data = new triplesec.Buffer(cipherData, 'base64');
  var key = new triplesec.Buffer(password);

  reset_progress();
  triplesec.decrypt({key:key, progress_hook: progress_hook, data:data}, function (err, plainData) {
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

