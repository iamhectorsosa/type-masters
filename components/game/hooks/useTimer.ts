"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const useTimer = () => {
  const [started, setStarted] = useState(false)
  const [time, setTime] = useState<number>(0)
  const interval = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    setStarted(true)
  }, [])

  const stopTimer = useCallback(() => {
    setStarted(false)
  }, [])

  useEffect(() => {
    if (!started) return

    const start = Date.now()
    const timer = (interval.current = setInterval(function () {
      if (!started) return

      const delta = Date.now() - start // milliseconds elapsed since start

      setTime(Math.floor(delta / 1000)) // in seconds
    }, 1000))

    return () => clearInterval(timer)
  }, [started])

  return {
    time,
    startTimer,
    stopTimer,
  }
}
