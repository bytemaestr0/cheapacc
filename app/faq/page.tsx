export const metadata = { title: "FAQ" };

const faqs = [
  {
    q: "How does fulfillment work?",
    a: "After you place an order, our team manually reviews and fulfills it. You'll see delivery details appear on your order page once it's ready.",
  },
  {
    q: "How long does fulfillment take?",
    a: "Most orders are fulfilled within a few hours. You can check status any time on your order page.",
  },
  {
    q: "What if something goes wrong with my order?",
    a: "Reach out via the support page and our team will help sort it out.",
  },
];

export default function FaqPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Frequently asked questions</h1>
      <div className="space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="font-semibold">{f.q}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
