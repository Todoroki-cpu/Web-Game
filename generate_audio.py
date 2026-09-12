import urllib.request
import urllib.parse
import json
import os

VOICEVOX_HOST = "http://127.0.0.1:50021"
OUTPUT_DIR = "c:/work/Web-game/audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 話者ID:
# キティ風 (リボンキャット): 0 (四国めたん あまあま)
# シナモン風 (フラッフィーパピー): 8 (春日部つむぎ)
# プリン風 (ゴールデンベレー): 1 (ずんだもん あまあま)
# メロディ風 (ピンクバニー): 10 (雨晴はう)

hiragana_voices = [
    # タイトルコール
    ("game_title_13", "ひらがな なぞりがき！", 8),
    ("game_title_14", "キャラクター かるた！", 0),
    ("game_title_15", "ことばの もぐもぐパズル！", 1),
    ("cat_hiragana", "ひらがなの ゲーム！", 8),

    # なぞり書き用
    ("trace_prompt", "ガイドの すうじにあわせて ゆびで なぞってね！", 8),
    ("trace_good", "すごい！とっても じょうずに かけたね！", 8),
    ("trace_a", "あ！アイスの あ！", 8),
    ("trace_i", "い！いちごの い！", 8),
    ("trace_u", "う！うさぎの う！", 8),
    ("trace_e", "え！えのぐの え！", 8),
    ("trace_o", "お！おにぎりの お！", 8),
    ("trace_ka", "か！かめの か！", 8),
    ("trace_sa", "さ！さかなの さ！", 8),
    ("trace_ta", "た！たいようの た！", 8),

    # 単音（五十音主要文字）
    ("hira_a", "あ！", 0),
    ("hira_i", "い！", 0),
    ("hira_u", "う！", 0),
    ("hira_e", "え！", 0),
    ("hira_o", "お！", 0),
    ("hira_ka", "か！", 0),
    ("hira_ki", "き！", 0),
    ("hira_ku", "く！", 0),
    ("hira_ke", "け！", 0),
    ("hira_ko", "こ！", 0),
    ("hira_sa", "さ！", 0),
    ("hira_shi", "し！", 0),
    ("hira_su", "す！", 0),
    ("hira_se", "せ！", 0),
    ("hira_so", "そ！", 0),
    ("hira_ta", "た！", 0),
    ("hira_chi", "ち！", 0),
    ("hira_tsu", "つ！", 0),
    ("hira_te", "て！", 0),
    ("hira_to", "と！", 0),
    ("hira_na", "な！", 0),
    ("hira_ni", "に！", 0),
    ("hira_nu", "ぬ！", 0),
    ("hira_ne", "ね！", 0),
    ("hira_no", "の！", 0),
    ("hira_ha", "は！", 0),
    ("hira_hi", "ひ！", 0),
    ("hira_fu", "ふ！", 0),
    ("hira_he", "へ！", 0),
    ("hira_ho", "ほ！", 0),
    ("hira_ma", "ま！", 0),
    ("hira_mi", "み！", 0),
    ("hira_mu", "む！", 0),
    ("hira_me", "め！", 0),
    ("hira_mo", "も！", 0),
    ("hira_ya", "や！", 0),
    ("hira_yu", "ゆ！", 0),
    ("hira_yo", "よ！", 0),
    ("hira_ra", "ら！", 0),
    ("hira_ri", "り！", 0),
    ("hira_ru", "る！", 0),
    ("hira_re", "れ！", 0),
    ("hira_ro", "ろ！", 0),
    ("hira_wa", "わ！", 0),
    ("hira_wo", "を！", 0),
    ("hira_nn", "ん！", 0),

    # かるた用問題
    ("karuta_prompt", "よまれた ひらがなカードを パチンと タッチしてね！", 0),
    ("karuta_q_ringo", "りんごの り は どれかな？", 0),
    ("karuta_q_usagi", "うさぎの う を タッチしてね！", 0),
    ("karuta_q_neko", "ねこの ね は どれかな？", 0),
    ("karuta_q_kuma", "くまの く を タッチしてね！", 0),
    ("karuta_q_sakana", "さかなの さ は どれかな？", 0),
    ("karuta_q_tori", "とりの と を タッチしてね！", 0),
    ("karuta_hit", "パチン！だいせいかい！", 0),

    # 言葉パズル用
    ("word_prompt", "もじを ならべて ことばを つくってね！", 1),
    ("word_ringo", "りんご！おいしそう！", 1),
    ("word_panda", "ぱんだ！かわいいね！", 1),
    ("word_kuruma", "くるま！かっこいい！", 1),
    ("word_neko", "ねこ！ニャー！", 1),
    ("word_kuma", "くま！だいせいこう！", 1),
    ("word_cake", "ケーキ！おいしいー！", 1)
]

def synthesize(text, filename, speaker=0):
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
    print("=== Generating Hiragana & Sanrio Voices ===")
    for key, txt, spk in hiragana_voices:
        synthesize(txt, key, speaker=spk)

    print("\n=== All hiragana audio generation done! ===")

if __name__ == "__main__":
    main()
