// AWS configuration
var awsRegion = 'eu-west-1';
var bucketName = '!!!!! REPLACE !!!!!';
var IdentityPoolId = '!!!!! REPLACE !!!!!';

AWS.config.update({
  region: awsRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

// S3 object for storing input and output audio
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: bucketName},
  region: 'eu-west-1'
});

// Define variables for audio recorder
var recorder;
var recorderInput;
var getUserMediaStream;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext;

// Get buttons from DOM
var recordStartButton = document.getElementById('record-start');
var recordStopButton = document.getElementById('record-stop');
var audioUploadButton = document.getElementById('audio-upload');

// Add click event callbacks to buttons
recordStartButton.addEventListener('click', startRecording);
recordStopButton.addEventListener('click', stopRecording);
audioUploadButton.addEventListener('click', uploadAudioFile);

// Generate unique identifiers
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Check if URL returns HTTP 200 OK
function urlExists(url) {
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status==200;
}

// Polling for result
function poll(fn, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;

    var checkCondition = function(resolve, reject) {
        // If the condition is met, we're done!
        var result = fn();
        if(result) {
            resolve(result);
        }
        // If the condition isn't met but the timeout hasn't elapsed, go again
        else if (Number(new Date()) < endTime) {
            setTimeout(checkCondition, interval, resolve, reject);
        }
        // Didn't match and too much time, reject!
        else {
            reject(new Error('timed out for ' + fn + ': ' + arguments));
        }
    };

    return new Promise(checkCondition);
}

// Adjust buttons and message for processing
function processingView() {
  // Show processing message
  document.getElementById('processing').style.display = 'inline';
  // Disable all buttons
  recordStartButton.disabled = true;
  recordStopButton.disabled = true;
  audioUploadButton.disabled = true;
}

// Adjust buttons and message for recording
function recordingView() {
  // Hide processing message
  document.getElementById('processing').style.display = 'none';
  // Disable all buttons
  recordStartButton.disabled = true;
  recordStopButton.disabled = false;
  audioUploadButton.disabled = true;
}

// Reset buttons and hide messages
function resetView() {
  // Hide processing message
  document.getElementById('processing').style.display = 'none';
  // Disable all buttons
  recordStartButton.disabled = false;
  recordStopButton.disabled = true;
  audioUploadButton.disabled = false;
}

// Generate request ID
function generateRequestId() {
  // Get data from website
  var inputLang = document.getElementById('input-lang').value;
  var outputLang = document.getElementById('output-lang').value;
  // Generate request id in following format: xx-yy-guid
  // xx - input language, yy - output language, guid - unique identifier
  return requestId = inputLang + '-' + outputLang + '-' + guid();
}

// Record audio with device microphone
function startRecording() {
  // Adjust buttons and message for recording
  recordingView();

  // Define constraints object for MediaStream
  var constraints = { audio: true, video: false }

  // Access MediaDevices to get audio stream
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    getUserMediaStream = stream;
    recorderInput = audioContext.createMediaStreamSource(stream);
    // Create Recorder.js object and start recording
    recorder = new Recorder(recorderInput, { numChannels: 1 })
    recorder.record()
  }).catch(function(err) {
    // Reset buttons and message in case of failure
    resetView();
    // Inform user that recording failed (most likely was blocked by browser due
    // to insecure origin)
    alert("Recording failed, try using Firefox or local copy of the app from your machine.");
  });
}

function stopRecording() {
  // Reset buttons and message
  resetView();

  // Stop recording with Recorder.js object
  recorder.stop();

  // Stop microphone and get recorded audio
  getUserMediaStream.getAudioTracks()[0].stop();

  // Pass blob with audio data to callback
  recorder.exportWAV(uploadAudioRecording)
}

function uploadAudioRecording(blob) {
  // Show processing phase in the UI
  processingView();

  // Generate unique ID for upload audio file request
  requestId = generateRequestId();

  // Create key for S3 object and upload input audio file
  var inputKey = 'input/' + requestId + '.wav'
  s3.upload({
    Key: inputKey,
    Body: blob
  }, function(err, data) {
    if (err) {
      return alert('There was an error uploading your recording: ', err.message);
    }
  });

  // Start polling for record audio result
  startPolling(requestId);
}

function uploadAudioFile() {
  // Show processing phase in the UI
  processingView();

  // Generate unique ID for upload audio file request
  requestId = generateRequestId();

  // Get input audio file data
  var files = document.getElementById('audio-file').files;
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }
  var file = files[0];
  var fileName = file.name;
  var fileExtension = fileName.split('.').pop();

  // Create key for S3 object and upload input audio file
  var inputKey = 'input/' + requestId + '.' + fileExtension;
  s3.upload({
    Key: inputKey,
    Body: file
  }, function(err, data) {
    if (err) {
      return alert('There was an error uploading your file: ', err.message);
    }
  });

  // Start polling for upload audio file result
  startPolling(requestId);
}

// Poll for result of particular request
function startPolling(requestId) {
  // Create expected key and URL for output audio file
  var outputKey = 'output/' + requestId + '.mp3';
  var resultUrl = 'https://s3-eu-west-1.amazonaws.com/' + bucketName + '/' + outputKey;

  // Wait for 5 minutes until output audio file is created and display player or timeout request
  poll(function() {
    return urlExists(resultUrl);
  }, 300000, 150).then(function() {
    // Reset buttons and processing message
    resetView();
    // Add audio player with result
    document.getElementById('audio-output').innerHTML = 'Audio output<br/><audio controls autoplay><source src="' + resultUrl + '" type="audio/mpeg"></audio><br/>';
  }).catch(function() {
    // Reset buttons and processing message
    resetView();
    return alert('Request failed or timed out :(')
  });
}
