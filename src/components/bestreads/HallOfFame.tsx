import { useEffect, useRef, useState } from "react";
import {
  Feather,
  MessageSquareText,
  Mic,
  PaintbrushVertical,
  Pause,
  Play,
  Plus,
  Settings2,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  HOF_ISSUE,
  authorById,
  type ChatMessage,
  type HofFeature,
  type HofMedia,
} from "@/lib/bestreads/data";
import { useBestreads } from "@/lib/bestreads/store";
import { cn } from "@/lib/utils";

const GLYPHS = ["✒️", "✏️", "📝", "🎨", "🧹", "📜", "📖", "📐", "✂️", "📓", "🖋️", "🕯️"];

/** Deterministic watermark field covering the whole article, not just the top. */
const SCATTER = Array.from({ length: 36 }, (_, i) => {
  const side = i % 2 === 0;
  return {
    emoji: GLYPHS[i % GLYPHS.length]!,
    top: `${1.5 + i * 2.7}%`,
    edge: side ? "left" : "right",
    offset: `${-6 + ((i * 37) % 9)}%`,
    rotate: `${((i * 53) % 40) - 20}deg`,
    size: 1.4 + ((i * 17) % 5) * 0.22,
    opacity: 0.1 + ((i * 29) % 5) * 0.035,
  };
});

function Scatter() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 hidden select-none lg:block"
      aria-hidden
    >
      {SCATTER.map((s, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: s.top,
            ...(s.edge === "left" ? { left: s.offset } : { right: s.offset }),
            transform: `rotate(${s.rotate})`,
            fontSize: `${s.size}rem`,
            opacity: s.opacity,
            filter: "grayscale(0.35)",
          }}
        >
          {s.emoji}
        </span>
      ))}
    </div>
  );
}

function Ornament({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-2 text-muted-foreground">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      <span className="font-display text-xs tracking-[0.4em] uppercase">{label ?? "✦ ✦ ✦"}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  );
}

/* ---------------- Audio ---------------- */

function AudioBlock({ url, minutes }: { url: string; minutes: number }) {
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <Button size="icon" variant="secondary" onClick={() => setPlaying((p) => !p)}>
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <div className="flex-1">
        <p className="text-xs font-semibold">
          <Mic className="mr-1 inline size-3" /> Audio log · {minutes} min
        </p>
        <div className="mt-2 flex h-7 items-end gap-0.5">
          {Array.from({ length: 40 }).map((_, k) => {
            const h = 18 + Math.abs(Math.sin(k * 1.3 + (playing ? tick * 0.4 : 0))) * 82;
            return (
              <span
                key={k}
                className={cn(
                  "w-1 rounded-full transition-[height] duration-150",
                  playing ? "bg-primary" : "bg-muted-foreground/40",
                )}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        {url ? (
          <p className="mt-1 truncate text-[0.65rem] text-muted-foreground">{url}</p>
        ) : (
          <p className="mt-1 text-[0.65rem] text-muted-foreground">No file attached yet</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Video ---------------- */

function VideoBlock({ url, title }: { url: string; title: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
        <Video className="size-8 text-muted-foreground" />
      </div>
      <p className="mt-2 text-xs font-semibold">{title || "Video conference"}</p>
      <p className="truncate text-[0.65rem] text-muted-foreground">
        {url || "No video container linked yet"}
      </p>
    </div>
  );
}

/* ---------------- Live chat playback ---------------- */

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function ChatBlock({
  authorName,
  messages,
}: {
  authorName: string;
  messages: ChatMessage[];
}) {
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<"moderator" | "author" | null>(null);
  const [collapsing, setCollapsing] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setTyping(null);
    setShown([]);
    setCollapsing(false);
  };

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown([]);
    setCollapsing(false);
    setRunning(true);
    let t = 300;
    messages.forEach((m) => {
      const delay = 700 + Math.min(1800, m.text.length * 28);
      timers.current.push(
        setTimeout(() => setTyping(m.role), t),
        setTimeout(() => {
          setTyping(null);
          setShown((prev) => [...prev, m]);
        }, t + delay),
      );
      t += delay + 420;
    });
    timers.current.push(setTimeout(() => setCollapsing(true), t + 900));
    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        setShown([]);
        setCollapsing(false);
      }, t + 1700),
    );
  };

  if (!messages.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-4 text-xs text-muted-foreground">
        No chat interview recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">
          <MessageSquareText className="mr-1 inline size-3" /> Live chat interview ·{" "}
          {authorName || "Author"}
        </p>
        <Button size="sm" variant={running ? "secondary" : "default"} onClick={running ? stop : play}>
          {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {running ? "Stop" : "Play Interview"}
        </Button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-700 ease-in-out",
          running ? "mt-3 opacity-100" : "mt-0 max-h-0 opacity-0",
          collapsing && "max-h-0 opacity-0",
        )}
        style={running && !collapsing ? { maxHeight: 620 } : undefined}
      >
        <div className="space-y-2 rounded-md bg-muted/30 p-3">
          {shown.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "author" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] animate-in fade-in slide-in-from-bottom-2 rounded-2xl px-3 py-2 text-sm shadow-soft",
                  m.role === "author"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-card",
                )}
              >
                <p className="mb-0.5 text-[0.6rem] tracking-widest uppercase opacity-70">
                  {m.role === "author" ? authorName || "Author" : "Moderator"}
                </p>
                {m.text}
              </div>
            </div>
          ))}
          {typing ? (
            <div className={cn("flex", typing === "author" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "rounded-2xl px-3 py-1.5 shadow-soft",
                  typing === "author" ? "rounded-br-sm bg-primary/20" : "rounded-bl-sm bg-card",
                )}
              >
                <TypingDots />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MediaView({ media }: { media: HofMedia }) {
  if (media.kind === "audio") return <AudioBlock url={media.url} minutes={media.minutes} />;
  if (media.kind === "video") return <VideoBlock url={media.url} title={media.title} />;
  return <ChatBlock authorName={media.authorName} messages={media.messages} />;
}

/* ---------------- Editor modal ---------------- */

function EditorModal({
  feature,
  open,
  onOpenChange,
}: {
  feature: HofFeature;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { updateHofMedia } = useBestreads();
  const media = feature.media;
  const [kind, setKind] = useState<HofMedia["kind"]>(media.kind);
  const [audioUrl, setAudioUrl] = useState(media.kind === "audio" ? media.url : "");
  const [audioMinutes, setAudioMinutes] = useState(
    media.kind === "audio" ? String(media.minutes) : "10",
  );
  const [videoUrl, setVideoUrl] = useState(media.kind === "video" ? media.url : "");
  const [videoTitle, setVideoTitle] = useState(media.kind === "video" ? media.title : "");
  const [chatAuthor, setChatAuthor] = useState(
    media.kind === "chat" ? media.authorName : authorById(feature.authorId).name,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    media.kind === "chat" ? media.messages : [],
  );
  const [role, setRole] = useState<"moderator" | "author">("moderator");
  const [text, setText] = useState("");

  const addMessage = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: `m${Date.now()}`, role, text: text.trim() }]);
    setText("");
    setRole((r) => (r === "moderator" ? "author" : "moderator"));
  };

  const save = () => {
    if (kind === "audio") {
      updateHofMedia(feature.authorId, {
        kind: "audio",
        url: audioUrl.trim(),
        minutes: Number(audioMinutes) || 0,
      });
    } else if (kind === "video") {
      updateHofMedia(feature.authorId, {
        kind: "video",
        url: videoUrl.trim(),
        title: videoTitle.trim(),
      });
    } else {
      updateHofMedia(feature.authorId, {
        kind: "chat",
        authorName: chatAuthor.trim(),
        messages,
      });
    }
    onOpenChange(false);
    toast.success("Interview format updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Configure interview format</DialogTitle>
          <DialogDescription>
            {feature.headline} · choose exactly one of the three approved formats.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={kind} onValueChange={(v) => setKind(v as HofMedia["kind"])}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audio">
              <Mic className="size-3.5" /> Audio log
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="size-3.5" /> Video
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquareText className="size-3.5" /> Live chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="audio-file">Upload voice note</Label>
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setAudioUrl(f.name);
                    toast.success(`Attached ${f.name}`);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio-url">…or paste an audio link</Label>
              <Input
                id="audio-url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://…/voice-note.mp3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio-min">Duration (minutes)</Label>
              <Input
                id="audio-min"
                value={audioMinutes}
                onChange={(e) => setAudioMinutes(e.target.value.replace(/\D/g, ""))}
                className="w-28"
              />
            </div>
            <AudioBlock url={audioUrl} minutes={Number(audioMinutes) || 0} />
          </TabsContent>

          <TabsContent value="video" className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="video-file">Upload video container</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setVideoUrl(f.name);
                    toast.success(`Attached ${f.name}`);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">…or paste a conference link</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://…/interview"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-title">Video title</Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Studio call: building a year-long structure"
              />
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="chat-author">Author name</Label>
              <Input
                id="chat-author"
                value={chatAuthor}
                onChange={(e) => setChatAuthor(e.target.value)}
                placeholder="Martha Quill"
              />
            </div>

            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={role === "moderator" ? "default" : "outline"}
                  onClick={() => setRole("moderator")}
                >
                  Moderator (left)
                </Button>
                <Button
                  size="sm"
                  variant={role === "author" ? "default" : "outline"}
                  onClick={() => setRole("author")}
                >
                  Author (right)
                </Button>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write the next message in the conversation…"
                className="min-h-20"
              />
              <Button size="sm" onClick={addMessage}>
                <Plus className="size-3.5" /> Insert message
              </Button>
            </div>

            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex items-center gap-2", m.role === "author" && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        m.role === "author"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted",
                      )}
                    >
                      {m.text}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setMessages((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save format</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Page ---------------- */

export function HallOfFame() {
  const { user, hofFeatures } = useBestreads();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="relative mx-auto max-w-3xl px-4 pb-24">
      <Scatter />
      <Feather className="pointer-events-none absolute -top-4 -left-10 size-40 rotate-12 text-accent opacity-60" />
      <PaintbrushVertical className="pointer-events-none absolute top-96 -right-12 size-36 -rotate-12 text-accent opacity-50" />

      <header className="relative border-y-2 border-double border-border py-12 text-center">
        <p className="text-[0.65rem] tracking-[0.35em] text-muted-foreground uppercase">
          The Hall of Fame Magazine · {HOF_ISSUE.issue} · {HOF_ISSUE.cadence}
        </p>
        <h1 className="font-display mt-4 text-5xl font-semibold text-balance">
          Five Rising Authors
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{HOF_ISSUE.window}</p>
        <div className="mx-auto mt-6 max-w-xl">
          <Ornament label="Editorial" />
          <p className="mt-4 text-left text-base leading-relaxed first-letter:font-display first-letter:mr-2 first-letter:float-left first-letter:text-6xl first-letter:leading-[0.8] first-letter:font-semibold">
            {HOF_ISSUE.editorial}
          </p>
        </div>
        {user?.isHallOfFameEditor ? (
          <p className="mt-6 inline-block rounded-full border border-gold bg-gold/15 px-3 py-1 text-xs font-semibold">
            Editor privileges active — seat granted by secret access code
          </p>
        ) : (
          <p className="mt-6 text-xs text-muted-foreground">
            Read-only. Only the 5 magazine editors can revise these pages.
          </p>
        )}
      </header>

      <div className="relative space-y-20 pt-12">
        {hofFeatures.map((f, i) => {
          const author = authorById(f.authorId);
          return (
            <article key={f.authorId} className="relative">
              <Ornament label={`Portrait ${String(i + 1).padStart(2, "0")} of 05`} />
              <div className="mt-8 flex items-start justify-between gap-4">
                <div>
                  <span className="text-metric inline-flex size-9 items-center justify-center rounded-full border border-gold text-xs tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display mt-2 text-3xl font-semibold">{f.headline}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {author.name} · @{author.username}
                  </p>
                </div>
                {user?.isHallOfFameEditor ? (
                  <Button size="sm" variant="outline" onClick={() => setEditing(f.authorId)}>
                    <Settings2 className="size-3.5" /> Edit Article
                  </Button>
                ) : null}
              </div>

              <p className="mt-4 border-l-2 border-border pl-4 text-lg leading-relaxed text-pretty">
                {f.standfirst}
              </p>

              <blockquote className="font-display my-8 border-l-2 border-gold pl-6 text-2xl leading-snug italic">
                “{f.quote}”
              </blockquote>

              <div className="space-y-4 rounded-xl border border-border bg-card/50 p-6 shadow-soft">
                {f.interview.map((qa) => (
                  <div key={qa.q} className="border-b border-dashed border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold tracking-widest uppercase">{qa.q}</p>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">{qa.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <MediaView media={f.media} />
              </div>

              {user?.isHallOfFameEditor ? (
                <EditorModal
                  key={`${f.authorId}-${f.media.kind}`}
                  feature={f}
                  open={editing === f.authorId}
                  onOpenChange={(v) => setEditing(v ? f.authorId : null)}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
