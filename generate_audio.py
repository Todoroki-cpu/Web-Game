import urllib.request
import urllib.parse
import json
import os

VOICEVOX_HOST = "http://127.0.0.1:50021"
OUTPUT_DIR = "c:/work/Web-game/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 話者ID:
# あんぱん: 3 (ずんだもん)
# ばいきん: 11 (玄野武宏)
# しょくぱん: 2 (四国めたん)
# めろんぱん: 8 (春日部つむぎ)

new_voices = [
    # タイトルコール
    ("game_title_7", "ぐるぐる とけい！", 3),
    ("game_title_8", "とけい ぴったりマッチ！", 8),
    ("game_title_9", "1しゅうかん トレイン！", 11),
    ("game_title_10", "ようび カレンダー！", 2),
    ("game_title_11", "きせつの アイテムあつめ！", 8),
    ("game_title_12", "めぐる まほうの木！", 3),

    # 時計用
    ("clock_prompt_7", "あさ 7じ に はりを まわしてね！", 3),
    ("clock_prompt_12", "おひる 12じ に はりを まわしてね！", 3),
    ("clock_prompt_3", "3じの おやつに はりを まわしてね！", 3),
    ("clock_prompt_8", "よる 8じの おやすみに はりを まわしてね！", 3),
    ("clock_prompt_930", "9じはん に はりを まわしてね！", 3),
    ("clock_match_prompt", "おなじ じかんの とけいを えらんでね！", 8),
    ("clock_exact", "ポッポー！じかん ぴったり！", 3),
    ("clock_match_good", "せいかい！じかん バッチリ！", 8),

    # 曜日用
    ("day_mon", "げつようび！", 11),
    ("day_tue", "かようび！", 11),
    ("day_wed", "すいようび！", 11),
    ("day_thu", "もくようび！", 11),
    ("day_fri", "きんようび！", 11),
    ("day_sat", "どようび！", 11),
    ("day_sun", "にちようび！", 11),
    ("week_train_prompt", "あいている しゃりょうに ただしい ようびを つなげてね！", 11),
    ("week_train_clear", "ガッシャーン！1しゅうかん トレイン しゅっぱつ進行！", 11),
    ("week_quiz_prompt", "ヒントをみて ただしい ようびを タッチしてね！", 2),
    ("week_quiz_good", "たいへんよくできました！", 2),

    # 季節用
    ("season_spring", "はる！", 8),
    ("season_summer", "なつ！", 8),
    ("season_autumn", "あき！", 8),
    ("season_winter", "ふゆ！", 8),
    ("season_items_prompt", "この きせつの アイテムを カゴにいれてね！", 8),
    ("season_items_clear", "いっぱい あつまったね！おいしそう！", 8),
    ("season_wheel_prompt", "つぎの きせつに ダイヤルを まわしてね！", 3),
    ("season_wheel_clear", "まほうの木が へんしん！きれいだね！", 3),

    # カテゴリ案内
    ("cat_numbers", "すうじの ゲーム！", 3),
    ("cat_clock", "とけいの ゲーム！", 8),
    ("cat_days", "ようびの ゲーム！", 11),
    ("cat_seasons", "きせつの ゲーム！", 2)
]

def synthesize(text, filename, speaker=3):
    out_path = os.path.join(OUTPUT_DIR, f"{filename}.wav")
    if os.path.exists(out_path):
        print(f"Skipping (exists): {filename}.wav")
        return

    print(f"Generating [Speaker {speaker}]: {filename}.wav ('{text}')...")
    try:
        query_url = f"{VOICEVOX_HOST}/audio_query?text={urllib.parse.quote(text)}&speaker={speaker}"
        req_q = urllib.request.Request(query_url, method="POST")
        with urllib.request.urlopen(req_q) as resp:
            query_json = json.loads(resp.read().decode('utf-8'))

        query_json["speedScale"] = 1.05
        query_json["pitchScale"] = 0.05
        query_json["intonationScale"] = 1.2

        synth_url = f"{VOICEVOX_HOST}/synthesis?speaker={speaker}"
        req_s = urllib.request.Request(
            synth_url,
            data=json.dumps(query_json).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req_s) as resp:
            audio_data = resp.read()

        with open(out_path, "wb") as f:
            f.write(audio_data)
    except Exception as e:
        print(f"Error generating {filename}: {e}")

def main():
    print("=== Generating Clock, Days, Seasons Voices ===")
    for key, txt, spk in new_voices:
        synthesize(txt, key, speaker=spk)

    print("\n=== All audio generation done! ===")

if __name__ == "__main__":
    main()
