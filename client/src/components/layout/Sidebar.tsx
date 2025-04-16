import { Link, useLocation } from "wouter";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const menuItems = [
    { icon: "ri-dashboard-line", label: "Dashboard", path: "/" },
    { icon: "ri-map-pin-line", label: "Map View", path: "/map" },
    { icon: "ri-bubble-chart-line", label: "Air Quality", path: "/air-quality" },
    { icon: "ri-traffic-line", label: "Traffic Analysis", path: "/traffic" },
    { icon: "ri-flood-line", label: "Flood Monitoring", path: "/flood" },
    { icon: "ri-alert-line", label: "Alerts", path: "/alerts" },
    { icon: "ri-settings-line", label: "Settings", path: "/settings" }
  ];

  const sidebarClasses = isMobile 
    ? "fixed inset-0 z-40 flex flex-col w-72 bg-white shadow-lg transition-transform transform ease-in-out duration-300" 
    : "hidden lg:flex lg:flex-col w-64 border-r border-gray-200 bg-white";

  return (
    <aside className={sidebarClasses}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <i className="ri-building-4-line text-lg"></i>
          </div>
          <h1 className="ml-3 text-xl font-semibold text-gray-900">UrbanMonitor</h1>
          {isMobile && (
            <button 
              onClick={onClose}
              className="ml-auto text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center px-2 py-3 text-sm font-medium rounded-md 
                ${isActive(item.path) 
                  ? "bg-gray-100 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}
            >
              <i className={`${item.icon} text-xl mr-3`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gray-300"></div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Jane Cooper</p>
            <p className="text-xs text-gray-500">City Planner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
