import * as React from "react"

import { cn } from "@/lib/utils"

export const AvatarPlaceholder: React.FC<{
  preferredHue: string
  className?: string
}> = ({ preferredHue: hue, className }) => {
  const [color1, color2] = generateHSL({ hue, theme: "dark" })

  return (
    <div
      style={{
        background: `linear-gradient(to top right, ${color1} 25%, ${color2})`,
      }}
      className={cn(
        "size-6 shrink-0 rounded-full dark:border-border",
        className
      )}
    />
  )
}

function generateHSL({
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
