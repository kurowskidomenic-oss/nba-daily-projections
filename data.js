// ============================================================
// NBA Daily Projections — Data Module
// ============================================================
// 2025-2026 season data sourced from Basketball Reference
// Updated: March 27, 2026 (post trade deadline rosters)

const NBA_TEAMS = {
  BOS: "Boston Celtics", BKN: "Brooklyn Nets", NYK: "New York Knicks",
  PHI: "Philadelphia 76ers", TOR: "Toronto Raptors", CHI: "Chicago Bulls",
  CLE: "Cleveland Cavaliers", DET: "Detroit Pistons", IND: "Indiana Pacers",
  MIL: "Milwaukee Bucks", ATL: "Atlanta Hawks", CHA: "Charlotte Hornets",
  MIA: "Miami Heat", ORL: "Orlando Magic", WAS: "Washington Wizards",
  DEN: "Denver Nuggets", MIN: "Minnesota Timberwolves", OKC: "Oklahoma City Thunder",
  POR: "Portland Trail Blazers", UTA: "Utah Jazz", GSW: "Golden State Warriors",
  LAC: "LA Clippers", LAL: "Los Angeles Lakers", PHX: "Phoenix Suns",
  SAC: "Sacramento Kings", DAL: "Dallas Mavericks", HOU: "Houston Rockets",
  MEM: "Memphis Grizzlies", NOP: "New Orleans Pelicans", SAS: "San Antonio Spurs"
};

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

// ---------- Today's Schedule (Sample) ----------
const TODAYS_GAMES = [
  { id: 1, away: "NYK", home: "CHA", time: "7:00 PM ET", arena: "Spectrum Center" },
  { id: 2, away: "NOP", home: "DET", time: "7:00 PM ET", arena: "Little Caesars Arena" },
  { id: 3, away: "SAC", home: "ORL", time: "7:00 PM ET", arena: "Kia Center" },
];

// ---------- Team Defence vs Position (stats ALLOWED per game) ----------
const TEAM_DEFENSE_VS_POSITION = {
  ATL: {
    PG: { pts: 24.2, reb: 4.5, ast: 7.7 }, SG: { pts: 21.2, reb: 4.1, ast: 4.0 },
    SF: { pts: 20.3, reb: 6.5, ast: 3.7 }, PF: { pts: 22.2, reb: 9.0, ast: 3.9 },
    C:  { pts: 19.8, reb: 11.7, ast: 3.0 }
  },
  BOS: {
    PG: { pts: 21.3, reb: 3.8, ast: 6.1 }, SG: { pts: 18.5, reb: 3.5, ast: 3.2 },
    SF: { pts: 17.8, reb: 5.6, ast: 2.9 }, PF: { pts: 19.2, reb: 7.8, ast: 3.1 },
    C:  { pts: 16.4, reb: 10.2, ast: 2.4 }
  },
  BKN: {
    PG: { pts: 23.0, reb: 4.2, ast: 7.1 }, SG: { pts: 20.0, reb: 3.8, ast: 3.6 },
    SF: { pts: 19.2, reb: 6.0, ast: 3.3 }, PF: { pts: 21.0, reb: 8.5, ast: 3.5 },
    C:  { pts: 18.5, reb: 11.0, ast: 2.7 }
  },
  CHA: {
    PG: { pts: 24.5, reb: 4.6, ast: 7.8 }, SG: { pts: 21.5, reb: 4.2, ast: 4.1 },
    SF: { pts: 20.5, reb: 6.6, ast: 3.8 }, PF: { pts: 22.5, reb: 9.1, ast: 4.0 },
    C:  { pts: 20.0, reb: 11.8, ast: 3.1 }
  },
  CHI: {
    PG: { pts: 23.2, reb: 4.1, ast: 7.2 }, SG: { pts: 20.1, reb: 3.8, ast: 3.6 },
    SF: { pts: 19.4, reb: 6.1, ast: 3.3 }, PF: { pts: 21.1, reb: 8.4, ast: 3.5 },
    C:  { pts: 18.6, reb: 11.1, ast: 2.7 }
  },
  CLE: {
    PG: { pts: 20.5, reb: 3.5, ast: 5.9 }, SG: { pts: 17.8, reb: 3.3, ast: 3.0 },
    SF: { pts: 17.0, reb: 5.3, ast: 2.7 }, PF: { pts: 18.5, reb: 7.5, ast: 2.9 },
    C:  { pts: 15.8, reb: 9.8, ast: 2.2 }
  },
  DAL: {
    PG: { pts: 23.2, reb: 4.3, ast: 7.5 }, SG: { pts: 20.5, reb: 4.0, ast: 3.9 },
    SF: { pts: 19.8, reb: 6.3, ast: 3.5 }, PF: { pts: 21.5, reb: 8.8, ast: 3.7 },
    C:  { pts: 19.2, reb: 11.5, ast: 2.9 }
  },
  DEN: {
    PG: { pts: 22.8, reb: 4.1, ast: 7.2 }, SG: { pts: 19.5, reb: 3.8, ast: 3.6 },
    SF: { pts: 18.9, reb: 6.0, ast: 3.3 }, PF: { pts: 20.8, reb: 8.4, ast: 3.5 },
    C:  { pts: 18.0, reb: 11.0, ast: 2.7 }
  },
  DET: {
    PG: { pts: 24.0, reb: 4.4, ast: 7.6 }, SG: { pts: 21.0, reb: 4.1, ast: 3.9 },
    SF: { pts: 20.0, reb: 6.4, ast: 3.6 }, PF: { pts: 22.0, reb: 8.9, ast: 3.8 },
    C:  { pts: 19.5, reb: 11.6, ast: 2.9 }
  },
  GSW: {
    PG: { pts: 22.5, reb: 4.0, ast: 7.0 }, SG: { pts: 19.8, reb: 3.7, ast: 3.5 },
    SF: { pts: 18.7, reb: 5.9, ast: 3.2 }, PF: { pts: 20.5, reb: 8.2, ast: 3.4 },
    C:  { pts: 17.8, reb: 10.8, ast: 2.6 }
  },
  HOU: {
    PG: { pts: 22.0, reb: 3.9, ast: 6.7 }, SG: { pts: 19.0, reb: 3.6, ast: 3.3 },
    SF: { pts: 18.2, reb: 5.7, ast: 3.0 }, PF: { pts: 19.8, reb: 8.0, ast: 3.2 },
    C:  { pts: 17.0, reb: 10.5, ast: 2.5 }
  },
  IND: {
    PG: { pts: 23.8, reb: 4.3, ast: 7.5 }, SG: { pts: 20.8, reb: 4.0, ast: 3.8 },
    SF: { pts: 19.8, reb: 6.3, ast: 3.5 }, PF: { pts: 21.8, reb: 8.7, ast: 3.7 },
    C:  { pts: 19.3, reb: 11.4, ast: 2.8 }
  },
  LAC: {
    PG: { pts: 22.8, reb: 4.1, ast: 7.0 }, SG: { pts: 19.8, reb: 3.7, ast: 3.5 },
    SF: { pts: 19.0, reb: 5.9, ast: 3.2 }, PF: { pts: 20.8, reb: 8.3, ast: 3.4 },
    C:  { pts: 18.2, reb: 10.9, ast: 2.6 }
  },
  LAL: {
    PG: { pts: 24.1, reb: 4.5, ast: 7.8 }, SG: { pts: 21.3, reb: 4.1, ast: 4.0 },
    SF: { pts: 20.2, reb: 6.5, ast: 3.7 }, PF: { pts: 22.0, reb: 9.0, ast: 3.9 },
    C:  { pts: 19.5, reb: 11.8, ast: 3.0 }
  },
  MEM: {
    PG: { pts: 23.2, reb: 4.2, ast: 7.2 }, SG: { pts: 20.2, reb: 3.9, ast: 3.7 },
    SF: { pts: 19.5, reb: 6.1, ast: 3.4 }, PF: { pts: 21.2, reb: 8.6, ast: 3.6 },
    C:  { pts: 18.7, reb: 11.2, ast: 2.8 }
  },
  MIA: {
    PG: { pts: 21.8, reb: 3.7, ast: 6.5 }, SG: { pts: 18.9, reb: 3.4, ast: 3.3 },
    SF: { pts: 18.0, reb: 5.5, ast: 3.0 }, PF: { pts: 19.5, reb: 7.9, ast: 3.2 },
    C:  { pts: 16.8, reb: 10.3, ast: 2.4 }
  },
  MIL: {
    PG: { pts: 22.0, reb: 3.9, ast: 6.8 }, SG: { pts: 19.2, reb: 3.6, ast: 3.4 },
    SF: { pts: 18.4, reb: 5.7, ast: 3.1 }, PF: { pts: 20.0, reb: 8.0, ast: 3.3 },
    C:  { pts: 17.2, reb: 10.5, ast: 2.5 }
  },
  MIN: {
    PG: { pts: 21.5, reb: 3.8, ast: 6.4 }, SG: { pts: 18.7, reb: 3.5, ast: 3.2 },
    SF: { pts: 17.8, reb: 5.6, ast: 2.9 }, PF: { pts: 19.3, reb: 7.8, ast: 3.1 },
    C:  { pts: 16.8, reb: 10.3, ast: 2.4 }
  },
  NOP: {
    PG: { pts: 24.0, reb: 4.4, ast: 7.6 }, SG: { pts: 21.0, reb: 4.1, ast: 3.9 },
    SF: { pts: 20.2, reb: 6.4, ast: 3.6 }, PF: { pts: 22.0, reb: 8.9, ast: 3.8 },
    C:  { pts: 19.5, reb: 11.5, ast: 2.9 }
  },
  NYK: {
    PG: { pts: 23.8, reb: 4.2, ast: 7.3 }, SG: { pts: 20.1, reb: 3.9, ast: 3.8 },
    SF: { pts: 19.5, reb: 6.1, ast: 3.4 }, PF: { pts: 21.7, reb: 8.5, ast: 3.6 },
    C:  { pts: 18.9, reb: 11.4, ast: 2.8 }
  },
  OKC: {
    PG: { pts: 21.0, reb: 3.6, ast: 6.0 }, SG: { pts: 18.0, reb: 3.3, ast: 3.0 },
    SF: { pts: 17.2, reb: 5.3, ast: 2.7 }, PF: { pts: 18.8, reb: 7.6, ast: 2.9 },
    C:  { pts: 16.2, reb: 10.0, ast: 2.2 }
  },
  ORL: {
    PG: { pts: 21.0, reb: 3.6, ast: 6.2 }, SG: { pts: 18.2, reb: 3.4, ast: 3.1 },
    SF: { pts: 17.5, reb: 5.4, ast: 2.8 }, PF: { pts: 19.0, reb: 7.7, ast: 3.0 },
    C:  { pts: 16.5, reb: 10.1, ast: 2.3 }
  },
  PHI: {
    PG: { pts: 24.5, reb: 4.6, ast: 7.9 }, SG: { pts: 21.8, reb: 4.2, ast: 4.1 },
    SF: { pts: 20.8, reb: 6.7, ast: 3.8 }, PF: { pts: 22.5, reb: 9.2, ast: 4.0 },
    C:  { pts: 20.0, reb: 12.0, ast: 3.1 }
  },
  PHX: {
    PG: { pts: 23.0, reb: 4.2, ast: 7.1 }, SG: { pts: 20.0, reb: 3.8, ast: 3.6 },
    SF: { pts: 19.2, reb: 6.0, ast: 3.3 }, PF: { pts: 21.0, reb: 8.5, ast: 3.5 },
    C:  { pts: 18.5, reb: 11.0, ast: 2.7 }
  },
  POR: {
    PG: { pts: 24.3, reb: 4.5, ast: 7.7 }, SG: { pts: 21.3, reb: 4.1, ast: 4.0 },
    SF: { pts: 20.3, reb: 6.5, ast: 3.7 }, PF: { pts: 22.3, reb: 9.0, ast: 3.9 },
    C:  { pts: 19.8, reb: 11.7, ast: 3.0 }
  },
  SAC: {
    PG: { pts: 23.5, reb: 4.3, ast: 7.3 }, SG: { pts: 20.5, reb: 4.0, ast: 3.8 },
    SF: { pts: 19.7, reb: 6.2, ast: 3.4 }, PF: { pts: 21.5, reb: 8.7, ast: 3.6 },
    C:  { pts: 19.0, reb: 11.3, ast: 2.8 }
  },
  SAS: {
    PG: { pts: 24.2, reb: 4.5, ast: 7.7 }, SG: { pts: 21.2, reb: 4.1, ast: 4.0 },
    SF: { pts: 20.3, reb: 6.5, ast: 3.7 }, PF: { pts: 22.2, reb: 9.0, ast: 3.9 },
    C:  { pts: 19.8, reb: 11.7, ast: 3.0 }
  },
  TOR: {
    PG: { pts: 23.5, reb: 4.3, ast: 7.4 }, SG: { pts: 20.3, reb: 3.9, ast: 3.7 },
    SF: { pts: 19.6, reb: 6.2, ast: 3.4 }, PF: { pts: 21.3, reb: 8.6, ast: 3.6 },
    C:  { pts: 18.8, reb: 11.2, ast: 2.8 }
  },
  UTA: {
    PG: { pts: 23.5, reb: 4.3, ast: 7.3 }, SG: { pts: 20.5, reb: 4.0, ast: 3.8 },
    SF: { pts: 19.7, reb: 6.2, ast: 3.4 }, PF: { pts: 21.5, reb: 8.7, ast: 3.6 },
    C:  { pts: 19.0, reb: 11.3, ast: 2.8 }
  },
  WAS: {
    PG: { pts: 25.0, reb: 4.7, ast: 8.0 }, SG: { pts: 22.0, reb: 4.3, ast: 4.2 },
    SF: { pts: 21.0, reb: 6.8, ast: 3.9 }, PF: { pts: 23.0, reb: 9.3, ast: 4.1 },
    C:  { pts: 20.5, reb: 12.0, ast: 3.2 }
  }
};

// ---------- Player Rosters & Season Averages (2025-26) ----------
// Source: Basketball Reference, updated March 2026
// Each player: { name, team, pos, pts, reb, ast, min, gp, starter, notes }
const SAMPLE_PLAYERS = [
  // === ATLANTA HAWKS ===
  { name: "Jalen Johnson", team: "ATL", pos: "SF", pts: 22.8, reb: 10.3, ast: 8.1, min: 35.3, gp: 64, starter: true, notes: "" },
  { name: "Nickeil Alexander-Walker", team: "ATL", pos: "SG", pts: 20.4, reb: 3.4, ast: 3.7, min: 33.1, gp: 70, starter: true, notes: "" },
  { name: "Trae Young", team: "ATL", pos: "PG", pts: 19.3, reb: 1.5, ast: 8.9, min: 28.0, gp: 10, starter: true, notes: "Traded to WAS mid-season" },
  { name: "CJ McCollum", team: "ATL", pos: "PG", pts: 18.7, reb: 3.2, ast: 3.9, min: 28.4, gp: 33, starter: true, notes: "" },
  { name: "Kristaps Porzingis", team: "ATL", pos: "C", pts: 17.1, reb: 5.1, ast: 2.7, min: 24.3, gp: 17, starter: true, notes: "Traded from BOS" },
  { name: "Onyeka Okongwu", team: "ATL", pos: "C", pts: 15.4, reb: 7.6, ast: 3.2, min: 30.9, gp: 67, starter: true, notes: "" },
  { name: "Jonathan Kuminga", team: "ATL", pos: "PF", pts: 12.8, reb: 6.6, ast: 2.4, min: 22.0, gp: 9, starter: false, notes: "" },
  { name: "Dyson Daniels", team: "ATL", pos: "SG", pts: 11.8, reb: 6.7, ast: 5.9, min: 33.2, gp: 69, starter: true, notes: "" },
  { name: "Zaccharie Risacher", team: "ATL", pos: "SF", pts: 10.0, reb: 3.9, ast: 1.2, min: 23.4, gp: 59, starter: false, notes: "" },
  { name: "Corey Kispert", team: "ATL", pos: "SF", pts: 9.4, reb: 2.5, ast: 1.7, min: 19.0, gp: 33, starter: false, notes: "" },

  // === BOSTON CELTICS ===
  { name: "Jaylen Brown", team: "BOS", pos: "SF", pts: 28.6, reb: 7.0, ast: 5.2, min: 34.3, gp: 65, starter: true, notes: "" },
  { name: "Jayson Tatum", team: "BOS", pos: "PF", pts: 19.1, reb: 9.2, ast: 3.7, min: 30.3, gp: 9, starter: true, notes: "Limited games — injury" },
  { name: "Derrick White", team: "BOS", pos: "SG", pts: 17.2, reb: 4.5, ast: 5.5, min: 34.3, gp: 69, starter: true, notes: "" },
  { name: "Payton Pritchard", team: "BOS", pos: "PG", pts: 16.6, reb: 4.0, ast: 5.2, min: 32.5, gp: 70, starter: true, notes: "" },
  { name: "Anfernee Simons", team: "BOS", pos: "SG", pts: 14.2, reb: 2.4, ast: 2.4, min: 24.5, gp: 49, starter: false, notes: "Traded from POR" },
  { name: "Nikola Vucevic", team: "BOS", pos: "C", pts: 10.4, reb: 7.2, ast: 1.8, min: 21.7, gp: 12, starter: true, notes: "Traded from CHI" },
  { name: "Neemias Queta", team: "BOS", pos: "C", pts: 9.9, reb: 8.3, ast: 1.5, min: 25.2, gp: 68, starter: true, notes: "" },
  { name: "Sam Hauser", team: "BOS", pos: "PF", pts: 8.9, reb: 3.9, ast: 1.4, min: 24.5, gp: 69, starter: false, notes: "" },
  { name: "Luka Garza", team: "BOS", pos: "C", pts: 7.6, reb: 3.9, ast: 0.9, min: 15.8, gp: 62, starter: false, notes: "" },

  // === BROOKLYN NETS ===
  { name: "Michael Porter Jr.", team: "BKN", pos: "SF", pts: 24.2, reb: 7.1, ast: 3.0, min: 32.5, gp: 52, starter: true, notes: "Traded from DEN" },
  { name: "Cam Thomas", team: "BKN", pos: "SG", pts: 15.6, reb: 1.8, ast: 3.1, min: 24.3, gp: 24, starter: true, notes: "Traded to MIL" },
  { name: "Noah Clowney", team: "BKN", pos: "PF", pts: 12.5, reb: 4.1, ast: 1.7, min: 27.3, gp: 62, starter: true, notes: "" },
  { name: "Nic Claxton", team: "BKN", pos: "C", pts: 11.8, reb: 7.0, ast: 3.7, min: 28.1, gp: 65, starter: true, notes: "" },
  { name: "Egor Demin", team: "BKN", pos: "PG", pts: 10.3, reb: 3.2, ast: 3.3, min: 25.2, gp: 52, starter: true, notes: "Rookie" },
  { name: "Ziaire Williams", team: "BKN", pos: "SF", pts: 10.2, reb: 2.4, ast: 1.0, min: 22.8, gp: 53, starter: false, notes: "" },
  { name: "Danny Wolf", team: "BKN", pos: "PF", pts: 8.9, reb: 4.9, ast: 2.2, min: 20.8, gp: 57, starter: false, notes: "" },
  { name: "Day'Ron Sharpe", team: "BKN", pos: "C", pts: 8.7, reb: 6.7, ast: 2.3, min: 18.7, gp: 62, starter: false, notes: "" },
  { name: "Nolan Traore", team: "BKN", pos: "PG", pts: 8.3, reb: 1.7, ast: 3.7, min: 22.1, gp: 49, starter: false, notes: "Rookie" },

  // === CHARLOTTE HORNETS ===
  { name: "Brandon Miller", team: "CHA", pos: "SF", pts: 20.3, reb: 5.0, ast: 3.5, min: 30.1, gp: 55, starter: true, notes: "" },
  { name: "LaMelo Ball", team: "CHA", pos: "PG", pts: 19.7, reb: 4.8, ast: 7.1, min: 27.5, gp: 62, starter: true, notes: "" },
  { name: "Kon Knueppel", team: "CHA", pos: "SF", pts: 19.0, reb: 5.3, ast: 3.4, min: 31.4, gp: 71, starter: true, notes: "Rookie breakout" },
  { name: "Miles Bridges", team: "CHA", pos: "PF", pts: 17.2, reb: 5.9, ast: 3.3, min: 31.4, gp: 67, starter: true, notes: "" },
  { name: "Coby White", team: "CHA", pos: "SG", pts: 15.9, reb: 3.3, ast: 3.6, min: 19.8, gp: 12, starter: true, notes: "Traded from CHI" },
  { name: "Collin Sexton", team: "CHA", pos: "SG", pts: 14.2, reb: 1.9, ast: 3.7, min: 22.3, gp: 42, starter: true, notes: "" },
  { name: "Moussa Diabate", team: "CHA", pos: "C", pts: 8.2, reb: 8.8, ast: 1.9, min: 25.9, gp: 64, starter: true, notes: "" },
  { name: "Ryan Kalkbrenner", team: "CHA", pos: "C", pts: 7.9, reb: 5.7, ast: 0.8, min: 21.9, gp: 59, starter: false, notes: "Rookie" },
  { name: "Grant Williams", team: "CHA", pos: "PF", pts: 6.8, reb: 3.9, ast: 1.7, min: 19.4, gp: 28, starter: false, notes: "" },
  { name: "Tidjane Salaun", team: "CHA", pos: "PF", pts: 6.2, reb: 4.1, ast: 0.8, min: 15.9, gp: 36, starter: false, notes: "" },

  // === CHICAGO BULLS ===
  { name: "Coby White", team: "CHI", pos: "SG", pts: 18.6, reb: 3.7, ast: 4.7, min: 29.1, gp: 29, starter: true, notes: "Traded to CHA" },
  { name: "Josh Giddey", team: "CHI", pos: "PG", pts: 17.6, reb: 8.3, ast: 9.2, min: 32.1, gp: 50, starter: true, notes: "" },
  { name: "Nikola Vucevic", team: "CHI", pos: "C", pts: 16.9, reb: 9.0, ast: 3.8, min: 30.8, gp: 48, starter: true, notes: "Traded to BOS" },
  { name: "Matas Buzelis", team: "CHI", pos: "PF", pts: 16.3, reb: 5.6, ast: 2.0, min: 29.1, gp: 71, starter: true, notes: "Rookie" },
  { name: "Ayo Dosunmu", team: "CHI", pos: "SG", pts: 15.0, reb: 3.0, ast: 3.6, min: 26.4, gp: 45, starter: true, notes: "" },
  { name: "Tre Jones", team: "CHI", pos: "PG", pts: 13.0, reb: 3.0, ast: 5.4, min: 27.0, gp: 55, starter: false, notes: "" },
  { name: "Kevin Huerter", team: "CHI", pos: "SF", pts: 10.9, reb: 3.8, ast: 2.6, min: 23.6, gp: 44, starter: false, notes: "" },
  { name: "Jalen Smith", team: "CHI", pos: "C", pts: 10.2, reb: 6.7, ast: 1.2, min: 20.7, gp: 53, starter: false, notes: "" },

  // === CLEVELAND CAVALIERS ===
  { name: "Donovan Mitchell", team: "CLE", pos: "SG", pts: 28.3, reb: 4.5, ast: 5.8, min: 33.6, gp: 64, starter: true, notes: "" },
  { name: "James Harden", team: "CLE", pos: "PG", pts: 21.0, reb: 5.4, ast: 7.7, min: 34.4, gp: 19, starter: true, notes: "Traded from LAC" },
  { name: "Evan Mobley", team: "CLE", pos: "PF", pts: 18.1, reb: 8.9, ast: 3.6, min: 32.4, gp: 58, starter: true, notes: "" },
  { name: "Darius Garland", team: "CLE", pos: "PG", pts: 18.0, reb: 2.4, ast: 6.9, min: 30.5, gp: 26, starter: true, notes: "Traded to LAC" },
  { name: "Jarrett Allen", team: "CLE", pos: "C", pts: 15.3, reb: 8.5, ast: 1.9, min: 27.5, gp: 51, starter: true, notes: "" },
  { name: "De'Andre Hunter", team: "CLE", pos: "SF", pts: 14.0, reb: 4.2, ast: 2.1, min: 26.2, gp: 43, starter: true, notes: "Traded from ATL" },
  { name: "Jaylon Tyson", team: "CLE", pos: "SG", pts: 13.1, reb: 5.1, ast: 2.2, min: 27.0, gp: 64, starter: false, notes: "" },
  { name: "Sam Merrill", team: "CLE", pos: "SG", pts: 13.1, reb: 2.6, ast: 2.3, min: 26.4, gp: 47, starter: false, notes: "" },

  // === DALLAS MAVERICKS ===
  { name: "Cooper Flagg", team: "DAL", pos: "SF", pts: 20.4, reb: 6.6, ast: 4.7, min: 33.8, gp: 61, starter: true, notes: "Rookie #1 pick" },
  { name: "Anthony Davis", team: "DAL", pos: "PF", pts: 20.4, reb: 11.1, ast: 2.8, min: 31.3, gp: 20, starter: true, notes: "Traded from LAL" },
  { name: "Naji Marshall", team: "DAL", pos: "SF", pts: 15.4, reb: 4.8, ast: 3.3, min: 29.7, gp: 70, starter: true, notes: "" },
  { name: "P.J. Washington", team: "DAL", pos: "PF", pts: 14.3, reb: 7.1, ast: 1.8, min: 31.1, gp: 54, starter: true, notes: "" },
  { name: "Brandon Williams", team: "DAL", pos: "PG", pts: 12.8, reb: 2.9, ast: 3.8, min: 22.0, gp: 61, starter: false, notes: "" },
  { name: "Max Christie", team: "DAL", pos: "SG", pts: 12.6, reb: 3.3, ast: 2.0, min: 29.5, gp: 68, starter: true, notes: "" },
  { name: "Klay Thompson", team: "DAL", pos: "SF", pts: 11.8, reb: 2.1, ast: 1.3, min: 21.9, gp: 63, starter: false, notes: "" },
  { name: "D'Angelo Russell", team: "DAL", pos: "PG", pts: 10.2, reb: 2.3, ast: 4.0, min: 19.0, gp: 26, starter: false, notes: "" },
  { name: "Daniel Gafford", team: "DAL", pos: "C", pts: 9.5, reb: 7.0, ast: 1.1, min: 21.9, gp: 51, starter: true, notes: "" },

  // === DENVER NUGGETS ===
  { name: "Nikola Jokic", team: "DEN", pos: "C", pts: 27.8, reb: 12.8, ast: 10.8, min: 34.8, gp: 58, starter: true, notes: "MVP candidate" },
  { name: "Jamal Murray", team: "DEN", pos: "PG", pts: 25.4, reb: 4.4, ast: 7.1, min: 35.1, gp: 69, starter: true, notes: "" },
  { name: "Aaron Gordon", team: "DEN", pos: "PF", pts: 16.6, reb: 5.9, ast: 2.5, min: 27.5, gp: 31, starter: true, notes: "" },
  { name: "Peyton Watson", team: "DEN", pos: "SF", pts: 15.0, reb: 4.9, ast: 2.0, min: 30.3, gp: 51, starter: true, notes: "" },
  { name: "Tim Hardaway Jr.", team: "DEN", pos: "SG", pts: 13.7, reb: 2.6, ast: 1.4, min: 26.9, gp: 73, starter: true, notes: "" },
  { name: "Cameron Johnson", team: "DEN", pos: "SF", pts: 11.9, reb: 3.7, ast: 2.4, min: 30.4, gp: 48, starter: false, notes: "Traded from BKN" },
  { name: "Christian Braun", team: "DEN", pos: "SG", pts: 11.7, reb: 4.8, ast: 2.9, min: 31.8, gp: 38, starter: true, notes: "" },
  { name: "Jonas Valanciunas", team: "DEN", pos: "C", pts: 8.3, reb: 4.9, ast: 1.2, min: 13.3, gp: 58, starter: false, notes: "" },
  { name: "Bruce Brown", team: "DEN", pos: "SG", pts: 7.7, reb: 3.9, ast: 2.1, min: 24.5, gp: 74, starter: false, notes: "" },

  // === DETROIT PISTONS ===
  { name: "Cade Cunningham", team: "DET", pos: "PG", pts: 24.5, reb: 5.6, ast: 9.9, min: 34.4, gp: 61, starter: true, notes: "" },
  { name: "Jalen Duren", team: "DET", pos: "C", pts: 19.3, reb: 10.6, ast: 1.7, min: 28.0, gp: 62, starter: true, notes: "" },
  { name: "Tobias Harris", team: "DET", pos: "PF", pts: 13.3, reb: 5.2, ast: 2.4, min: 28.3, gp: 55, starter: true, notes: "" },
  { name: "Duncan Robinson", team: "DET", pos: "SF", pts: 11.9, reb: 2.7, ast: 2.1, min: 27.7, gp: 70, starter: true, notes: "Traded from MIA" },
  { name: "Ausar Thompson", team: "DET", pos: "SF", pts: 10.0, reb: 5.8, ast: 3.0, min: 25.9, gp: 63, starter: true, notes: "" },
  { name: "Isaiah Stewart", team: "DET", pos: "C", pts: 10.0, reb: 5.1, ast: 1.2, min: 23.1, gp: 55, starter: false, notes: "" },
  { name: "Daniss Jenkins", team: "DET", pos: "PG", pts: 8.5, reb: 2.0, ast: 3.4, min: 18.7, gp: 62, starter: false, notes: "Rookie" },
  { name: "Ron Holland", team: "DET", pos: "SF", pts: 8.3, reb: 4.2, ast: 1.3, min: 20.0, gp: 68, starter: false, notes: "" },
  { name: "Jaden Ivey", team: "DET", pos: "SG", pts: 8.2, reb: 2.2, ast: 1.6, min: 16.8, gp: 33, starter: false, notes: "" },
  { name: "Caris LeVert", team: "DET", pos: "SG", pts: 7.3, reb: 1.9, ast: 2.7, min: 19.3, gp: 52, starter: false, notes: "" },

  // === GOLDEN STATE WARRIORS ===
  { name: "Stephen Curry", team: "GSW", pos: "PG", pts: 27.2, reb: 3.5, ast: 4.8, min: 31.3, gp: 39, starter: true, notes: "Load management" },
  { name: "Jimmy Butler", team: "GSW", pos: "SF", pts: 20.0, reb: 5.6, ast: 4.9, min: 31.1, gp: 38, starter: true, notes: "Traded from MIA" },
  { name: "Kristaps Porzingis", team: "GSW", pos: "C", pts: 15.9, reb: 4.3, ast: 2.6, min: 22.0, gp: 9, starter: true, notes: "Traded from ATL" },
  { name: "Brandin Podziemski", team: "GSW", pos: "SG", pts: 13.1, reb: 5.2, ast: 3.8, min: 28.4, gp: 73, starter: true, notes: "" },
  { name: "De'Anthony Melton", team: "GSW", pos: "PG", pts: 13.0, reb: 3.2, ast: 2.5, min: 22.9, gp: 42, starter: false, notes: "" },
  { name: "Moses Moody", team: "GSW", pos: "SG", pts: 12.1, reb: 3.3, ast: 1.6, min: 25.7, gp: 60, starter: true, notes: "" },
  { name: "Jonathan Kuminga", team: "GSW", pos: "PF", pts: 12.1, reb: 5.9, ast: 2.5, min: 23.8, gp: 20, starter: true, notes: "Traded to ATL" },
  { name: "Gui Santos", team: "GSW", pos: "PF", pts: 8.6, reb: 3.8, ast: 2.2, min: 19.7, gp: 62, starter: false, notes: "" },
  { name: "Draymond Green", team: "GSW", pos: "PF", pts: 8.5, reb: 5.6, ast: 5.3, min: 27.4, gp: 60, starter: true, notes: "" },
  { name: "Al Horford", team: "GSW", pos: "C", pts: 8.3, reb: 5.0, ast: 2.6, min: 21.7, gp: 43, starter: false, notes: "" },

  // === HOUSTON ROCKETS ===
  { name: "Kevin Durant", team: "HOU", pos: "SF", pts: 26.0, reb: 5.4, ast: 4.5, min: 36.6, gp: 69, starter: true, notes: "Traded from PHX" },
  { name: "Alperen Sengun", team: "HOU", pos: "C", pts: 20.5, reb: 8.9, ast: 6.1, min: 33.7, gp: 63, starter: true, notes: "" },
  { name: "Amen Thompson", team: "HOU", pos: "PG", pts: 17.9, reb: 7.9, ast: 5.3, min: 37.3, gp: 70, starter: true, notes: "" },
  { name: "Jabari Smith Jr.", team: "HOU", pos: "PF", pts: 15.5, reb: 6.8, ast: 1.9, min: 35.2, gp: 68, starter: true, notes: "" },
  { name: "Reed Sheppard", team: "HOU", pos: "SG", pts: 13.5, reb: 2.9, ast: 3.4, min: 26.3, gp: 72, starter: true, notes: "Rookie" },
  { name: "Tari Eason", team: "HOU", pos: "PF", pts: 10.2, reb: 6.3, ast: 1.6, min: 25.9, gp: 50, starter: false, notes: "" },
  { name: "Steven Adams", team: "HOU", pos: "C", pts: 5.8, reb: 8.6, ast: 1.5, min: 22.8, gp: 32, starter: false, notes: "" },

  // === INDIANA PACERS ===
  { name: "Pascal Siakam", team: "IND", pos: "PF", pts: 23.9, reb: 6.6, ast: 3.8, min: 33.4, gp: 58, starter: true, notes: "" },
  { name: "Bennedict Mathurin", team: "IND", pos: "SF", pts: 17.8, reb: 5.4, ast: 2.3, min: 31.8, gp: 28, starter: true, notes: "Traded to LAC" },
  { name: "Andrew Nembhard", team: "IND", pos: "PG", pts: 17.1, reb: 2.8, ast: 7.6, min: 31.2, gp: 55, starter: true, notes: "" },
  { name: "Aaron Nesmith", team: "IND", pos: "SF", pts: 13.5, reb: 4.1, ast: 1.9, min: 29.5, gp: 44, starter: true, notes: "" },
  { name: "Jarace Walker", team: "IND", pos: "PF", pts: 11.6, reb: 5.2, ast: 2.4, min: 25.9, gp: 72, starter: true, notes: "" },
  { name: "Jay Huff", team: "IND", pos: "C", pts: 9.5, reb: 3.8, ast: 1.3, min: 20.9, gp: 73, starter: true, notes: "" },
  { name: "T.J. McConnell", team: "IND", pos: "PG", pts: 9.4, reb: 2.2, ast: 5.1, min: 17.2, gp: 54, starter: false, notes: "" },

  // === LOS ANGELES CLIPPERS ===
  { name: "Kawhi Leonard", team: "LAC", pos: "SF", pts: 28.3, reb: 6.3, ast: 3.6, min: 32.2, gp: 57, starter: true, notes: "" },
  { name: "James Harden", team: "LAC", pos: "PG", pts: 25.4, reb: 4.8, ast: 8.1, min: 35.4, gp: 44, starter: true, notes: "Traded to CLE" },
  { name: "Darius Garland", team: "LAC", pos: "PG", pts: 21.1, reb: 2.5, ast: 6.8, min: 27.7, gp: 11, starter: true, notes: "Traded from CLE" },
  { name: "Bennedict Mathurin", team: "LAC", pos: "SF", pts: 20.1, reb: 5.8, ast: 2.5, min: 29.9, gp: 17, starter: true, notes: "Traded from IND" },
  { name: "Ivica Zubac", team: "LAC", pos: "C", pts: 14.4, reb: 11.0, ast: 2.2, min: 30.9, gp: 43, starter: true, notes: "" },
  { name: "John Collins", team: "LAC", pos: "PF", pts: 13.5, reb: 5.3, ast: 1.0, min: 27.5, gp: 60, starter: true, notes: "" },
  { name: "Derrick Jones Jr.", team: "LAC", pos: "SF", pts: 10.8, reb: 3.3, ast: 1.4, min: 27.5, gp: 41, starter: false, notes: "" },
  { name: "Brook Lopez", team: "LAC", pos: "C", pts: 7.9, reb: 3.2, ast: 1.2, min: 21.0, gp: 66, starter: false, notes: "Traded from MIL" },
  { name: "Kris Dunn", team: "LAC", pos: "PG", pts: 7.5, reb: 3.3, ast: 3.6, min: 27.5, gp: 73, starter: false, notes: "" },

  // === LOS ANGELES LAKERS ===
  { name: "Luka Doncic", team: "LAL", pos: "PG", pts: 33.6, reb: 7.8, ast: 8.3, min: 35.9, gp: 61, starter: true, notes: "Traded from DAL" },
  { name: "Austin Reaves", team: "LAL", pos: "SG", pts: 23.6, reb: 4.7, ast: 5.6, min: 34.7, gp: 47, starter: true, notes: "" },
  { name: "LeBron James", team: "LAL", pos: "SF", pts: 21.0, reb: 6.0, ast: 6.9, min: 33.5, gp: 52, starter: true, notes: "Year 22" },
  { name: "Deandre Ayton", team: "LAL", pos: "C", pts: 12.4, reb: 8.3, ast: 0.9, min: 27.6, gp: 63, starter: true, notes: "" },
  { name: "Rui Hachimura", team: "LAL", pos: "PF", pts: 11.1, reb: 3.2, ast: 0.8, min: 28.5, gp: 59, starter: true, notes: "" },
  { name: "Marcus Smart", team: "LAL", pos: "SG", pts: 9.5, reb: 2.8, ast: 2.8, min: 28.8, gp: 60, starter: false, notes: "" },
  { name: "Jake LaRavia", team: "LAL", pos: "PF", pts: 8.4, reb: 3.8, ast: 1.8, min: 24.7, gp: 73, starter: false, notes: "" },
  { name: "Jaxson Hayes", team: "LAL", pos: "C", pts: 7.0, reb: 4.1, ast: 0.9, min: 17.9, gp: 61, starter: false, notes: "" },

  // === MEMPHIS GRIZZLIES ===
  { name: "Ja Morant", team: "MEM", pos: "PG", pts: 19.5, reb: 3.3, ast: 8.1, min: 28.5, gp: 20, starter: true, notes: "Injury limited" },
  { name: "Jaren Jackson Jr.", team: "MEM", pos: "C", pts: 19.2, reb: 5.8, ast: 1.9, min: 30.7, gp: 45, starter: true, notes: "" },
  { name: "Santi Aldama", team: "MEM", pos: "PF", pts: 14.0, reb: 6.7, ast: 2.9, min: 27.9, gp: 43, starter: true, notes: "" },
  { name: "Zach Edey", team: "MEM", pos: "C", pts: 13.6, reb: 11.1, ast: 1.1, min: 25.8, gp: 11, starter: true, notes: "Sophomore" },
  { name: "Cedric Coward", team: "MEM", pos: "SG", pts: 13.3, reb: 6.1, ast: 2.8, min: 26.0, gp: 55, starter: true, notes: "" },
  { name: "Jaylen Wells", team: "MEM", pos: "SG", pts: 12.5, reb: 3.2, ast: 1.6, min: 26.4, gp: 69, starter: true, notes: "" },
  { name: "Taylor Hendricks", team: "MEM", pos: "PF", pts: 10.9, reb: 4.8, ast: 1.3, min: 24.7, gp: 21, starter: false, notes: "" },
  { name: "Walter Clayton", team: "MEM", pos: "PG", pts: 8.9, reb: 2.1, ast: 5.8, min: 24.8, gp: 17, starter: false, notes: "" },

  // === MIAMI HEAT ===
  { name: "Norman Powell", team: "MIA", pos: "SG", pts: 22.2, reb: 3.6, ast: 2.6, min: 30.1, gp: 54, starter: true, notes: "Traded from LAC" },
  { name: "Tyler Herro", team: "MIA", pos: "SG", pts: 21.3, reb: 4.8, ast: 3.8, min: 30.8, gp: 26, starter: true, notes: "" },
  { name: "Bam Adebayo", team: "MIA", pos: "C", pts: 20.3, reb: 9.8, ast: 3.0, min: 32.1, gp: 64, starter: true, notes: "" },
  { name: "Andrew Wiggins", team: "MIA", pos: "SF", pts: 15.7, reb: 5.0, ast: 2.7, min: 30.6, gp: 59, starter: true, notes: "Traded from GSW" },
  { name: "Jaime Jaquez Jr.", team: "MIA", pos: "SF", pts: 14.8, reb: 5.0, ast: 4.8, min: 28.3, gp: 66, starter: true, notes: "" },
  { name: "Kel'el Ware", team: "MIA", pos: "C", pts: 11.1, reb: 9.3, ast: 0.6, min: 22.5, gp: 68, starter: false, notes: "Sophomore" },
  { name: "Pelle Larsson", team: "MIA", pos: "SG", pts: 11.0, reb: 3.4, ast: 3.3, min: 25.9, gp: 62, starter: false, notes: "" },
  { name: "Davion Mitchell", team: "MIA", pos: "PG", pts: 9.1, reb: 2.6, ast: 6.5, min: 28.4, gp: 62, starter: true, notes: "" },
  { name: "Nikola Jovic", team: "MIA", pos: "PF", pts: 7.4, reb: 3.3, ast: 2.2, min: 17.3, gp: 46, starter: false, notes: "" },

  // === MILWAUKEE BUCKS ===
  { name: "Giannis Antetokounmpo", team: "MIL", pos: "PF", pts: 27.6, reb: 9.8, ast: 5.4, min: 28.9, gp: 36, starter: true, notes: "Injury limited" },
  { name: "Kevin Porter Jr.", team: "MIL", pos: "PG", pts: 17.4, reb: 5.2, ast: 7.4, min: 33.2, gp: 38, starter: true, notes: "" },
  { name: "Ryan Rollins", team: "MIL", pos: "PG", pts: 17.1, reb: 4.6, ast: 5.6, min: 32.1, gp: 70, starter: true, notes: "" },
  { name: "Bobby Portis", team: "MIL", pos: "PF", pts: 13.7, reb: 6.4, ast: 1.6, min: 24.2, gp: 67, starter: false, notes: "" },
  { name: "Kyle Kuzma", team: "MIL", pos: "PF", pts: 13.1, reb: 4.5, ast: 2.6, min: 26.4, gp: 65, starter: true, notes: "" },
  { name: "Myles Turner", team: "MIL", pos: "C", pts: 11.9, reb: 5.3, ast: 1.5, min: 27.1, gp: 66, starter: true, notes: "Traded from IND" },
  { name: "Cam Thomas", team: "MIL", pos: "SG", pts: 10.7, reb: 1.6, ast: 1.9, min: 16.6, gp: 18, starter: false, notes: "Traded from BKN" },
  { name: "A.J. Green", team: "MIL", pos: "SG", pts: 9.5, reb: 2.5, ast: 1.9, min: 28.5, gp: 68, starter: true, notes: "" },
  { name: "Gary Trent Jr.", team: "MIL", pos: "SG", pts: 7.6, reb: 1.0, ast: 1.2, min: 21.1, gp: 60, starter: false, notes: "" },

  // === MINNESOTA TIMBERWOLVES ===
  { name: "Anthony Edwards", team: "MIN", pos: "SG", pts: 29.5, reb: 5.1, ast: 3.7, min: 35.5, gp: 58, starter: true, notes: "" },
  { name: "Julius Randle", team: "MIN", pos: "PF", pts: 21.1, reb: 6.8, ast: 5.1, min: 33.1, gp: 73, starter: true, notes: "" },
  { name: "Jaden McDaniels", team: "MIN", pos: "PF", pts: 14.8, reb: 4.2, ast: 2.7, min: 31.9, gp: 71, starter: true, notes: "" },
  { name: "Naz Reid", team: "MIN", pos: "C", pts: 13.7, reb: 6.3, ast: 2.3, min: 26.1, gp: 70, starter: true, notes: "" },
  { name: "Donte DiVincenzo", team: "MIN", pos: "SG", pts: 12.3, reb: 4.3, ast: 4.0, min: 30.9, gp: 73, starter: true, notes: "" },
  { name: "Rudy Gobert", team: "MIN", pos: "C", pts: 11.0, reb: 11.5, ast: 1.7, min: 31.4, gp: 70, starter: true, notes: "" },
  { name: "Bones Hyland", team: "MIN", pos: "PG", pts: 8.0, reb: 1.6, ast: 2.6, min: 15.7, gp: 64, starter: false, notes: "" },
  { name: "Mike Conley", team: "MIN", pos: "PG", pts: 4.2, reb: 1.8, ast: 2.9, min: 18.1, gp: 48, starter: false, notes: "" },

  // === NEW ORLEANS PELICANS ===
  { name: "Trey Murphy III", team: "NOP", pos: "SF", pts: 21.7, reb: 5.7, ast: 3.8, min: 35.5, gp: 64, starter: true, notes: "" },
  { name: "Zion Williamson", team: "NOP", pos: "PF", pts: 21.4, reb: 5.8, ast: 3.3, min: 29.8, gp: 56, starter: true, notes: "" },
  { name: "Dejounte Murray", team: "NOP", pos: "PG", pts: 17.6, reb: 5.1, ast: 6.7, min: 27.6, gp: 11, starter: true, notes: "Injury limited" },
  { name: "Saddiq Bey", team: "NOP", pos: "SF", pts: 17.4, reb: 5.7, ast: 2.6, min: 31.1, gp: 66, starter: true, notes: "" },
  { name: "Jordan Poole", team: "NOP", pos: "PG", pts: 13.3, reb: 2.0, ast: 3.0, min: 24.1, gp: 35, starter: false, notes: "" },
  { name: "Jeremiah Fears", team: "NOP", pos: "PG", pts: 13.1, reb: 3.6, ast: 3.2, min: 24.8, gp: 73, starter: true, notes: "Rookie" },
  { name: "Derik Queen", team: "NOP", pos: "C", pts: 11.3, reb: 6.8, ast: 3.8, min: 24.5, gp: 72, starter: true, notes: "Rookie" },
  { name: "Herbert Jones", team: "NOP", pos: "SF", pts: 9.1, reb: 3.5, ast: 2.8, min: 29.1, gp: 50, starter: false, notes: "" },
  { name: "Bryce McGowens", team: "NOP", pos: "SG", pts: 8.1, reb: 2.1, ast: 1.5, min: 21.0, gp: 42, starter: false, notes: "" },
  { name: "Jose Alvarado", team: "NOP", pos: "PG", pts: 7.9, reb: 2.8, ast: 3.1, min: 21.9, gp: 41, starter: false, notes: "" },

  // === NEW YORK KNICKS ===
  { name: "Jalen Brunson", team: "NYK", pos: "PG", pts: 26.2, reb: 3.4, ast: 6.6, min: 34.9, gp: 67, starter: true, notes: "" },
  { name: "Karl-Anthony Towns", team: "NYK", pos: "C", pts: 20.2, reb: 12.0, ast: 2.8, min: 31.0, gp: 68, starter: true, notes: "" },
  { name: "OG Anunoby", team: "NYK", pos: "PF", pts: 16.8, reb: 5.2, ast: 2.2, min: 33.1, gp: 59, starter: true, notes: "" },
  { name: "Mikal Bridges", team: "NYK", pos: "SF", pts: 14.7, reb: 4.1, ast: 3.9, min: 33.4, gp: 73, starter: true, notes: "" },
  { name: "Miles McBride", team: "NYK", pos: "SG", pts: 12.9, reb: 2.6, ast: 2.8, min: 28.0, gp: 35, starter: true, notes: "" },
  { name: "Josh Hart", team: "NYK", pos: "SF", pts: 12.2, reb: 7.6, ast: 5.0, min: 30.1, gp: 58, starter: false, notes: "" },
  { name: "Landry Shamet", team: "NYK", pos: "SG", pts: 9.6, reb: 1.8, ast: 1.5, min: 23.0, gp: 46, starter: false, notes: "" },
  { name: "Jordan Clarkson", team: "NYK", pos: "SG", pts: 9.0, reb: 1.7, ast: 1.4, min: 18.2, gp: 63, starter: false, notes: "" },
  { name: "Jose Alvarado", team: "NYK", pos: "PG", pts: 5.8, reb: 1.8, ast: 4.0, min: 16.4, gp: 21, starter: false, notes: "" },
  { name: "Mitchell Robinson", team: "NYK", pos: "C", pts: 5.5, reb: 8.9, ast: 0.9, min: 19.5, gp: 54, starter: false, notes: "" },

  // === OKLAHOMA CITY THUNDER ===
  { name: "Shai Gilgeous-Alexander", team: "OKC", pos: "PG", pts: 31.5, reb: 4.4, ast: 6.6, min: 33.4, gp: 61, starter: true, notes: "MVP candidate" },
  { name: "Chet Holmgren", team: "OKC", pos: "PF", pts: 17.1, reb: 8.9, ast: 1.7, min: 29.2, gp: 63, starter: true, notes: "" },
  { name: "Jalen Williams", team: "OKC", pos: "SG", pts: 17.1, reb: 4.6, ast: 5.4, min: 28.6, gp: 28, starter: true, notes: "" },
  { name: "Ajay Mitchell", team: "OKC", pos: "SG", pts: 14.1, reb: 3.5, ast: 3.6, min: 26.1, gp: 50, starter: true, notes: "" },
  { name: "Jared McCain", team: "OKC", pos: "SG", pts: 12.0, reb: 2.2, ast: 0.9, min: 19.3, gp: 21, starter: false, notes: "Traded from PHI" },
  { name: "Isaiah Joe", team: "OKC", pos: "SG", pts: 10.8, reb: 2.7, ast: 1.4, min: 21.8, gp: 64, starter: false, notes: "" },
  { name: "Isaiah Hartenstein", team: "OKC", pos: "C", pts: 9.6, reb: 9.5, ast: 3.8, min: 24.9, gp: 41, starter: true, notes: "" },
  { name: "Luguentz Dort", team: "OKC", pos: "SF", pts: 8.5, reb: 3.8, ast: 1.2, min: 27.6, gp: 60, starter: true, notes: "" },
  { name: "Cason Wallace", team: "OKC", pos: "SG", pts: 8.5, reb: 3.1, ast: 2.7, min: 27.0, gp: 70, starter: false, notes: "" },

  // === ORLANDO MAGIC ===
  { name: "Paolo Banchero", team: "ORL", pos: "PF", pts: 22.7, reb: 8.4, ast: 5.1, min: 35.0, gp: 62, starter: true, notes: "" },
  { name: "Franz Wagner", team: "ORL", pos: "SF", pts: 21.3, reb: 5.8, ast: 3.6, min: 31.8, gp: 28, starter: true, notes: "Injury limited" },
  { name: "Desmond Bane", team: "ORL", pos: "SG", pts: 20.3, reb: 4.2, ast: 4.2, min: 34.2, gp: 72, starter: true, notes: "Traded from MEM" },
  { name: "Anthony Black", team: "ORL", pos: "PG", pts: 15.3, reb: 3.9, ast: 3.8, min: 30.7, gp: 60, starter: true, notes: "" },
  { name: "Jalen Suggs", team: "ORL", pos: "PG", pts: 13.8, reb: 3.8, ast: 5.3, min: 27.0, gp: 47, starter: true, notes: "" },
  { name: "Wendell Carter Jr.", team: "ORL", pos: "C", pts: 11.9, reb: 7.5, ast: 2.1, min: 29.6, gp: 68, starter: true, notes: "" },
  { name: "Tristan Da Silva", team: "ORL", pos: "SF", pts: 9.8, reb: 3.7, ast: 1.5, min: 24.6, gp: 67, starter: false, notes: "" },
  { name: "Moritz Wagner", team: "ORL", pos: "C", pts: 7.6, reb: 3.4, ast: 0.8, min: 12.9, gp: 30, starter: false, notes: "" },
  { name: "Goga Bitadze", team: "ORL", pos: "C", pts: 5.6, reb: 4.8, ast: 1.3, min: 15.0, gp: 54, starter: false, notes: "" },

  // === PHILADELPHIA 76ERS ===
  { name: "Tyrese Maxey", team: "PHI", pos: "PG", pts: 29.0, reb: 4.1, ast: 6.7, min: 38.3, gp: 61, starter: true, notes: "" },
  { name: "Joel Embiid", team: "PHI", pos: "C", pts: 26.9, reb: 7.5, ast: 4.0, min: 31.1, gp: 34, starter: true, notes: "Load management" },
  { name: "Paul George", team: "PHI", pos: "PF", pts: 16.4, reb: 5.2, ast: 3.7, min: 30.4, gp: 28, starter: true, notes: "Injury limited" },
  { name: "VJ Edgecombe", team: "PHI", pos: "SG", pts: 16.1, reb: 5.7, ast: 4.0, min: 34.9, gp: 66, starter: true, notes: "Rookie" },
  { name: "Kelly Oubre Jr.", team: "PHI", pos: "SF", pts: 14.7, reb: 4.9, ast: 1.7, min: 32.4, gp: 41, starter: true, notes: "" },
  { name: "Quentin Grimes", team: "PHI", pos: "SG", pts: 13.9, reb: 3.7, ast: 3.5, min: 30.1, gp: 66, starter: true, notes: "" },
  { name: "Dominick Barlow", team: "PHI", pos: "PF", pts: 8.1, reb: 4.8, ast: 1.3, min: 24.2, gp: 62, starter: false, notes: "" },
  { name: "Trendon Watford", team: "PHI", pos: "PF", pts: 6.8, reb: 3.5, ast: 2.6, min: 17.0, gp: 50, starter: false, notes: "" },

  // === PHOENIX SUNS ===
  { name: "Devin Booker", team: "PHX", pos: "SG", pts: 25.5, reb: 3.9, ast: 5.9, min: 33.5, gp: 57, starter: true, notes: "" },
  { name: "Dillon Brooks", team: "PHX", pos: "SF", pts: 20.9, reb: 3.7, ast: 1.8, min: 30.6, gp: 50, starter: true, notes: "" },
  { name: "Jalen Green", team: "PHX", pos: "SG", pts: 17.7, reb: 3.6, ast: 2.9, min: 26.2, gp: 25, starter: false, notes: "Traded from HOU" },
  { name: "Grayson Allen", team: "PHX", pos: "SG", pts: 17.3, reb: 3.0, ast: 4.1, min: 29.7, gp: 45, starter: true, notes: "" },
  { name: "Collin Gillespie", team: "PHX", pos: "PG", pts: 13.3, reb: 4.1, ast: 4.7, min: 28.9, gp: 72, starter: true, notes: "" },
  { name: "Mark Williams", team: "PHX", pos: "C", pts: 11.6, reb: 8.1, ast: 1.0, min: 23.6, gp: 56, starter: true, notes: "Traded from CHA" },
  { name: "Royce O'Neale", team: "PHX", pos: "SF", pts: 10.0, reb: 4.8, ast: 2.8, min: 29.1, gp: 70, starter: true, notes: "" },
  { name: "Jordan Goodwin", team: "PHX", pos: "PG", pts: 8.7, reb: 4.9, ast: 2.2, min: 22.5, gp: 63, starter: false, notes: "" },
  { name: "Oso Ighodaro", team: "PHX", pos: "PF", pts: 6.4, reb: 4.9, ast: 2.2, min: 22.0, gp: 73, starter: false, notes: "" },

  // === PORTLAND TRAIL BLAZERS ===
  { name: "Deni Avdija", team: "POR", pos: "SF", pts: 23.9, reb: 6.9, ast: 6.7, min: 33.1, gp: 58, starter: true, notes: "" },
  { name: "Shaedon Sharpe", team: "POR", pos: "SG", pts: 21.4, reb: 4.4, ast: 2.6, min: 30.0, gp: 48, starter: true, notes: "" },
  { name: "Jerami Grant", team: "POR", pos: "PF", pts: 18.6, reb: 3.5, ast: 2.2, min: 29.8, gp: 56, starter: true, notes: "" },
  { name: "Jrue Holiday", team: "POR", pos: "PG", pts: 15.8, reb: 4.5, ast: 6.3, min: 28.9, gp: 45, starter: true, notes: "Traded from BOS" },
  { name: "Scoot Henderson", team: "POR", pos: "PG", pts: 13.9, reb: 2.8, ast: 3.9, min: 23.6, gp: 22, starter: false, notes: "" },
  { name: "Toumani Camara", team: "POR", pos: "PF", pts: 13.0, reb: 5.2, ast: 2.5, min: 33.1, gp: 74, starter: true, notes: "" },
  { name: "Donovan Clingan", team: "POR", pos: "C", pts: 12.4, reb: 11.8, ast: 2.2, min: 27.2, gp: 69, starter: true, notes: "Sophomore" },
  { name: "Caleb Love", team: "POR", pos: "SG", pts: 11.0, reb: 2.5, ast: 2.7, min: 21.9, gp: 46, starter: false, notes: "" },
  { name: "Robert Williams", team: "POR", pos: "C", pts: 6.8, reb: 7.0, ast: 1.0, min: 17.0, gp: 51, starter: false, notes: "" },

  // === SACRAMENTO KINGS ===
  { name: "Zach LaVine", team: "SAC", pos: "SG", pts: 19.2, reb: 2.8, ast: 2.3, min: 31.4, gp: 39, starter: true, notes: "Traded from CHI" },
  { name: "DeMar DeRozan", team: "SAC", pos: "PF", pts: 18.2, reb: 3.0, ast: 4.1, min: 31.5, gp: 72, starter: true, notes: "" },
  { name: "Domantas Sabonis", team: "SAC", pos: "C", pts: 15.8, reb: 11.4, ast: 4.1, min: 29.7, gp: 19, starter: true, notes: "Injury limited" },
  { name: "Russell Westbrook", team: "SAC", pos: "SF", pts: 15.2, reb: 5.4, ast: 6.7, min: 29.0, gp: 64, starter: true, notes: "" },
  { name: "Keegan Murray", team: "SAC", pos: "PF", pts: 14.0, reb: 5.7, ast: 1.7, min: 34.5, gp: 23, starter: true, notes: "" },
  { name: "Dennis Schroder", team: "SAC", pos: "PG", pts: 12.8, reb: 3.1, ast: 5.3, min: 26.4, gp: 40, starter: true, notes: "" },
  { name: "Malik Monk", team: "SAC", pos: "SG", pts: 12.7, reb: 1.9, ast: 3.0, min: 22.1, gp: 56, starter: false, notes: "" },
  { name: "Maxime Raynaud", team: "SAC", pos: "C", pts: 11.9, reb: 7.3, ast: 1.3, min: 25.8, gp: 65, starter: true, notes: "Rookie" },
  { name: "Precious Achiuwa", team: "SAC", pos: "C", pts: 9.3, reb: 6.5, ast: 1.3, min: 23.1, gp: 64, starter: false, notes: "" },

  // === SAN ANTONIO SPURS ===
  { name: "Victor Wembanyama", team: "SAS", pos: "C", pts: 24.2, reb: 11.2, ast: 3.0, min: 29.2, gp: 58, starter: true, notes: "Sophomore star" },
  { name: "De'Aaron Fox", team: "SAS", pos: "PG", pts: 18.9, reb: 3.8, ast: 6.3, min: 31.3, gp: 63, starter: true, notes: "Traded from SAC" },
  { name: "Stephon Castle", team: "SAS", pos: "PG", pts: 16.5, reb: 5.0, ast: 7.1, min: 29.6, gp: 61, starter: true, notes: "Sophomore" },
  { name: "Devin Vassell", team: "SAS", pos: "SG", pts: 14.2, reb: 3.8, ast: 2.5, min: 30.6, gp: 58, starter: true, notes: "" },
  { name: "Keldon Johnson", team: "SAS", pos: "SF", pts: 13.0, reb: 5.5, ast: 1.3, min: 23.2, gp: 73, starter: true, notes: "" },
  { name: "Dylan Harper", team: "SAS", pos: "SG", pts: 11.5, reb: 3.4, ast: 3.9, min: 22.3, gp: 60, starter: false, notes: "Rookie" },
  { name: "Julian Champagnie", team: "SAS", pos: "SF", pts: 11.1, reb: 5.8, ast: 1.5, min: 27.7, gp: 73, starter: false, notes: "" },
  { name: "Harrison Barnes", team: "SAS", pos: "PF", pts: 10.3, reb: 2.9, ast: 2.0, min: 26.3, gp: 68, starter: true, notes: "" },
  { name: "Luke Kornet", team: "SAS", pos: "C", pts: 6.6, reb: 6.3, ast: 1.8, min: 21.0, gp: 61, starter: false, notes: "" },

  // === TORONTO RAPTORS ===
  { name: "Brandon Ingram", team: "TOR", pos: "SF", pts: 21.5, reb: 5.6, ast: 3.7, min: 34.1, gp: 69, starter: true, notes: "Traded from NOP" },
  { name: "RJ Barrett", team: "TOR", pos: "SF", pts: 18.9, reb: 5.3, ast: 3.3, min: 30.0, gp: 48, starter: true, notes: "" },
  { name: "Scottie Barnes", team: "TOR", pos: "PF", pts: 18.5, reb: 7.8, ast: 5.5, min: 34.0, gp: 70, starter: true, notes: "" },
  { name: "Immanuel Quickley", team: "TOR", pos: "PG", pts: 16.9, reb: 4.1, ast: 6.0, min: 32.4, gp: 67, starter: true, notes: "" },
  { name: "Sandro Mamukelashvili", team: "TOR", pos: "C", pts: 10.9, reb: 4.8, ast: 1.9, min: 21.8, gp: 70, starter: true, notes: "" },
  { name: "Jakob Poeltl", team: "TOR", pos: "C", pts: 10.4, reb: 7.5, ast: 2.1, min: 25.5, gp: 36, starter: true, notes: "" },
  { name: "Jamal Shead", team: "TOR", pos: "PG", pts: 6.5, reb: 1.9, ast: 5.2, min: 22.2, gp: 72, starter: false, notes: "Rookie" },
  { name: "Gradey Dick", team: "TOR", pos: "SG", pts: 6.3, reb: 2.1, ast: 0.7, min: 15.0, gp: 67, starter: false, notes: "" },

  // === UTAH JAZZ ===
  { name: "Lauri Markkanen", team: "UTA", pos: "PF", pts: 26.7, reb: 6.9, ast: 2.1, min: 34.4, gp: 42, starter: true, notes: "" },
  { name: "Keyonte George", team: "UTA", pos: "PG", pts: 23.6, reb: 3.7, ast: 6.1, min: 33.1, gp: 54, starter: true, notes: "" },
  { name: "Walker Kessler", team: "UTA", pos: "C", pts: 14.4, reb: 10.8, ast: 3.0, min: 30.8, gp: 5, starter: true, notes: "Injury limited" },
  { name: "Brice Sensabaugh", team: "UTA", pos: "SF", pts: 14.1, reb: 3.0, ast: 1.7, min: 22.8, gp: 67, starter: true, notes: "" },
  { name: "Ace Bailey", team: "UTA", pos: "SF", pts: 13.4, reb: 4.1, ast: 1.8, min: 27.1, gp: 64, starter: true, notes: "Rookie" },
  { name: "Isaiah Collier", team: "UTA", pos: "PG", pts: 11.7, reb: 2.5, ast: 7.2, min: 25.7, gp: 59, starter: false, notes: "" },
  { name: "Jusuf Nurkic", team: "UTA", pos: "C", pts: 10.9, reb: 10.4, ast: 4.8, min: 26.4, gp: 41, starter: true, notes: "" },
  { name: "Kyle Filipowski", team: "UTA", pos: "C", pts: 10.5, reb: 6.9, ast: 2.4, min: 22.9, gp: 70, starter: false, notes: "" },
  { name: "Cody Williams", team: "UTA", pos: "SG", pts: 7.7, reb: 2.8, ast: 1.6, min: 22.7, gp: 58, starter: false, notes: "" },

  // === WASHINGTON WIZARDS ===
  { name: "CJ McCollum", team: "WAS", pos: "SG", pts: 18.8, reb: 3.5, ast: 3.6, min: 30.9, gp: 35, starter: true, notes: "Traded from ATL" },
  { name: "Alex Sarr", team: "WAS", pos: "C", pts: 16.5, reb: 7.4, ast: 2.7, min: 27.3, gp: 47, starter: true, notes: "Sophomore" },
  { name: "Trae Young", team: "WAS", pos: "PG", pts: 15.2, reb: 3.0, ast: 6.2, min: 20.8, gp: 5, starter: true, notes: "Traded from ATL" },
  { name: "Kyshawn George", team: "WAS", pos: "SF", pts: 14.8, reb: 5.1, ast: 4.5, min: 29.0, gp: 48, starter: true, notes: "" },
  { name: "Jaden Hardy", team: "WAS", pos: "SG", pts: 13.2, reb: 1.8, ast: 0.9, min: 20.9, gp: 17, starter: false, notes: "" },
  { name: "Tre Johnson", team: "WAS", pos: "SG", pts: 12.4, reb: 2.8, ast: 2.0, min: 24.1, gp: 56, starter: true, notes: "Rookie" },
  { name: "Bilal Coulibaly", team: "WAS", pos: "SG", pts: 11.3, reb: 4.4, ast: 2.7, min: 26.7, gp: 50, starter: true, notes: "" },
  { name: "Bub Carrington", team: "WAS", pos: "PG", pts: 10.2, reb: 3.6, ast: 4.5, min: 27.7, gp: 72, starter: true, notes: "" },
  { name: "Khris Middleton", team: "WAS", pos: "SF", pts: 10.3, reb: 3.9, ast: 3.3, min: 24.3, gp: 34, starter: false, notes: "Traded from MIL" },
  { name: "Marvin Bagley III", team: "WAS", pos: "PF", pts: 10.1, reb: 5.7, ast: 1.5, min: 19.2, gp: 38, starter: false, notes: "" },
];

// Alias for backwards compatibility
const PLAYERS = SAMPLE_PLAYERS;

// ---------- League Average Stats by Position (for ranking/colour coding) ----------
function computeLeagueAverages() {
  const teams = Object.keys(TEAM_DEFENSE_VS_POSITION);
  const avgs = {};
  for (const pos of POSITIONS) {
    let pts = 0, reb = 0, ast = 0;
    for (const t of teams) {
      pts += TEAM_DEFENSE_VS_POSITION[t][pos].pts;
      reb += TEAM_DEFENSE_VS_POSITION[t][pos].reb;
      ast += TEAM_DEFENSE_VS_POSITION[t][pos].ast;
    }
    avgs[pos] = { pts: pts / teams.length, reb: reb / teams.length, ast: ast / teams.length };
  }
  return avgs;
}

// ---------- Defensive Rankings (1 = allows most, 30 = allows least) ----------
function computeDefensiveRankings() {
  const teams = Object.keys(TEAM_DEFENSE_VS_POSITION);
  const rankings = {};
  for (const pos of POSITIONS) {
    for (const stat of ["pts", "reb", "ast"]) {
      const sorted = [...teams].sort((a, b) =>
        TEAM_DEFENSE_VS_POSITION[b][pos][stat] - TEAM_DEFENSE_VS_POSITION[a][pos][stat]
      );
      sorted.forEach((t, i) => {
        if (!rankings[t]) rankings[t] = {};
        if (!rankings[t][pos]) rankings[t][pos] = {};
        rankings[t][pos][stat] = i + 1; // 1 = allows most
      });
    }
  }
  return rankings;
}

const LEAGUE_AVERAGES = computeLeagueAverages();
const DEFENSIVE_RANKINGS = computeDefensiveRankings();
