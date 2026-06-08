export function squircleClipPath(size: number): string {
  const half = size / 2
  const points: string[] = []

  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = half + half * Math.sign(cos) * Math.sqrt(Math.abs(cos))
    const y = half + half * Math.sign(sin) * Math.sqrt(Math.abs(sin))
    points.push(`${x}px ${y}px`)
  }

  return `polygon(${points.join(', ')})`
}
