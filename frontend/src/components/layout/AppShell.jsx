import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AppShell = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#164e63_0%,#0f172a_28%,#020617_70%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.08),transparent_35%,rgba(14,116,144,0.12)_100%)]" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1">
          <Header />

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
