"use client";

/**
 * Replaces the root layout when an error is thrown there, so the app's
 * stylesheets are not guaranteed to be loaded. Inline styles keep this page
 * readable no matter what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fffaf4",
          color: "#1f1a16",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "1rem",
              background: "linear-gradient(135deg, #fb7c3b, #dd4a09)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            MC
          </div>
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b6057", lineHeight: 1.6 }}>
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          {error.digest && (
            <p style={{ color: "#a89e94", fontFamily: "monospace", fontSize: "0.75rem" }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.75rem",
              border: "none",
              borderRadius: "9999px",
              background: "#f2611a",
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload the app
          </button>
        </div>
      </body>
    </html>
  );
}
