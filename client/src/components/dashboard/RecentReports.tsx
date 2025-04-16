import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Report {
  id: string;
  issue: {
    title: string;
    type: string;
    icon: string;
    iconBg: string;
    iconColor: string;
  };
  location: {
    area: string;
    details: string;
  };
  reporter: {
    name: string;
    role: string;
  };
  date: string;
  status: {
    label: string;
    color: string;
  };
}

export default function RecentReports() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['/api/reports', filter],
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow animate-pulse">
          <div className="p-4 border-b border-gray-200">
            <div className="h-7 bg-gray-200 rounded w-56"></div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded mb-4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <i className="ri-error-warning-line text-3xl text-red-500 mb-2"></i>
            <h3 className="text-lg font-medium text-gray-900">Failed to load reports</h3>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the reports array from the API response
  const response = reports as { reports: Report[], total: number, page: number, perPage: number, totalPages: number } | undefined;
  
  // Fallback data if API fails or during development
  const reportData: Report[] = response?.reports || [
    {
      id: '1',
      issue: {
        title: 'Factory Smoke',
        type: 'Air Pollution',
        icon: 'ri-bubble-chart-line',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
      },
      location: {
        area: 'North Industrial Zone',
        details: 'Block 4, Building 7'
      },
      reporter: {
        name: 'Robert Johnson',
        role: 'Citizen'
      },
      date: 'Today, 09:41 AM',
      status: {
        label: 'In Progress',
        color: 'bg-yellow-100 text-yellow-800'
      }
    },
    {
      id: '2',
      issue: {
        title: 'Major Accident',
        type: 'Traffic Congestion',
        icon: 'ri-traffic-line',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
      },
      location: {
        area: 'West Highway',
        details: 'Mile 23, Exit 12'
      },
      reporter: {
        name: 'Maria Garcia',
        role: 'Traffic Officer'
      },
      date: 'Today, 08:17 AM',
      status: {
        label: 'Resolved',
        color: 'bg-green-100 text-green-800'
      }
    },
    {
      id: '3',
      issue: {
        title: 'Street Flooding',
        type: 'Flooding',
        icon: 'ri-flood-line',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      location: {
        area: 'Downtown',
        details: 'Oak Street & 7th Avenue'
      },
      reporter: {
        name: 'Susan Wong',
        role: 'Citizen'
      },
      date: 'Yesterday, 05:32 PM',
      status: {
        label: 'Urgent',
        color: 'bg-red-100 text-red-800'
      }
    }
  ];

  // Use the total and pagination data from the API response if available
  const total = response?.total || reportData.length;
  const perPage = response?.perPage || 10;
  const totalPages = response?.totalPages || Math.ceil(total / perPage);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Citizen Reports</h3>
          <div className="flex space-x-2">
            <Select onValueChange={handleFilterChange} defaultValue={filter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="airPollution">Air Pollution</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="flooding">Flooding</SelectItem>
                <SelectItem value="noise">Noise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center">
              <i className="ri-filter-3-line mr-1"></i>
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full ${report.issue.iconBg} flex items-center justify-center ${report.issue.iconColor}`}>
                        <i className={report.issue.icon}></i>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.issue.title}</div>
                        <div className="text-sm text-gray-500">{report.issue.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.location.area}</div>
                    <div className="text-sm text-gray-500">{report.location.details}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.reporter.name}</div>
                    <div className="text-sm text-gray-500">{report.reporter.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status.color}`}>
                      {report.status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">{total}</span> results
              </p>
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <a 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    <PaginationPrevious />
                  </a>
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <a 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-300 pointer-events-none' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    <PaginationNext />
                  </a>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          <div className="flex sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </a>
            <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
