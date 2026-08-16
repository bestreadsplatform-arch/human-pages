import { Check, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBestreads } from "@/lib/bestreads/store";
import { cn } from "@/lib/utils";

const FREE = [
  "Browse every feed and the full Top 10",
  "Library limited to 5 books",
  "Up to 5 saved drafts",
  "Plain-text storefront links",
  "Single 3-pillar analytics chart",
];

const PRO = [
  "Unlimited library slots",
  "Advanced feed filters (length, upvotes)",
  "Unlimited drafts",
  "Hour-by-hour, day-by-day Pro line charts",
  "Stylized storefront CTA buttons on your cards",
];

export function Pricing() {
  const { user, setTier } = useBestreads();
  const pro = user?.tier === "pro";

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24">
      <header className="py-12 text-center">
        <h1 className="font-display text-4xl font-semibold">Support human writing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Simulated Stripe billing — switch tiers freely to test privileges.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className={cn("rounded-xl border border-border bg-card p-6 shadow-soft", !pro && "ring-2 ring-ring")}>
          <h2 className="font-display text-2xl font-semibold">Free</h2>
          <p className="text-metric mt-2 text-4xl font-semibold">0€</p>
          <ul className="mt-6 space-y-2 text-sm">
            {FREE.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-6 w-full"
            disabled={!pro}
            onClick={() => {
              setTier("free");
              toast("Downgraded to Free");
            }}
          >
            {pro ? "Switch to Free" : "Current plan"}
          </Button>
        </div>

        <div className={cn("rounded-xl border border-gold bg-card p-6 shadow-lift", pro && "ring-2 ring-gold")}>
          <h2 className="font-display text-2xl font-semibold">Pro</h2>
          <p className="text-metric mt-2 text-4xl font-semibold">
            9€ <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="text-xs text-muted-foreground">or 69€ / year — two months on the house</p>
          <ul className="mt-6 space-y-2 text-sm">
            {PRO.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-verified" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 w-full"
            disabled={pro}
            onClick={() => {
              setTier("pro");
              toast.success("Pro unlocked (simulated Stripe checkout)");
            }}
          >
            <CreditCard className="size-4" /> {pro ? "Current plan" : "Upgrade for 9€/month"}
          </Button>
        </div>
      </div>
    </div>
  );
}
