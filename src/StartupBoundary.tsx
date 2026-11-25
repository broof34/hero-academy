import { Component, useEffect, type ReactNode } from "react";

// The recovery UI lives in index.html so it also works when this module cannot load.
export class StartupBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Hero Academy application failure", error);
    window.dispatchEvent(new Event("hero:startup-error"));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function StartupReady({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.dispatchEvent(new Event("hero:ready"));
  }, []);
  return children;
}
