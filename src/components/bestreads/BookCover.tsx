import { COVER_PALETTES } from "@/lib/bestreads/data";
import { cn } from "@/lib/utils";

export function BookCover({
  title,
  author,
  cover,
  image,
  className,
}: {
  title: string;
  author?: string;
  cover: number;
  image?: string | undefined;
  className?: string;
}) {
  const palette = COVER_PALETTES[cover % COVER_PALETTES.length]!;
  return (
    <div
      className={cn(
        "relative flex aspect-2/3 w-full flex-col justify-between overflow-hidden rounded-sm p-4 shadow-cover",
        className,
      )}
      style={{ backgroundColor: palette.bg, color: palette.fg }}
    >
      {image ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-y-0 left-0 w-2 bg-black/15" />
      {!image && (
        <>
          <div className="relative text-[0.55rem] font-semibold tracking-[0.25em] uppercase opacity-70">
            Bestreads
          </div>
          <div className="relative">
            <div className="mb-2 h-px w-8 bg-current opacity-50" />
            <h3 className="font-display text-lg leading-tight font-semibold text-balance">
              {title}
            </h3>
            {author ? (
              <p className="mt-2 text-[0.6rem] tracking-[0.18em] uppercase opacity-75">{author}</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
