// Mock stand-in for a real `local_batch` prediction response (see
// backend/routers/data_processor.py, handle_prediction()). The dashboard derives
// everything from one object with this exact shape, so wiring in a real portfolio
// endpoint later is just swapping getMockBatchPredictionResult() for a real fetch —
// the derivation helpers below don't change.

export interface BatchPredictionResult {
  summary: string;
  predicted_as: Record<string, string[]>;
  shap_aggregate: { feature: string; shap_value: number }[];
  results: { id_value: string; prediction: string; confidence: number }[];
}

const FEATURE_LABELS: Record<string, string> = {
  credit_history: 'Credit History',
  loan_amount: 'Loan Amount',
  employment_years: 'Employment Years',
  income: 'Income',
  existing_credits: 'Existing Credits',
  housing: 'Housing Status',
  job_type: 'Job Type',
};

export function getMockBatchPredictionResult(): BatchPredictionResult {
  const goodIds = ['A001','A003','A005','A006','A008','A009','A011','A012','A014','A015','A017','A018','A020','A021','A023','A024','A026','A027','A029','A030','A032','A033','A035','A036','A038','A039'];
  const badIds = ['A002','A004','A007','A010','A013','A016','A019','A022','A025','A028','A031','A034','A037','A040'];

  const results: BatchPredictionResult['results'] = [
    ...goodIds.map((id) => ({ id_value: id, prediction: 'good', confidence: Math.round(72 + Math.random() * 24) })),
    ...badIds.map((id) => ({ id_value: id, prediction: 'bad', confidence: Math.round(65 + Math.random() * 28) })),
  ].sort((a, b) => a.id_value.localeCompare(b.id_value));

  return {
    summary: `Processed ${results.length} applicants — ${goodIds.length} predicted good, ${badIds.length} predicted bad.`,
    predicted_as: { good: goodIds, bad: badIds },
    shap_aggregate: [
      { feature: 'credit_history', shap_value: 0.412 },
      { feature: 'income', shap_value: 0.298 },
      { feature: 'existing_credits', shap_value: -0.221 },
      { feature: 'loan_amount', shap_value: -0.187 },
      { feature: 'employment_years', shap_value: 0.156 },
      { feature: 'housing', shap_value: 0.094 },
      { feature: 'job_type', shap_value: -0.061 },
    ],
    results,
  };
}

export function getTotalRecords(data: BatchPredictionResult): number {
  return data.results.length;
}

export function getOutcomeBreakdown(data: BatchPredictionResult): { label: string; count: number; percentage: number }[] {
  const total = getTotalRecords(data) || 1;
  return Object.entries(data.predicted_as)
    .map(([label, ids]) => ({ label, count: ids.length, percentage: Math.round((ids.length / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}

export function getAvgConfidence(data: BatchPredictionResult): number {
  if (data.results.length === 0) return 0;
  const sum = data.results.reduce((acc, r) => acc + r.confidence, 0);
  return Math.round((sum / data.results.length) * 10) / 10;
}

export function getTopDrivers(data: BatchPredictionResult, limit = 6): { feature: string; label: string; importance: number }[] {
  return [...data.shap_aggregate]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, limit)
    .map((d) => ({ feature: d.feature, label: FEATURE_LABELS[d.feature] ?? d.feature, importance: d.shap_value }));
}
