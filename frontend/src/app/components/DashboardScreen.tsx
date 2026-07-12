import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/app/context/AuthContext';
import { AppRail, RAIL_WIDTH } from '@/app/components/AppRail';
import { useAccountMenu, AccountMenuOverlays } from '@/app/components/AccountMenu';
import {
  getMockBatchPredictionResult,
  getTotalRecords,
  getOutcomeBreakdown,
  getAvgConfidence,
  getTopDrivers,
} from '@/data/mockDashboardData';

interface DashboardScreenProps {
  onLogout: () => void;
  onNavigateChat: () => void;
}

// Chart colors pulled from the real design tokens in styles/theme.css (--chart-1..5,
// --success, --destructive) rather than invented — recharts needs literal paint
// values since it draws to SVG, not Tailwind classes.
const CHART_PURPLE = '#7760bd';
const CHART_GREEN = '#08B839';
const CHART_AMBER = '#FFC107';
const CHART_GRAY = '#9e9e9e';
const OUTCOME_COLORS = [CHART_GREEN, '#e05a5a', CHART_AMBER, CHART_GRAY];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#7760bd] text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">
      {children}
    </p>
  );
}

function HairlineDivider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-white/[0.08] ${className}`} />;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[160px] border border-white/[0.08] rounded-[12px] px-[20px] py-[18px]">
      <p className="font-sans text-[0.8125rem] text-[#9e9e9e] mb-[8px]">{label}</p>
      <p className="font-tabular text-[1.75rem] text-[#fffcfe]">{value}</p>
    </div>
  );
}

export function DashboardScreen({ onLogout, onNavigateChat }: DashboardScreenProps) {
  const { user, session } = useAuth();
  const menu = useAccountMenu(user, session);

  // Mock now, real data later: this stands in for a real portfolio-monitoring
  // endpoint, generated once per mount (not on every render) since it includes
  // randomized confidence values. Swapping in a real fetch later is a one-function
  // change — the derivation helpers below don't need to change.
  const data = useMemo(() => getMockBatchPredictionResult(), []);
  const totalRecords = getTotalRecords(data);
  const breakdown = getOutcomeBreakdown(data);
  const avgConfidence = getAvgConfidence(data);
  const topDrivers = getTopDrivers(data);

  const displayName = menu.displayName;

  return (
    <>
      <AccountMenuOverlays menu={menu} onLogoutClick={onLogout} />

      <div className="bg-[#141414] relative w-full h-screen overflow-y-auto">
        <AppRail active="dashboard" onNavigateDashboard={() => {}} onNavigateChat={onNavigateChat} accountMenu={menu} />

        <div className="max-w-[1100px] mx-auto px-[32px] py-[40px]" style={{ marginLeft: RAIL_WIDTH }}>
          {/* Greeting */}
          <div className="mb-[36px]">
            <h1 className="font-serif font-medium text-[2rem] text-[#fffcfe] mb-[6px]">
              Welcome back, {displayName}
            </h1>
            <p className="font-sans text-[0.9375rem] text-[#9e9e9e]">
              Here's how your portfolio's credit decisions are looking.
            </p>
          </div>

          {/* Stat tiles */}
          <div className="flex flex-wrap gap-[16px] mb-[40px]">
            <StatTile label="Records Processed" value={totalRecords.toLocaleString()} />
            {breakdown.slice(0, 2).map((b) => (
              <StatTile key={b.label} label={`${b.label} rate`} value={`${b.percentage}%`} />
            ))}
            <StatTile label="Avg. Confidence" value={`${avgConfidence}%`} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] mb-[40px]">
            <div className="border border-white/[0.08] rounded-[12px] p-[24px]">
              <Eyebrow>Prediction Breakdown</Eyebrow>
              <h2 className="font-serif font-medium text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
                Outcome split
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {breakdown.map((entry, i) => (
                      <Cell key={entry.label} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: '#2c2c2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fffcfe' }}
                    formatter={(value: number, name: string) => [`${value} (${((value / totalRecords) * 100).toFixed(1)}%)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-[16px] mt-[8px]">
                {breakdown.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-[6px]">
                    <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }} />
                    <span className="font-sans text-[0.8125rem] text-[#9e9e9e] capitalize">{b.label}</span>
                    <span className="font-tabular text-[0.8125rem] text-[#fffcfe]">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/[0.08] rounded-[12px] p-[24px]">
              <Eyebrow>Factor Importance · SHAP</Eyebrow>
              <h2 className="font-serif font-medium text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
                Top drivers
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topDrivers} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fill: '#9e9e9e', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{ background: '#2c2c2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fffcfe' }}
                    formatter={(value: number) => value.toFixed(3)}
                  />
                  <Bar dataKey="importance" radius={4}>
                    {topDrivers.map((d) => (
                      <Cell key={d.feature} fill={d.importance >= 0 ? CHART_PURPLE : CHART_GRAY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Note: bias/drift charts intentionally deferred until real portfolio
              data exists to compute them against — see TODO.txt Section 9. */}

          {/* Results table */}
          <div>
            <Eyebrow>Recent Predictions</Eyebrow>
            <h2 className="font-serif font-medium text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
              Applicant results
            </h2>
            <div className="border border-white/[0.08] rounded-[12px] overflow-hidden">
              <div className="grid grid-cols-3 px-[20px] py-[12px] bg-[#1a1a1a]">
                <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e]">ID</span>
                <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e]">Prediction</span>
                <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e] text-right">Confidence</span>
              </div>
              <HairlineDivider />
              <div className="max-h-[360px] overflow-y-auto">
                {data.results.slice(0, 20).map((r, i) => (
                  <div key={r.id_value}>
                    <div className="grid grid-cols-3 px-[20px] py-[12px] items-center">
                      <span className="font-tabular text-[0.875rem] text-[#fffcfe]">{r.id_value}</span>
                      <span
                        className="font-sans text-[0.8125rem] capitalize"
                        style={{ color: r.prediction === breakdown[0]?.label ? CHART_GREEN : '#e05a5a' }}
                      >
                        {r.prediction}
                      </span>
                      <span className="font-tabular text-[0.875rem] text-[#fffcfe] text-right">{r.confidence}%</span>
                    </div>
                    {i < data.results.slice(0, 20).length - 1 && <HairlineDivider className="mx-[20px]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
