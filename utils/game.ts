export const splitPhrase = (phrase: string) => {
  const words = phrase.split(" ")
  return words.map((word) => word.split(""))
}

export type Char = {
  value: string;
  correct?: boolean;
  exists: boolean;
  additionalIncorrect?: boolean;
}

export type Word = Char[]

export type BuiltPhrase = Word[]

export type Player = {
  percentage: number;
  username: string;
  hue: string;
}

export const buildRenderedPhrase = (phrase: string, value: string): BuiltPhrase => {
  const phraseWords = splitPhrase(phrase);
  const valueWords = splitPhrase(value);

  return phraseWords.map((word, i) => {
    const phraseTokens = word.map<Char>((char, j) => {
      const charExists = !!valueWords[i]?.[j] || !!valueWords[i + 1]
      const isCorrect = valueWords[i]?.[j] === char
      return {
        value: char,
        exists: charExists,
        correct: charExists ? isCorrect : undefined,
      }
    })

    const additionalTokens = valueWords[i]?.slice(word.length)?.map<Char>((char) => {
      return {
        value: char,
        exists: true,
        additionalIncorrect: true
      }
    })

    return phraseTokens.concat(additionalTokens ?? [])
  })
}

export const currentCursorPosition = (builtPhrase: BuiltPhrase): [number, number] => {
  for (let i = 0; i < builtPhrase.length; i++) {
    const lastChar = builtPhrase[i].findIndex((char) => !char.exists);

    const previousWord = builtPhrase[i - 1];
    if (lastChar === 0 && previousWord?.[(previousWord.length ?? 0 ) -1].additionalIncorrect) return [i - 1, previousWord.length - 1];  
    if (lastChar >= 0) return [i, lastChar];
  }

  return [0, 0]
}

export const isCurrentPositionCursor = (position: [number, number], cursor: [number, number]): boolean => {
  if (position[0] !== cursor[0]) return false;
  
  return position[1] === cursor[1]
}

export const calculatePercentageCompleted = (builtPhrase: BuiltPhrase): number => {
  const totalCharacters = builtPhrase.reduce((acc, word) => acc + word.reduce((charAcc, char) => {
    if (!char.additionalIncorrect) return charAcc + 1;

    return charAcc
  }, 0), 0)

  const correctChars = builtPhrase.reduce((acc, word) => acc + word.reduce((charAcc, char) => {
    if (char.correct) return charAcc + 1;

    return charAcc
  }, 0), 0)

  return Math.round((correctChars / totalCharacters) * 100)
}