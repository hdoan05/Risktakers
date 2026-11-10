export const footballEvent = {
  id: 1,
  day: "21",
  month: "SEP",
  title: "Hokies vs Cavaliers",
  subtitle: "Football · 3:30 PM",
  tag: "LIVE",
  tagColor: "primary",
  category: "Football",
  closes: "Closes today, 6:30 PM",
  volume: 48200,
  options: [
    { label: "VT", probability: 62, change: 4.1, probHistory: [51, 54, 53, 57, 59, 62] },
    { label: "UVA", probability: 38, change: -4.1, probHistory: [49, 46, 47, 43, 41, 38] },
  ],
};

export const campusEvent = {
  id: 2,
  day: "24",
  month: "SEP",
  title: "Trivia Night Pool",
  subtitle: "Squires · 7:00 PM",
  tag: "NEW",
  tagColor: "secondary",
  category: "Campus",
  closes: "Closes Sep 24, 7:00 PM",
  volume: 2140,
  options: [
    { label: "Team Trivia Titans", probability: 41, change: 3.2, probHistory: [32, 34, 35, 37, 39, 41] },
    { label: "Field", probability: 59, change: -3.2, probHistory: [68, 66, 65, 63, 61, 59] },
  ],
};

export const accEvent = {
  id: 7,
  day: "30",
  month: "NOV",
  title: "Hokies Make the ACC Championship?",
  subtitle: "Season-Long Market",
  tag: "CLOSING SOON",
  tagColor: "accent",
  category: "Football",
  closes: "Closes Nov 30, 11:59 PM",
  volume: 22100,
  options: [
    { label: "Yes", probability: 31, change: 2.6, probHistory: [24, 25, 27, 28, 29, 31] },
    { label: "No", probability: 69, change: -2.6, probHistory: [76, 75, 73, 72, 71, 69] },
  ],
};

export const sampleEvents = [footballEvent, campusEvent, accEvent];

export const sampleLeaderboard = [
  { rank: 1, initials: "MK", name: "Maya K.", detail: "Junior · Mechanical Eng.", points: 18920, trend: "up" },
  { rank: 2, initials: "DT", name: "Derek T.", detail: "Senior · Finance", points: 17405, trend: "up" },
  { rank: 3, initials: "SP", name: "Sam P.", detail: "Sophomore · CS", points: 16110, trend: "down" },
  { rank: 4, initials: "RC", name: "Rae C.", detail: "Senior · Marketing", points: 15860, trend: "up" },
  { rank: 5, initials: "JL", name: "Jordan L.", detail: "Junior · Biology", points: 14995, trend: "down" },
];

export const sampleCurrentUser = {
  name: "JD",
  balance: 2480,
  rank: 47,
  changePct: 12.4,
  peakThisMonth: 2480,
  pointsHistory: [1800, 1950, 1870, 2050, 2200, 2120, 2300, 2260, 2400, 2350, 2480],
};

export function makeAppData(overrides = {}) {
  return {
    events: sampleEvents,
    leaderboard: sampleLeaderboard,
    currentUser: sampleCurrentUser,
    myBetEventIds: [1],
    ...overrides,
  };
}
