export function mapSearchCountToMetricCard(data) {
  if (!data) return null;

  return {
    title: "Searches",
    value: data?.total_count,
    delta: data?.ratio_diff,
    sparklineData: data?.daily_counts?.map((d) => ({
      value: d?.count, 
      date: d?.date, 
    })),
  };
}

export function mapTotalVieCountToMetricCard(data) {
  if (!data) return null;

  return {
    title: "Total Views",
    value: data?.total_count,
    delta: data?.ratio_diff,
    sparklineData: data?.daily_counts?.map((d) => ({
      value: d?.count, 
      date: d?.date, 
    })),
  };
}

export function mapTopCityToMetricCard(data) {
  if (!data) return null;

  return {
    title: data?.top_city,
    value: data?.current_total_views,
    delta: data?.ratio_diff,
    sparklineData: data?.current_daily_counts?.map((d) => ({
      value: d?.count, 
      date: d?.date, 
    })),
  };
}


export function mapTopProfToMetricCard(data) {
  if (!data) return null;

  return {
    title: data?.top_profession,
    value: data?.current_total_views,
    delta: data?.ratio_diff,
    sparklineData: data?.current_daily_counts?.map((d) => ({
      value: d?.count, 
      date: d?.date, 
    })),
  };
}


export function mapEngToMetricCard(data) {
  if (!data) return null;

  return {
    title: "Engagement",
    value: data?.current_total_engagements,
    delta: data?.ratio_diff,
    sparklineData: data?.daily_counts?.map((d) => ({
      value: d?.count, 
      date: d?.date, 
    })),
  };
}