"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ fontFamily: "sans-serif", padding: 40, background: "#0a0a0a", color: "#fff" }}>
        <h2>エラーが発生しました</h2>
        <p style={{ color: "#888" }}>{error.message}</p>
        <pre style={{ fontSize: 12, color: "#666", whiteSpace: "pre-wrap", maxWidth: 600 }}>
          {error.stack}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: "8px 20px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          再試行
        </button>
      </body>
    </html>
  );
}
