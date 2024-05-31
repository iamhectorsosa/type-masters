'use client'

import { BuiltPhrase, calculateAccuracy } from "@/utils/game"
import { useCallback, useState } from "react"

export const useAccuracy = () => {
  const [phraseHistory, setPhraseHistory] = useState<BuiltPhrase[]>([])

  const addPhrase = useCallback((phrase: BuiltPhrase) => {
    setPhraseHistory((prev) => [...prev, phrase])
  }, [])

  const retrieveAccuracy = useCallback(() => {
    return calculateAccuracy(phraseHistory);
  }, [phraseHistory])

  return {
    addPhrase,
    retrieveAccuracy
  }
}