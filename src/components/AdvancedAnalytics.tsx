import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfWeek, endOfWeek, eachWeekOfInterval } from "date-fns";

interface CohortData {
  week: string;
  signups: number;
  weeklyRetention: number[];
}

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
  color: string;
}

interface ConversionData {
  day: string;
  views: number;
  signups: number;
  downloads: number;
  conversionRate: number;
}

export function AdvancedAnalytics() {
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [conversionTrends, setConversionTrends] = useState<ConversionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdvancedAnalytics();
  }, []);

  const loadAdvancedAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's pages
      const { data: pages } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', user.id);

      if (!pages || pages.length === 0) {
        setIsLoading(false);
        return;
      }

      const pageIds = pages.map(p => p.id);

      // Load all analytics data
      await Promise.all([
        loadCohortAnalysis(pageIds),
        loadFunnelAnalysis(pageIds),
        loadConversionTrends(pageIds),
      ]);

    } catch (error) {
      console.error('Error loading advanced analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCohortAnalysis = async (pageIds: string[]) => {
    try {
      // Get last 8 weeks
      const endDate = new Date();
      const startDate = subDays(endDate, 56); // 8 weeks

      const weeks = eachWeekOfInterval({ start: startDate, end: endDate });

      const cohorts: CohortData[] = [];

      for (const weekStart of weeks) {
        const weekEnd = endOfWeek(weekStart);

        // Get signups for this week
        const { data: signups } = await supabase
          .from('email_captures')
          .select('id, captured_at, email')
          .in('page_id', pageIds)
          .gte('captured_at', weekStart.toISOString())
          .lte('captured_at', weekEnd.toISOString());

        if (!signups || signups.length === 0) continue;

        // Calculate weekly retention (simplified - checks if users downloaded in subsequent weeks)
        const retention: number[] = [];
        const signupEmails = signups.map(s => s.email);

        for (let i = 1; i <= 4; i++) {
          const retentionWeekStart = subDays(weekEnd, -i * 7);
          const retentionWeekEnd = subDays(weekEnd, -(i - 1) * 7);

          const { data: downloads } = await supabase
            .from('analytics_events')
            .select('metadata')
            .in('page_id', pageIds)
            .eq('event_type', 'download')
            .gte('created_at', retentionWeekStart.toISOString())
            .lte('created_at', retentionWeekEnd.toISOString());

          const activeUsers = new Set(
            downloads?.map(d => (d.metadata as any)?.email).filter(Boolean) || []
          );

          const retainedCount = signupEmails.filter(email =>
            activeUsers.has(email)
          ).length;

          const retentionRate = signups.length > 0
            ? (retainedCount / signups.length) * 100
            : 0;

          retention.push(Math.round(retentionRate));
        }

        cohorts.push({
          week: format(weekStart, 'MMM d'),
          signups: signups.length,
          weeklyRetention: retention,
        });
      }

      setCohortData(cohorts.reverse());
    } catch (error) {
      console.error('Error loading cohort analysis:', error);
    }
  };

  const loadFunnelAnalysis = async (pageIds: string[]) => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Get all events from last 30 days
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('page_id', pageIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const viewCount = events?.filter(e => e.event_type === 'view').length || 0;
      const signupCount = events?.filter(e => e.event_type === 'signup').length || 0;
      const downloadCount = events?.filter(e => e.event_type === 'download').length || 0;

      const funnel: FunnelStep[] = [
        {
          step: 'Page Views',
          count: viewCount,
          percentage: 100,
          color: '#06b6d4',
        },
        {
          step: 'Email Signups',
          count: signupCount,
          percentage: viewCount > 0 ? (signupCount / viewCount) * 100 : 0,
          color: '#10b981',
        },
        {
          step: 'Downloads',
          count: downloadCount,
          percentage: signupCount > 0 ? (downloadCount / signupCount) * 100 : 0,
          color: '#8b5cf6',
        },
      ];

      setFunnelData(funnel);
    } catch (error) {
      console.error('Error loading funnel analysis:', error);
    }
  };

  const loadConversionTrends = async (pageIds: string[]) => {
    try {
      const trends: ConversionData[] = [];

      for (let i = 13; i >= 0; i--) {
        const day = subDays(new Date(), i);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));

        const { data: events } = await supabase
          .from('analytics_events')
          .select('event_type')
          .in('page_id', pageIds)
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());

        const views = events?.filter(e => e.event_type === 'view').length || 0;
        const signups = events?.filter(e => e.event_type === 'signup').length || 0;
        const downloads = events?.filter(e => e.event_type === 'download').length || 0;
        const conversionRate = views > 0 ? (signups / views) * 100 : 0;

        trends.push({
          day: format(dayStart, 'MMM d'),
          views,
          signups,
          downloads,
          conversionRate: Math.round(conversionRate * 10) / 10,
        });
      }

      setConversionTrends(trends);
    } catch (error) {
      console.error('Error loading conversion trends:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="funnel" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="funnel">
          <Target className="w-4 h-4 mr-2" />
          Conversion Funnel
        </TabsTrigger>
        <TabsTrigger value="trends">
          <TrendingUp className="w-4 h-4 mr-2" />
          Trends
        </TabsTrigger>
        <TabsTrigger value="cohorts">
          <Users className="w-4 h-4 mr-2" />
          Cohorts
        </TabsTrigger>
      </TabsList>

      {/* Conversion Funnel */}
      <TabsContent value="funnel" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel (Last 30 Days)</CardTitle>
            <CardDescription>
              See where users drop off in your conversion flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((step, index) => (
                <div key={step.step} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: step.color }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{step.step}</p>
                        <p className="text-sm text-slate-600">
                          {step.count.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${step.color}20`,
                        color: step.color,
                      }}
                    >
                      {Math.round(step.percentage)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${step.percentage}%`,
                        backgroundColor: step.color,
                      }}
                    />
                  </div>
                  {index < funnelData.length - 1 && (
                    <div className="pl-12 text-xs text-slate-500">
                      Drop-off: {Math.round(100 - funnelData[index + 1].percentage)}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Funnel Chart */}
            <div className="mt-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Conversion Trends */}
      <TabsContent value="trends" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Trends (Last 14 Days)</CardTitle>
            <CardDescription>
              Track how your conversion rate changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={conversionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  stroke="#06b6d4"
                  name="Views"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="signups"
                  stroke="#10b981"
                  name="Signups"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#8b5cf6"
                  name="Conversion %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Cohort Analysis */}
      <TabsContent value="cohorts" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cohort Retention Analysis</CardTitle>
            <CardDescription>
              See how well you retain users over time (by signup week)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Week</th>
                    <th className="text-right py-2 px-3">Signups</th>
                    <th className="text-center py-2 px-3">Week 1</th>
                    <th className="text-center py-2 px-3">Week 2</th>
                    <th className="text-center py-2 px-3">Week 3</th>
                    <th className="text-center py-2 px-3">Week 4</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.map((cohort) => (
                    <tr key={cohort.week} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium">{cohort.week}</td>
                      <td className="text-right py-2 px-3">{cohort.signups}</td>
                      {cohort.weeklyRetention.map((retention, index) => (
                        <td key={index} className="text-center py-2 px-3">
                          <span
                            className="inline-block px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor:
                                retention > 50
                                  ? '#d1fae5'
                                  : retention > 25
                                  ? '#fef3c7'
                                  : '#fee2e2',
                              color:
                                retention > 50
                                  ? '#065f46'
                                  : retention > 25
                                  ? '#78350f'
                                  : '#991b1b',
                            }}
                          >
                            {retention}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {cohortData.length === 0 && (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-600">
                    Not enough data yet. Cohort analysis needs at least 2 weeks of activity.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
