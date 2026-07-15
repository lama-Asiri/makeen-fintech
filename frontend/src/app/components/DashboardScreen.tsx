import { useMemo } from 'react';
import { motion } from 'motion/react';
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

// Same easing/duration conventions used across Subscription.tsx / HelpCenter.tsx /
// Chat.tsx for entrance animations, so the Dashboard feels consistent with the rest
// of the app rather than static.
const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

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

function StatTile({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="border border-white/[0.08] rounded-[12px] px-[20px] py-[18px] transition-all duration-300 hover:border-[rgba(255,255,255,0.16)] hover:-translate-y-[2px] hover:shadow-xl"
    >
      <p className="font-sans text-[0.8125rem] text-[#9e9e9e] mb-[8px]">{label}</p>
      <p className="font-tabular text-[1.5rem] md:text-[1.75rem] text-[#fffcfe]">{value}</p>
    </motion.div>
  );
}

function ChartCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className="border border-white/[0.08] rounded-[12px] p-[20px] md:p-[24px] transition-all duration-300 hover:border-[rgba(255,255,255,0.16)] hover:shadow-xl"
    >
      {children}
    </motion.div>
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
  const visibleResults = data.results.slice(0, 20);

  return (
    <>
      <AccountMenuOverlays menu={menu} onLogoutClick={onLogout} />

      <div className="bg-[#141414] relative w-full h-screen overflow-y-auto">
        <AppRail active="dashboard" onNavigateDashboard={() => {}} onNavigateChat={onNavigateChat} accountMenu={menu} />

        {/* No max-width cap: unlike the marketing/reading pages (Subscription, HelpCenter),
            this is a data dashboard — it should keep using available width on large
            monitors rather than plateau and center with dead space on either side. */}
        <div
          className="w-full px-[20px] sm:px-[24px] md:px-[40px] lg:px-[56px] xl:px-[72px] py-[32px] md:py-[48px]"
          style={{ marginLeft: RAIL_WIDTH }}
        >
          {/* Greeting */}
          <motion.div
            className="mb-[28px] md:mb-[36px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-serif font-medium text-[1.625rem] md:text-[2rem] text-[#fffcfe] mb-[6px]">
              Welcome back, {displayName}
            </h1>
            <p className="font-sans text-[0.875rem] md:text-[0.9375rem] text-[#9e9e9e]">
              Here's how your portfolio's credit decisions are looking.
            </p>
          </motion.div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px] md:gap-[16px] mb-[32px] md:mb-[40px]">
            <StatTile label="Records Processed" value={totalRecords.toLocaleString()} delay={0} />
            {breakdown.slice(0, 2).map((b, i) => (
              <StatTile key={b.label} label={`${b.label} rate`} value={`${b.percentage}%`} delay={0.08 * (i + 1)} />
            ))}
            <StatTile label="Avg. Confidence" value={`${avgConfidence}%`} delay={0.24} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] md:gap-[24px] mb-[32px] md:mb-[40px]">
            <ChartCard delay={0.1}>
              <Eyebrow>Prediction Breakdown</Eyebrow>
              <h2 className="font-serif font-medium text-[1.125rem] md:text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
                Outcome split
              </h2>
              <div className="w-full aspect-[5/2] min-h-[200px] max-h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="45%"
                      outerRadius="70%"
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
              </div>
              <div className="flex flex-wrap gap-[16px] mt-[8px]">
                {breakdown.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-[6px]">
                    <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: OUTCOME_COLORS[i % OUTCOME_COLORS.length] }} />
                    <span className="font-sans text-[0.8125rem] text-[#9e9e9e] capitalize">{b.label}</span>
                    <span className="font-tabular text-[0.8125rem] text-[#fffcfe]">{b.count}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard delay={0.18}>
              <Eyebrow>Factor Importance · SHAP</Eyebrow>
              <h2 className="font-serif font-medium text-[1.125rem] md:text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
                Top drivers
              </h2>
              <div className="w-full aspect-[5/2] min-h-[200px] max-h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
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
            </ChartCard>
          </div>

          {/* Note: bias/drift charts intentionally deferred until real portfolio
              data exists to compute them against — see TODO.txt Section 9. */}

          {/* Results table */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.26, ease: EASE }}
          >
            <Eyebrow>Recent Predictions</Eyebrow>
            <h2 className="font-serif font-medium text-[1.125rem] md:text-[1.25rem] text-[#fffcfe] mt-[4px] mb-[16px]">
              Applicant results
            </h2>
            <div className="border border-white/[0.08] rounded-[12px] overflow-hidden transition-colors duration-300 hover:border-[rgba(255,255,255,0.16)]">
              <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-3 px-[16px] md:px-[20px] py-[12px] bg-[#1a1a1a]">
                    <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e]">ID</span>
                    <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e]">Prediction</span>
                    <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e] text-right">Confidence</span>
                  </div>
                  <HairlineDivider />
                  <div className="max-h-[360px] overflow-y-auto">
                    {visibleResults.map((r, i) => (
                      <div key={r.id_value}>
                        <div className="grid grid-cols-3 px-[16px] md:px-[20px] py-[12px] items-center transition-colors hover:bg-white/[0.02]">
                          <span className="font-tabular text-[0.875rem] text-[#fffcfe]">{r.id_value}</span>
                          <span
                            className="font-sans text-[0.8125rem] capitalize"
                            style={{ color: r.prediction === breakdown[0]?.label ? CHART_GREEN : '#e05a5a' }}
                          >
                            {r.prediction}
                          </span>
                          <span className="font-tabular text-[0.875rem] text-[#fffcfe] text-right">{r.confidence}%</span>
                        </div>
                        {i < visibleResults.length - 1 && <HairlineDivider className="mx-[16px] md:mx-[20px]" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
