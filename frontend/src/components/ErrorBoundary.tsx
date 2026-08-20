import { Component, type ErrorInfo, type ReactNode } from "react";
import { posthog } from "../lib/posthog";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    posthog.capture("$exception", {
      $exception_message: error.message,
      $exception_stack_trace_raw: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
