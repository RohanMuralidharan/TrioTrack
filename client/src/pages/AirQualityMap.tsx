import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from '@/lib/queryClient';
import Plotly from 'plotly.js-dist';
import { AlertCircle, Wind, Thermometer, Droplets, Compass } from "lucide-react";

interface AirQualityInput {
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
}

interface AirQualityResult {
  aqi: {
    value: number;
    label: string;
  };
  recommendation: {
    text: string;
    emoji: string;
  };
  mapData: {
    data: number[][];
    x: number[];
    y: number[];
    title: string;
  };
  ranges: {
    good: string;
    moderate: string;
    unhealthySensitive: string;
    unhealthy: string;
    veryUnhealthy: string;
    hazardous: string;
  };
  input: AirQualityInput;
}

export default function AirQualityMap() {
  const { toast } = useToast();
  const plotRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AirQualityResult | null>(null);
  
  // Default values for inputs
  const [inputs, setInputs] = useState<AirQualityInput>({
    pm25: 35,
    pm10: 75,
    no2: 40,
    co: 5,
    so2: 20,
    o3: 30,
    temperature: 25,
    humidity: 50,
    windSpeed: 5,
    windDirection: 180
  });

  // Update input values
  const handleInputChange = (name: keyof AirQualityInput, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // Process and analyze air quality data
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest<AirQualityResult>('/api/air-quality/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });
      
      setResult(result);
      
      toast({
        title: 'Analysis Complete',
        description: `AQI: ${result.aqi.value} (${result.aqi.label})`,
      });
      
      // Draw the heatmap using Plotly
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
        
        const { mapData } = result;
        
        Plotly.newPlot(plotRef.current, [{
          z: mapData.data,
          x: mapData.x,
          y: mapData.y,
          type: 'heatmap',
          colorscale: 'Viridis',
          colorbar: {
            title: 'PM2.5 (µg/m³)'
          }
        }], {
          title: mapData.title,
          xaxis: {
            title: 'X (m)',
            tickformat: 'k', 
            tickangle: 0
          },
          yaxis: {
            title: 'Y (m)',
            tickformat: '.0f'
          },
          width: undefined, // Let it be responsive
          height: 500,
          margin: {
            l: 50,
            r: 50,
            b: 100,
            t: 100,
            pad: 4
          }
        }, {
          responsive: true
        });
      }
    } catch (error) {
      console.error('Error analyzing air quality:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze air quality data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get AQI color class based on value
  const getAQIColorClass = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    if (aqi <= 200) return 'text-red-600';
    if (aqi <= 300) return 'text-purple-600';
    return 'text-rose-800';
  };

  // Component
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Air Quality Analysis</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Tabs defaultValue="primary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="primary">Primary</TabsTrigger>
                <TabsTrigger value="secondary">Secondary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="primary" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pm25">PM2.5 (µg/m³)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        id="pm25-slider"
                        value={[inputs.pm25]} 
                        min={0} 
                        max={300} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('pm25', v[0])} 
                      />
                      <Input
                        id="pm25"
                        type="number"
                        value={inputs.pm25}
                        className="w-16"
                        onChange={(e) => handleInputChange('pm25', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pm10">PM10 (µg/m³)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.pm10]} 
                        min={0} 
                        max={500} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('pm10', v[0])} 
                      />
                      <Input
                        id="pm10"
                        type="number"
                        value={inputs.pm10}
                        className="w-16"
                        onChange={(e) => handleInputChange('pm10', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="no2">NO2 (ppb)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.no2]} 
                        min={0} 
                        max={200} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('no2', v[0])} 
                      />
                      <Input
                        id="no2"
                        type="number"
                        value={inputs.no2}
                        className="w-16"
                        onChange={(e) => handleInputChange('no2', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="co">CO (ppm)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.co]} 
                        min={0} 
                        max={50} 
                        step={0.1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('co', v[0])} 
                      />
                      <Input
                        id="co"
                        type="number"
                        value={inputs.co}
                        className="w-16" 
                        onChange={(e) => handleInputChange('co', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="secondary" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="so2">SO2 (ppb)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.so2]} 
                        min={0} 
                        max={100} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('so2', v[0])} 
                      />
                      <Input
                        id="so2"
                        type="number"
                        value={inputs.so2}
                        className="w-16"
                        onChange={(e) => handleInputChange('so2', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="o3">O3 (ppb)</Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.o3]} 
                        min={0} 
                        max={150} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('o3', v[0])} 
                      />
                      <Input
                        id="o3"
                        type="number"
                        value={inputs.o3}
                        className="w-16"
                        onChange={(e) => handleInputChange('o3', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="temperature" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" /> Temperature (°C)
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.temperature]} 
                        min={-20} 
                        max={50} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('temperature', v[0])} 
                      />
                      <Input
                        id="temperature"
                        type="number"
                        value={inputs.temperature}
                        className="w-16"
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="humidity" className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" /> Humidity (%)
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.humidity]} 
                        min={0} 
                        max={100} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('humidity', v[0])} 
                      />
                      <Input
                        id="humidity"
                        type="number"
                        value={inputs.humidity}
                        className="w-16"
                        onChange={(e) => handleInputChange('humidity', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="windSpeed" className="flex items-center gap-2">
                      <Wind className="h-4 w-4" /> Wind Speed (m/s)
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.windSpeed]} 
                        min={0} 
                        max={30} 
                        step={0.1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('windSpeed', v[0])} 
                      />
                      <Input
                        id="windSpeed"
                        type="number"
                        value={inputs.windSpeed}
                        className="w-16"
                        onChange={(e) => handleInputChange('windSpeed', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="windDirection" className="flex items-center gap-2">
                      <Compass className="h-4 w-4" /> Wind Direction (°)
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Slider 
                        value={[inputs.windDirection]} 
                        min={0} 
                        max={359} 
                        step={1}
                        className="flex-1"
                        onValueChange={(v) => handleInputChange('windDirection', v[0])} 
                      />
                      <Input
                        id="windDirection"
                        type="number"
                        value={inputs.windDirection}
                        className="w-16"
                        onChange={(e) => handleInputChange('windDirection', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button onClick={handleAnalyze} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Air Quality'}
            </Button>
            
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>AQI: <span className={getAQIColorClass(result.aqi.value)}>{result.aqi.value}</span></span>
                    <span className="text-xl">{result.recommendation.emoji}</span>
                  </CardTitle>
                  <CardDescription>
                    {result.aqi.label}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Health Recommendation</AlertTitle>
                    <AlertDescription>
                      {result.recommendation.text}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-sm space-y-1">
                    <p className="text-green-600">{result.ranges.good}</p>
                    <p className="text-yellow-600">{result.ranges.moderate}</p>
                    <p className="text-orange-600">{result.ranges.unhealthySensitive}</p>
                    <p className="text-red-600">{result.ranges.unhealthy}</p>
                    <p className="text-purple-600">{result.ranges.veryUnhealthy}</p>
                    <p className="text-rose-800">{result.ranges.hazardous}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Air Quality Visualization</CardTitle>
                <CardDescription>
                  Heatmap showing PM2.5 distribution across the area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={plotRef} className="w-full h-[500px]" />
                {!result && (
                  <div className="flex items-center justify-center h-[500px] border border-dashed rounded-md">
                    <p className="text-muted-foreground">Enter parameters and click "Analyze Air Quality" to see the visualization</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Data shown is a heatmap of PM2.5 concentration with spatial variation
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}