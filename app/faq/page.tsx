import Link from "next/link";

export const metadata = { title: "FAQ" };

const link = "font-semibold text-primary underline-offset-4 hover:underline";

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How does fulfillment work?",
    a: (
      <>
        Orders under $5 are fulfilled automatically and instantly. Orders of $5 or more are manually reviewed by our team
        and take 1–5 hours.
      </>
    ),
  },
  {
    q: "Where do I get my order?",
    a: (
      <>
        It is sent to your email and is also available on your{" "}
        <Link href="/account/orders" className={link}>orders page</Link>, where you can open any order to see its delivery details.
      </>
    ),
  },
  {
    q: "What if the details I received don't work?",
    a: (
      <>
        Send us proof and you are guaranteed a replacement after 1 hour. See the{" "}
        <Link href="/terms" className={link}>Rules & Guarantee</Link> for the full details, including refunds.
      </>
    ),
  },
  {
    q: "What if something else goes wrong with my order?",
    a: (
      <>
        Reach out via the <Link href="/support" className={link}>support page</Link> with your order ID and we will help sort it out.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
        Frequently asked <span className="text-gradient">questions</span>
      </h1>
      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="glass group rounded-2xl p-5 open:border-primary/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[.07] text-lg leading-none transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
