import {
  BriefcaseBusiness,
  CandlestickChart,
  CircleDot,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    end: true,
  },
  {
    title: "Portfolio",
    icon: BriefcaseBusiness,
    href: "/portfolio",
  },
  {
    title: "Market",
    icon: CandlestickChart,
    href: "/market",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
];

const Sidebar = () => {
  const pathName = window.location.pathname;
  return (
    <aside className="w-full border-b border-white/10 bg-slate-950/85 px-4 py-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
      <div className="flex items-center justify-between lg:flex-col lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
            IBKR Control
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">
            Trader cockpit
          </h1>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:flex lg:mt-5">
          <CircleDot className="size-3 fill-current" />
          Live session
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-fit items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition lg:w-full",
                  isActive
                    ? "border-cyan-400/30 bg-cyan-400/15 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.06)]"
                    : "border-white/8 bg-white/4 text-slate-300 hover:border-white/16 hover:bg-white/8 hover:text-white"
                )
              }
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </NavLink>

            // <button
            //   key={item.title}
            //   type="button"
            //   className={cn(
            //     "flex min-w-fit items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition lg:w-full",
            //     pathName === item.href
            //       ? "border-cyan-400/30 bg-cyan-400/15 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.06)]"
            //       : "border-white/8 bg-white/4 text-slate-300 hover:border-white/16 hover:bg-white/8 hover:text-white"
            //   )}
            // >
            //   <Icon size={18} />
            //   <span>{item.title}</span>
            // </button>
          );
        })}
      </div>

      <div className="mt-5 hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 lg:block">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Focus
        </p>
        <p className="mt-3 leading-6">
          Keep the dashboard fast, readable, and reliable during market hours.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
