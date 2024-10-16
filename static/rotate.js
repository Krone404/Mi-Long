let socket;
let mediaRecorder;
let temp;
let isRecording = false;
let isPulsating = false;
let isSwapped = false;

function toggleCirclePluse(toggle) {
    const pulsatingCircle = document.querySelector('.pulsating-circle');
    const solidCircle = document.querySelector('.solid-circle');
    const outerPulsatingCircle = document.querySelector('.outer-pulsating-circle');
    if (!isPulsating) {
        // Start pulsating and change all colors to rgba(242, 242, 242, x)
        pulsatingCircle.style.backgroundColor = 'rgba(242, 242, 242, 0.6)'; // Light pulsating color
        solidCircle.style.backgroundColor = 'rgba(242, 242, 242, 1)'; // Light solid color
        outerPulsatingCircle.style.backgroundColor = 'rgba(242, 242, 242, 0.3)'; // Light outer color
        pulsatingCircle.style.animation = 'pulsate 1.5s infinite'; // Start animation
        outerPulsatingCircle.style.animation = 'pulsate 3s infinite'; // Start outer circle animation
        isPulsating = true;
    } else {
        // Stop pulsating and revert all colors to rgba(13, 13, 13, x)
        pulsatingCircle.style.backgroundColor = 'rgba(13, 13, 13, 0.6)'; // Dark color with partial opacity
        solidCircle.style.backgroundColor = 'rgba(13, 13, 13, 1)'; // Dark solid color
        outerPulsatingCircle.style.backgroundColor = 'rgba(13, 13, 13, 0.3)'; // Dark outer color
        pulsatingCircle.style.animation = 'none'; // Stop animation
        outerPulsatingCircle.style.animation = 'none'; // Stop animation for outer circle
        isPulsating = false;
    }
}

document.getElementById('toggleBtn').addEventListener('click', async () => {
    toggleCirclePluse()
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
            return alert('Browser not supported');
        }

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        // Get selected language from dropdown
        const selectedLanguage = document.getElementById('languageFrom').value;
        console.log(selectedLanguage)

        // Include language in the WebSocket URL as a query parameter
        socket = new WebSocket(`wss://192.168.4.142:5555/listen?language=${selectedLanguage}`); 
        // PLEASE PLEASE PLEASE PLEASE CHANGE THIS TO YOUR IP IN IPCONFIG TO MAKE THIS WORK. 0.0.0.0 DOES NOT WORK. JUST CHANGE IT FOR THE DEMO.

        socket.onopen = () => {
            document.getElementById('toggleBtn').textContent = 'Stop Transcription';
            isRecording = true;

            mediaRecorder.addEventListener('dataavailable', async (event) => {
                if (event.data.size > 0 && socket.readyState === 1) {
                    socket.send(event.data);
                }
            });
            mediaRecorder.start(250);
        };

        socket.onmessage = (message) => {
            const received = JSON.parse(message.data);
        
            if (received) {
                const transcriptFrom = received.find(item => item.type === 'transcriptFrom').transcript;
                const transcriptTo = received.find(item => item.type === 'transcriptTo').transcript;
        
                // Always write to the same boxes, regardless of isSwapped
                const currentTop = document.getElementById('topTranscription').innerHTML;
                const currentBottom = document.getElementById('bottomTranscription').innerHTML;
        
                // istead of changing the transcription elements, just change what currenttop and currentbottom are written to based on a flag of whether it has been swapped.

                document.getElementById('topTranscription').innerHTML = currentTop + "<br>" + transcriptTo;
                document.getElementById('bottomTranscription').innerHTML = currentBottom + '<br><span style="float:right;">' + transcriptFrom;
                speakText(transcriptTo, received.find(item => item.type === 'language').language);
            }
        };
        

        socket.onclose = () => {
            stopRecording();
        };
    });
}

function stopRecording() { 
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    if (socket && socket.readyState === 1) {
        socket.close();
    }

    document.getElementById('toggleBtn').textContent = 'Start Transcription';
    isRecording = false;
}

function loadTranslation(){
    
    const selectedTranslation = document.getElementById('languageTo').value;
    console.log(selectedTranslation)
    fetch("/translation", {
        method: "POST",
        body: JSON.stringify({
            translation: selectedTranslation
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

}

function loadLanguage(){
    const selectedTranslation = document.getElementById('languageFrom').value;
    console.log(selectedTranslation)
}

function swapLanguages() {
    temp = document.getElementById('languageFrom').value;
    document.getElementById('languageFrom').value = document.getElementById('languageTo').value;
    document.getElementById('languageTo').value = temp;

    // Flip the boxes visually by adding a CSS class that swaps their display order
    isSwapped = !isSwapped;

    if (isSwapped) {
        document.getElementById('topBox').classList.add('swapped');
        document.getElementById('bottomBox').classList.add('swapped');
    } else {
        document.getElementById('topBox').classList.remove('swapped');
        document.getElementById('bottomBox').classList.remove('swapped');
    }

    loadTranslation();
}

function speakText(inputText, language) {
    // Your Azure Speech Service subscription key and region
    const speechKey = 'e46e4f39f27346b3aee612df188f0f58';
    const serviceRegion = 'uksouth';

    // Initialize the speech configuration
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, serviceRegion);

    // Set the speech language (optional, can adjust as needed)
    switch (language) {
        case 'en-US':
            speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
            break;
        case 'es':
            speechConfig.speechSynthesisVoiceName = 'es-ES-ElviraNeural';
            break;
        case 'fr':
            speechConfig.speechSynthesisVoiceName = 'fr-FR-DeniseNeural';
            break;
        case 'de':
            speechConfig.speechSynthesisVoiceName = 'de-DE-KatjaNeural';
            break;
        case 'ro':
            speechConfig.speechSynthesisVoiceName = 'ro-RO-AlinaNeural';
            break;
        case 'sv':
            speechConfig.speechSynthesisVoiceName = 'sv-SE-SofieNeural';
            break;
        case 'zh-CN':
            speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural';
            break;
        default:
            // Fallback to a default voice if no match is found
            speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
    }

    // Create the speech synthesizer
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

    // Synthesize the input text
    synthesizer.speakTextAsync(
        inputText,
        function (result) {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log("Speech synthesis succeeded.");
            } else {
                console.error("Speech synthesis failed: ", result.errorDetails);
            }
            synthesizer.close();
        },
        function (err) {
            console.error("Error during synthesis: ", err);
            synthesizer.close();
        }
    );
}