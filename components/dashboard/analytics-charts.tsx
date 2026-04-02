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

type AnalyticsChartsProps = Pick<AnalyticsData, "leadStatusBreakdown" | "permitsOverTime">;

const PIE_COLORS = ["#FF5E00", "#FF9A52", "#A8A29E", "#78716C"];

const tooltipStyle = {
  backgroundColor: "#1C1917",
  border: "1px solid rgba(168, 162, 158, 0.15)",
  borderRadius: "10px",
  color: "#FAFAF9",
  fontSize: "13px",
  fontFamily: "var(--font-outfit)",
};

export function AnalyticsCharts({ leadStatusBreakdown, permitsOverTime }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Pie chart */}
      <section aria-label="Lead status breakdown" className="card p-6">
        <h2 className="font-display text-xl text-sand-bright">LEADS BY STATUS</h2>
        <p className="mt-1 text-sm text-sand">Pipeline breakdown across saved lead states.</p>

        {leadStatusBreakdown.length === 0 ? (
          <p className="py-20 text-center text-sm text-sand/40">No lead data available yet.</p>
        ) : (
          <>
            <div className="h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadStatusBreakdown} cx="50%" cy="50%" dataKey="value" innerRadius={72} outerRadius={110} paddingAngle={3} strokeWidth={0}>
                    {leadStatusBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {leadStatusBreakdown.map((entry, index) => (
                <div key={entry.name} className="inline-flex items-center gap-2 rounded border border-stroke px-3 py-1.5 text-xs text-sand">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="capitalize">{entry.name}: <span className="font-mono text-sand-bright">{entry.value}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Line chart */}
      <section aria-label="Permits over time" className="card p-6">
        <h2 className="font-display text-xl text-sand-bright">PERMITS OVER TIME</h2>
        <p className="mt-1 text-sm text-sand">Monthly permit volume, last 12 months.</p>

        {permitsOverTime.length === 0 ? (
          <p className="py-20 text-center text-sm text-sand/40">No timeline data available yet.</p>
        ) : (
          <div className="h-96 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={permitsOverTime}>
                <CartesianGrid stroke="rgba(168, 162, 158, 0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#78716C" tick={{ fontSize: 11, fontFamily: "var(--font-outfit)" }} />
                <YAxis allowDecimals={false} stroke="#78716C" tick={{ fontSize: 11, fontFamily: "var(--font-outfit)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="permits"
                  stroke="#FF5E00"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#FF5E00", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#FAFAF9", stroke: "#FF5E00", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
