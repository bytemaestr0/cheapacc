import Link from "next/link";
import { ShieldCheck, RefreshCcw, KeyRound, Ban } from "lucide-react";

export const metadata = { title: "Rules & Guarantee" };

const sections = [
  {
    icon: RefreshCcw,
    title: "Refunds",
    items: [
      "Refund requests must be made within 30 days of your purchase.",
      "To get a refund, send proof that the account data was not valid (for example a screenshot or screen recording of the failed login).",
      "Every request is reviewed and answered within 3 business days at most.",
      "A refund is only issued once the proof has been accepted.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Replacement guarantee",
    items: [
      "If the account details you received are not correct, you are guaranteed a new account after 1 hour.",
      "Send your proof of the problem together with your order ID so we can verify it quickly.",
      "A replacement is the same type of account, or the closest equivalent if the original is no longer available.",
    ],
  },
  {
    icon: KeyRound,
    title: "After delivery",
    items: [
      "Once the details have been delivered and work as described, the order is complete.",
      "We are not responsible for problems that happen after delivery, such as the password or email being changed by the account's original owner or by anyone else.",
      "Change the password and secure the account as soon as you receive it.",
    ],
  },
  {
    icon: Ban,
    title: "General rules",
    items: [
      "Check the listing's options and description before you buy. They show exactly what is included.",
      "Requests without proof, or with proof that does not match the order, can be declined.",
      "Abuse of the refund or replacement system can lead to a ban from the store.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
        Rules & <span className="text-gradient">Guarantee</span>
      </h1>
      <p className="mt-3 text-muted-foreground">The short version of how refunds, replacements and delivery work.</p>

      <div className="mt-10 space-y-4">
        {sections.map(({ icon: Icon, title, items }) => (
          <section key={title} className="glass rounded-2xl p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-3 text-lg font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary"><Icon className="h-[18px] w-[18px]" /></span>
              {title}
            </h2>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {items.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Need to use the guarantee? <Link href="/support" className="font-semibold text-primary underline-offset-4 hover:underline">Contact support</Link> with your order ID and proof.
      </p>
    </div>
  );
}
