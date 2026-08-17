import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

import {
  AUTHORS,
  BOOKS,
  GENRES,
  HOF_CODE,
  HOF_FEATURES,
  authorById,
  type Author,
  type Book,
  type HofFeature,
  type HofMedia,
  type TimeFilter,
} from "./data";

export type Tier = "free" | "pro";
export type View = "discover" | "studio" | "bookshelf" | "hall-of-fame" | "pricing";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  tier: Tier;
  isHallOfFameEditor: boolean;
};

export type Draft = {
  id: string;
  title: string;
  summary: string;
  hashtags: string[];
  body: string;
  cover: number;
  coverImage?: string | undefined;
  status: "draft" | "published";
  createdAt: string;
};

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  username: string;
  accessCode: string;
};

type AuthResult = { ok: boolean; error?: string };


type Store = {
  user: SessionUser | null;
  authors: Author[];
  books: Book[];
  drafts: Draft[];
  filter: TimeFilter;
  genreSlots: (string | null)[];
  search: string;
  view: View;
  sidebarOpen: boolean;
  topTenCollapsed: boolean;
  feedTab: "for-you" | "following";
  upvoted: string[];
  following: string[];
  library: string[];
  proSortEnabled: boolean;
  maxPages: number | null;
  activeGenre: string | null;
  hofEditorCount: number;
  hofFeatures: HofFeature[];
  authLoading: boolean;
  upvoteCount: (book: Book) => number;
  updateHofMedia: (authorId: string, media: HofMedia) => void;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;

  setFilter: (f: TimeFilter) => void;
  setGenreSlot: (index: number, genre: string | null) => void;
  setSearch: (s: string) => void;
  setView: (v: View) => void;
  toggleSidebar: () => void;
  toggleTopTen: () => void;
  setFeedTab: (t: "for-you" | "following") => void;
  toggleUpvote: (bookId: string) => void;
  toggleFollow: (authorId: string) => void;
  toggleLibrary: (bookId: string) => { ok: boolean; error?: string };
  setTier: (t: Tier) => void;
  saveDraft: (d: Omit<Draft, "id" | "createdAt" | "status">) => { ok: boolean; error?: string };
  publishDraft: (id: string) => void;
  deleteDraft: (id: string) => void;
  setMaxPages: (p: number | null) => void;
  setActiveGenre: (g: string | null) => void;
  availableGenres: string[];
  hashtagSearch: string | null;
  visibleBooks: Book[];
  topTen: Book[];
  streamBooks: Book[];
  topAuthors: { author: Author; score: number; titles: number }[];
};

const StoreContext = createContext<Store | null>(null);

const FREE_LIBRARY_LIMIT = 5;
const FREE_DRAFT_LIMIT = 5;

export function BestreadsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [books] = useState<Book[]>(BOOKS);

    const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState<TimeFilter>("today");
  const [genreSlots, setGenreSlots] = useState<(string | null)[]>(["#POETRY", "#FICTION", "#NOIR"]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("discover");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topTenCollapsed, setTopTenCollapsed] = useState(false);
  const [feedTab, setFeedTab] = useState<"for-you" | "following">("for-you");
  const [upvoted, setUpvoted] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>(["a3", "a7"]);
  const [library, setLibrary] = useState<string[]>(["b1", "b4"]);
  const [maxPages, setMaxPages] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [hofEditorCount, setHofEditorCount] = useState(0);
  const [hofFeatures, setHofFeatures] = useState<HofFeature[]>(HOF_FEATURES);

  const updateHofMedia = useCallback((authorId: string, media: HofMedia) => {
    setHofFeatures((prev) => prev.map((f) => (f.authorId === authorId ? { ...f, media } : f)));
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, username, tier, is_hall_of_fame_editor")
      .eq("id", userId)
      .maybeSingle();
    if (!data) return;
    setUser({
      id: data.id,
      name: data.name,
      username: data.username,
      tier: data.tier === "pro" ? "pro" : "free",
      isHallOfFameEditor: data.is_hall_of_fame_editor,
    });
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });
    void supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) await loadProfile(data.session.user.id);
      setAuthLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    void supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_hall_of_fame_editor", true)
      .then(({ count }) => setHofEditorCount(count ?? 0));
  }, [user]);

  const signUp = useCallback(
    async ({ email, password, name, username, accessCode }: SignUpInput): Promise<AuthResult> => {
      const handle = username.replace(/^@/, "").trim().toLowerCase();
      const mail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
        return { ok: false, error: "Enter a valid email address." };
      if (password.length < 6)
        return { ok: false, error: "Password must be at least 6 characters." };
      if (!name.trim()) return { ok: false, error: "Display name is required." };
      if (!/^[a-z0-9._]{3,20}$/.test(handle))
        return { ok: false, error: "Username must be 3–20 chars: a–z, 0–9, dot or underscore." };

      const code = accessCode.trim();
      if (code.length > 0 && code !== HOF_CODE)
        return { ok: false, error: "That secret access code is not valid." };

      const { data: available } = await supabase.rpc("username_available", { _username: handle });
      if (available === false)
        return { ok: false, error: `@${handle} is already taken. Try another handle.` };

      const { error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: name.trim(), username: handle },
        },
      });
      if (error) return { ok: false, error: error.message };

      if (code === HOF_CODE) {
        const { data: redeemed } = await supabase.rpc("redeem_hof_code", { _code: code });
        const result = redeemed as { ok: boolean; error?: string } | null;
        if (result && !result.ok) return { ok: false, error: result.error ?? "Code rejected." };
      }

      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user) await loadProfile(session.session.user.id);
      return { ok: true };
    },
    [loadProfile],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { ok: false, error: error.message };
      if (data.user) await loadProfile(data.user.id);
      return { ok: true };
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);


  const toggleUpvote = useCallback((bookId: string) => {
    setUpvoted((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]));
  }, []);

  const upvoteCount = useCallback(
    (book: Book) => book.upvotes[filter] + (upvoted.includes(book.id) ? 1 : 0),
    [filter, upvoted],
  );

  const toggleFollow = useCallback((authorId: string) => {
    setFollowing((prev) =>
      prev.includes(authorId) ? prev.filter((id) => id !== authorId) : [...prev, authorId],
    );
  }, []);

  const toggleLibrary = useCallback(
    (bookId: string) => {
      if (library.includes(bookId)) {
        setLibrary((l) => l.filter((id) => id !== bookId));
        return { ok: true };
      }
      if (user?.tier === "free" && library.length >= FREE_LIBRARY_LIMIT) {
        return { ok: false, error: "Free library holds 5 books. Upgrade to Pro for unlimited." };
      }
      setLibrary((l) => [...l, bookId]);
      return { ok: true };
    },
    [library, user],
  );

  const saveDraft = useCallback(
    (d: Omit<Draft, "id" | "createdAt" | "status">) => {
      const currentDrafts = drafts.filter((x) => x.status === "draft");
      if (user?.tier === "free" && currentDrafts.length >= FREE_DRAFT_LIMIT) {
        return { ok: false, error: "Free accounts keep 5 drafts. Upgrade to Pro for unlimited." };
      }
      setDrafts((prev) => [
        { ...d, id: `d${Date.now()}`, createdAt: new Date().toISOString(), status: "draft" },
        ...prev,
      ]);
      return { ok: true };
    },
    [drafts, user],
  );

  const publishDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "published" } : d)));
  }, []);

  const deleteDraft = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const setTier = useCallback((t: Tier) => {
    setUser((u) => (u ? { ...u, tier: t } : u));
  }, []);

  const setGenreSlot = useCallback((index: number, genre: string | null) => {
    setGenreSlots((prev) => prev.map((g, i) => (i === index ? genre : g)));
  }, []);

  const hashtagSearch = useMemo(() => {
    const q = search.trim();
    return q.startsWith("#") && q.length > 1 ? q.toUpperCase() : null;
  }, [search]);


  const visibleBooks = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = books.filter((b) => b.status === "published");
    if (q) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.summary.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.hashtags.some((h) => h.toLowerCase().includes(q)) ||
          authorById(b.authorId).username.includes(q.replace("@", "")),
      );
    }
    if (activeGenre) list = list.filter((b) => b.hashtags.includes(activeGenre));
    if (user?.tier === "pro" && maxPages) list = list.filter((b) => b.pages <= maxPages);
    return [...list].sort((a, b) => b.upvotes[filter] - a.upvotes[filter]);
  }, [books, search, filter, user, maxPages, activeGenre]);

  const topTen = useMemo(() => visibleBooks.slice(0, 10), [visibleBooks]);
  const streamBooksBase = useMemo(() => visibleBooks.slice(10), [visibleBooks]);
  const streamBooks = useMemo(
    () =>
      feedTab === "following"
        ? streamBooksBase.filter((b) => following.includes(b.authorId))
        : streamBooksBase,
    [streamBooksBase, feedTab, following],
  );

  const topAuthors = useMemo(() => {
    const map = new Map<string, { score: number; titles: number }>();
    books
      .filter((b) => b.status === "published")
      .forEach((b) => {
        const entry = map.get(b.authorId) ?? { score: 0, titles: 0 };
        entry.score += b.upvotes[filter];
        entry.titles += 1;
        map.set(b.authorId, entry);
      });
    return [...map.entries()]
      .map(([id, v]) => ({ author: authorById(id), score: v.score, titles: v.titles }))
      .sort((a, b) => b.score - a.score);
  }, [books, filter]);

  const value: Store = {
    user,
    authors: AUTHORS,
    books,
    drafts,
    filter,
    genreSlots,
    search,
    view,
    sidebarOpen,
    topTenCollapsed,
    feedTab,
    upvoted,
    following,
    library,
    proSortEnabled: user?.tier === "pro",
    maxPages,
    activeGenre,
    hofEditorCount,
    hofFeatures,
    upvoteCount,
    updateHofMedia,
    signUp,
    signIn,
    signOut: () => setUser(null),
    setFilter,
    setGenreSlot,
    setSearch,
    setView,
    toggleSidebar: () => setSidebarOpen((s) => !s),
    toggleTopTen: () => setTopTenCollapsed((s) => !s),
    setFeedTab,
    toggleUpvote,
    toggleFollow,
    toggleLibrary,
    setTier,
    saveDraft,
    publishDraft,
    deleteDraft,
    setMaxPages,
    setActiveGenre,
    availableGenres: GENRES,
    hashtagSearch,
    visibleBooks,
    topTen,
    streamBooks,
    topAuthors,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useBestreads() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useBestreads must be used inside BestreadsProvider");
  return ctx;
}

export { FREE_DRAFT_LIMIT, FREE_LIBRARY_LIMIT };
