import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070e24] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
          <div className="max-w-md w-full bg-[#0c183a]/90 border border-blue-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-400">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Content Unavailable</h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              We encountered a temporary hiccup loading this view. The rest of the site is operating normally.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.resetError();
                  if (typeof window !== "undefined") window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                <RefreshCw size={15} /> Reload
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14234b] hover:bg-[#1a2e63] border border-blue-400/30 text-blue-200 font-medium text-sm transition-all"
              >
                <Home size={15} /> Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
