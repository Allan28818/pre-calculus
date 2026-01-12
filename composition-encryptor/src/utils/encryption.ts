function encryptAsciiArray(asciiArray: number[]): number[] {
  const encryptedArray: number[] = []

  for (let i = 0; i < asciiArray.length; i++) {
    const asciiCode = asciiArray[i] as number

    encryptedArray.push(2 * asciiCode + 50)
  }

  return encryptedArray
}

function decryptAsciiArray(asciiArray: number[]): number[] {
  const decryptedAsciiArray: number[] = []

  for (let i = 0; i < asciiArray.length; i++) {
    const asciiCode = asciiArray[i] as number

    decryptedAsciiArray.push((asciiCode - 50) / 2)
  }

  return decryptedAsciiArray
}

function fromStringToAsciiArray(string: string): number[] {
  const asciiArray: number[] = []

  for (let i = 0; i < string.length; i++) {
    asciiArray.push(string.charCodeAt(i))
  }

  return asciiArray
}

function fromAsciiArrayToString(charCodeArray: number[]): string {
  let finalString = ''

  for (let i = 0; i < charCodeArray.length; i++) {
    const charCode = charCodeArray[i] as number

    finalString += String.fromCharCode(charCode)
  }

  return finalString
}

export { encryptAsciiArray, decryptAsciiArray, fromStringToAsciiArray, fromAsciiArrayToString }
