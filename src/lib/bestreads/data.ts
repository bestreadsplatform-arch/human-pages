export type TimeFilter = "today" | "week" | "month";

export type Author = {
  id: string;
  name: string;
  username: string;
  bio: string;
  isPro: boolean;
  isHallOfFameEditor: boolean;
};

export type Book = {
  id: string;
  authorId: string;
  title: string;
  summary: string;
  hashtags: string[];
  excerpt: string;
  pages: number;
  cover: number; // palette index 0-9
  launchDate: string;
  status: "published" | "draft";
  upvotes: Record<TimeFilter, number>;
  totalUpvotes: number;
  views: number;
  shares: number;
  currentReads: number;
  store?: { amazon?: string; gumroad?: string };
};

export const HOF_CODE = "thof1856!";

export const COVER_PALETTES = [
  { bg: "oklch(0.42 0.09 30)", fg: "oklch(0.96 0.02 85)" },
  { bg: "oklch(0.34 0.06 250)", fg: "oklch(0.95 0.02 85)" },
  { bg: "oklch(0.55 0.12 145)", fg: "oklch(0.98 0.01 85)" },
  { bg: "oklch(0.78 0.13 78)", fg: "oklch(0.25 0.04 55)" },
  { bg: "oklch(0.28 0.02 60)", fg: "oklch(0.93 0.02 85)" },
  { bg: "oklch(0.68 0.14 25)", fg: "oklch(0.99 0.01 85)" },
  { bg: "oklch(0.5 0.1 320)", fg: "oklch(0.97 0.01 85)" },
  { bg: "oklch(0.88 0.05 100)", fg: "oklch(0.3 0.04 60)" },
  { bg: "oklch(0.45 0.08 195)", fg: "oklch(0.97 0.01 85)" },
  { bg: "oklch(0.62 0.09 60)", fg: "oklch(0.2 0.03 55)" },
];

export const GENRES = [
  "#POETRY",
  "#FICTION",
  "#MEMOIR",
  "#ESSAY",
  "#SHORTSTORY",
  "#HISTORY",
  "#NATURE",
  "#ROMANCE",
  "#PHILOSOPHY",
  "#NOIR",
];

export const AUTHORS: Author[] = [
  {
    id: "a1",
    name: "Elena Vasquez",
    username: "elena.inkwell",
    bio: "Writes at dawn, edits at dusk. Barcelona.",
    isPro: true,
    isHallOfFameEditor: true,
  },
  {
    id: "a2",
    name: "Elena Moretti",
    username: "moretti.pages",
    bio: "Slow prose from a loud city.",
    isPro: false,
    isHallOfFameEditor: false,
  },
  {
    id: "a3",
    name: "Martha Quill",
    username: "marthaq",
    bio: "Poetry that refuses to hurry.",
    isPro: true,
    isHallOfFameEditor: true,
  },
  {
    id: "a4",
    name: "Martha Adeyemi",
    username: "adeyemi.longform",
    bio: "Essays on inheritance and rivers.",
    isPro: false,
    isHallOfFameEditor: false,
  },
  {
    id: "a5",
    name: "Tomas Lind",
    username: "lind.nordic",
    bio: "Cold light, warm sentences.",
    isPro: true,
    isHallOfFameEditor: false,
  },
  {
    id: "a6",
    name: "Ruth Okonjo",
    username: "ruthwrites",
    bio: "Short stories, no shortcuts.",
    isPro: false,
    isHallOfFameEditor: true,
  },
  {
    id: "a7",
    name: "Hana Sato",
    username: "hana.margins",
    bio: "Marginalia as a way of life.",
    isPro: true,
    isHallOfFameEditor: false,
  },
  {
    id: "a8",
    name: "Owen Brice",
    username: "brice.noir",
    bio: "Rain, streetlights, unreliable narrators.",
    isPro: false,
    isHallOfFameEditor: true,
  },
  {
    id: "a9",
    name: "Ida Fenn",
    username: "idafenn",
    bio: "Nature writing from the estuary.",
    isPro: true,
    isHallOfFameEditor: false,
  },
  {
    id: "a10",
    name: "Cyrus Malik",
    username: "cyrus.folio",
    bio: "Philosophy in plain clothes.",
    isPro: false,
    isHallOfFameEditor: true,
  },
];

const EXCERPT =
  "She kept the letters in a tin that had once held tea, and every year the paper smelled a little less of him and a little more of the tin. That was the arithmetic of memory: something is always subtracted, something else is quietly added, and the sum insists it has not changed at all.\n\nOn the morning the river froze she walked out to the middle of it and listened. Nothing. Then, beneath her boots, the long complaint of ice deciding whether to hold.";

type Seed = [string, string, string, string[], number, number, number, number, number];

const SEEDS: Seed[] = [
  ["a1", "The Salt Almanac", "A year on a fishing coast, told in tides, debts and small mercies.", ["#FICTION", "#NATURE"], 214, 0, 412, 91, 38],
  ["a3", "Twelve Ways to Leave a Room", "Poems about doorways, hesitation, and the courage of the last step.", ["#POETRY"], 88, 3, 388, 74, 51],
  ["a5", "Cold Light Over Malmö", "A slow detective story where nobody raises their voice.", ["#NOIR", "#FICTION"], 302, 1, 355, 62, 22],
  ["a7", "Marginalia", "Notes written in the edges of borrowed books, collected into a life.", ["#MEMOIR", "#ESSAY"], 146, 8, 331, 58, 44],
  ["a9", "Estuary Hours", "Field notes from six months of watching water change its mind.", ["#NATURE", "#ESSAY"], 178, 2, 318, 49, 27],
  ["a2", "The Loud City Diaries", "Prose that walks slowly through a place that never does.", ["#MEMOIR"], 132, 6, 296, 41, 19],
  ["a6", "Nine Doors, No Keys", "Nine short stories about rooms that will not open.", ["#SHORTSTORY", "#FICTION"], 121, 5, 275, 47, 31],
  ["a8", "Streetlight Confessions", "A noir novella where the rain is the only honest witness.", ["#NOIR"], 96, 4, 261, 39, 24],
  ["a10", "Plain Clothes Philosophy", "Ten arguments about ordinary life, made without jargon.", ["#PHILOSOPHY", "#ESSAY"], 205, 9, 244, 36, 17],
  ["a4", "The River Owes Us Nothing", "Essays on inheritance, land, and the water that outlives both.", ["#ESSAY", "#HISTORY"], 188, 7, 232, 44, 26],
  ["a1", "Letters to a Tin Box", "Epistolary fiction about a love kept in storage for thirty years.", ["#ROMANCE", "#FICTION"], 164, 6, 198, 33, 15],
  ["a3", "Rope, Bread, Weather", "Short poems written on receipts during one winter.", ["#POETRY"], 62, 1, 187, 28, 21],
  ["a7", "The Quiet Interview", "Conversations with people who never wanted to be asked.", ["#ESSAY"], 210, 2, 174, 25, 12],
  ["a6", "Grandmother's Radio", "A short story cycle set across one apartment block.", ["#SHORTSTORY"], 108, 3, 161, 22, 18],
  ["a5", "The Ninth Winter", "A historical novel about a village that voted to disappear.", ["#HISTORY", "#FICTION"], 340, 8, 149, 19, 9],
  ["a9", "Birds I Failed to Name", "A nature memoir about attention and its limits.", ["#NATURE", "#MEMOIR"], 154, 5, 138, 24, 14],
  ["a2", "Small Rooms, Big Weather", "Fiction about roommates, storms and unpaid rent.", ["#FICTION"], 176, 0, 122, 17, 8],
  ["a8", "Twelve O'Clock Somewhere", "Noir shorts set in twelve time zones.", ["#NOIR", "#SHORTSTORY"], 143, 4, 111, 15, 11],
  ["a10", "Against Certainty", "An essay in defence of changing your mind.", ["#PHILOSOPHY"], 74, 9, 98, 13, 7],
  ["a4", "Inheritance Papers", "Family history assembled from deeds, arguments and photographs.", ["#HISTORY", "#MEMOIR"], 262, 7, 84, 11, 6],
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const BOOKS: Book[] = SEEDS.map((s, i) => {
  const [authorId, title, summary, hashtags, pages, cover, month, shares, currentReads] = s;
  const h = hash(title);
  const today = Math.max(3, Math.round(month / (7 + (h % 5))));
  const week = Math.max(today + 2, Math.round(month / (2 + (h % 2))));
  return {
    id: `b${i + 1}`,
    authorId,
    title,
    summary,
    hashtags,
    excerpt: EXCERPT,
    pages,
    cover,
    launchDate: new Date(Date.UTC(2026, 5 + (i % 3), 1 + (h % 26))).toISOString(),
    status: "published" as const,
    upvotes: { today, week, month },
    totalUpvotes: month + 340 + (h % 700),
    views: month * 27 + (h % 1500),
    shares,
    currentReads,
    store:
      i % 3 === 0
        ? { amazon: "https://amazon.example/bestreads", gumroad: "https://gumroad.example/bestreads" }
        : i % 3 === 1
          ? { gumroad: "https://gumroad.example/bestreads" }
          : undefined,
  };
});

export const authorById = (id: string) => AUTHORS.find((a) => a.id === id)!;

/* ---------- CEST reset logic (UTC+2) ---------- */

const CEST_OFFSET_MS = 2 * 60 * 60 * 1000;

export function cestNow(now = new Date()) {
  return new Date(now.getTime() + CEST_OFFSET_MS);
}

/** Start of the current pool window, expressed as a real (UTC) Date. */
export function poolStart(filter: TimeFilter, now = new Date()): Date {
  const c = cestNow(now);
  const y = c.getUTCFullYear();
  const m = c.getUTCMonth();
  const d = c.getUTCDate();
  let startCest: number;
  if (filter === "today") {
    startCest = Date.UTC(y, m, d);
  } else if (filter === "week") {
    const dow = (c.getUTCDay() + 6) % 7; // Monday = 0
    startCest = Date.UTC(y, m, d - dow);
  } else {
    startCest = Date.UTC(y, m, 1);
  }
  return new Date(startCest - CEST_OFFSET_MS);
}

export function nextReset(filter: TimeFilter, now = new Date()): Date {
  const c = cestNow(now);
  const y = c.getUTCFullYear();
  const m = c.getUTCMonth();
  const d = c.getUTCDate();
  let endCest: number;
  if (filter === "today") endCest = Date.UTC(y, m, d + 1);
  else if (filter === "week") {
    const dow = (c.getUTCDay() + 6) % 7;
    endCest = Date.UTC(y, m, d - dow + 7);
  } else endCest = Date.UTC(y, m + 1, 1);
  return new Date(endCest - CEST_OFFSET_MS);
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const dd = Math.floor(total / 86400);
  const hh = Math.floor((total % 86400) / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return dd > 0 ? `${dd}d ${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

/* ---------- analytics series ---------- */

export function hourlySeries(book: Book) {
  const h = hash(book.id);
  const hours = cestNow().getUTCHours() + 1;
  return Array.from({ length: hours }, (_, i) => {
    const w = 1 + Math.sin((i / 24) * Math.PI * 2 + (h % 7)) * 0.6;
    return {
      label: `${String(i).padStart(2, "0")}:00`,
      reads: Math.round(6 * w + ((h + i * 13) % 9)),
      currentReads: Math.round(2 * w + ((h + i * 7) % 4)),
      upvotes: Math.round(2 * w + ((h + i * 5) % 3)),
      shares: Math.round(w + ((h + i * 3) % 2)),
    };
  });
}

export function dailySeries(book: Book, days: number) {
  const h = hash(book.id);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: days }, (_, i) => {
    const w = 1 + Math.cos((i / days) * Math.PI * 3 + (h % 5)) * 0.5;
    return {
      label: days === 7 ? names[i] : `${i + 1}`,
      reads: Math.round(48 * w + ((h + i * 17) % 40)),
      currentReads: Math.round(11 * w + ((h + i * 11) % 9)),
      upvotes: Math.round(14 * w + ((h + i * 9) % 12)),
      shares: Math.round(4 * w + ((h + i * 5) % 5)),
    };
  });
}

/* ---------- Hall of Fame ---------- */

export type HofFeature = {
  authorId: string;
  headline: string;
  standfirst: string;
  quote: string;
  interview: { q: string; a: string }[];
  audioMinutes: number;
  videoTitle: string;
};

export const HOF_ISSUE = {
  issue: "No. 24",
  cadence: "Every 2–3 semanas",
  window: "16 Aug – 2 Sep 2026",
  editorial:
    "Five writers who, in the last three weeks, made thousands of readers stop scrolling and start reading. No algorithms wrote these pages. No machine drafted these sentences. Every word below came out of a human head, at a human hour, usually too late at night.",
};

export const HOF_FEATURES: HofFeature[] = [
  {
    authorId: "a3",
    headline: "The Poet Who Writes on Receipts",
    standfirst: "Martha Quill on winter, thrift, and why a poem should fit in a coat pocket.",
    quote: "A poem that needs a whole page is usually two poems arguing.",
    interview: [
      { q: "Why receipts?", a: "They're free, they're small, and they curl. A curling poem tells you when to stop." },
      { q: "Do you revise?", a: "Constantly. The receipt is the first draft; the ninth draft is the one people read." },
      { q: "Advice for new writers?", a: "Write the thing you keep almost telling people at parties." },
    ],
    audioMinutes: 18,
    videoTitle: "Reading: 'Rope, Bread, Weather' — live from Leeds",
  },
  {
    authorId: "a1",
    headline: "A Year of Tides",
    standfirst: "Elena Vasquez turned a fishing village ledger into the season's most upvoted novel.",
    quote: "Research is just eavesdropping with a notebook and better manners.",
    interview: [
      { q: "How long did The Salt Almanac take?", a: "Four winters. The summers were for forgetting it." },
      { q: "Hardest chapter?", a: "The one where nothing happens. Those are always the hardest." },
    ],
    audioMinutes: 24,
    videoTitle: "Studio call: building a year-long structure",
  },
  {
    authorId: "a7",
    headline: "Notes in the Edges",
    standfirst: "Hana Sato collected fifteen years of marginalia into a memoir about attention.",
    quote: "I don't own most of the books I've written in. That feels correct.",
    interview: [
      { q: "First margin note?", a: "'He is lying' — age eleven, in a library copy. I still stand by it." },
      { q: "Digital or paper?", a: "Paper. Pencil. Nothing that syncs." },
    ],
    audioMinutes: 12,
    videoTitle: "Video conference: Marginalia, one year later",
  },
  {
    authorId: "a9",
    headline: "Six Months of Water",
    standfirst: "Ida Fenn's estuary field notes became a slow-burning nature classic.",
    quote: "Nothing on the estuary happens fast, which is why nobody films it.",
    interview: [
      { q: "Best hour to write?", a: "The hour before the tide turns. Everything is waiting, including me." },
      { q: "Do you edit outdoors?", a: "Never. Outdoors is for noticing; indoors is for lying about what you noticed." },
    ],
    audioMinutes: 31,
    videoTitle: "Walk-and-talk: the estuary at low water",
  },
  {
    authorId: "a6",
    headline: "Nine Doors, One Building",
    standfirst: "Ruth Okonjo built a story cycle out of a single apartment block.",
    quote: "Every neighbour is a novel you're not allowed to read.",
    interview: [
      { q: "Did anyone recognise themselves?", a: "Three people. Two were flattered. One moved." },
      { q: "Next project?", a: "The same building, forty years earlier." },
    ],
    audioMinutes: 21,
    videoTitle: "Recorded panel: the short story is not a warm-up",
  },
];
