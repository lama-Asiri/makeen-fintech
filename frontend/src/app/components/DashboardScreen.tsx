import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/app/context/AuthContext';
import { AppRail, RAIL_WIDTH } from '@/app/components/AppRail';
import { useAccountMenu, AccountMenuOverlays } from '@/app/components/AccountMenu';
import {
  viewHistoryAPI,
  getDashboardOverviewAPI,
  type BackendChat,
  type DashboardOverviewTrained,
} from '@/lib/chatApi';
import { getToken } from '@/lib/supabase';

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

type LoadStage = 'loading' | 'no_chats' | 'no_data' | 'no_target' | 'trained' | 'error';

function prettifyFeature(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function EmptyState({ message, onNavigateChat }: { message: string; onNavigateChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-[64px] gap-[16px]">
      <p className="font-sans text-[0.9375rem] text-[#9e9e9e] text-center max-w-[400px]">{message}</p>
      <button
        onClick={onNavigateChat}
        className="font-sans text-[0.875rem] text-[#7760bd] border border-[#7760bd]/40 rounded-[8px] px-[20px] py-[10px] hover:bg-[#7760bd]/10 transition-colors"
      >
        Go to Chat →
      </button>
    </div>
  );
}

export function DashboardScreen({ onLogout, onNavigateChat }: DashboardScreenProps) {
  const { user, session } = useAuth();
  const menu = useAccountMenu(user, session);

  const [chats, setChats] = useState<BackendChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [overview, setOverview] = useState<DashboardOverviewTrained | null>(null);
  const [stage, setStage] = useState<LoadStage>('loading');
  const [stageMessage, setStageMessage] = useState('');

  // Load chat list once on mount
  useEffect(() => {
    if (!session) return;
    getToken().then((token) => viewHistoryAPI(token))
      .then((list) => {
        setChats(list);
        if (list.length > 0) {
          setSelectedChatId(list[0].CHAT_ID);
        } else {
          setStage('no_chats');
          setStageMessage('No chats yet. Head to Chat, upload a file and ask a question — your results will appear here.');
        }
      })
      .catch(() => {
        setStage('error');
        setStageMessage('Could not load your chats. Please refresh and try again.');
      });
  }, [session?.access_token]);

  // Fetch dashboard overview whenever the selected chat changes
  useEffect(() => {
    if (!selectedChatId || !session) return;
    setStage('loading');
    setOverview(null);
    getToken().then((token) => getDashboardOverviewAPI(selectedChatId, token))
      .then((data) => {
        if (data.stage === 'trained') {
          setOverview(data);
          setStage('trained');
        } else {
          setOverview(null);
          setStage(data.stage);
          setStageMessage(data.message);
        }
      })
      .catch(() => {
        setStage('error');
        setStageMessage('Failed to load dashboard data. Please try again.');
      });
  }, [selectedChatId, session?.access_token]);

  const displayName = menu.displayName;
  const isClassification = overview?.task_type === 'classification';

  // Derive chart inputs from real overview
  const totalRecords = overview?.records_processed ?? 0;

  const breakdown = isClassification && overview?.outcome_split
    ? overview.outcome_split.map((s) => ({ label: s.label, count: s.count, percentage: s.rate }))
    : [];

  const avgConfidence =
    isClassification && overview?.avg_confidence != null ? overview.avg_confidence : null;

  const topDrivers = (overview?.top_drivers ?? []).map((d) => ({
    feature: d.feature,
    label: prettifyFeature(d.feature),
    importance: d.importance,
  }));

  const visibleResults = (overview?.recent_results ?? []).slice(0, 20);

  const predStats = !isClassification ? overview?.prediction_stats : null;

  // ── Stat tiles differ by task type ────────────────────────────────────────
  const statTiles = isClassification
    ? [
        { label: 'Records Processed', value: totalRecords.toLocaleString() },
        ...breakdown.slice(0, 2).map((b) => ({ label: `${b.label} rate`, value: `${b.percentage}%` })),
        { label: 'Avg. Confidence', value: avgConfidence != null ? `${avgConfidence}%` : '—' },
      ]
    : [
        { label: 'Records Processed', value: totalRecords.toLocaleString() },
        { label: 'Avg. Prediction', value: predStats?.avg != null ? String(predStats.avg) : '—' },
        { label: 'Min', value: predStats?.min != null ? String(predStats.min) : '—' },
        { label: 'Max', value: predStats?.max != null ? String(predStats.max) : '—' },
      ];

  return (
    <>
      <AccountMenuOverlays menu={menu} onLogoutClick={onLogout} />

      <div className="bg-[#141414] relative w-full h-screen overflow-y-auto">
        <AppRail active="dashboard" onNavigateDashboard={() => {}} onNavigateChat={onNavigateChat} accountMenu={menu} />

        <div
          className="w-full px-[20px] sm:px-[24px] md:px-[40px] lg:px-[56px] xl:px-[72px] py-[32px] md:py-[48px]"
          style={{ marginLeft: RAIL_WIDTH }}
        >
          {/* Greeting + chat selector */}
          <motion.div
            className="mb-[28px] md:mb-[36px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex flex-wrap items-start justify-between gap-[12px]">
              <div>
                <h1 className="font-serif font-medium text-[1.625rem] md:text-[2rem] text-[#fffcfe] mb-[6px]">
                  Welcome back, {displayName}
                </h1>
                <p className="font-sans text-[0.875rem] md:text-[0.9375rem] text-[#9e9e9e]">
                  {overview
                    ? `Showing results for "${overview.target_column}" · ${overview.task_type}`
                    : "Here's how your portfolio's decisions are looking."}
                </p>
              </div>
              {chats.length > 1 && (
                <select
                  value={selectedChatId ?? ''}
                  onChange={(e) => setSelectedChatId(Number(e.target.value))}
                  className="font-sans text-[0.875rem] text-[#fffcfe] bg-[#1e1e1e] border border-white/[0.12] rounded-[8px] px-[12px] py-[8px] focus:outline-none focus:border-[#7760bd]/60 transition-colors cursor-pointer"
                >
                  {chats.map((c) => (
                    <option key={c.CHAT_ID} value={c.CHAT_ID}>
                      {c.Title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </motion.div>

          {/* Loading spinner */}
          {stage === 'loading' && (
            <div className="flex items-center justify-center py-[80px]">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#7760bd] rounded-full animate-spin" />
            </div>
          )}

          {/* Empty / error states */}
          {(stage === 'no_chats' || stage === 'no_data' || stage === 'no_target' || stage === 'error') && (
            <EmptyState message={stageMessage} onNavigateChat={onNavigateChat} />
          )}

          {/* Live dashboard */}
          {stage === 'trained' && overview && (
            <>
              {/* Stat tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px] md:gap-[16px] mb-[32px] md:mb-[40px]">
                {statTiles.map((t, i) => (
                  <StatTile key={t.label} label={t.label} value={t.value} delay={0.08 * i} />
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] md:gap-[24px] mb-[32px] md:mb-[40px]">
                {isClassification && breakdown.length > 0 && (
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
                            formatter={(value: number, name: string) => [
                              `${value} (${totalRecords ? ((value / totalRecords) * 100).toFixed(1) : 0}%)`,
                              name,
                            ]}
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
                )}

                {topDrivers.length > 0 && (
                  <ChartCard delay={isClassification ? 0.18 : 0.1}>
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
                )}
              </div>

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
                        <span className="font-sans text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#9e9e9e] text-right">
                          {isClassification ? 'Confidence' : 'Value'}
                        </span>
                      </div>
                      <HairlineDivider />
                      <div className="max-h-[360px] overflow-y-auto">
                        {visibleResults.map((r, i) => (
                          <div key={r.id_value ?? i}>
                            <div className="grid grid-cols-3 px-[16px] md:px-[20px] py-[12px] items-center transition-colors hover:bg-white/[0.02]">
                              <span className="font-tabular text-[0.875rem] text-[#fffcfe]">{r.id_value ?? '—'}</span>
                              <span
                                className="font-sans text-[0.8125rem] capitalize"
                                style={{ color: r.prediction === breakdown[0]?.label ? CHART_GREEN : '#e05a5a' }}
                              >
                                {r.prediction ?? '—'}
                              </span>
                              <span className="font-tabular text-[0.875rem] text-[#fffcfe] text-right">
                                {r.confidence != null ? `${r.confidence}%` : '—'}
                              </span>
                            </div>
                            {i < visibleResults.length - 1 && <HairlineDivider className="mx-[16px] md:mx-[20px]" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
