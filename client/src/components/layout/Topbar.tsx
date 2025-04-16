import { useState } from "react";
import Sidebar from "./Sidebar";

interface TopbarProps {
  title: string;
  lastUpdated?: string;
}

export default function Topbar({ title, lastUpdated }: TopbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const locations = [
    { id: 'downtown', name: 'Downtown' },
    { id: 'north', name: 'North District' },
    { id: 'west', name: 'West Harbor' },
    { id: 'east', name: 'East Side' },
    { id: 'south', name: 'South Valley' }
  ];

  return (
    <>
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30" onClick={() => setSidebarOpen(false)}></div>
          <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
        </>
      )}
      
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
            >
              <i className="ri-menu-line text-2xl"></i>
            </button>
            <h1 className="ml-3 text-lg font-semibold text-gray-900">UrbanMonitor</h1>
          </div>
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:w-full">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
              {lastUpdated && (
                <span className="ml-3 text-sm text-gray-500">Last updated: {lastUpdated}</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center">
                  <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-2.5">
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
              </div>
              <button className="relative bg-white p-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-orange-500"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
