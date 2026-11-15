"use client";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

const Scene = dynamic(() => import("./MascotScene"), {
  ssr: false,
  loading: () => <p className="t-label grid h-full place-items-center text-stone">Loading the crew…</p>,
});

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="grid h-full place-items-center px-6 text-center text-stone">Your browser can&apos;t show the 3D scene — meet the crew below.</p>
    ) : (
      this.props.children
    );
  }
}

export default function MascotStage() {
  return (
    <WebGLBoundary>
      <Scene />
    </WebGLBoundary>
  );
}
