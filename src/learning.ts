import type { Subject, Settings, CustomQuestion } from "./model";
export const topics: Record<Subject, { id: string; name: string }[]> = {
  math: [
    { id: "addition", name: "Addition" },
    { id: "subtraction", name: "Subtraction" },
    { id: "counting", name: "Counting objects" },
    { id: "comparison", name: "Compare numbers" },
    { id: "missing", name: "Missing numbers" },
    { id: "patterns", name: "Number patterns" },
    { id: "word", name: "Story problems" },
  ],
  spelling: [
    { id: "cvc", name: "Three-letter words" },
    { id: "missing", name: "Missing letters" },
    { id: "tiles", name: "Build a word" },
    { id: "beginning", name: "Beginning sounds" },
    { id: "ending", name: "Ending sounds" },
    { id: "rhymes", name: "Rhyming words" },
    { id: "sight", name: "Sight words" },
  ],
  reading: [
    { id: "passage", name: "Little stories" },
    { id: "picture", name: "Picture match" },
    { id: "sentence", name: "Finish a sentence" },
  ],
};
export type Question = {
  id: string;
  subject: Subject;
  prompt: string;
  answer: string;
  hint: string;
  choices?: string[];
  tiles?: string[];
  picture?: string;
  passage?: string;
  objects?: number;
  equation?: string;
};
const shuffle = <T>(values: T[]) => [...values].sort(() => Math.random() - 0.5);
const int = (max: number) => Math.floor(Math.random() * (max + 1));
const words = [
  ["cat", "🐱"],
  ["dog", "🐶"],
  ["sun", "☀️"],
  ["hat", "🎩"],
  ["pig", "🐷"],
  ["bed", "🛏️"],
  ["bus", "🚌"],
  ["fox", "🦊"],
  ["cup", "☕"],
  ["hen", "🐔"],
  ["bug", "🐞"],
  ["bat", "🦇"],
];
const stories = [
  [
    "Sam has a red kite. He runs in the park. The kite goes up, up, up!",
    "What color is the kite?",
    "red",
    ["red", "blue", "green"],
    "Look in the first sentence.",
  ],
  [
    "A little cat sits on a mat. The cat sees a ball. It taps the ball with a paw.",
    "What does the cat tap?",
    "a ball",
    ["a ball", "a hat", "a cup"],
    "Look in the last sentence.",
  ],
  [
    "Mia plants a seed. She gives it water each day. A tiny green leaf pops up.",
    "What does Mia give the seed?",
    "water",
    ["water", "milk", "sand"],
    "Look in the second sentence.",
  ],
  [
    "Ben and Jo pack a bag. They take apples to the park. They sit under a big tree and eat.",
    "Where do Ben and Jo go?",
    "the park",
    ["the park", "the moon", "a shop"],
    "Look in the second sentence.",
  ],
  [
    "A dog sees a frog by the pond. The frog hops into the water. The dog stays on the grass.",
    "Which animal hops into the water?",
    "the frog",
    ["the frog", "the dog", "a duck"],
    "Read the middle sentence.",
  ],
  [
    "Lily has a little boat. She puts it in a tub. The boat floats on top of the water.",
    "Where is the boat?",
    "in a tub",
    ["in a tub", "in a tree", "in a bed"],
    "Read the second sentence.",
  ],
] as const;
export function makeQuestion(
  subject: Subject,
  topic: string,
  settings: Settings,
  custom: CustomQuestion[],
  index: number,
): Question {
  const q: Question = {
    id: crypto.randomUUID(),
    subject,
    prompt: "",
    answer: "",
    hint: "",
  };
  const own = custom.filter((c) => c.subject === subject);
  if (topic === "custom" && own.length) {
    const c = own[index % own.length];
    return {
      ...q,
      prompt: c.prompt,
      answer: c.answer,
      hint: "Take your time. Ask your grown-up for a clue.",
    };
  }
  if (topic === "mix" || topic === "custom")
    topic = topics[subject][index % topics[subject].length].id;
  const choose = (answer: string, others: string[]) => {
    q.answer = answer;
    q.choices = shuffle([...new Set([answer, ...others])].slice(0, 4));
  };
  if (subject === "math") {
    const max = settings.difficulty,
      a = int(max - 1) + 1,
      b = int(max - a);
    let n = 0;
    if (topic === "addition") {
      q.prompt = "Add the numbers together.";
      q.equation = `${a} + ${b} = ?`;
      n = a + b;
      q.hint = `Start at ${a}. Count ${b} more.`;
      q.objects = a + b;
    } else if (topic === "subtraction") {
      const small = int(a);
      q.prompt = "How many are left?";
      q.equation = `${a} − ${small} = ?`;
      n = a - small;
      q.hint = `Count out ${a} objects. Take away ${small}.`;
      q.objects = a;
    } else if (topic === "counting") {
      n = int(max - 1) + 1;
      q.prompt = "How many stars can you count?";
      q.objects = n;
      q.hint = "Touch each star as you count. Count each one just once.";
    } else if (topic === "comparison") {
      const other = (a + int(max - 1) + 1) % (max + 1);
      q.prompt = "Which number is greater?";
      q.equation = `${a} or ${other}`;
      choose(String(Math.max(a, other)), [String(Math.min(a, other))]);
      q.hint = "The greater number comes later when you count.";
      return q;
    } else if (topic === "missing") {
      n = a;
      q.prompt = "Find the missing number.";
      q.equation = `${a - 1}, __, ${a + 1}`;
      q.hint = `Count forward from ${a - 1}.`;
    } else if (topic === "patterns") {
      const step = settings.difficulty === 20 ? 2 : 1;
      const base = int(max - step * 3);
      n = base + step * 3;
      q.prompt = "What comes next in the pattern?";
      q.equation = `${base}, ${base + step}, ${base + step * 2}, __`;
      q.hint = `Add ${step} each time.`;
    } else {
      n = a + b;
      q.prompt = `A hero finds ${a} stars. Then the hero finds ${b} more. How many stars are there now?`;
      q.hint = `Put ${a} and ${b} together. Count them all.`;
      q.objects = a + b;
    }
    choose(String(n), [
      String(n + 1),
      String(Math.max(0, n - 1)),
      String(n + 2),
      String(n + 3),
    ]);
  } else if (subject === "spelling") {
    const [word, picture] = words[index % words.length];
    q.picture = picture;
    if (topic === "cvc") {
      q.prompt = "Which word names this picture?";
      choose(
        word,
        words
          .filter((w) => w[0] !== word)
          .slice(0, 3)
          .map((w) => w[0]),
      );
      q.hint = `Say the sounds slowly: ${word.split("").join(" · ")}.`;
    } else if (topic === "missing") {
      q.prompt = `Fill in the missing letter: ${word[0]} _ ${word[2]}`;
      choose(
        word[1],
        ["a", "e", "i", "o", "u"].filter((l) => l !== word[1]),
      );
      q.hint = `Say “${word}” slowly. Listen to the middle sound.`;
    } else if (topic === "tiles") {
      q.prompt = "Tap the letters to build the word.";
      q.answer = word;
      q.tiles = shuffle(word.split(""));
      q.hint = `The word is ${word}. It starts with ${word[0]}.`;
    } else if (topic === "beginning" || topic === "ending") {
      const start = topic === "beginning";
      q.prompt = `What is the ${start ? "first" : "last"} sound in “${word}”?`;
      const letter = word[start ? 0 : 2];
      choose(
        letter,
        ["m", "s", "t", "b", "f"].filter((l) => l !== letter),
      );
      q.hint = `Say “${word}” slowly. Listen at the ${start ? "start" : "end"}.`;
    } else if (topic === "rhymes") {
      const pairs = [
        ["cat", "hat", "dog", "sun"],
        ["bug", "rug", "cat", "hen"],
        ["pen", "hen", "bus", "cup"],
        ["fox", "box", "pig", "hat"],
      ][index % 4];
      q.picture = undefined;
      q.prompt = `Which word rhymes with “${pairs[0]}”?`;
      choose(pairs[1], pairs.slice(2));
      q.hint = "Rhyming words have the same ending sound.";
    } else {
      const sight = [
        ["the", "I see ___ moon."],
        ["my", "This is ___ hat."],
        ["we", "You and I can play. ___ can play."],
        ["is", "The sun ___ hot."],
        ["see", "I can ___ a red bus."],
      ][index % 5];
      q.picture = undefined;
      q.prompt = sight[1];
      choose(
        sight[0],
        ["the", "my", "we", "is", "see"].filter(
          (w) =>
            w !== sight[0] &&
            !(["the", "my"].includes(sight[0]) && ["the", "my"].includes(w)),
        ),
      );
      q.hint = "Read the whole sentence. Try each word in the gap.";
    }
  } else {
    if (topic === "passage") {
      const s = stories[index % stories.length];
      q.passage = s[0];
      q.prompt = s[1];
      choose(
        s[2],
        [...s[3]].filter((w) => w !== s[2]),
      );
      q.hint = s[4];
    } else if (topic === "picture") {
      const [w, p] = words[index % words.length];
      q.picture = p;
      q.prompt = "Read the words. Which one matches the picture?";
      choose(
        w,
        words
          .filter((x) => x[0] !== w)
          .slice(0, 3)
          .map((x) => x[0]),
      );
      q.hint = `Look closely. The word begins with ${w[0]}.`;
    } else {
      const s = [
        [
          "The bird can ___.",
          "fly",
          ["fly", "read", "cook"],
          "Birds have wings.",
        ],
        [
          "I put a hat on my ___.",
          "head",
          ["head", "foot", "hand"],
          "Where do you wear a hat?",
        ],
        [
          "The fish swims in the ___.",
          "water",
          ["water", "sky", "sand"],
          "Fish live in ponds and seas.",
        ],
        [
          "At night, I sleep in my ___.",
          "bed",
          ["bed", "cup", "hat"],
          "Where do you rest at night?",
        ],
      ][index % 4];
      q.prompt = s[0] as string;
      choose(s[1] as string, s[2] as string[]);
      q.hint = s[3] as string;
    }
  }
  return q;
}
