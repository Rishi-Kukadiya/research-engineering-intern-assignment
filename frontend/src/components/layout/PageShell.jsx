import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Network, BarChart2, Menu, X } from 'lucide-react';

export default function PageShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-narrative-lightest font-poppins overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar - Hidden on mobile unless toggled, always visible on medium screens and up */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-narrative-light transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-sm ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-narrative-dark tracking-wide">NarrativeScope</h1>
          <button onClick={toggleSidebar} className="md:hidden text-narrative-dark">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-narrative-dark hover:bg-narrative-lightest transition-colors font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/timeseries" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-narrative-dark hover:bg-narrative-lightest transition-colors font-medium">
            <BarChart2 size={20} /> Trends
          </Link>
          <Link to="/network" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-narrative-dark hover:bg-narrative-lightest transition-colors font-medium">
            <Network size={20} /> Network
          </Link>
          <Link to="/chat" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-narrative-dark hover:bg-narrative-lightest transition-colors font-medium">
            <MessageSquare size={20} /> AI Analyst
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Mobile Header with Hamburger Menu */}
        <header className="md:hidden bg-white p-4 border-b border-narrative-light flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="text-narrative-dark">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-narrative-dark">NarrativeScope</h1>
          </div>
        </header>

        {/* Dynamic Page Content goes here */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}