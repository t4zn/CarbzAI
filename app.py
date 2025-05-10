from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import io
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("API_KEY")

# Configure API key
genai.configure(api_key=API_KEY)

# Create a Generative Model instance
model = genai.GenerativeModel('gemini-1.5-flash')  # or 'gemini-pro'

# Route to serve the HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle user questions
@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        data = request.json
        user_message = data['message']

        # Generate response using model
        response = model.generate_content(user_message)

        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"reply": f"Error occurred: {str(e)}"}), 500

# Route to handle OCR image upload
@app.route('/api/ocr', methods=['POST'])
def ocr():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['file']
        filename = file.filename.lower()
        text = ''
        if filename.endswith('.pdf'):
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_pdf:
                file.save(temp_pdf.name)
                images = convert_from_path(temp_pdf.name)
                for img in images:
                    text += pytesseract.image_to_string(img) + '\n'
        else:
            img = Image.open(file.stream)
            text = pytesseract.image_to_string(img)
        return jsonify({'text': text.strip()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
