import * as React from "react"
import { generateHSL } from "@/utils/colors"

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
