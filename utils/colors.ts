export function generateHSL({
  hue,
  theme = "dark",
}: {
  hue: string
  theme: string | undefined
}): [string, string] {
  const lightness = theme === "dark" ? "50%" : "65%"
  const saturation = "85%"

  let complementaryHue = parseInt(hue) + 112
  if (complementaryHue >= 360) {
    complementaryHue -= 360
  }

  const color1 = `hsl(${hue}, ${saturation}, ${lightness})`
  const color2 = `hsl(${complementaryHue}, ${saturation}, ${lightness})`

  return [color1, color2]
}