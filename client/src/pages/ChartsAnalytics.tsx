import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'recharts';
import { mockAttackStats, mockTimelineData } from '@/lib/mockData';

const COLORS = ['#f97316', '#eab308', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function ChartsAnalytics() {
  const [attackStats] = useState(mockAttackStats);
  const [timelineData] = useState(mockTimelineData);

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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attackStats}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.type}: ${entry.percentage}%`}
                >
                  {attackStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attack Count by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attackStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>24-Hour Attack Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="ddos"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                name="DDoS"
              />
              <Area
                type="monotone"
                dataKey="portScan"
                stackId="1"
                stroke="#f97316"
                fill="#f97316"
                name="Port Scan"
              />
              <Area
                type="monotone"
                dataKey="bruteForce"
                stackId="1"
                stroke="#eab308"
                fill="#eab308"
                name="Brute Force"
              />
              <Area
                type="monotone"
                dataKey="malware"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                name="Malware"
              />
              <Area
                type="monotone"
                dataKey="other"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                name="Other"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attack Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ddos"
                stroke="#ef4444"
                name="DDoS"
              />
              <Line
                type="monotone"
                dataKey="portScan"
                stroke="#f97316"
                name="Port Scan"
              />
              <Line
                type="monotone"
                dataKey="bruteForce"
                stroke="#eab308"
                name="Brute Force"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}