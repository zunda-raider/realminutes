from fastapi import FastAPI, Body
from pydantic import BaseModel
from process_audio import process_audio_url

app = FastAPI()

class AudioRequest(BaseModel):
    url: str
    language: str = "en"  # "en" or "ja"

@app.post("/process")
async def process_audio(req: AudioRequest):
    try:
        text = process_audio_url(req.url, req.language)
        return {"status": "success", "text": text}
    except Exception as e:
        return {"status": "error", "message": str(e)}
