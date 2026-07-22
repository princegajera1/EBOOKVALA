import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught runtime error in React tree:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "24px",
          margin: "24px",
          borderRadius: "16px",
          background: "#18181b",
          color: "#f4f4f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ color: "#ef4444", fontSize: "20px", fontWeight: "bold", margin: "0 0 12px 0" }}>
            Application Error
          </h2>
          <p style={{ fontSize: "14px", color: "#a1a1aa", margin: "0 0 16px 0" }}>
            An unexpected error occurred while running EBOOKVALA:
          </p>
          <pre style={{
            background: "#09090b",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#f87171",
            overflowX: "auto",
            whiteSpace: "pre-wrap"
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
