/** Format meters to “X m” or “Y km” */
export function formatDistance(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`
}

/** Format seconds to “Z sec”, “W min” or “H h M min” */
export function formatDuration(s: number): string {
  if (s >= 3600) {
    const h = Math.floor(s / 3600)
    const m = Math.round((s % 3600) / 60)
    return `${h} h${m ? ` ${m} min` : ''}`
  }
  if (s >= 60) {
    return `${Math.round(s / 60)} min`
  }
  return `${s} sec`
}
