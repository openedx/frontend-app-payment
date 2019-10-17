// Used for SpeedCurve performance tracking
export function markPerformanceIfAble(markName) {
  if (performance.mark) {
    performance.mark(markName);
  }
}

// Returns performance timing properties to send in events
export function getPerformanceProperties() {
  return {
    emitted_at: Date.now() / 1000, // Seconds since epoch, for comparing timing on backend vs. frontend
    performance_timestamp: performance.now(), // Milliseconds since time origin. See https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  };
}
