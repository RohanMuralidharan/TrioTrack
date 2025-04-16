import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function PollutionPrediction() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/air-quality/prediction'],
    staleTime: 900000, // 15 minutes
  });

  const renderPredictionBox = (label: string, value: number, bgColor: string, textColor: string) => (
    <div className="w-20 mr-4">
      <div className={`${bgColor} ${textColor} font-medium px-3 py-2 rounded-md text-center`}>
        <span className="text-sm">{label}</span>
        <div className="text-lg">{value}</div>
      </div>
    </div>
  );

  const getColorForAQI = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-green-100', text: 'text-green-800' };
    if (aqi <= 100) return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    if (aqi <= 150) return { bg: 'bg-orange-100', text: 'text-orange-800' };
    if (aqi <= 200) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (aqi <= 300) return { bg: 'bg-purple-100', text: 'text-purple-800' };
    return { bg: 'bg-rose-100', text: 'text-rose-800' };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="h-5 w-48 skeleton rounded"></div>
        <div className="flex space-x-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 skeleton rounded"></div>
          ))}
        </div>
        <div className="h-16 skeleton rounded"></div>
        <div className="h-10 skeleton rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Pollution Prediction</h3>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="ri-alert-line text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load predictions. Please try again.
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => refetch()} 
          className="w-full mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Fallback data if API fails or during development
  const predictions = data || {
    current: 132,
    twoHours: 125,
    fourHours: 98,
    sixHours: 75,
    confidence: 87,
    explanation: "Based on ML predictions, air quality will improve over the next 6 hours due to changing wind patterns and decreased traffic."
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">AI Pollution Prediction</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-4">
          {renderPredictionBox("Now", predictions.current, 
            getColorForAQI(predictions.current).bg, 
            getColorForAQI(predictions.current).text)}
            
          {renderPredictionBox("2h", predictions.twoHours, 
            getColorForAQI(predictions.twoHours).bg, 
            getColorForAQI(predictions.twoHours).text)}
            
          {renderPredictionBox("4h", predictions.fourHours, 
            getColorForAQI(predictions.fourHours).bg, 
            getColorForAQI(predictions.fourHours).text)}
            
          {renderPredictionBox("6h", predictions.sixHours, 
            getColorForAQI(predictions.sixHours).bg, 
            getColorForAQI(predictions.sixHours).text)}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {predictions.explanation}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <i className="ri-information-line mr-1"></i>
            <span>Model confidence: {predictions.confidence}%</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4">
        <Button className="w-full" variant="default">
          Run detailed analysis
        </Button>
      </div>
    </div>
  );
}
