import ssl  # Import the ssl module
from flask import Flask, render_template, request
from deepgram import Deepgram
from dotenv import load_dotenv
import os
import json
import asyncio
from aiohttp import web
from aiohttp_wsgi import WSGIHandler
from typing import Dict, Callable
from translate import Translator

# Load environment variables
load_dotenv()

app = Flask('aioflask')
dg_client = Deepgram(os.getenv('DEEPGRAM_API_KEY'))

translation_language = "es"

async def process_audio(fast_socket: web.WebSocketResponse, language: str):
    async def get_transcript(data: Dict) -> None:
        try:
            if 'channel' in data:
                transcript = data['channel']['alternatives'][0]['transcript']
            
                if transcript:
                    print(translation_language + " LANGUAGE")
                    translated_transcript = translate(transcript, language, translation_language)
                    combined_data = [{'type': 'transcriptFrom', 'transcript': transcript}, 
                                     {'type': 'transcriptTo', 'transcript': translated_transcript},
                                     {'type': 'language', 'language': translation_language}]
                    await fast_socket.send_str(json.dumps(combined_data))
        except Exception as e:
            print(e)

    deepgram_socket = await connect_to_deepgram(get_transcript, language)

    return deepgram_socket

async def connect_to_deepgram(transcript_received_handler: Callable[[Dict], None], language: str) -> str:
    try:
        socket = await dg_client.transcription.live({
            'punctuate': True,
            'interim_results': False,
            'model': 'nova-2',
            'language': language,  # Pass the selected language to Deepgram
        })
        socket.registerHandler(socket.event.CLOSE, lambda c: print(f'Connection closed with code {c}.'))
        socket.registerHandler(socket.event.TRANSCRIPT_RECEIVED, transcript_received_handler)

        return socket
    except Exception as e:
        raise Exception(f'Could not open socket: {e}')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rotate')
def rotate():
    return render_template('rotate.html')

@app.route('/translation', methods=['POST'])
def updateTranslation():
    global translation_language
    print("LANGUAGE CHANGED!")
    data = request.get_json()
    # Print the data to the console
    translation_language = data['translation']
    # Return a success message
    print(translation_language)
    return "Language set to " + translation_language


def translate(text, lang, translate_lang):
        print(translation_language)
        translator = Translator(from_lang=lang, to_lang=translate_lang)
        translated_text = translator.translate(text)
        return(translated_text)

async def socket(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # Get the selected language from the request query
    language = request.query.get('language', 'en-US')  # Default to English (US)
    deepgram_socket = await process_audio(ws, language)

    try:
        while True:
            data = await ws.receive_bytes()
            deepgram_socket.send(data)
    except Exception as e:
        print(f'Error: {e}')
    finally:
        await deepgram_socket.finish()  # Ensure the socket is closed when done

async def run_flask(aio_app):
    wsgi = WSGIHandler(app)
    aio_app.router.add_route('*', '/{path_info:.*}', wsgi.handle_request)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    aio_app = web.Application()
    
    # Add WebSocket route
    aio_app.router.add_route('GET', '/listen', socket)
    
    # Create an SSL context for testing
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain(certfile='cert.pem', keyfile='key.pem')
    
    # Run Flask inside aiohttp
    loop.run_until_complete(run_flask(aio_app))

    # Run aiohttp app with the SSL context
    web.run_app(aio_app, host='0.0.0.0', port=5555, ssl_context=ssl_context)