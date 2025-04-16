import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  change: {
    value: string | number;
    type: 'increase' | 'decrease';
  };
  status: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  linkText: string;
  linkUrl: string;
}

function StatCard({ 
  title, 
  value, 
  change, 
  status, 
  icon, 
  iconBg, 
  iconColor,
  linkText,
  linkUrl
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                change.type === 'increase' ? 'text-red-600' : 'text-green-600'
              }`}>
                <i className={
                  change.type === 'increase' 
                    ? 'ri-arrow-up-s-fill text-red-500' 
                    : 'ri-arrow-down-s-fill text-green-500'
                }></i>
                <span className="sr-only">{change.type === 'increase' ? 'Increased by' : 'Decreased by'}</span>
                {change.value}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{status}</p>
          </div>
          <div className={`flex items-center justify-center h-12 w-12 rounded-md ${iconBg} ${iconColor}`}>
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkUrl} className="font-medium text-blue-600 hover:text-blue-500">
            {linkText}
            <i className="ri-arrow-right-line text-xs ml-0.5"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StatsOverview() {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['/api/stats/overview'],
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden rounded-lg shadow h-[180px] skeleton"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="ri-alert-line text-red-400"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load stats. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback data if API fails or during development
  const stats = statsData || {
    airQuality: {
      value: 132,
      change: { value: '12%', type: 'increase' as const },
      status: 'Unhealthy for sensitive groups'
    },
    trafficCongestion: {
      value: '68%',
      change: { value: '4%', type: 'decrease' as const },
      status: 'Moderate congestion'
    },
    floodRisk: {
      value: 3,
      change: { value: 1, type: 'increase' as const },
      status: '2 low risk, 1 medium risk'
    },
    citizenReports: {
      value: 27,
      change: { value: 7, type: 'increase' as const },
      status: '18 resolved, 9 pending'
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Average Air Quality Index"
        value={stats.airQuality.value}
        change={stats.airQuality.change}
        status={stats.airQuality.status}
        icon="ri-bubble-chart-line"
        iconBg="bg-yellow-100"
        iconColor="text-yellow-600"
        linkText="View air quality map"
        linkUrl="/air-quality"
      />
      
      <StatCard
        title="Traffic Congestion Level"
        value={stats.trafficCongestion.value}
        change={stats.trafficCongestion.change}
        status={stats.trafficCongestion.status}
        icon="ri-traffic-line"
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
        linkText="View traffic map"
        linkUrl="/traffic"
      />
      
      <StatCard
        title="Flood Risk Areas"
        value={stats.floodRisk.value}
        change={stats.floodRisk.change}
        status={stats.floodRisk.status}
        icon="ri-flood-line"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        linkText="View flood map"
        linkUrl="/flood"
      />
      
      <StatCard
        title="Citizen Reports Today"
        value={stats.citizenReports.value}
        change={stats.citizenReports.change}
        status={stats.citizenReports.status}
        icon="ri-user-voice-line"
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        linkText="View all reports"
        linkUrl="/reports"
      />
    </div>
  );
}
