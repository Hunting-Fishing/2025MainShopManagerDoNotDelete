import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherDay {
  id?: string;
  forecast_date: string;
  temperature_high: number | null;
  temperature_low: number | null;
  precipitation_chance: number | null;
  wind_speed: number | null;
  humidity: number | null;
  conditions: string | null;
  is_suitable_for_work: boolean | null;
}

// Mock weather data for demo (would be replaced with actual API)
const generateMockWeather = (): WeatherDay[] => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Thunderstorms'];
  return Array.from({ length: 7 }, (_, i) => {
    const precipChance = Math.floor(Math.random() * 100);
    const windSpeed = Math.floor(Math.random() * 25);
    return {
      forecast_date: format(addDays(new Date(), i), 'yyyy-MM-dd'),
      temperature_high: Math.floor(Math.random() * 20) + 70,
      temperature_low: Math.floor(Math.random() * 15) + 55,
      precipitation_chance: precipChance,
      wind_speed: windSpeed,
      humidity: Math.floor(Math.random() * 40) + 40,
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      is_suitable_for_work: precipChance < 40 && windSpeed < 20,
    };
  });
};

export default function PowerWashingWeather() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');

  const { data: weatherData, isLoading, refetch } = useQuery({
    queryKey: ['power-washing-weather'],
    queryFn: async () => {
      // First try to get from database
      const { data, error } = await supabase
        .from('power_washing_weather_data')
        .select('*')
        .gte('forecast_date', format(new Date(), 'yyyy-MM-dd'))
        .order('forecast_date', { ascending: true })
        .limit(7);
      
      if (error) throw error;
      
      // If no data, return mock data for demo
      if (!data || data.length === 0) {
        return generateMockWeather();
      }
      
      return data as WeatherDay[];
    },
  });

  const { data: scheduledJobs } = useQuery({
    queryKey: ['power-washing-scheduled-jobs-weather'],
    queryFn: async () => {
      const startDate = format(new Date(), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('power_washing_jobs')
        .select('id, job_number, scheduled_date, property_address')
        .eq('status', 'scheduled')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);
      
      if (error) throw error;
      return data;
    },
  });

  const getWeatherIcon = (conditions: string | null) => {
    if (!conditions) return <Cloud className="h-8 w-8" />;
    const lower = conditions.toLowerCase();
    if (lower.includes('sun') || lower.includes('clear')) return <Sun className="h-8 w-8 text-yellow-500" />;
    if (lower.includes('rain') || lower.includes('thunder')) return <CloudRain className="h-8 w-8 text-blue-500" />;
    return <Cloud className="h-8 w-8 text-gray-400" />;
  };

  const getJobsForDate = (date: string) => {
    return scheduledJobs?.filter(job => job.scheduled_date === date) || [];
  };

  const badWeatherDays = weatherData?.filter(d => !d.is_suitable_for_work) || [];
  const affectedJobs = badWeatherDays.flatMap(d => getJobsForDate(d.forecast_date));

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/power-washing')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Cloud className="h-8 w-8 text-blue-400" />
              Weather Forecast
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan your jobs around the weather
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Weather Alert */}
      {affectedJobs.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Weather Alert</p>
                <p className="text-sm text-muted-foreground">
                  {affectedJobs.length} job(s) may be affected by weather conditions this week.
                  Consider rescheduling:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {affectedJobs.map(job => (
                    <Badge key={job.id} variant="outline" className="text-amber-500">
                      {job.job_number}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {weatherData?.map((day, index) => {
            const jobs = getJobsForDate(day.forecast_date);
            const isToday = day.forecast_date === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Card 
                key={day.forecast_date} 
                className={`border-border ${isToday ? 'ring-2 ring-primary' : ''} ${
                  !day.is_suitable_for_work ? 'bg-red-500/5 border-red-500/30' : ''
                }`}
              >
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-medium mb-1">
                    {isToday ? 'Today' : format(new Date(day.forecast_date), 'EEE')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {format(new Date(day.forecast_date), 'MMM d')}
                  </p>
                  
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.conditions)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{day.conditions}</p>
                  
                  <div className="flex justify-center items-baseline gap-1 mb-3">
                    <span className="text-lg font-bold">{day.temperature_high}°</span>
                    <span className="text-sm text-muted-foreground">/{day.temperature_low}°</span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-3 w-3" />
                      <span>{day.precipitation_chance}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span>{day.wind_speed} mph</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    {day.is_suitable_for_work ? (
                      <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Good
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500/30 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Poor
                      </Badge>
                    )}
                  </div>
                  
                  {jobs.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {jobs.length} job{jobs.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Work Suitability Legend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Work Suitability Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-500">Good Conditions</p>
                <p className="text-sm text-muted-foreground">
                  Rain chance &lt;40%, Wind &lt;20 mph
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Marginal Conditions</p>
                <p className="text-sm text-muted-foreground">
                  Rain chance 40-60%, Wind 15-25 mph
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
              <CloudRain className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-500">Poor Conditions</p>
                <p className="text-sm text-muted-foreground">
                  Rain chance &gt;60%, Wind &gt;25 mph
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
