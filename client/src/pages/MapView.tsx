import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MapVisualization from '@/components/dashboard/MapVisualization';

export default function MapView() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleString('en-US', {
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    }));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <Topbar title="Map View" lastUpdated={`Today, ${lastUpdated}`} />
        
        <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Detailed Map View</h2>
            <p className="text-sm text-gray-600">
              Explore urban data with interactive layers. Toggle different data types using the controls above the map.
            </p>
          </div>
          
          <MapVisualization height="h-[calc(100vh-16rem)]" fullWidth={true} />
        </div>
      </main>
    </div>
  );
}
