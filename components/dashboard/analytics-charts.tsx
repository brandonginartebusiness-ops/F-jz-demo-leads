"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AnalyticsData } from "@/lib/analytics/queries";

type AnalyticsChartsProps = Pick<
  AnalyticsData,
  "leadStatusBreakdown" | "permitsOverTime"
>;

const PIE_COLORS = ["#FF6B00", "#FF9A52", "#888888", "#B3B3B3"];

export function AnalyticsCharts({
  leadStatusBreakdown,
  permitsOverTime,
}: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Leads By Status</h2>
          <p className="mt-1 text-sm text-[#888888]">
            Current pipeline breakdown across saved lead states.
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leadStatusBreakdown}
                cx="50%"
                cy="50%"
                dataKey="value"
                innerRadius={68}
                outerRadius={102}
                paddingAngle={4}
              >
                {leadStatusBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,107,0,0.25)",
                  borderRadius: "16px",
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {leadStatusBreakdown.map((entry, index) => (
            <div
              key={entry.name}
              className="inline-flex items-center gap-2 rounded-full border border-[#FF6B00]/25 px-3 py-1 text-sm text-[#C0C0C0]"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="capitalize">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Permits Over Time</h2>
          <p className="mt-1 text-sm text-[#888888]">
            Permit volume grouped by month across the last 12 months.
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={permitsOverTime}>
              <CartesianGrid stroke="rgba(255,107,0,0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#888888" />
              <YAxis allowDecimals={false} stroke="#888888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,107,0,0.25)",
                  borderRadius: "16px",
                  color: "#ffffff",
                }}
              />
              <Line
                type="monotone"
                dataKey="permits"
                stroke="#FF6B00"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FF6B00" }}
                activeDot={{ r: 6, fill: "#888888" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
