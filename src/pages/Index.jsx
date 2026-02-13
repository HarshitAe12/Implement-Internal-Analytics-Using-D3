import { useEffect, useState } from "react";
import {
  mockMetrics,
  mockDailyLogins,
  mockMonthlySearches,
  mockFailedSearches
} from "../data/mockData";
import DateRangeFilter from "../components/dashboard/DateRangeFilter";
import MetricCard from "../components/dashboard/MetricCard";
import { fetchAllProfilesViewCount, fetchCityAnalitics, fetchConnections, fetchEngagement, fetchMostSearchUsers, fetchMostViewedProfiles, fetchProfessionAnalytics, fetchSearchCount, fetchTopCity, fetchTopProfession, fetchTotalViews } from "../utils/api";
import { showToast } from "@/utils/showToast";
import MostViewedProfile from "@/components/dashboard/MostViewedProfile";
import MostSearchUser from "@/components/dashboard/MostSearchUser";
import ProfessionAnalyticChart from "@/components/dashboard/ProfessionAnalyticChart";
import Spinner from "@/utils/Spinner";
import D3NetworkGraph from "@/components/dashboard/UserConnectionGraph";
import CityAnalytics from "@/components/dashboard/CityAnalytics";
import { mapEngToMetricCard, mapSearchCountToMetricCard, mapTopCityToMetricCard, mapTopProfToMetricCard, mapTotalVieCountToMetricCard } from "@/utils/formatters";

const Index = () => {

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

  const [totalViews, setTotalViews] = useState(null);
  const [searchMetric, setSearchMetric] = useState(null);
  const [topCity, setTopCity] = useState(null);
  const [topProf, setTopProf] = useState(null);
  const [eng, setEng] = useState(null);


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

    totalViewCount({
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

    topCityfun({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })

    topProffun({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })

    engFun({
      start_date: dateRange.start,
      end_date: dateRange.end,
    })
  }, [dateRange]);

  const isEmpty = (data) => {
    return (
      data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0)
    );
  };
  const displayValue = (val) => {
    if (val === null || val === undefined || val === 0) {
      return "Not Found";
    }
    return val;
  };


  // ================= VIEWED PROFILE =================
  const viewedProfile = async (start_date, end_date) => {
    setMostViewedLoading(true);
    try {
      const data = await fetchMostViewedProfiles(start_date, end_date);

      if (isEmpty(data)) {
        setMostViewedProfile([]); // or null if your UI expects that
        return;
      }

      setMostViewedProfile(data);
      console.log("viewed data", data);
    } catch (err) {
      console.log("Most Viewed Profile Error->", err?.message);
      showToast.error("Error while fetching the API");
      setMostViewedProfile([]);
    } finally {
      setMostViewedLoading(false);
    }
  };

  // ================= SEARCHED USER =================
  const searchedUser = async (start_date, end_date) => {
    setMostSearchLoading(true);
    try {
      const data = await fetchMostSearchUsers(start_date, end_date);

      if (isEmpty(data)) {
        setMostSearchUser([]);
        return;
      }

      setMostSearchUser(data);
      console.log("Most searched user", data);
    } catch (err) {
      console.log("Most Search Error->", err?.message);
      showToast.error("Error while fetching the API");
      setMostSearchUser([]);
    } finally {
      setMostSearchLoading(false);
    }
  };

  // ================= PROFESSION =================
  const professionFun = async (start_date, end_date) => {
    setProfessionLoading(true);
    try {
      const data = await fetchProfessionAnalytics(start_date, end_date);

      if (isEmpty(data)) {
        setProfession([]);
        return;
      }

      setProfession(data);
      console.log("Profession & Views", data);
    } catch (err) {
      console.log("Profession Error->", err?.message);
      showToast.error("Error while fetching the API");
      setProfession([]);
    } finally {
      setProfessionLoading(false);
    }
  };

  // ================= CITY ANALYTICS =================
  const cityAnalytics = async (start_date, end_date) => {
    setAnalyticsLoading(true);
    try {
      const data = await fetchCityAnalitics(start_date, end_date);

      if (isEmpty(data)) {
        setAnalitics([]);
        return;
      }

      setAnalitics(data);
      console.log("City Analytics", data);
    } catch (err) {
      console.log("City Analytics Error->", err?.message);
      showToast.error("Error while fetching the API");
      setAnalitics([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ================= CONNECTIONS =================
  const setConnection = async (start_date, end_date) => {
    try {
      const data = await fetchConnections(start_date, end_date);

      if (isEmpty(data)) {
        setConnections([]);
        return;
      }

      setConnections(data);
      console.log("Connections--", data);
    } catch (err) {
      console.log("Connections Error->", err?.message);
      showToast.error("Error while fetching the API");
      setConnections([]);
    }
  };

  // ================= TOTAL VIEW COUNT =================
  const totalViewCount = async (start_date, end_date) => {
    try {
      const data = await fetchTotalViews(start_date, end_date);

      if (isEmpty(data)) {
        setTotalViews(null); // or default metric object
        return;
      }

      const mapped = mapTotalVieCountToMetricCard(data);
      setTotalViews(mapped);
      console.log("TotalViews:", mapped);
    } catch (err) {
      console.log("Total Views Error ->", err?.message);
      showToast.error("Error while fetching Total views");
      setTotalViews(null);
    }
  };

  // ================= SEARCH COUNT =================
  const searchCount = async (start_date, end_date) => {
    try {
      const data = await fetchSearchCount(start_date, end_date);

      if (isEmpty(data)) {
        setSearchMetric(null);
        return;
      }

      const mapped = mapSearchCountToMetricCard(data);
      setSearchMetric(mapped);
      console.log("Search metric mapped:", mapped);
    } catch (err) {
      console.log("Search Count Error ->", err?.message);
      showToast.error("Error while fetching search count");
      setSearchMetric(null);
    }
  };

  // ================= TOP CITY =================
  const topCityfun = async (start_date, end_date) => {
    try {
      const data = await fetchTopCity(start_date, end_date);

      if (isEmpty(data)) {
        setTopCity(null);
        return;
      }

      const mapped = mapTopCityToMetricCard(data);
      setTopCity(mapped);
      console.log("Top City:", mapped);
    } catch (err) {
      console.log("Top City Error ->", err?.message);
      showToast.error("Error while fetching Top City");
      setTopCity(null);
    }
  };

  // ================= TOP PROFESSION =================
  const topProffun = async (start_date, end_date) => {
    try {
      const data = await fetchTopProfession(start_date, end_date);

      if (isEmpty(data)) {
        setTopProf(null);
        return;
      }

      const mapped = mapTopProfToMetricCard(data);
      setTopProf(mapped);
      console.log("Top Prof:", mapped);
    } catch (err) {
      console.log("Top Prof Error ->", err?.message);
      showToast.error("Error while fetching Top Prof");
      setTopProf(null);
    }
  };

  // ================= ENGAGEMENT =================
  const engFun = async (start_date, end_date) => {
    try {
      const data = await fetchEngagement(start_date, end_date);

      if (isEmpty(data)) {
        setEng(null);
        return;
      }

      const mapped = mapEngToMetricCard(data);
      setEng(mapped);
      console.log("Eng:", mapped);
    } catch (err) {
      console.log("Eng Error ->", err?.message);
      showToast.error("Error while fetching Engagement API");
      setEng(null);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            title={totalViews?.title || "Total Views"}
            value={displayValue(totalViews?.value)}
            delta={totalViews?.delta ?? 0}
            sparklineData={totalViews?.sparklineData ?? []}
          />

          <MetricCard
            title={searchMetric?.title || "Searches"}
            value={displayValue(searchMetric?.value)}
            delta={searchMetric?.delta ?? 0}
            sparklineData={searchMetric?.sparklineData ?? []}
          />

          <MetricCard
            title={topCity?.title || "Top City"}
            value={displayValue(topCity?.value)}
            delta={topCity?.delta ?? 0}
            sparklineData={topCity?.sparklineData ?? []}
            sparklineColor="#f59e0b"
          />

          <MetricCard
            title={topProf?.title || "Top Profession"}
            value={displayValue(topProf?.value)}
            delta={topProf?.delta ?? 0}
            sparklineData={topProf?.sparklineData ?? []}
            sparklineColor="#3b82f6"
          />

          <MetricCard
            title={eng?.title || "Engagement"}
            value={displayValue(eng?.value)}
            delta={eng?.delta ?? 0}
            sparklineData={eng?.sparklineData ?? []}
            sparklineColor="#8b5cf6"
          />


          {/* <MetricCard
            title="Failed Searches"
            value={mockMetrics.failedSearches}
            delta={mockMetrics.failedSearchesDelta}
            sparklineData={mockFailedSearches}
            sparklineColor="#ef4444" // red
          /> */}

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
        {
          connectionLoading ? (<Spinner />)
            :
            <D3NetworkGraph nodes={connections?.nodes} links={connections?.links} height={600} />
        }


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
                height={"700"}
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
