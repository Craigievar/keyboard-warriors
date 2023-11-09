import words from "./WordList";

export function randomElement(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomWord() {
  return randomElement(words);
}

export function generateRandomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
