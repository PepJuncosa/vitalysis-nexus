import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Heart, Moon, TrendingUp, Calendar } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface WearableAnalyticsProps {
  timeRange?: number; // days
}

export default function WearableAnalyticsDashboard({ timeRange = 7 }: WearableAnalyticsProps) {
  const { user } = useAuth();
  const [stepsData, setStepsData] = useState<ChartDataPoint[]>([]);
  const [heartRateData, setHeartRateData] = useState<ChartDataPoint[]>([]);
  const [sleepData, setSleepData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('data_type, value, recorded_at')
        .eq('user_id', user?.id)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // Group data by type and date
      const stepsMap = new Map<string, number>();
      const heartRateMap = new Map<string, number[]>();
      const sleepMap = new Map<string, number>();

      data?.forEach((item) => {
        const date = new Date(item.recorded_at).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric',
        });

        if (item.data_type === 'steps') {
          stepsMap.set(date, (stepsMap.get(date) || 0) + Number(item.value));
        } else if (item.data_type === 'heart_rate') {
          if (!heartRateMap.has(date)) {
            heartRateMap.set(date, []);
          }
          heartRateMap.get(date)?.push(Number(item.value));
        } else if (item.data_type === 'sleep') {
          sleepMap.set(date, (sleepMap.get(date) || 0) + Number(item.value));
        }
      });

      // Convert to chart data
      setStepsData(
        Array.from(stepsMap.entries()).map(([date, value]) => ({
          date,
          value: Math.round(value),
        }))
      );

      setHeartRateData(
        Array.from(heartRateMap.entries()).map(([date, values]) => ({
          date,
          value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        }))
      );

      setSleepData(
        Array.from(sleepMap.entries()).map(([date, value]) => ({
          date,
          value: Number(value.toFixed(1)),
        }))
      );
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    steps: {
      label: 'Pasos',
      color: 'hsl(var(--chart-1))',
    },
    heartRate: {
      label: 'Frecuencia Cardíaca',
      color: 'hsl(var(--chart-5))',
    },
    sleep: {
      label: 'Sueño',
      color: 'hsl(var(--chart-4))',
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Analíticas</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Dashboard de Analíticas
          </h2>
          <p className="text-muted-foreground mt-1">
            Tendencias de tus datos de wearables en los últimos {timeRange} días
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{timeRange} días</span>
        </div>
      </div>

      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Pasos
          </TabsTrigger>
          <TabsTrigger value="heartrate" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Frecuencia Cardíaca
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sueño
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Pasos Diarios</CardTitle>
              <CardDescription>
                Promedio: {stepsData.length > 0
                  ? Math.round(stepsData.reduce((acc, d) => acc + d.value, 0) / stepsData.length).toLocaleString()
                  : 0} pasos/día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={stepsData}>
                  <defs>
                    <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#stepsGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heartrate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frecuencia Cardíaca Promedio</CardTitle>
              <CardDescription>
                Promedio: {heartRateData.length > 0
                  ? Math.round(heartRateData.reduce((acc, d) => acc + d.value, 0) / heartRateData.length)
                  : 0} bpm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    domain={[40, 120]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-5))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Horas de Sueño</CardTitle>
              <CardDescription>
                Promedio: {sleepData.length > 0
                  ? (sleepData.reduce((acc, d) => acc + d.value, 0) / sleepData.length).toFixed(1)
                  : 0} horas/noche
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    domain={[0, 12]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--chart-4))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
