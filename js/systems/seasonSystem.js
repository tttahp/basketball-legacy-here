// ============================================================
// SEASON SYSTEM
// ------------------------------------------------------------
// Quản lý:
// - Year / Month / Week / Day
// - Career phase
// - School
// - D-League
// - Draft
// - BLA
// - Offseason
// - Playoff state
// - Season state
//
// KHÔNG quản lý:
// - Player progression chi tiết
// - NPC generation
// - Roster reset
// - Draft selection
// - Match simulation
//
// Những hệ đó nằm ở system riêng.
// ============================================================


// ============================================================
// CAREER TIMELINE
// ============================================================

export const CareerTimeline = {

  START_YEAR: 2023,

  SCHOOL_YEAR_1: 2023,

  SCHOOL_YEAR_2: 2024,

  DLEAGUE_YEAR: 2025,

  DRAFT_YEAR: 2026,

  BLA_START_YEAR: 2026

};


// ============================================================
// SEASON PHASE
// ============================================================

export const SeasonPhase = {

  SCHOOL: "SCHOOL",

  DLEAGUE: "DLEAGUE",

  DRAFT: "DRAFT",

  BLA: "BLA",

  OFFSEASON: "OFFSEASON"

};


// ============================================================
// SEASON CONFIG
// ============================================================

export const SeasonConfig = {

  SCHOOL: {

    games: 12

  },

  DLEAGUE: {

    games: 43

  },

  BLA: {

    games: 82

  }

};


// ============================================================
// SEASON STATE
// ============================================================

export const seasonState = {

  // --------------------------
  // TIME
  // --------------------------

  year: CareerTimeline.START_YEAR,

  month: 1,

  week: 1,

  day: 1,


  // --------------------------
  // CURRENT PHASE
  // --------------------------

  phase: SeasonPhase.SCHOOL,


  // --------------------------
  // MATCH / SEASON
  // --------------------------

  gamePlayed: 0,

  seasonFinished: false,

  playoff: false,


  // --------------------------
  // OFFSEASON
  // --------------------------

  offseason: false,


  // --------------------------
  // DRAFT
  // --------------------------

  draftFinished: false

};


// ============================================================
// BASIC GETTERS
// ============================================================

export function getSeasonState() {

  return seasonState;

}


export function getCurrentYear() {

  return seasonState.year;

}


export function getCurrentMonth() {

  return seasonState.month;

}


export function getCurrentWeek() {

  return seasonState.week;

}


export function getCurrentDay() {

  return seasonState.day;

}


export function getCurrentPhase() {

  return seasonState.phase;

}


// ============================================================
// PHASE CHECKS
// ============================================================

export function isSchool() {

  return (
    seasonState.phase === SeasonPhase.SCHOOL
  );

}


export function isDLeague() {

  return (
    seasonState.phase === SeasonPhase.DLEAGUE
  );

}


export function isDraft() {

  return (
    seasonState.phase === SeasonPhase.DRAFT
  );

}


export function isBLA() {

  return (
    seasonState.phase === SeasonPhase.BLA
  );

}


export function isOffseason() {

  return (
    seasonState.phase === SeasonPhase.OFFSEASON
  );

}


// ============================================================
// CAREER PHASE DETECTION
// ------------------------------------------------------------
// Dựa trên timeline đã chốt.
// Không tự khóa giải bằng OVR ở đây.
// ============================================================

export function getCareerPhase(year = seasonState.year) {

  if (year === CareerTimeline.SCHOOL_YEAR_1) {

    return SeasonPhase.SCHOOL;

  }


  if (year === CareerTimeline.SCHOOL_YEAR_2) {

    return SeasonPhase.SCHOOL;

  }


  if (year === CareerTimeline.DLEAGUE_YEAR) {

    return SeasonPhase.DLEAGUE;

  }


  if (year >= CareerTimeline.DRAFT_YEAR) {

    return SeasonPhase.BLA;

  }


  return SeasonPhase.SCHOOL;

}


// ============================================================
// SET PHASE
// ============================================================

export function setPhase(phase) {

  if (!Object.values(SeasonPhase).includes(phase)) {

    throw new Error(
      `Invalid season phase: ${phase}`
    );

  }

  seasonState.phase = phase;

}


// ============================================================
// ENTER SCHOOL
// ============================================================

export function enterSchool() {

  seasonState.phase =
    SeasonPhase.SCHOOL;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

  seasonState.offseason = false;

  seasonState.draftFinished = false;

  seasonState.seasonFinished = false;

}


// ============================================================
// ENTER D-LEAGUE
// ============================================================

export function enterDLeague() {

  seasonState.phase =
    SeasonPhase.DLEAGUE;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

  seasonState.offseason = false;

  seasonState.draftFinished = false;

  seasonState.seasonFinished = false;

}


// ============================================================
// ENTER DRAFT
// ============================================================

export function enterDraft() {

  seasonState.phase =
    SeasonPhase.DRAFT;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

  seasonState.offseason = false;

  seasonState.draftFinished = false;

  seasonState.seasonFinished = false;

}


// ============================================================
// PROCESS SCHOOL SEASON
// ============================================================

export function processSchoolSeason() {

  if (
    seasonState.phase !==
    SeasonPhase.SCHOOL
  ) {

    return false;

  }


  if (
    seasonState.gamePlayed >=
    SeasonConfig.SCHOOL.games
  ) {

    seasonState.seasonFinished = true;

  }


  return true;

}


// ============================================================
// PROCESS D-LEAGUE SEASON
// ============================================================

export function processDLeagueSeason() {

  if (
    seasonState.phase !==
    SeasonPhase.DLEAGUE
  ) {

    return false;

  }


  if (
    seasonState.gamePlayed >=
    SeasonConfig.DLEAGUE.games
  ) {

    seasonState.seasonFinished = true;

  }


  return true;

}


// ============================================================
// PROCESS DRAFT
// ============================================================
//
// Draft đầu tiên: 2026.
// Các mùa BLA sau đó cũng có draft.
//
// Draft pool 60 người được tạo bởi
// rosterGenerator / npcGenerator.
//
// Function này chỉ xác nhận phase,
// KHÔNG tự chọn player.
// ============================================================

export function processDraft() {

  if (
    seasonState.phase !==
    SeasonPhase.DRAFT
  ) {

    return false;

  }


  if (
    seasonState.year <
    CareerTimeline.DRAFT_YEAR
  ) {

    return false;

  }


  return true;

}


// ============================================================
// ENTER BLA
// ============================================================
//
// QUAN TRỌNG:
// Không set year = 2026.
//
// Nếu đang ở 2026:
//   → BLA 2026
//
// Nếu đang ở 2027:
//   → BLA 2027
//
// Nếu đang ở 2028:
//   → BLA 2028
//
// Không reset BLA roster ở đây.
// ============================================================

export function enterBLA() {

  seasonState.phase =
    SeasonPhase.BLA;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

  seasonState.offseason = false;

  seasonState.draftFinished = true;

  seasonState.seasonFinished = false;

}


// ============================================================
// PROCESS BLA SEASON
// ============================================================

export function processBLASeason() {

  if (
    seasonState.year <
    CareerTimeline.BLA_START_YEAR
  ) {

    return false;

  }


  if (
    seasonState.phase !==
    SeasonPhase.BLA
  ) {

    return false;

  }


  SeasonConfig.BLA.games = 82;


  if (
    seasonState.seasonFinished
  ) {

    startOffseason();

  }


  return true;

}

// ============================================================
// OFFSEASON
// ============================================================

export function startOffseason() {

  seasonState.phase =
    SeasonPhase.OFFSEASON;

  seasonState.offseason = true;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

}


// ============================================================
// PROCESS OFFSEASON
// ============================================================
//
// BLA 2026
//   ↓
// OFFSEASON
//   ↓
// năm mới
//   ↓
// DRAFT
//
// Không reset BLA roster ở đây.
// Không generate NPC ở đây.
// Không xử lý draft selection ở đây.
// ============================================================

export function processOffseason() {

  if (
    seasonState.phase !==
    SeasonPhase.OFFSEASON
  ) {

    return false;

  }


  if (!seasonState.offseason) {

    return false;

  }


  seasonState.year++;

  seasonState.phase =
    SeasonPhase.DRAFT;

  seasonState.month = 1;

  seasonState.week = 1;

  seasonState.day = 1;

  seasonState.gamePlayed = 0;

  seasonState.playoff = false;

  seasonState.offseason = false;

  seasonState.draftFinished = false;

  seasonState.seasonFinished = false;


  return true;

}


// ============================================================
// FINISH SEASON
// ============================================================

export function finishSeason() {

  seasonState.seasonFinished = true;

}


// ============================================================
// PLAYOFF
// ============================================================

export function startPlayoff() {

  seasonState.playoff = true;

}


export function endPlayoff() {

  seasonState.playoff = false;

}


// ============================================================
// TIME
// ============================================================

export const WeekDays = [

  "MONDAY",

  "TUESDAY",

  "WEDNESDAY",

  "THURSDAY",

  "FRIDAY",

  "SATURDAY",

  "SUNDAY"

];


// ============================================================
// CURRENT WEEK DAY
// ============================================================

export function getWeekDay() {

  return WeekDays[
    (seasonState.day - 1) % 7
  ];

}


// ============================================================
// TRAINING DAY
// ============================================================

export function isTrainingDay() {

  const day =
    getWeekDay();

  return (

    day === "MONDAY" ||

    day === "TUESDAY" ||

    day === "WEDNESDAY" ||

    day === "THURSDAY" ||

    day === "FRIDAY"

  );

}


// ============================================================
// EVENT DAY
// ============================================================

export function isEventDay() {

  const day =
    getWeekDay();

  return (

    day === "SATURDAY" ||

    day === "SUNDAY"

  );

}


// ============================================================
// ADVANCE DAY
// ============================================================
//
// 30 ngày = 1 tháng.
// 12 tháng = 1 năm.
//
// Week được cập nhật theo ngày.
// ============================================================

export function nextDay() {

  seasonState.day++;


  // Mỗi 7 ngày tăng 1 tuần.

  if (
    seasonState.day % 7 === 1
  ) {

    seasonState.week++;

  }


  // Hết tháng.

  if (
    seasonState.day > 30
  ) {

    seasonState.day = 1;

    seasonState.month++;

  }


  // Hết năm.

  if (
    seasonState.month > 12
  ) {

    seasonState.month = 1;

    seasonState.week = 1;

    seasonState.year++;

  }

}


// ============================================================
// ADVANCE WEEK
// ============================================================

export function nextWeek() {

  seasonState.week++;

  seasonState.day += 7;


  while (
    seasonState.day > 30
  ) {

    seasonState.day -= 30;

    seasonState.month++;

  }


  if (
    seasonState.month > 12
  ) {

    seasonState.month = 1;

    seasonState.year++;

  }

}


// ============================================================
// ADVANCE MONTH
// ============================================================

export function nextMonth() {

  seasonState.month++;

  seasonState.day = 1;

  seasonState.week = 1;


  if (
    seasonState.month > 12
  ) {

    seasonState.month = 1;

    seasonState.year++;

  }

}


// ============================================================
// ADVANCE YEAR
// ============================================================

export function nextYear() {

  seasonState.year++;

  seasonState.month = 1;

  seasonState.week = 1;

  seasonState.day = 1;

}


// ============================================================
// NEXT PHASE
// ============================================================
//
// Chỉ chuyển phase cơ bản.
// Draft selection / roster management
// xử lý ở system tương ứng.
// ============================================================

export function nextPhase() {

  switch (
    seasonState.phase
  ) {

    case SeasonPhase.SCHOOL:

      if (
        seasonState.year <
        CareerTimeline.DLEAGUE_YEAR
      ) {

        enterSchool();

      } else {

        enterDLeague();

      }

      break;


    case SeasonPhase.DLEAGUE:

      enterDraft();

      break;


    case SeasonPhase.DRAFT:

      enterBLA();

      break;


    case SeasonPhase.BLA:

      startOffseason();

      break;


    case SeasonPhase.OFFSEASON:

      processOffseason();

      break;


    default:

      break;

  }

}


// ============================================================
// END SEASON
// ============================================================
//
// Alias để tương thích với code cũ.
// ============================================================

export function endSeason() {

  finishSeason();

}


// ============================================================
// SEASON FINISHED
// ============================================================

export function isSeasonFinished() {

  return seasonState.seasonFinished;

}


// ============================================================
// CURRENT DATE
// ============================================================

export function getCurrentDate() {

  return {

    year:
      seasonState.year,

    month:
      seasonState.month,

    day:
      seasonState.day

  };

}


// ============================================================
// SAVE
// ============================================================

export function getSeasonSaveData() {

  return structuredClone(
    seasonState
  );

}


// ============================================================
// LOAD
// ============================================================

export function loadSeasonSaveData(
  saveData
) {

  if (!saveData) {

    return false;

  }


  Object.assign(

    seasonState,

    structuredClone(saveData)

  );


  return true;

}


// ============================================================
// EXPORT
// ============================================================

export {

  CareerTimeline,

  SeasonPhase,

  SeasonConfig,

  seasonState,

  getSeasonState,

  resetSeason,

  getCurrentYear,

  getCurrentMonth,

  getCurrentWeek,

  getCurrentDay,

  getCurrentPhase,

  getCareerPhase,

  setPhase,

  enterSchool,

  enterDLeague,

  enterDraft,

  processSchoolSeason,

  processDLeagueSeason,

  processDraft,

  enterBLA,

  processBLASeason,

  startOffseason,

  processOffseason,

  finishSeason,

  startPlayoff,

  endPlayoff,

  endSeason,

  nextDay,

  nextWeek,

  nextMonth,

  nextYear,

  nextPhase,

  getWeekDay,

  isTrainingDay,

  isEventDay,

  isSchool,

  isDLeague,

  isDraft,

  isBLA,

  isOffseason,

  isSeasonFinished,

  getCurrentDate,

  getSeasonSaveData,

  loadSeasonSaveData

};