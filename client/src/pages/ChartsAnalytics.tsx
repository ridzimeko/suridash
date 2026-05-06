import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const COLORS = ["#f97316", "#eab308", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981", "#ec4899", "#06b6d4"];

type AttackCategory = {
  type: string;
  count: number;
  percentage: number;
};

type TimelineEntry = {
  timestamp: string;
  [category: string]: string | number;
};

export default function ChartsAnalytics() {
  const [attackStats, setAttackStats] = useState<AttackCategory[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [categoryRes, timelineRes] = await Promise.all([
          api.get("analytics/attacks-by-category").json<AttackCategory[]>(),
          api.get("analytics/attacks-timeline").json<TimelineEntry[]>(),
        ]);

        setAttackStats(categoryRes ?? []);
        setTimelineData(timelineRes ?? []);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extract unique category names from timeline data + attackStats for dynamic Area rendering
  const categoryKeys = useMemo(() => {
    const keys = new Set<string>();
    // From timeline data
    for (const entry of timelineData) {
      for (const key of Object.keys(entry)) {
        if (key !== "timestamp") {
          keys.add(key);
        }
      }
    }
    // Fallback: also include categories from attackStats
    for (const stat of attackStats) {
      if (stat.type) {
        keys.add(stat.type);
      }
    }
    return Array.from(keys);
  }, [timelineData, attackStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Charts & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze attack patterns and trends
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attack Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {attackStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attackStats}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.payload.type}: ${entry.payload.percentage}%`
                    }
                  >
                    {attackStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Count by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {attackStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attackStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24-Hour Attack Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                {categoryKeys.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    name={key}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
