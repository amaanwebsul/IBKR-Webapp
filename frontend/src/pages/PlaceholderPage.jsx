import { Badge } from "@/components/ui/badge";

const PlaceholderPage = ({
  label,
  title,
  description,
}) => {
  return (
    <section className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_100px_rgba(8,15,33,0.42)] backdrop-blur-xl sm:p-8">
      <Badge className="rounded-full bg-amber-400/12 px-3 py-1 text-amber-100 hover:bg-amber-400/12">
        Coming next
      </Badge>

      <div className="mt-5 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
          {label}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
};

export default PlaceholderPage;
