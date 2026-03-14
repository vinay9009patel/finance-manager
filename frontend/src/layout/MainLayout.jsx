import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="hidden md:block md:w-72 border-r border-white/5 bg-[#0c1117] p-6">
        <Sidebar />
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <aside className="relative h-full w-[85vw] max-w-72 border-r border-white/8 bg-[#0c1117] p-5 shadow-2xl">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30 border-b border-white/5 bg-gray-900/90 backdrop-blur px-4 py-4 md:px-8">
          <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_32%),linear-gradient(180deg,_rgba(17,24,39,0.96),_rgba(3,7,18,1))]">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
