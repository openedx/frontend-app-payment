// Used for SpeedCurve performance tracking
export function markPerformanceIfAble(markName) {
  if (performance.mark) {
    performance.mark(markName);
  }
}

// Returns performance timing properties to send in events
export function getPerformanceProperties() {
  return {
    // Seconds since epoch, for comparing timing on backend vs. frontend
    emitted_at: Date.now() / 1000,

    // Milliseconds since time origin.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
    performance_timestamp: performance.now(),
  };
}
