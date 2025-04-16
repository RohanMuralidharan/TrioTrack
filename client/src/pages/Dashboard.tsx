import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AlertBanner from '@/components/dashboard/AlertBanner';
import StatsOverview from '@/components/dashboard/StatsOverview';
import MapVisualization from '@/components/dashboard/MapVisualization';
import PollutionPrediction from '@/components/dashboard/PollutionPrediction';
import TrafficHotspots from '@/components/dashboard/TrafficHotspots';
import QuickReport from '@/components/dashboard/QuickReport';
import RecentReports from '@/components/dashboard/RecentReports';

export default function Dashboard() {
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
              <PollutionPrediction />
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
