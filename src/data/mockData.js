
// --- Mock Data ---

export const mockMetrics = {
  activeMembers: 2847,
  activeMembersDelta: 12.3,
  dailyLogins: 432,
  dailyLoginsDelta: -3.1,
  monthlyLogins: 8924,
  monthlyLoginsDelta: 8.7,
  searchesPerformed: 15230,
  searchesDelta: 22.4,
  failedSearches: 342,
  failedSearchesDelta: -15.2,
  communityEngagement: 73.8,
  engagementDelta: 5.1,
};

export const mockDailyLogins = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    value: Math.floor(280 + Math.random() * 200 + Math.sin(i / 4) * 60),
  };
});

export const mockMostViewedProfiles = [
  { viewed_profile_id: "prof_101", viewed_profile_firstname: "Sarah", viewed_profile_lastname: "Mitchell", view_count: 287 },
  { viewed_profile_id: "prof_102", viewed_profile_firstname: "James", viewed_profile_lastname: "Rodriguez", view_count: 234 },
  { viewed_profile_id: "prof_103", viewed_profile_firstname: "Emily", viewed_profile_lastname: "Chen", view_count: 198 },
  { viewed_profile_id: "prof_104", viewed_profile_firstname: "Michael", viewed_profile_lastname: "Thompson", view_count: 176 },
  { viewed_profile_id: "prof_105", viewed_profile_firstname: "Lisa", viewed_profile_lastname: "Patel", view_count: 152 },
  { viewed_profile_id: "prof_106", viewed_profile_firstname: "David", viewed_profile_lastname: "Kim", view_count: 143 },
  { viewed_profile_id: "prof_107", viewed_profile_firstname: "Rachel", viewed_profile_lastname: "Garcia", view_count: 128 },
  { viewed_profile_id: "prof_108", viewed_profile_firstname: "Andrew", viewed_profile_lastname: "Wilson", view_count: 115 },
  { viewed_profile_id: "prof_109", viewed_profile_firstname: "Megan", viewed_profile_lastname: "Davis", view_count: 97 },
  { viewed_profile_id: "prof_110", viewed_profile_firstname: "Robert", viewed_profile_lastname: "Martinez", view_count: 84 },
];

export const mockAllProfileViews = [
  ...mockMostViewedProfiles,
  { viewed_profile_id: "prof_111", viewed_profile_firstname: "Karen", viewed_profile_lastname: "Johnson", view_count: 72 },
  { viewed_profile_id: "prof_112", viewed_profile_firstname: "Chris", viewed_profile_lastname: "Lee", view_count: 68 },
  { viewed_profile_id: "prof_113", viewed_profile_firstname: "Amanda", viewed_profile_lastname: "Brown", view_count: 55 },
  { viewed_profile_id: "prof_114", viewed_profile_firstname: "Brian", viewed_profile_lastname: "Taylor", view_count: 49 },
  { viewed_profile_id: "prof_115", viewed_profile_firstname: "Nicole", viewed_profile_lastname: "Anderson", view_count: 41 },
  { viewed_profile_id: "prof_116", viewed_profile_firstname: "Kevin", viewed_profile_lastname: "Thomas", view_count: 38 },
  { viewed_profile_id: "prof_117", viewed_profile_firstname: "Stephanie", viewed_profile_lastname: "White", view_count: 30 },
  { viewed_profile_id: "prof_118", viewed_profile_firstname: "Daniel", viewed_profile_lastname: "Harris", view_count: 24 },
  { viewed_profile_id: "prof_119", viewed_profile_firstname: "Laura", viewed_profile_lastname: "Clark", view_count: 18 },
  { viewed_profile_id: "prof_120", viewed_profile_firstname: "Jason", viewed_profile_lastname: "Lewis", view_count: 12 },
];

export const mockMostSearched = [
  { criteria: "Real Estate Agent in Reno", search_count: 312 },
  { criteria: "Mortgage Lender in Las Vegas", search_count: 256 },
  { criteria: "Plumber in Washoe County", search_count: 198 },
  { criteria: "Electrician in Sparks", search_count: 175 },
  { criteria: "Home Inspector in Carson City", search_count: 142 },
  { criteria: "Insurance Agent in Reno", search_count: 128 },
  { criteria: "Financial Advisor in Henderson", search_count: 115 },
  { criteria: "Contractor in Tahoe", search_count: 98 },
  { criteria: "Attorney in Reno", search_count: 87 },
  { criteria: "Appraiser in Washoe", search_count: 72 },
];

export const mockProfessionAnalytics = {
  most_searched_professions: [
    { profession_code: "Real Estate Agent", count: 520 },
    { profession_code: "Mortgage Lender", count: 385 },
    { profession_code: "Plumber", count: 290 },
    { profession_code: "Electrician", count: 245 },
    { profession_code: "Home Inspector", count: 210 },
    { profession_code: "Insurance Agent", count: 188 },
    { profession_code: "Financial Advisor", count: 165 },
    { profession_code: "General Contractor", count: 142 },
    { profession_code: "Attorney", count: 120 },
    { profession_code: "Appraiser", count: 95 },
  ],
  most_viewed_professions: [
    { profession_code: "Real Estate Agent", viewed_profile_profession_code: "prof-re-agent", count: 890 },
    { profession_code: "Mortgage Lender", viewed_profile_profession_code: "prof-lender", count: 620 },
    { profession_code: "Plumber", viewed_profile_profession_code: "prof-plumber", count: 410 },
    { profession_code: "Electrician", viewed_profile_profession_code: "prof-electrician", count: 355 },
    { profession_code: "Home Inspector", viewed_profile_profession_code: "prof-inspector", count: 298 },
    { profession_code: "Insurance Agent", viewed_profile_profession_code: "prof-insurance", count: 265 },
    { profession_code: "Financial Advisor", viewed_profile_profession_code: "prof-finance", count: 220 },
    { profession_code: "General Contractor", viewed_profile_profession_code: "prof-contractor", count: 195 },
    { profession_code: "Attorney", viewed_profile_profession_code: "prof-attorney", count: 170 },
    { profession_code: "Appraiser", viewed_profile_profession_code: "prof-appraiser", count: 130 },
  ],
};

export const mockCityAnalytics = {
  most_viewed_cities: [
    { viewed_profile_city_code: "Reno, NV", count: 1250 },
    { viewed_profile_city_code: "Las Vegas, NV", count: 980 },
    { viewed_profile_city_code: "Sparks, NV", count: 620 },
    { viewed_profile_city_code: "Carson City, NV", count: 485 },
    { viewed_profile_city_code: "Henderson, NV", count: 420 },
    { viewed_profile_city_code: "Tahoe, NV", count: 310 },
    { viewed_profile_city_code: "Austin, TX", count: 245 },
    { viewed_profile_city_code: "Fernley, NV", count: 180 },
    { viewed_profile_city_code: "Fallon, NV", count: 125 },
    { viewed_profile_city_code: "Elko, NV", count: 88 },
  ],
};

export const mockMonthlySearches = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    value: Math.floor(400 + Math.random() * 250 + Math.cos(i / 3) * 80),
  };
});

export const mockFailedSearches = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    value: Math.floor(5 + Math.random() * 20),
  };
});


export  const nodes = [
    { id: "Alice", group: 1, connections: 3 },
    { id: "Bob", group: 1, connections: 4 },
    { id: "Charlie", group: 1, connections: 2 },
    { id: "David", group: 1, connections: 3 },
    { id: "Eve", group: 1, connections: 2 },
    { id: "Frank", group: 2, connections: 3 },
    { id: "Grace", group: 2, connections: 2 },
    { id: "Heidi", group: 2, connections: 4 },
    { id: "Ivan", group: 2, connections: 3 },
    { id: "Judy", group: 2, connections: 2 },
    { id: "Kevin", group: 3, connections: 3 },
    { id: "Laura", group: 3, connections: 4 },
    { id: "Mallory", group: 3, connections: 3 },
    { id: "Niaj", group: 3, connections: 2 },
    { id: "Olivia", group: 3, connections: 3 },
    { id: "Peggy", group: 4, connections: 2 },
    { id: "Quentin", group: 4, connections: 3 },
    { id: "Rupert", group: 4, connections: 3 },
    { id: "Sybil", group: 4, connections: 2 },
    { id: "Trent", group: 4, connections: 4 },
    { id: "Uma", group: 5, connections: 3 },
    { id: "Victor", group: 5, connections: 2 },
    { id: "Walter", group: 5, connections: 3 },
    { id: "Xavier", group: 5, connections: 4 },
    { id: "Yvonne", group: 5, connections: 2 },
    { id: "Zara", group: 6, connections: 3 },
    { id: "Aaron", group: 6, connections: 3 },
    { id: "Beth", group: 6, connections: 2 },
    { id: "Carl", group: 6, connections: 4 },
    { id: "Diana", group: 6, connections: 3 },
    { id: "Ethan", group: 7, connections: 2 },
    { id: "Fiona", group: 7, connections: 3 },
    { id: "George", group: 7, connections: 4 },
    { id: "Hannah", group: 7, connections: 2 },
    { id: "Isaac", group: 7, connections: 3 },
    { id: "Jack", group: 8, connections: 3 },
    { id: "Kara", group: 8, connections: 2 },
    { id: "Liam", group: 8, connections: 4 },
    { id: "Mia", group: 8, connections: 3 },
    { id: "Noah", group: 8, connections: 2 },
  ];

 export const links = [
    { source: "Alice", target: "Vaishnav", value: 2 , name:"harshit"},
    { source: "Alice", target: "Charlie", value: 1 },
    { source: "Bob", target: "David", value: 2 },
    { source: "Charlie", target: "Eve", value: 1 },
    { source: "David", target: "Eve", value: 2 },
    { source: "Frank", target: "Grace", value: 2 },
    { source: "Frank", target: "Heidi", value: 3 },
    { source: "Grace", target: "Ivan", value: 2 },
    { source: "Heidi", target: "Judy", value: 1 },
    { source: "Ivan", target: "Judy", value: 2 },
    { source: "Kevin", target: "Laura", value: 2 },
    { source: "Kevin", target: "Mallory", value: 1 },
    { source: "Laura", target: "Niaj", value: 2 },
    { source: "Mallory", target: "Olivia", value: 2 },
    { source: "Niaj", target: "Olivia", value: 1 },
    { source: "Peggy", target: "Quentin", value: 2 },
    { source: "Rupert", target: "Sybil", value: 2 },
    { source: "Trent", target: "Sybil", value: 1 },
    { source: "Trent", target: "Quentin", value: 2 },
    { source: "Uma", target: "Victor", value: 1 },
    { source: "Walter", target: "Xavier", value: 2 },
    { source: "Victor", target: "Xavier", value: 1 },
    { source: "Yvonne", target: "Xavier", value: 2 },
    { source: "Zara", target: "Aaron", value: 2 },
    { source: "Beth", target: "Carl", value: 1 },
    { source: "Diana", target: "Carl", value: 2 },
    { source: "Ethan", target: "Fiona", value: 2 },
    { source: "George", target: "Hannah", value: 3 },
    { source: "Isaac", target: "George", value: 2 },
    { source: "Jack", target: "Kara", value: 2 },
    { source: "Liam", target: "Mia", value: 2 },
    { source: "Noah", target: "Mia", value: 1 },
    { source: "Mia", target: "Liam", value: 1 },
    { source: "Fiona", target: "Isaac", value: 2 },
    { source: "Beth", target: "Zara", value: 1 },
    { source: "Aaron", target: "Diana", value: 2 },
  ];