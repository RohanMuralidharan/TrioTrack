import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface AirQualityAnalysis {
  aqi: {
    value: number;
    label: string;
  };
  recommendation: {
    text: string;
    emoji: string;
  };
  predictions: {
    current: number;
    twoHours: number;
    fourHours: number;
    sixHours: number;
    confidence: number;
    explanation: string;
  };
  ranges: {
    good: string;
    moderate: string;
    unhealthySensitive: string;
    unhealthy: string;
    veryUnhealthy: string;
    hazardous: string;
  };
}

const getColorForAQI = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-100 text-green-800';
  if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
  if (aqi <= 150) return 'bg-orange-100 text-orange-800';
  if (aqi <= 200) return 'bg-red-100 text-red-800';
  if (aqi <= 300) return 'bg-purple-100 text-purple-800';
  return 'bg-rose-100 text-rose-800';
};

export const PollutionPrediction: React.FC<{ locationId: string }> = ({ locationId }) => {
  const { data, isLoading, isError, refetch } = useQuery<AirQualityAnalysis>({
    queryKey: ['airQualityAnalysis', locationId],
    queryFn: async () => {
      const response = await fetch('/api/air-quality/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch air quality analysis');
      }
      return response.json();
    },
    enabled: !!locationId,
  });

  if (isLoading) {
    return <p className="text-gray-600">Loading air quality analysis...</p>;
  }

  if (isError) {
    return <p className="text-red-600">Error loading air quality analysis</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => refetch()} 
        className="w-full md:w-auto mb-4"
      >
        <i className="ri-refresh-line mr-2" />
        Analyze Air Quality
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current AQI Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Air Quality
          </h3>
          <div className={`${getColorForAQI(data.aqi.value)} rounded-md p-4 mb-4`}>
            <div className="text-3xl font-bold text-center">
              {data.aqi.value}
            </div>
            <div className="text-center mt-1">
              {data.aqi.label}
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <i className="ri-alert-line" />
            <span>{data.recommendation.emoji} {data.recommendation.text}</span>
          </div>
        </div>

        {/* Predictions Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Predictions
          </h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              2 Hours: {data.predictions.twoHours.toFixed(1)} AQI
            </p>
            <p className="text-gray-700">
              4 Hours: {data.predictions.fourHours.toFixed(1)} AQI
            </p>
            <p className="text-gray-700">
              6 Hours: {data.predictions.sixHours.toFixed(1)} AQI
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Confidence: {(data.predictions.confidence * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {data.predictions.explanation}
            </p>
          </div>
        </div>

        {/* AQI Ranges Card */}
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            AQI Ranges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(data.ranges).map(([key, value]) => (
              <p key={key} className="text-sm text-gray-600">
                {value}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
