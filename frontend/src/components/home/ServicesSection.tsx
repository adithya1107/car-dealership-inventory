import { Car, MousePointerClick, Wallet, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const services: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Car, title: 'Top Buy & Sell Car', text: 'Browse a curated inventory and buy your next car in a few clicks.' },
  { icon: Wallet, title: 'Easy Payment', text: 'Clear pricing with no hidden fees, so you always know what you pay.' },
  { icon: MousePointerClick, title: 'Easy To Use', text: 'Search by make, model, category or budget and find a match fast.' },
];

export function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20">
      <SectionHeading title="Our Services" subtitle="Everything you need to find, compare and buy your next vehicle." />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {services.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Icon className="text-brand" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}