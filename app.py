from flask import Flask, render_template, request, jsonify
from translate import Translator

app = Flask(__name__)

# de, en, zh-cn
DEFAULT_SOURCE_LANG = 'en'
DEFAULT_TARGET_LANG = 'es'  # Example: translate to Spanish

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate_audio', methods=['POST'])
def translate_audio():
    original_text = request.form['text']  # Use request.form to access form data
    target_lang = request.form['lang']     # Use request.form to access the language

    try:
        translator = Translator(from_lang=DEFAULT_SOURCE_LANG, to_lang=DEFAULT_TARGET_LANG)
        translated_text = translator.translate(original_text)
        print(f"Translated text: {translated_text}")
        return jsonify({'translated_text': translated_text})  # Return the translated text
    except Exception as e:
        return jsonify({'error': f"Translation error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)