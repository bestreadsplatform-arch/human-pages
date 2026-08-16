import { useState } from "react";
import { Feather, PaintbrushVertical, Pause, Pencil, Play, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HOF_FEATURES, HOF_ISSUE, authorById } from "@/lib/bestreads/data";
import { useBestreads } from "@/lib/bestreads/store";

export function HallOfFame() {
  const { user } = useBestreads();
  const [editing, setEditing] = useState<string | null>(null);
  const [copy, setCopy] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="relative mx-auto max-w-3xl px-4 pb-24">
      <Feather className="pointer-events-none absolute -top-4 -left-10 size-40 rotate-12 text-accent opacity-60" />
      <PaintbrushVertical className="pointer-events-none absolute top-96 -right-12 size-36 -rotate-12 text-accent opacity-50" />

      <header className="relative py-12 text-center">
        <p className="text-[0.65rem] tracking-[0.35em] text-muted-foreground uppercase">
          The Hall of Fame Magazine · {HOF_ISSUE.issue} · {HOF_ISSUE.cadence}
        </p>
        <h1 className="font-display mt-4 text-5xl font-semibold text-balance">
          Five Rising Authors
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{HOF_ISSUE.window}</p>
        <p className="mx-auto mt-6 max-w-xl text-left text-base leading-relaxed">
          {HOF_ISSUE.editorial}
        </p>
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

      <div className="relative space-y-16">
        {HOF_FEATURES.map((f, i) => {
          const author = authorById(f.authorId);
          const text = copy[f.authorId] ?? f.standfirst;
          return (
            <article key={f.authorId} className="border-t border-border pt-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-metric text-xs tracking-widest text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display mt-2 text-3xl font-semibold">{f.headline}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {author.name} · @{author.username}
                  </p>
                </div>
                {user?.isHallOfFameEditor ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(editing === f.authorId ? null : f.authorId)}
                  >
                    <Pencil className="size-3.5" /> Edit Article
                  </Button>
                ) : null}
              </div>

              {editing === f.authorId ? (
                <div className="mt-4 space-y-2">
                  <Textarea
                    value={text}
                    onChange={(e) => setCopy((c) => ({ ...c, [f.authorId]: e.target.value }))}
                    className="min-h-24 bg-card"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null);
                      toast.success("Article updated");
                    }}
                  >
                    Save changes
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-lg leading-relaxed">{text}</p>
              )}

              <blockquote className="font-display my-8 border-l-2 border-gold pl-6 text-2xl leading-snug italic">
                “{f.quote}”
              </blockquote>

              <div className="space-y-4">
                {f.interview.map((qa) => (
                  <div key={qa.q}>
                    <p className="text-xs font-semibold tracking-widest uppercase">{qa.q}</p>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">{qa.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setPlaying(playing === f.authorId ? null : f.authorId)}
                  >
                    {playing === f.authorId ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Voice log · {f.audioMinutes} min</p>
                    <div className="mt-2 flex h-6 items-end gap-0.5">
                      {Array.from({ length: 28 }).map((_, k) => (
                        <span
                          key={k}
                          className="w-1 rounded-full bg-muted-foreground/50"
                          style={{ height: `${20 + Math.abs(Math.sin(k * 1.3)) * 80}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                  <Video className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">{f.videoTitle}</p>
                    <p className="text-xs text-muted-foreground">Video conference placeholder</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
