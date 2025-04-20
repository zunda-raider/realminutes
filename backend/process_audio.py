import shutil
from datetime import datetime
import os

def save_transcript(text, original_filename, language="ja"):
    base_name = os.path.splitext(original_filename)[0]
    now = datetime.now().strftime('%Y%m%d_%H%M')
    file_name = f"{base_name}_{language}_{now}.txt"

    # 保存先1：backend フォルダ内
    path_local = os.path.join("backend", file_name)
    with open(path_local, "w", encoding="utf-8") as f:
        f.write(text)

    # 保存先2：指定ローカルフォルダ（D:\2025前期）
    target_dir = r"D:\2025前期"
    os.makedirs(target_dir, exist_ok=True)
    path_backup = os.path.join(target_dir, file_name)
    shutil.copy(path_local, path_backup)

    print(f"📝 議事録を保存したよ：\n→ {path_local}\n→ {path_backup}")

    # オプション：Supabaseにアップロード（要 Supabase SDK 利用）
    return file_name
