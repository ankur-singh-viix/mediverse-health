import * as React from "react";

import { ErrorState } from "@/components/common/error-state";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Unexpected application error"
          message="An unexpected error occurred while rendering this page."
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
