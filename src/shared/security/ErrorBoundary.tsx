// src/shared/security/ErrorBoundary.tsx
import React from "react"

type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("Runtime error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600">
          Something went wrong. Refresh the page.
        </div>
      )
    }

    return this.props.children
  }
}
