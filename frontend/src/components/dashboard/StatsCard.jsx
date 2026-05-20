import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "default",
}) => {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop-blur-sm",
        tone === "accent" && "bg-cyan-400/10"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-5 pb-0">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <CardTitle className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {value}
          </CardTitle>
        </div>

        {Icon ? (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-200">
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="flex items-center justify-between px-5 pt-5 pb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          {subtitle || "Live account metric"}
        </p>
        <ArrowUpRight className="size-4 text-slate-500" />
      </CardContent>
    </Card>
  );
};

export default StatsCard;
