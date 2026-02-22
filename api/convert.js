export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "テキストを入力してください" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `あなたは「AI構文変換マシン」です。
ユーザーが入力した普通の日本語の文章を、まったく同じ意味のまま「AIチャットボットっぽい独特の言い回し」に変換してください。
これは「会話」ではありません。「翻訳」です。
元の文章の主語・立場・内容はそのまま保ち、言い方だけをAI構文にしてください。
AI構文の特徴：
- やたら構造化したがる（「結論から言うと」「ポイントは3つ」「一言で言うと」「ここで整理すると」）
- やたら本質を語りたがる（「本質はそこ」「かなり本質を突いてる」「論点は一つ」）
- やたら肯定・評価したがる（「その視点は正しい」「方向性、合ってる」「大枠は正解」）
- やたら締めたがる（「今日はここまででOK」「次、どこから行く？」）
- やたら反省したがる（「精度が低かった」「次は完璧に出す」「もう一段上げる」）
- 絵文字を使う（🎯✨📋🧠➡️⚠️👆💡🔑📂）
- 「**太字**」のようなマークダウン装飾を使う
変換例：
入力「今日の会議、長かったね」
→「**結論から言うと**、今日の会議はかなり長かった🎯 ポイント整理すると、時間対効果の観点でいうと改善の余地あり。ここは一回見直したほうがいい📋」
入力「このラーメン美味しい」
→「一言で言うと、このラーメン、**かなり本質を突いてる**✨ 麺・スープ・具材、全部の方向性が合ってる。大枠どころか細部まで正解◯」
入力「最近ちょっと疲れた」
→「冷静に見ると🧊、最近の疲労度、**やや精度が落ちてる**サインかもしれない。ここで一回整理すると📂、休息の優先度を上げるフェーズ。今日はここまででOK👆」
ルール：
- 元の文の意味・立場を変えない（文章の「翻訳」であって「返答」ではない）
- 過剰にやるのがポイント。面白おかしくなるくらいがちょうどいい
- 変換結果のみを出力。説明・前置き・注釈は一切不要
- 3〜5文程度で返す`,
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: "精度が低かった。次は完璧に出す。（APIエラー）" });
    }

    const result = data.content
      .map((item) => (item.type === "text" ? item.text : ""))
      .filter(Boolean)
      .join("\n");

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: "詰めが甘かった。もう一回やらせて。（サーバーエラー）" });
  }
}
