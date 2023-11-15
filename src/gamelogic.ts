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

export function generateRandomName() {
  let adjectives = [
    "Angry",
    "Curious",
    "Happy",
    "Sad",
    "Excited",
    "Sleepy",
    "Energetic",
    "Lazy",
    "Brave",
    "Calm",
    "Amazing",
    "Spectacular",
    "Sleepy",
    "Evil",
  ];
  const nouns = [
    "Beaver",
    "Echidna",
    "Cat",
    "Dog",
    "Elephant",
    "Giraffe",
    "Kangaroo",
    "Lion",
    "Monkey",
    "Panda",
    "Echidna",
    "Platypus",
  ];

  const animal = randomElement(nouns);
  if (animal === "Echidna") {
    adjectives = [
      "Happy",
      "Excited",
      "Energetic",
      "Brave",
      "Amazing",
      "Spectacular",
    ];
  }
  if (animal === "Platypus") {
    adjectives = ["Angry", "Sad", "Evil"];
  }
  return `${randomElement(adjectives)} ${animal}`;
}
