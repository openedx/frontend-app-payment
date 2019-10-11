// Used for SpeedCurve performance tracking
export default function markPerformanceIfAble(markName) {
  if (performance.mark) {
    performance.mark(markName);
  }
}
