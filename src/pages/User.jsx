import MetricCard from '@/components/dashboard/MetricCard';
import TimeLine from '@/components/dashboard/TimeLine';
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  fetchTotalViewsPerUser,
  fetchSearchCountPerUser,
  fetchEngagementPerUser,
  fetchAllCommunityPerUser,
  fetchUserDetails,
  fetchViewedProfile,
  fetchSearchedUser
} from '@/utils/api';
import {
  dummyData,
  mockGraphData,
  mockMostSearchedUsers,
  mockMostViewedProfiles,
  mockProfessionAnalytics,
  mockSearchQueries
} from '@/utils/data';
import {
  mapEngToMetricCard,
  mapSearchCountToMetricCard,
  mapTotalVieCountToMetricCard
} from '@/utils/formatters';
import { showToast } from '@/utils/showToast';
import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { BriefcaseBusiness, Mail, MapPin } from 'lucide-react';
import ProfileBarChart from '@/components/dashboard/ProfileBarChart';
import SearchedUsersRadial from '@/components/dashboard/SearchedUserRadial';
import SearchQueryCloud from '@/components/dashboard/SearchQueryCloud';
import DonutChart from '@/components/dashboard/DonutChart';
import CommunityGraph from '@/components/dashboard/CommunityGraph';
import ConciergeBarChart from '@/components/dashboard/ConciergeBarChart';

const User = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  const { dateRange } = useOutletContext();
  const { id } = useParams();
  const [totalViews, setTotalViews] = useState(null);
  const [searchCount, setSearchCount] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [viewedProfile, setViewedProfile] = useState([]);
  const [searchedUser, setSearchedUser] = useState([]);

  const [community, setCommunity] = useState({
    nodes: [],
    links: []
  });

  const [communityLoading, setCommunityLoading] = useState(false);

  // ================= COMMUNITY FETCH (Only depends on user_id) =================
  useEffect(() => {
    if (!id) return;
    fetchCommunity();
  }, [id]);

  // ================= METRICS FETCH (Depends on dateRange + user_id) =================
  useEffect(() => {
    if (!dateRange?.start || !dateRange?.end || !id) return;

    const payload = {
      start_date: dateRange.start,
      end_date: dateRange.end,
      user_id: id,
    };

    fetchAllMetrics(payload);

  }, [dateRange, id]);

  const isEmpty = (data) =>
    !data || (Array.isArray(data) && data.length === 0);

  const displayValue = (val) =>
    val === null || val === undefined || val === 0
      ? "Not Found"
      : val;

  // ================= FETCH METRICS =================
  const fetchAllMetrics = async (payload) => {
    try {
      const [
        totalViewsRes,
        searchCountRes,
        engagementRes
      ] = await Promise.all([
        fetchTotalViewsPerUser(payload),
        fetchSearchCountPerUser(payload),
        fetchEngagementPerUser(payload)
      ]);

      if (!isEmpty(totalViewsRes)) {
        setTotalViews(mapTotalVieCountToMetricCard(totalViewsRes));
      } else {
        setTotalViews(null);
      }

      if (!isEmpty(searchCountRes)) {
        setSearchCount(mapSearchCountToMetricCard(searchCountRes));
      } else {
        setSearchCount(null);
      }

      if (!isEmpty(engagementRes)) {
        setEngagement(mapEngToMetricCard(engagementRes));
      } else {
        setEngagement(null);
      }

    } catch (err) {
      console.log("User Metrics Error ->", err?.message);
      showToast.error("Error while fetching user metrics");
    }
  };

  // ================= FETCH COMMUNITY =================
  const fetchCommunity = async () => {
    try {
      setCommunityLoading(true);

      const data = await fetchAllCommunityPerUser({ user_id: id });

      const filteredLinks = data?.links?.filter(
        link =>
          link.source &&
          link.target &&
          link.source !== link.target
      );

      setCommunity({
        nodes: data?.nodes || [],
        links: filteredLinks || []
      });

    } catch (err) {
      console.log("User Community Error ->", err?.message);
      showToast.error("Error while fetching user community");
      setCommunity({ nodes: [], links: [] });
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers()
    fetchViewProfile()
    fetchSearches()
  }, [id])

  const fetchUsers = async () => {
    try {
      const data = await fetchUserDetails({ user_id: id });
      setUserDetails(data)

    } catch (err) {
      console.log("User  Error ->", err?.message);
      showToast.error("Error while fetching user data");
      setUserDetails([]);
    }
  };

  const fetchViewProfile = async () => {
    try {
      const data = await fetchViewedProfile({ user_id: id });
      const mapped = (data || [])?.map((item) => ({
        name: `${item?.viewed_profile_firstname} ${item?.viewed_profile_lastname}`,
        views: item?.view_count || item?.views || 1
      }));

      setViewedProfile(mapped);

    } catch (err) {
      console.log("User Error ->", err?.message);
      showToast.error("Error while fetching user data");
      setViewedProfile([]);
    }
  };

  const fetchSearches = async () => {
    try {
      const data = await fetchSearchedUser({ user_id: id });
      const mapped = (data || [])?.map((item) => ({
        name: item?.criteria,
        searches: item?.search_count
      }));
      setSearchedUser(mapped);

    } catch (err) {
      console.log("User  Error ->", err?.message);
      showToast.error("Error while fetching user data");
      setSearchedUser([]);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <header className="mb-12 mt-8">
        {/* Horizontal scroll only on mobile */}
        <div className="mx-auto flex flex-col lg:flex-row gap-6 overflow-x-auto">

          {/* Back Link */}
          <a
            href="/"
            className="flex items-baseline text-sm md:text-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </a>

          {/* Profile Section */}
          <div className="flex items-start md:items-center flex-col md:flex-row gap-4 shrink-0">
            <Avatar className="h-40 w-40 rounded-full border-2 border-primary/30 overflow-hidden">
              <img
                src={userDetails?.profile?.preview?.avatar}
                alt="IMG"
                className="object-cover w-full h-full"
              />
              <AvatarFallback>
                {userDetails?.profile?.preview?.logo}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-max">
              {
                userDetails &&
                <h1 className="text-2xl font-bold tracking-tight text-left whitespace-nowrap">
                  {userDetails?.profile?.fullname}
                </h1>
              }
              {
                userDetails &&
                <div className="flex flex-wrap flex-col items-start gap-1 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <BriefcaseBusiness size={14} /> {userDetails?.profile?.profession}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Mail size={14} /> {userDetails?.profile?.email}
                  </span>
                </div>
              }
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-flow-col auto-cols-[280px] lg:grid-cols-3 lg:grid-flow-row gap-4 overflow-x-auto pb-2">
            <MetricCard
              title={totalViews?.title || "Total Views"}
              value={displayValue(totalViews?.value)}
              delta={totalViews?.delta ?? 0}
              sparklineData={totalViews?.sparklineData ?? []}
            />

            <MetricCard
              title={searchCount?.title || "Search Count"}
              value={displayValue(searchCount?.value)}
              delta={searchCount?.delta ?? 0}
              sparklineData={searchCount?.sparklineData ?? []}
            />

            <MetricCard
              title={engagement?.title || "Engagement"}
              value={displayValue(engagement?.value)}
              delta={engagement?.delta ?? 0}
              sparklineData={engagement?.sparklineData ?? []}
            />
          </div>
        </div>
      </header>

      {/* <div className="mt-12 overflow-x-auto">
        <div className="min-w-[700px]">
          <TimeLine data={mockGraphData.timeline} title="Activity Over Time" />
        </div>
      </div> */}

      <div className="mt-12 overflow-x-auto">
        <div className="min-w-[700px]">
          <ConciergeBarChart data={dummyData} title="App Downloads by Concierge Member" />
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <ProfileBarChart
              data={viewedProfile}
              title="Most Viewed Profiles"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <SearchedUsersRadial
              data={searchedUser}
              title="Most Searched Data"
            />
          </div>
        </div>
      </section>

      {/* <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <DonutChart
              data={mockProfessionAnalytics.professions}
              title="Profession Breakdown"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <SearchQueryCloud
              data={mockSearchQueries.queries}
              title="Top Search Queries"
            />
          </div>
        </div>
      </section> */}

      {/* Community Graph */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {communityLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading community...
            </div>
          ) : (
            <CommunityGraph
              nodes={community.nodes}
              links={community.links}
              title="Community Network"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default User;