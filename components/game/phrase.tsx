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
  splitPhrase,
} from "@/utils/game"

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

export const Phrase: FC<{ phrase: string }> = ({ phrase }) => {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (splitPhrase(value).length > splitPhrase(phrase).length) return
    setValue(e.target.value)
  }

  const handleValueInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
    }
  }

  const renderedPhrase = buildRenderedPhrase(phrase, value)

  return (
    <label
      className="relative block h-screen max-w-full cursor-pointer"
      htmlFor="phrase"
    >
      <h1 className="text-xl">
        {calculatePercentageCompleted(renderedPhrase)}%
      </h1>
      <div className="flex flex-wrap text-3xl">
        {renderedPhrase.map((word, i) => (
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
      />
    </label>
  )
}
