import pytesseract
from PIL import Image

# Agar Windows par error aaye "tesseract is not installed", toh is line ko uncomment kar ke apna path daal dena:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        return f"OCR Error: {str(e)}"
        
    
import whisper

def extract_text_from_audio(audio_path):
    try:
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result["text"]
    except Exception as e:
        return f"STT Error: {str(e)}"