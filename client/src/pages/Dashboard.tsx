import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AlertBanner from '@/components/dashboard/AlertBanner';
import StatsOverview from '@/components/dashboard/StatsOverview';
import MapVisualization from '@/components/dashboard/MapVisualization';
import { PollutionPrediction } from '@/components/dashboard/PollutionPrediction';
import TrafficHotspots from '@/components/dashboard/TrafficHotspots';
import QuickReport from '@/components/dashboard/QuickReport';
import RecentReports from '@/components/dashboard/RecentReports';

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('delhi');
  
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
        <Topbar title="Dashboard" lastUpdated={`Today, ${lastUpdated}`} />
        
        <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] overflow-y-auto">
          <AlertBanner 
            title="Attention" 
            message="High air pollution levels detected in the North District. AQI levels exceeding 150. Consider limiting outdoor activities."
          />
          
          <StatsOverview />
          
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="col-span-1 lg:col-span-8">
              <MapVisualization />
            </div>
            
            <div className="col-span-1 lg:col-span-4 space-y-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Air Quality Analysis</h3>
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Select Location</label>
                  <select
                    id="location"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="delhi">Delhi</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="pune">Pune</option>
                    <option value="ahmedabad">Ahmedabad</option>
                  </select>
                </div>
                <PollutionPrediction locationId={selectedLocation} />
              </div>
              <TrafficHotspots />
              <QuickReport />
            </div>
          </div>
          
          <RecentReports />
        </div>
      </main>
    </div>
  );
}
