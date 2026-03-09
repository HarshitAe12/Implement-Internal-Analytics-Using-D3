// login 

import { apiFetch } from "./apiclient";

const API = "https://api.proinsight.com";

export async function loginUser({ username, password }) {
  const res = await fetch(`${API}/mfa/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function setupMfa({ username, password }) {
  const res = await fetch(`${API}/mfa/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function verifyMfa({username, otp}) {
  const res = await fetch(`${API}/mfa/verify_and_enable`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, otp }),
  });

  return res.json();
}

export async function verifyLogin({username, otp}) {
  const res = await fetch(`${API}/mfa/verify_login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, otp }),
  });

  return res.json();
}

export async function refreshToken(refresh) {
  const res = await fetch(`${API}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  return res.json();
}

// data 
export default function getLastMonthDateRange() {
  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const formatDate = (date) => date.toISOString().split("T")[0]; // YYYY-MM-DD

  return {
    start_date: formatDate(firstDayLastMonth),
    end_date: formatDate(lastDayLastMonth),
  };
}


export async function fetchMostViewedProfiles({
  limit = 10,
  start_date,
  end_date
} = {}) {


  const res = await apiFetch(
    `https://api.proinsight.com/analytics/most_viewed_profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit,
      start_date,
      end_date,
    })
  }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch most viewed profiles");
  }

  return res.json();
}

export async function fetchMostSearchUsers({
  limit = 10,
  start_date,
  end_date,
} = {}) {
  try {
    const res = await apiFetch(
      `https://api.proinsight.com/analytics/most_searched_users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit,
          start_date,
          end_date,
        })
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch most searched users");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchMostSearchUsers error:", err.message);
    throw err;
  }
}

export async function fetchProfessionAnalytics({ limit = 10, start_date, end_date } = {}) {

  const url = `https://api.proinsight.com/analytics/profession_analytics`;

  const res = await apiFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      limit,
      start_date,
      end_date,
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profession analytics");
  }

  const data = await res.json();
  return data;
}


export async function fetchAllProfilesViewCount({
  limit = 10,
  start_date,
  end_date,
} = {}) {
  try {

    const res = await apiFetch(
      `https://api.proinsight.com/analytics/all_profiles_view_count`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit,
          start_date,
          end_date,
        })
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch all profiles view count");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchAllProfilesViewCount error:", err.message);
    throw err;
  }
}

export async function fetchCityAnalitics({
  limit = 10,
  start_date,
  end_date,
} = {}) {
  try {

    const res = await apiFetch(
      `https://api.proinsight.com/analytics/city_analytics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit,
          start_date,
          end_date,
        })
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch city analitics");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchCityAnalytics error:", err.message);
    throw err;
  }
}

export async function fetchSearchCount({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/search_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Search Count API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Search Count API Error]", error);
    throw error;
  }
}

export async function fetchConnections({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/graph_data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Connection API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Connection API Error]", error);
    throw error;
  }
}


export async function fetchTotalViews({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/view_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Total Views API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Total Views API Error]", error);
    throw error;
  }
}

export async function fetchTopCity({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/city_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Top City API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Top City API Error]", error);
    throw error;
  }
}

export async function fetchTopProfession({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/profession_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Top Profession API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Top Profession API Error]", error);
    throw error;
  }
}

export async function fetchEngagement({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/total_engagements",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Engagement API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Engagement API Error]", error);
    throw error;
  }
}

// 100 search queries 

export async function fetchSearchQueriesTable() {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/search_query",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Table Search Query API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Table Search Query API Error]", error);
    throw error;
  }
}

export async function fetchAllCity({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/city_analytics",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ALl cities data failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ALl cities data error]", error);
    throw error;
  }
}

export async function fetchAllConnections({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/graph",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    if (!response.ok) {
      throw new Error(`All Connections data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[All Connections data error]", error);
    throw error;
  }
}
export async function fetchAllCommunity({
  start_date,
  end_date,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/get_community_graph",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    if (!response.ok) {
      throw new Error(`All Community data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[All Community data error]", error);
    throw error;
  }
}


// for specific user 
export async function fetchTotalViewsPerUser({
  start_date,
  end_date,
  user_id,
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/view_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
          user_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Total Views API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Total Views API Error]", error);
    throw error;
  }
}

export async function fetchSearchCountPerUser({
  start_date,
  end_date,
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/search_count",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
          user_id
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Search Count API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Search Count API Error]", error);
    throw error;
  }
}

export async function fetchEngagementPerUser({
  start_date,
  end_date,
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/total_engagements",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_date,
          end_date,
          user_id
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Engagement API failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Engagement API Error]", error);
    throw error;
  }
}

export async function fetchAllCommunityPerUser({
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/get_community_graph",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id
        })
      }
    );
    if (!response.ok) {
      throw new Error(`All Community data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[All Community data error]", error);
    throw error;
  }
}

export async function fetchUserDetails({
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/get_user_details",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id
        })
      }
    );
    if (!response.ok) {
      throw new Error(`User data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[User data error]", error);
    throw error;
  }
}

export async function fetchViewedProfile({
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/most_viewed_profiles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id
        })
      }
    );
    if (!response.ok) {
      throw new Error(`User data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[User data error]", error);
    throw error;
  }
}

export async function fetchSearchedUser({
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/most_searched_users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id
        })
      }
    );
    if (!response.ok) {
      throw new Error(`User data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[fetch Search user error]", error);
    throw error;
  }
}

export async function fetchSearchedQuery({
  user_id
} = {}) {
  try {
    const response = await apiFetch(
      "https://api.proinsight.com/analytics/search_query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id
        })
      }
    );
    if (!response.ok) {
      throw new Error(`User data failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[fetch Search Query error]", error);
    throw error;
  }
}