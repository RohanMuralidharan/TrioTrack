import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

interface TrafficHotspot {
  id: string;
  location: string;
  description: string;
  congestionLevel: number;
  severity: 'L' | 'M' | 'H';
}

const getSeverityDetails = (severity: string, congestionLevel: number) => {
  switch (severity) {
    case 'H':
      return {
        label: 'H',
        bg: 'bg-red-100',
        text: 'text-red-800',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        description: 'Severe congestion'
      };
    case 'M':
      return {
        label: 'M',
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        description: 'Heavy traffic'
      };
    default:
      return {
        label: 'L',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-800',
        description: 'Moderate congestion'
      };
  }
};

export default function TrafficHotspots() {
  const { data: hotspots, isLoading, error } = useQuery({
    queryKey: ['/api/traffic/hotspots'],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Traffic Hotspots</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-64">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-40 rounded mb-2" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-4">
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Traffic Hotspots</h3>
        </div>
        <div className="p-4 text-center text-gray-500">
          <i className="ri-error-warning-line text-2xl mb-2"></i>
          <p>Unable to load traffic data.</p>
        </div>
      </div>
    );
  }

  // Fallback data if API fails or during development
  const trafficData: TrafficHotspot[] = hotspots || [
    {
      id: '1',
      location: 'Main Street & 5th Avenue',
      description: 'Severe congestion',
      congestionLevel: 92,
      severity: 'H'
    },
    {
      id: '2',
      location: 'Central Boulevard',
      description: 'Heavy traffic',
      congestionLevel: 76,
      severity: 'M'
    },
    {
      id: '3',
      location: 'West Highway Exit 12',
      description: 'Heavy traffic',
      congestionLevel: 71,
      severity: 'M'
    },
    {
      id: '4',
      location: 'Harbor Bridge',
      description: 'Moderate congestion',
      congestionLevel: 58,
      severity: 'L'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Current Traffic Hotspots</h3>
      </div>
      <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
        {trafficData.map((hotspot) => {
          const severity = getSeverityDetails(hotspot.severity, hotspot.congestionLevel);
          
          return (
            <li key={hotspot.id} className="px-4 py-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${severity.bg} ${severity.text} font-medium text-xs`}>
                    {severity.label}
                  </span>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hotspot.location}</p>
                      <p className="text-xs text-gray-500">{severity.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severity.badgeBg} ${severity.badgeText}`}>
                      {hotspot.congestionLevel}%
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="bg-gray-50 px-4 py-4">
        <Link href="/traffic" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          View all traffic incidents <i className="ri-arrow-right-line text-xs ml-0.5"></i>
        </Link>
      </div>
    </div>
  );
}
