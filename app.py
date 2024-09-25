from pydub import AudioSegment
from flask import Flask, render_template, request, jsonify
import speech_recognition as sr
import pyttsx3
from translate import Translator 
import os

app = Flask(__name__)

# Initialize pyttsx3 for text-to-speech
engine = pyttsx3.init()

# Language settings
DEFAULT_SOURCE_LANG = 'en'
DEFAULT_TARGET_LANG = 'es'  # Example: translate to Spanish

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate_voice():
    # Step 1: Process uploaded audio file
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file uploaded'}), 400
    
    audio_file = request.files['file']
    audio_file.save('audio_file.wav')
    
    # Convert audio to WAV format using pydub
    try:
        sound = AudioSegment.from_file('audio_file.wav')
        sound.export('converted_audio.wav', format='wav')
    except Exception as e:
        return jsonify({'error': f"Audio conversion failed: {str(e)}"}), 500

    recognizer = sr.Recognizer()
    with sr.AudioFile('converted_audio.wav') as source:
        audio = recognizer.record(source)
    
    # Step 2: Convert speech to text using SpeechRecognition
    try:
        original_text = recognizer.recognize_google(audio)
        print(f"Recognized text: {original_text}")
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech could not be understood'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f"Could not request results; {e}"}), 500

    # Step 3: Translate the recognized text using the Translate library
    try:
        translator = Translator(from_lang=DEFAULT_SOURCE_LANG, to_lang=DEFAULT_TARGET_LANG)
        translated_text = translator.translate(original_text)
        print(f"Translated text: {translated_text}")
    except Exception as e:
        return jsonify({'error': f"Translation error: {str(e)}"}), 500

    # Step 4: Convert the translated text to speech using pyttsx3
    engine.save_to_file(translated_text, 'translated_output.mp3')
    engine.runAndWait()

    # Step 5: Return the audio file
    output_path = os.path.join('static', 'translated_output.mp3')
    engine.save_to_file(translated_text, output_path)
    engine.runAndWait()

    return jsonify({'translated_text': translated_text, 'audio': '/static/translated_output.mp3'})
if __name__ == '__main__':
    app.run(debug=True)
