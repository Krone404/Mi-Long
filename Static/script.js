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

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let recognition; // Declare the recognition variable

    async function translateSpeach(text) {
        const formData = new FormData();
        formData.append('text', text); // Correctly append the text
        formData.append('lang', "en-GB"); // Append the target language

        try {
            const response = await fetch('/translate_audio', { // Correct endpoint
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Extract JSON from response

            if (data.error) {
                throw new Error(data.error);
            }

            console.log("Translated Text:", data.translated_text); // Log the translated text
            return data.translated_text; // Return the translated text
        } catch (err) {
            console.error('Error fetching translation:', err);
            return text; // Return the original text if there's an error
        }
    }

    // Function to start speech recognition
    function startRecognition() {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-GB" // Set language for recognition
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;

            // Automatically speak the recognized text
            const translatedText = await translateSpeach(transcript);
            console.log("Final Translated Text:", translatedText);
            speakText(translatedText);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
            console.log('Speech recognition ended.');
        };

        recognition.start();
    }

    // Function to convert text to speech
    function speakText(text) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en"; // Set the language based on user selection
        speech.onstart = () => {
        };
        speech.onend = () => {
        };
        speech.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        window.speechSynthesis.speak(speech);
    }

    let flag = false;
    // Event listener for starting recognition
    document.getElementById('translate-btn').addEventListener('click', () => {
        if (flag === false) {
            startRecognition();
            flag = true;
        } else {
            flag = false;
            recognition.stop();
        }
        
    });
});