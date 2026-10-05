import { Mail } from "lucide-react";

export const metadata = { title: "Support" };

const EMAIL = "cheapaccountsha@proton.me";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Support</h1>
      <div className="glass mt-8 flex items-start gap-4 rounded-2xl p-5 sm:p-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Mail className="h-5 w-5" /></span>
        <p className="text-muted-foreground">
          Questions about an order? Email{" "}
          <a href={`mailto:${EMAIL}`} className="break-all font-semibold text-primary underline-offset-4 hover:underline">{EMAIL}</a>{" "}
          and include your order ID.
        </p>
      </div>
    </div>
  );
}
