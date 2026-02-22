import { useState, useRef, useEffect } from "react";

const AI_PHRASES = [
  "結論から言うと",
  "本質はそこ🎯",
  "ポイント言うね✨",
  "一言で言うと",
  "ここで整理📂",
  "簡単に言うと",
  "冷静に見ると🧊",
  "まず前提🧠",
  "流れはこう➡️",
  "かなり本質を突いてる",
  "論点は一つ",
  "大枠は正解◯",
];

const EXAMPLES = [
  "今日の会議、長かったね",
  "このラーメン美味しい",
  "最近ちょっと疲れた",
  "週末なにしよう",
  "明日の天気が心配",
  "新しいカフェに行きたい",
];

function FloatingParticles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    text: AI_PHRASES[i % AI_PHRASES.length],
    left: `${Math.random() * 90 + 5}%`,
    delay: `${Math.random() * 20}s`,
    duration: `${18 + Math.random() * 15}s`,
    size: `${10 + Math.random() * 4}px`,
    opacity: 0.05 + Math.random() * 0.05,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            bottom: "-60px",
            fontSize: p.size,
            opacity: p.opacity,
            color: "#1a1a2e",
            fontWeight: 700,
            whiteSpace: "nowrap",
            animation: `floatUp ${p.duration} ${p.delay} linear infinite`,
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
      <span style={{ fontSize: "13px", color: "#888", fontFamily: "'Noto Sans JP', sans-serif" }}>
        AI構文に変換中
      </span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#FFB800",
            animation: `bounce 1.2s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const textareaRef = useRef(null);

  async function handleConvert() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult("");
    setError("");
    setConverted(false);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "精度が低かった。次は完璧に出す。（通信エラー）");
        setLoading(false);
        return;
      }

      setResult(data.result);
      setConverted(true);
    } catch (err) {
      setError("詰めが甘かった。もう一回やらせて。（通信エラー）");
    }
    setLoading(false);
  }

  function handleCopy() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(result).then(() => {
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
        }).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    try {
      const ta = document.createElement("textarea");
      ta.value = result;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      window.prompt("コピーしてね:", result);
    }
  }

  function handleExampleClick(text) {
    setInput(text);
    setConverted(false);
    setResult("");
    textareaRef.current?.focus();
  }

  function handleReset() {
    setInput("");
    setResult("");
    setConverted(false);
    setError("");
    textareaRef.current?.focus();
  }

  useEffect(() => {
    if (converted && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [converted]);

  function renderResult(text) {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: "8px" }} />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} style={{ color: "#FFB800", fontWeight: 800 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      return (
        <div key={i} style={{ marginBottom: "6px" }}>
          {parts}
        </div>
      );
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-110vh) rotate(8deg); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,184,0,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(255,184,0,0); }
        }
        textarea::placeholder { color: #ccc; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F5F0E8", position: "relative", overflow: "hidden" }}>
        <FloatingParticles />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "580px", margin: "0 auto", padding: "48px 20px 80px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "44px", animation: "slideUp 0.6s ease-out" }}>
            <div style={{
              display: "inline-block", background: "#1a1a2e", color: "#FFB800",
              padding: "5px 14px", borderRadius: "100px", fontSize: "10px", fontWeight: 700,
              letterSpacing: "2.5px", fontFamily: "'Noto Sans JP', sans-serif",
              marginBottom: "18px", textTransform: "uppercase",
            }}>
              AI TEXT CONVERTER
            </div>
            <h1 style={{
              fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "clamp(36px, 9vw, 56px)",
              fontWeight: 900, color: "#1a1a2e", lineHeight: 1.15, letterSpacing: "-1px",
            }}>
              AI構文
              <br />
              <span style={{
                background: "linear-gradient(90deg, #FFB800, #FF6B35, #FFB800)",
                backgroundSize: "200% auto", WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite",
              }}>
                つく〜る
              </span>
            </h1>
            <p style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px",
              color: "#999", marginTop: "14px", fontWeight: 500, lineHeight: 1.7,
            }}>
              ふつうの日本語を入力すると
              <br />
              AIっぽい言い回しに変換されます
            </p>
          </div>

          {/* Input Card */}
          <div style={{
            background: "#FFF", borderRadius: "24px", padding: "24px",
            boxShadow: "0 2px 24px rgba(0,0,0,0.05)", marginBottom: "14px",
            animation: "slideUp 0.6s 0.15s ease-out both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <label style={{
                fontSize: "11px", fontWeight: 700, color: "#ccc", letterSpacing: "1.5px",
                fontFamily: "'Noto Sans JP', sans-serif", textTransform: "uppercase",
              }}>
                ふつうの日本語
              </label>
              {input && (
                <button onClick={handleReset} style={{
                  background: "none", border: "none", fontSize: "11px", color: "#ccc",
                  cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
                }}>
                  クリア
                </button>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ここに文章を入力してね"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleConvert();
              }}
              style={{
                width: "100%", minHeight: "100px", border: "none", outline: "none",
                resize: "vertical", fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: "16px", lineHeight: 1.8, color: "#1a1a2e", background: "transparent",
              }}
            />
            <div style={{ textAlign: "right", marginTop: "8px" }}>
              <span style={{ fontSize: "11px", color: "#ddd", fontFamily: "'Noto Sans JP', sans-serif" }}>
                {input.length > 0 ? `${input.length}文字` : "⌘+Enter で変換"}
              </span>
            </div>
          </div>

          {/* Examples */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px",
            animation: "slideUp 0.6s 0.25s ease-out both",
          }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                style={{
                  padding: "7px 14px", borderRadius: "100px",
                  border: "1.5px solid #e0dbd3", background: "rgba(255,255,255,0.6)",
                  fontSize: "12px", color: "#888", cursor: "pointer",
                  fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.target.style.background = "#FFF"; e.target.style.borderColor = "#1a1a2e"; e.target.style.color = "#1a1a2e"; }}
                onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.6)"; e.target.style.borderColor = "#e0dbd3"; e.target.style.color = "#888"; }}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={loading || !input.trim()}
            style={{
              width: "100%", padding: "18px", borderRadius: "16px", border: "none",
              background: !input.trim() ? "#ddd" : "#1a1a2e",
              color: !input.trim() ? "#aaa" : "#FFB800",
              fontSize: "16px", fontWeight: 700, cursor: !input.trim() ? "default" : "pointer",
              fontFamily: "'Zen Kaku Gothic New', sans-serif", letterSpacing: "1px",
              transition: "all 0.3s ease",
              animation: input.trim() && !loading ? "pulse 2s ease-in-out infinite" : "none",
              marginBottom: "32px", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "変換中..." : "AI構文に変換する ✨"}
          </button>

          {/* Loading */}
          {loading && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div style={{
              background: "#FFF5F5", border: "2px solid #FFE0E0", borderRadius: "16px",
              padding: "20px", marginBottom: "24px", fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: "14px", color: "#C53030", animation: "popIn 0.4s ease-out",
            }}>
              {error}
            </div>
          )}

          {/* Result */}
          {converted && result && (
            <div ref={resultRef} style={{ animation: "popIn 0.5s ease-out" }}>
              {/* Arrow */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,255,255,0.7)", padding: "6px 16px",
                  borderRadius: "100px",
                }}>
                  <span style={{ fontSize: "14px" }}>👇</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: "#999",
                    fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: "1px",
                  }}>
                    AI構文に変換
                  </span>
                </div>
              </div>

              {/* Result Card */}
              <div style={{
                background: "#1a1a2e", borderRadius: "24px", padding: "28px",
                boxShadow: "0 8px 40px rgba(26,26,46,0.2)", position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 0, right: 0, width: "100px", height: "100px",
                  background: "radial-gradient(circle at top right, rgba(255,184,0,0.08), transparent 70%)",
                }} />
                <div style={{
                  fontFamily: "'Noto Sans JP', sans-serif", fontSize: "15px",
                  lineHeight: 2, color: "#E8E4DC", fontWeight: 500,
                }}>
                  {renderResult(result)}
                </div>

                {/* Actions */}
                <div style={{
                  display: "flex", gap: "10px", marginTop: "20px",
                  paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "12px",
                      border: "1.5px solid rgba(255,184,0,0.25)",
                      background: copyFeedback ? "rgba(255,184,0,0.12)" : "transparent",
                      color: "#FFB800", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s ease",
                    }}
                  >
                    {copyFeedback ? "コピーした ✓" : "コピー 📋"}
                  </button>
                  <button
                    onClick={handleConvert}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "12px",
                      border: "1.5px solid rgba(255,255,255,0.12)",
                      background: "transparent", color: "rgba(255,255,255,0.5)",
                      fontSize: "13px", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.2s ease",
                    }}
                  >
                    もう一回 🔄
                  </button>
                </div>
              </div>

              {/* Before */}
              <div style={{
                marginTop: "14px", padding: "14px 18px",
                background: "rgba(255,255,255,0.5)", borderRadius: "14px",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}>
                <span style={{ fontSize: "10px", color: "#bbb", fontWeight: 700, letterSpacing: "1.5px" }}>
                  BEFORE →{" "}
                </span>
                <span style={{ fontSize: "13px", color: "#999" }}>{input}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
