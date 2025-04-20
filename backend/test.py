import requests, os, subprocess, whisper

DOWNLOAD_DIR = "downloads"
SPLIT_DIR = "splits"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(SPLIT_DIR, exist_ok=True)

def split_audio(input_file, output_dir, chunk_duration=30):
    command = [
        "ffmpeg",
        "-i", input_file,
        "-f", "segment",
        "-segment_time", str(chunk_duration),
        "-c", "copy",
        os.path.join(output_dir, "chunk_%03d.webm")
    ]
    subprocess.run(command)

def process_audio_url(audio_url, language="ja"):
    filename = os.path.join(DOWNLOAD_DIR, "input.webm")
    res = requests.get(audio_url)
    with open(filename, "wb") as f:
        f.write(res.content)

    split_audio(filename, SPLIT_DIR)

    model = whisper.load_model("base")
    result_text = ""
    for f in sorted(os.listdir(SPLIT_DIR)):
        path = os.path.join(SPLIT_DIR, f)
        result = model.transcribe(path, language=language)
        result_text += f"\n=== {f} ===\n" + result["text"]
    return result_text
