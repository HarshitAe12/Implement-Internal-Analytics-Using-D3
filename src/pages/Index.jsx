import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import MetricCard from "../components/dashboard/MetricCard";
import { fetchAllCommunity, fetchAllConnections, fetchCityAnalitics, fetchConnections, fetchEngagement, fetchMostSearchUsers, fetchMostViewedProfiles, fetchProfessionAnalytics, fetchSearchCount, fetchTopCity, fetchTopProfession, fetchTotalViews } from "../utils/api";
import { showToast } from "@/utils/showToast";
import MostViewedProfile from "@/components/dashboard/MostViewedProfile";
import MostSearchUser from "@/components/dashboard/MostSearchUser";
import ProfessionAnalyticChart from "@/components/dashboard/ProfessionAnalyticChart";
import Spinner from "@/utils/Spinner";
import D3NetworkGraph from "@/components/dashboard/UserConnectionGraph";
import CityAnalytics from "@/components/dashboard/CityAnalytics";
import { mapEngToMetricCard, mapSearchCountToMetricCard, mapTopCityToMetricCard, mapTopProfToMetricCard, mapTotalVieCountToMetricCard } from "@/utils/formatters";
import ViewConnectionGraph from "@/components/dashboard/ViewConnectionGraph";
import ViewCommunity from "@/components/dashboard/ViewCommunity";
import DrillDownBarChart from "@/components/dashboard/DrillDownBarChart";
import { mockPartnerEngagement } from "@/utils/data";

const Index = () => {
  const { dateRange } = useOutletContext();
// console.log("localstorage",localStorage)
  const defaultRange = (() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  })();


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

  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  });

  const [allConnectionLoading, setAllConnectionLoading] = useState(false)

  const [community, setCommunity] = useState({
    nodes: [],
    links: []
  })
  const [communityLoading, setCommunityLoading] = useState(false)

  // HEADER CARDS 

  const [totalViews, setTotalViews] = useState(null);
  const [searchMetric, setSearchMetric] = useState(null);
  const [topCity, setTopCity] = useState(null);
  const [topProf, setTopProf] = useState(null);
  const [eng, setEng] = useState(null);

  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    const payload = {
      start_date: dateRange.start,
      end_date: dateRange.end,
    };

    const fetchAll = async () => {
      try {
        await Promise.all([
          viewedProfile(payload),
          searchedUser(payload),
          professionFun(payload),
          totalViewCount(payload),
          cityAnalytics(payload),
          searchCount(payload),
          setConnection(payload),
          topCityfun(payload),
          topProffun(payload),
          engFun(payload),
          fetchAllConnectionsData(payload),
          fetchCommunity(payload)
        ]);
      } catch (err) {
        console.log("Dashboard Load Error:", err);
      }
    };

    fetchAll();
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
        setMostViewedProfile([]);
        return;
      }

      setMostViewedProfile(data);
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
    } catch (err) {
      console.log("Profession Error->", err?.message);
      showToast.error("Error while fetching the API");
      setProfession([]);
    } finally {
      setProfessionLoading(false);
    }
  };

  const cityAnalytics = async (start_date, end_date) => {
    setAnalyticsLoading(true);
    try {
      const data = await fetchCityAnalitics(start_date, end_date);

      if (isEmpty(data)) {
        setAnalitics([]);
        return;
      }

      setAnalitics(data);
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
    } catch (err) {
      console.log("Eng Error ->", err?.message);
      showToast.error("Error while fetching Engagement API");
      setEng(null);
    }
  };

  const fetchAllConnectionsData = async (start_date, end_date) => {
    try {
      setAllConnectionLoading(true);
      const data = await fetchAllConnections(start_date, end_date);

      const filteredLinks = data?.links?.filter(
        link => link.source && link.target && link.source !== link.target
      );

      setGraphData({
        nodes: data?.nodes || [],
        links: filteredLinks || []
      });

    } catch (err) {
      console.log("fetch all connections Error ->", err?.message);
      showToast.error("Error while fetch all connections API");
      setGraphData({
        nodes: [],
        links: []
      });

    }
    finally {
      setAllConnectionLoading(false)
    }
  };

  const fetchCommunity = async (start_date, end_date) => {
    try {
      setCommunityLoading(true);

      const data = await fetchAllCommunity(start_date, end_date);

      const filteredLinks = data?.links?.filter(
        link => link.source && link.target && link.source !== link.target
      );
      setCommunity({
        nodes: data?.nodes || [],
        links: filteredLinks || []
      });

    } catch (err) {
      console.log("fetch all community Error ->", err?.message);
      showToast.error("Error while fetch all community API");
      setCommunity({
        nodes: [],
        links: []
      });

    }
    finally {
      setCommunityLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-background">

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



        {/* Partner Engagement */}
        <DrillDownBarChart
          data={mockPartnerEngagement}
          title="Partner Engagement Funnel"
        />
        {/* <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementBubbles
            data={mockPartnerEngagement}
            title="Engagement Bubbles"
          />
        </section> */}
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

        {
          allConnectionLoading ? <Spinner />
            :
            <ViewConnectionGraph
              nodes={graphData?.nodes}
              links={graphData?.links}
            />
        }

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

        {
          communityLoading ? <Spinner />
            :
            <ViewCommunity
              nodes={community?.nodes}
              links={community?.links}
            />
        }

      </main>

    </div>
  );
};

export default Index;
