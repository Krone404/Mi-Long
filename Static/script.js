// const hamburger = document.getElementById("hamburger");
// const sidebar = document.getElementById("sidebar");

const modal = document.getElementById("languageModal");

const fromLanguageBtn = document.getElementById("from-language-btn");
const toLanguageBtn = document.getElementById("to-language-btn");
const translateBtn = document.getElementById("translate-btn");

const closeBtn = document.getElementsByClassName("close")[0];

var splitScreen = document.querySelector('.split-screen');
var topHalf = document.querySelector('.top-half');
var bottomHalf = document.querySelector('.bottom-half');

var selectedButton = null;

// hamburger.onclick = function() {
//     sidebar.style.display = "block";

// }

fromLanguageBtn.onclick = function() {
    modal.style.display = "block";
    selectedButton = fromLanguageBtn;
}

toLanguageBtn.onclick = function() {
    modal.style.display = "block";
    selectedButton = toLanguageBtn;
}

document.querySelectorAll(".language-list li").forEach(function(item) {
    item.onclick = function() {
        selectedButton.innerHTML = this.innerHTML;
        modal.style.display = "none";
    }
});

closeBtn.onclick = function() {
    modal.style.display = "none";
}

translateBtn.onclick = function() {
    circleContainer.classList.add('circle-center');
    
    splitScreen.style.display = 'block';
    
    setTimeout(function() {
        topHalf.classList.add('rotate-top');
    }, 1000);
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

const recordButton = document.getElementById('record');
const audioPlayback = document.getElementById('audioPlayback');
const translatedText = document.getElementById('translatedText');
let mediaRecorder;
let audioChunks = [];

recordButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('file', audioBlob, 'audio.wav');

                // Send the audio to the Flask server
                fetch('/translate', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    translatedText.innerText = data.translated_text;
                    audioPlayback.src = data.audio + '?t=' + new Date().getTime();
                })
                .catch(err => console.error(err));
            };

            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);  // Record for 3 seconds
        });
});