import { SectionHeading } from './SectionHeading';

const posts = [
  { image: '/images/blog/1.png', title: 'Is The 2024 Porsche Cayenne S A Good SUV? 4 Pros And 3 Cons', alt: 'Blue Porsche Cayenne by the sea' },
  { image: '/images/blog/2.png', title: 'Compact Steamroller: 2024 Toyota RAV4 Starts At $29,825', alt: 'Green Toyota RAV4 on a forest road' },
  { image: '/images/blog/3.png', title: '2024 Kia Niro EV Costs $50 More, Nearly Unchanged Otherwise', alt: 'White Kia Niro EV in front of a building' },
];

export function BlogSection() {
  return (
    <section id="blogs" className="scroll-mt-24 bg-muted py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading title="Blogs" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img src={p.image} alt={p.alt} loading="lazy" className="h-48 w-full object-cover" />
              <h3 className="p-5 text-lg leading-snug">{p.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}