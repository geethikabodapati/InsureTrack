import { Component } from "react";
export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", fontFamily: "monospace" }}>
          <h2 style={{ color: "#dc2626" }}>Something went wrong</h2>
          <pre style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", fontSize: "12px", overflow: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick= {() => window.location.reload()}
            style={{ marginTop: "16px", padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
