import { useEffect, useState } from "react";
import {
  mockMetrics,
  mockDailyLogins,
  mockMonthlySearches,
  mockFailedSearches,
  mockCityAnalytics,
  nodes,
  links,
} from "../data/mockData";
import DateRangeFilter from "../components/dashboard/DateRangeFilter";
import MetricCard from "../components/dashboard/MetricCard";
import getLastMonthDateRange, { fetchAllProfilesViewCount, fetchCityAnalitics, fetchConnections, fetchMostSearchUsers, fetchMostViewedProfiles, fetchProfessionAnalytics, fetchSearchCount } from "../utils/api";
import { showToast } from "@/utils/showToast";
import MostViewedProfile from "@/components/dashboard/MostViewedProfile";
import MostSearchUser from "@/components/dashboard/MostSearchUser";
import ProfessionAnalyticChart from "@/components/dashboard/ProfessionAnalyticChart";
import Spinner from "@/utils/Spinner";
import D3NetworkGraph from "@/components/dashboard/UserConnectionGraph";
import CityAnalytics from "@/components/dashboard/CityAnalytics";
import { mapSearchCountToMetricCard } from "@/utils/formatters";

const Index = () => {
  const cityBarData = mockCityAnalytics.most_viewed_cities.map((c) => ({
    label: c.viewed_profile_city_code,
    value: c.count,
  }));


  const defaultRange = (() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  })();

  const [dateRange, setDateRange] = useState(defaultRange);


  // CHARTS & GHARPS
  const [mostViewedProfile, setMostViewedProfile] = useState([]);
  const [mostViewedLoading, setMostViewedLoading] = useState(false);

  const [mostsearchUser, setMostSearchUser] = useState([]);
  const [mostSearchLoading, setMostSearchLoading] = useState(false);

  const [profession, setProfession] = useState([]);
  const [professionLoading, setProfessionLoading] = useState(false);

  const [analytics, setAnalitics] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [connections, setConnections] = useState([])
  const [connectionLoading, setConnectionLoading] = useState(false)

  // HEADER CARDS 

  const [totalProfileViews, setTotalProfileViews] = useState(0);
  const [totalViewsLoading, setTotalViewsLoading] = useState(false)

  const [searchMetric, setSearchMetric] = useState(null);
  const [totalSearchLoading, setTotalSearchLoading] = useState(false)


  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    viewedProfile({
      start_date: dateRange.start,
      end_date: dateRange.end,
    });

    searchedUser({
      start_date: dateRange.start,
      end_date: dateRange.end,
    });

    professionFun({
      start_date: dateRange.start,
      end_date: dateRange.end,
    });

    totalProfileViewCount({
      start_date: dateRange.start,
      end_date: dateRange.end,
    });

    cityAnalytics({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })

    searchCount({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })

    setConnection({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })
  }, [dateRange]);



  const totalProfileViewCount = async (start_date, end_date ) => {
    try {
      const data = await fetchAllProfilesViewCount(
        start_date,
        end_date,
      );


      setTotalProfileViews(data);

      console.log("Total Profile Views (Last 30 days):", data);
    } catch (err) {
      console.log("Total Profile Views Error ->", err?.message);
      showToast.error("Error while fetching profile views", err?.message);
    }
  };


  const viewedProfile = async (start_date, end_date) => {
    setMostViewedLoading(true);
    try {
      let viewedProfile = await fetchMostViewedProfiles(start_date, end_date);
      setMostViewedProfile(viewedProfile);
      console.log("viewed data", viewedProfile);
    }
    catch (err) {
      console.log("Most Viewed Profile Error->", err?.message)
      showToast.error("Error while fetching the API", err?.message)
    }
    finally {
      setMostViewedLoading(false);
    }
  }
  const searchedUser = async (start_date, end_date) => {
    setMostSearchLoading(true);
    try {
      let user = await fetchMostSearchUsers(start_date, end_date)
      setMostSearchUser(user);
      console.log("Most searched user", user);
    }
    catch (err) {
      console.log("Most Viewed Profile Error->", err?.message)
      showToast.error("Error while fetching the API", err?.message)
    }
    finally {
      setMostSearchLoading(false);
    }
  }

  const professionFun = async (start_date, end_date) => {
    setProfessionLoading(true);
    try {
      let views = await fetchProfessionAnalytics(start_date, end_date);
      setProfession(views);
      console.log("Profession & Views", views);
    }
    catch (err) {
      console.log("Profession & Views Error->", err)
      showToast.error("Error while fetching the API", err?.message)
    }
    finally {
      setProfessionLoading(false);
    }
  }

  const cityAnalytics = async (start_date, end_date) => {
    setAnalyticsLoading(true);
    try {
      let views = await fetchCityAnalitics(start_date, end_date);
      setAnalitics(views);
      console.log("Profession & Views", views);
    }
    catch (err) {
      console.log("Profession & Views Error->", err)
      showToast.error("Error while fetching the API", err?.message)
    }
    finally {
      setAnalyticsLoading(false);
    }
  }

  const setConnection = async (start_date, end_date) => {
    setConnectionLoading(true);
    try {
      let views = await fetchConnections(start_date, end_date);
      setConnections(views);
      console.log("Connections--", views);
    }
    catch (err) {
      console.log("Connections Error->", err)
      showToast.error("Error while fetching the API", err?.message)
    }
    finally {
      setConnectionLoading(false);
    }
  }
  //total count for card 

  const searchCount = async (start_date, end_date) => {
    try {
      const data = await fetchSearchCount( start_date, end_date);
      const mapped = mapSearchCountToMetricCard(data);
      setSearchMetric(mapped);

      console.log("Search metric mapped:", mapped);
    } catch (err) {
      console.log("Search Count Error ->", err?.message);
      showToast.error("Error while fetching search count", err?.message);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-360 mx-auto px-6 max-w-[1440px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            {/* Left Branding */}
            <div className="flex flex-col md:flex-row lg:flex-row items-center gap-4 min-w-0">
              <div className="w-44 h-20 shrink-0 flex items-center justify-center">
                <img
                  src="https://proinsight.com/wp-content/uploads/2024/07/ProInsight-Logo-1-1-768x219.png"
                  alt="ProInsight"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="leading-tight min-w-0">
                <h1 className="mb-1 text-sm text-center md:text-left  font-semibold tracking-tight text-foreground truncate">
                  ProInsight Analytics
                </h1>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-muted-foreground">
                    Internal
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono text-primary">
                    Dev Data Lake
                  </span>
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mb-2 md:mb-0">
              <div className="rounded-lg border border-border bg-card/70 px-2 py-1 w-full sm:w-auto shadow-sm">
                <DateRangeFilter
                  onRangeChange={(start, end) => setDateRange({ start, end })}
                />
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-8 ">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Views"
            value={mockMetrics.monthlyLogins}
            delta={mockMetrics.monthlyLoginsDelta}
            sparklineData={mockDailyLogins}
          />

          {searchMetric && (
            <MetricCard
              title={searchMetric.title}
              value={searchMetric.value}
              delta={searchMetric.delta}
              sparklineData={searchMetric.sparklineData}
            />
          )}

          <MetricCard
            title="Monthly Logins"
            value={mockMetrics.monthlyLogins}
            delta={mockMetrics.monthlyLoginsDelta}
            sparklineData={mockDailyLogins}
            sparklineColor="#f59e0b" // amber
          />

          <MetricCard
            title="Searches"
            value={mockMetrics.searchesPerformed}
            delta={mockMetrics.searchesDelta}
            sparklineData={mockMonthlySearches}
            sparklineColor="#3b82f6" // blue
          />

          <MetricCard
            title="Failed Searches"
            value={mockMetrics.failedSearches}
            delta={mockMetrics.failedSearchesDelta}
            sparklineData={mockFailedSearches}
            sparklineColor="#ef4444" // red
          />

          <MetricCard
            title="Engagement"
            value={mockMetrics.communityEngagement}
            delta={mockMetrics.engagementDelta}
            suffix="%"
            sparklineData={mockDailyLogins}
            sparklineColor="#8b5cf6" // violet
          />
        </div>

        {/* Most Viewed */}

        {mostViewedLoading ? (
          <Spinner />
        ) : (
          <MostViewedProfile
            data={mostViewedProfile}
            title="Most Viewed 10 Profiles"
            yLabel="Views"
          />
        )}


        {/* Network Graph */}
        <D3NetworkGraph nodes={connections?.nodes} links={connections?.links} height={600} />


        {/* Analytics Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-x-auto w-full rounded-xl border border-slate-200 p-7">
          {analyticsLoading ? (
            <Spinner />
          ) : (
            <div className="w-full">
              <CityAnalytics
                data={analytics}
                title="City Analytics — Profile Views by City"
                color="#8b5cf6"
                height={340}
                yLabel="Views"
              />
            </div>
          )}

          {mostSearchLoading ? (
            <Spinner />
          ) : (
            <div className="w-full">
              <MostSearchUser
                data={mostsearchUser}
                title="Top Search Queries"
                color="#f59e0b"
                height={"100%"}
                yLabel="Searches"
              />
            </div>
          )}
        </div>


        {/* Profession Analytics */}
        {professionLoading ? (
          <Spinner />
        ) : (
          <ProfessionAnalyticChart
            data={profession}
            title="Profession Analytics — Searched vs Viewed"
            height={520}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-4 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500">
            <span>ProInsight Analytics · Internal Use Only</span>
            <span>
              Data range: {dateRange.start || "Last 30 days"}
              {dateRange.end ? ` → ${dateRange.end}` : ""}
            </span>
          </div>
        </footer>
      </main>

    </div>
  );
};

export default Index;
