import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            fontFamily: "Inter, sans-serif",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            ⚠️
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
            Lỗi tải trang
          </h2>

          <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: "400px", margin: 0 }}>
            Có lỗi xảy ra khi tải trang. Vui lòng thử lại.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                maxWidth: "600px",
                width: "100%",
                backgroundColor: "#fff1f2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "0.8rem",
                textAlign: "left",
                color: "#b91c1c",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: "600" }}>
                Chi tiết lỗi (development)
              </summary>
              <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 32px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#4f46e5")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#6366f1")}
          >
            Quay lại trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
