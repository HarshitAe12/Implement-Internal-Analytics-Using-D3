export function mapSearchCountToMetricCard(data) {
  if (!data) return null;

  return {
    title: "Searches",
    value: data.total_count,
    delta: data.ratio_diff,
    sparklineData: data.daily_counts.map((d) => ({
      value: d.count, 
      date: d.date, 
    })),
  };
}
