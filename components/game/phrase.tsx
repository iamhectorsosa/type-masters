"use client"

import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  buildRenderedPhrase,
  calculatePercentageCompleted,
  Char,
} from "@/utils/game"

import { cn } from "@/lib/utils"

const getCharColorClassName = ({
  correct,
  exists,
  additionalIncorrect,
}: Char) => {
  if (!exists) return ""
  if (additionalIncorrect) return "text-red-900"

  if (correct) return "text-green-500"
  return "text-red-500"
}

export const Phrase: FC<{
  phrase: string
  onValueChange: (percentage: number, strokes: [number, number]) => void
  onComplete: (strokes: [number, number]) => void
}> = ({ phrase, onValueChange, onComplete }) => {
  const [value, setValue] = useState("")
  const [inputFocused, setInputFocused] = useState<boolean>(false)
  const [, setStrokes] = useState<[number, number]>([0, 0])
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { builtPhrase, correct, wrong } = buildRenderedPhrase(
      phrase,
      e.target.value
    )
    const percentage = calculatePercentageCompleted(builtPhrase)

    setStrokes(([, prevWrong]) => {
      const newStrokes: [number, number] = [correct, wrong + prevWrong]

      if (percentage <= 100) {
        setValue(e.target.value)
        onValueChange(percentage, newStrokes)
      }

      if (percentage === 100) {
        onComplete(newStrokes)
      }

      return [correct, wrong + prevWrong]
    })
  }

  const handleValueInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
    }
  }

  const { builtPhrase } = buildRenderedPhrase(phrase, value)

  return (
    <div className="relative">
      {!inputFocused && (
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          Click here to focus the input!
        </h1>
      )}
      <label
        className={cn(
          "relative block max-w-full cursor-pointer select-none",
          !inputFocused && "blur-lg"
        )}
        htmlFor="phrase"
      >
        <div className="flex flex-wrap text-3xl">
          {builtPhrase.map((word, i) => (
            <span key={`word-${i}`} className="mx-2">
              {word.map((char, j) => {
                return (
                  <>
                    <span
                      key={`char-${j}`}
                      className={getCharColorClassName(char)}
                    >
                      {char.value}
                    </span>
                  </>
                )
              })}
            </span>
          ))}
        </div>
        <input
          id="phrase"
          value={value}
          onChange={handleValueChange}
          ref={inputRef}
          className="pointer-events-none absolute top-[-9999px] opacity-0"
          onKeyDown={handleValueInputKeyDown}
          onPaste={(e) => e.preventDefault()}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
      </label>
    </div>
  )
}
