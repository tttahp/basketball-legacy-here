// data/performanceEngine.js

import {
  matchDay
} from "../systems/trainingSystem.js";

// ========================================
// CONSTANTS
// ========================================

const CONDITION = {

  EXCELLENT: "Excellent",
  GOOD: "Good",
  HEALTHY: "Healthy",
  SICK: "Sick",
  EXHAUSTED: "Exhausted"

};


// ========================================
// CLAMP
// ========================================

function clamp(
  value,
  min = 0,
  max = 100
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


// ========================================
// RANDOM
// ========================================
//
// Chỉ dùng cho in-game performance state.
// Không dùng để generate boxscore.
//
// ========================================

export function random(
  min,
  max
) {

  return Math.floor(
    Math.random() *
    (max - min + 1)
  ) + min;

}


// ========================================
// GET CONDITION
// ========================================

function getCondition(
  player
) {

  return (
    player?.status?.condition ||
    CONDITION.HEALTHY
  );

}


// ========================================
// START CONFIDENCE
// ========================================

function calculateStartingConfidence(
  player
) {

  let value = 50;

  const morale =
    player?.status?.morale;


  switch (morale) {

    case "Untouchable":

      value += 20;

      break;


    case "Happy":

      value += 10;

      break;


    case "Normal":

      break;


    case "Unhappy":

      value -= 8;

      break;


    case "Angry":

      value -= 15;

      break;

  }


  return clamp(
    value
  );

}


// ========================================
// CREATE MATCH PERFORMANCE
// ========================================
//
// Chỉ tạo trạng thái performance.
// Không mô phỏng trận.
//
// ========================================

export function createMatchPerformance(
  player
) {

  if (!player) return null;


  return {

    playerId:
      player.id,

    confidence:
      calculateStartingConfidence(
        player
      ),

    hotHand: 0,

    coldStreak: 0,

    shootingForm: 0,

    playmakingForm: 0,

    defenseForm: 0,

    clutchBoost: 0,

    fatiguePenalty: 0,

    staminaState:
      getStaminaState(
        player.attributes?.stamina
      ),

    conditionState:
      getConditionState(
        getCondition(player)
      ),

    performanceRating: 0

  };

}


// ========================================
// UPDATE PERFORMANCE STATE
// ========================================
//
// Dùng nếu sau này Player có các
// interactive moments trong trận.
//
// Không tạo action.
// Không tạo boxscore.
//
// ========================================

export function updatePerformance(
  performance,
  result
) {

  if (!performance) {

    return null;

  }


  if (
    result === "SCORE"
  ) {

    performance.hotHand += 1;

    performance.coldStreak = 0;

    performance.confidence += 3;

  }


  else if (
    result === "MISS"
  ) {

    performance.coldStreak += 1;

    performance.hotHand = 0;

    performance.confidence -= 2;

  }


  performance.confidence =
    clamp(
      performance.confidence
    );


  performance.hotHand =
    Math.max(
      0,
      performance.hotHand
    );


  performance.coldStreak =
    Math.max(
      0,
      performance.coldStreak
    );


  return performance;

}


// ========================================
// UPDATE MATCH PERFORMANCE
// ========================================
//
// State update cho Player trong trận.
// Không can thiệp matchEngine.
//
// ========================================

export function updateMatchPerformance(
  performance,
  player,
  action,
  gameState = {}
) {

  if (
    !performance ||
    !player
  ) {

    return performance;

  }


  switch (action) {

    case "SCORE":

      performance.hotHand += 1;

      performance.coldStreak = 0;

      performance.confidence +=
        random(1, 4);

      break;


    case "MISS":

      performance.coldStreak += 1;

      performance.hotHand = 0;

      performance.confidence -=
        random(1, 3);

      break;


    case "ASSIST":

      performance.confidence +=
        random(0, 2);

      break;


    case "TURNOVER":

      performance.confidence -=
        random(1, 3);

      break;


    case "DEFENSIVE_PLAY":

      performance.confidence +=
        random(0, 2);

      break;

  }


  if (
    gameState?.clutch
  ) {

    performance.clutchBoost =
      random(0, 5);

  }

  else {

    performance.clutchBoost = 0;

  }


  performance.staminaState =
    getStaminaState(
      player.attributes?.stamina
    );


  performance.conditionState =
    getConditionState(
      getCondition(player)
    );


  performance.confidence =
    clamp(
      performance.confidence
    );


  performance.hotHand =
    Math.max(
      0,
      performance.hotHand
    );


  performance.coldStreak =
    Math.max(
      0,
      performance.coldStreak
    );


  return performance;

}


// ========================================
// STAMINA STATE
// ========================================

function getStaminaState(
  stamina
) {

  const value =
    Number(stamina);


  if (!Number.isFinite(value)) {

    return "NORMAL";

  }


  if (value >= 70) {

    return "FRESH";

  }


  if (value >= 40) {

    return "NORMAL";

  }


  if (value >= 20) {

    return "TIRED";

  }


  return "EXHAUSTED";

}


// ========================================
// CONDITION STATE
// ========================================

function getConditionState(
  condition
) {

  switch (condition) {

    case CONDITION.EXCELLENT:

      return "EXCELLENT";


    case CONDITION.GOOD:

      return "GOOD";


    case CONDITION.HEALTHY:

      return "HEALTHY";


    case CONDITION.SICK:

      return "SICK";


    case CONDITION.EXHAUSTED:

      return "EXHAUSTED";


    default:

      return "HEALTHY";

  }

}


// ========================================
// FIELD GOAL PERCENTAGE
// ========================================

function getPercentage(
  made,
  attempted
) {

  const m =
    Number(made) || 0;

  const a =
    Number(attempted) || 0;


  if (a <= 0) {

    return null;

  }


  return m / a;

}


// ========================================
// CALCULATE PERFORMANCE RATING
// ========================================
//
// Rating dựa trên boxscore thật từ
// matchEngine.
//
// Không generate stat.
// Không random.
//
// ========================================

export function calculatePerformanceRating(
  stat,
  matchContext = {}
) {

  if (!stat) return 0;


  const minutes =
    Number(stat.minutes) || 0;


  if (minutes <= 0) {

    return 0;

  }


  let rating = 50;


  // ====================================
  // PRODUCTION
  // ====================================

  rating +=
    Math.min(
      24,
      (Number(stat.points) || 0) *
      1.2
    );


  rating +=
    Math.min(
      15,
      (Number(stat.assists) || 0) *
      1.4
    );


  rating +=
    Math.min(
      12,
      (Number(stat.rebounds) || 0) *
      1.0
    );


  rating +=
    Math.min(
      10,
      (Number(stat.steals) || 0) *
      2
    );


  rating +=
    Math.min(
      10,
      (Number(stat.blocks) || 0) *
      2
    );


  // ====================================
  // TURNOVERS
  // ====================================

  rating -=
    Math.min(
      12,
      (Number(stat.turnovers) || 0) *
      1.75
    );


  // ====================================
  // SHOOTING EFFICIENCY
  // ====================================

  const fg =
    getPercentage(
      stat.fieldGoals?.made,
      stat.fieldGoals?.attempted
    );


  const three =
    getPercentage(
      stat.threePoints?.made,
      stat.threePoints?.attempted
    );


  const ft =
    getPercentage(
      stat.freeThrows?.made,
      stat.freeThrows?.attempted
    );


  if (fg !== null) {

    rating +=
      clamp(
        (fg - 0.45) * 20,
        -10,
        10
      );

  }


  if (three !== null) {

    rating +=
      clamp(
        (three - 0.35) * 10,
        -5,
        5
      );

  }


  if (ft !== null) {

    rating +=
      clamp(
        (ft - 0.75) * 5,
        -3,
        3
      );

  }


  // ====================================
  // RESULT BONUSES
  // ====================================

  if (
    matchContext.win
  ) {

    rating += 3;

  }


  if (
    stat.doubleDouble
  ) {

    rating += 3;

  }


  if (
    stat.tripleDouble
  ) {

    rating += 5;

  }


  if (
    matchContext.mvp
  ) {

    rating += 5;

  }


  // ====================================
  // MINUTES NORMALIZATION
  // ====================================
  //
  // Bench player ít phút không bị đánh
  // giá quá cao chỉ vì vài stat.
  //
  // Starter chơi nhiều phút được đánh
  // giá đầy đủ.
  //
  // ====================================

  const minuteFactor =
    clamp(
      minutes / 30,
      0.6,
      1
    );


  rating =
    50 +
    (
      rating - 50
    ) *
    minuteFactor;


  return Math.round(
    clamp(
      rating,
      1,
      99
    )
  );

}


// ========================================
// PROCESS PLAYER MATCH RESULT
// ========================================
//
// Đây là cầu nối:
//
// matchEngine
//      ↓
// performanceEngine
//      ↓
// trainingSystem
//      ↓
// growthSystem
//
// Chỉ xử lý player được truyền vào.
// Không tự động sửa NPC.
//
// ========================================

export function processPlayerMatchResult(
  player,
  stat,
  matchContext = {}
) {

  if (
    !player ||
    !stat
  ) {

    return null;

  }


  const rating =
    calculatePerformanceRating(
      stat,
      matchContext
    );


  const performance = {

    playerId:
      player.id,

    performanceRating:
      rating,

    minutes:
      Number(stat.minutes) || 0,

    points:
      Number(stat.points) || 0,

    rebounds:
      Number(stat.rebounds) || 0,

    assists:
      Number(stat.assists) || 0,

    steals:
      Number(stat.steals) || 0,

    blocks:
      Number(stat.blocks) || 0,

    turnovers:
      Number(stat.turnovers) || 0,

    doubleDouble:
      Boolean(
        stat.doubleDouble
      ),

    tripleDouble:
      Boolean(
        stat.tripleDouble
      ),

    mvp:
      Boolean(
        matchContext.mvp
      )

  };


  // ====================================
  // DEVELOPMENT
  // ====================================
  //
  // trainingSystem quyết định cách XP
  // được cộng vào growthSystem.
  //
  // PerformanceEngine không tự cộng
  // attributeXP trực tiếp.
  // ====================================

  matchDay(

    player,

    performance.minutes > 0,

    performance.mvp,

    performance.tripleDouble

  );


  return performance;

}


// ========================================
// FIND PLAYER BOX SCORE
// ========================================

export function findPlayerMatchStat(
  match,
  playerId
) {

  if (
    !match ||
    !playerId
  ) {

    return null;

  }


  const allPlayers = [

    ...(Array.isArray(match.homeBox)
      ? match.homeBox
      : []),

    ...(Array.isArray(match.awayBox)
      ? match.awayBox
      : [])

  ];


  return (
    allPlayers.find(
      stat =>
        stat.playerId === playerId ||
        stat.player?.id === playerId
    ) ||
    null
  );

}


// ========================================
// PROCESS MATCH FOR PLAYER
// ========================================
//
// Hàm chính để Career/Match UI gọi.
//
// ========================================

export function processMatchForPlayer(
  match,
  player
) {

  if (
    !match ||
    !player
  ) {

    return null;

  }


  const stat =
    findPlayerMatchStat(
      match,
      player.id
    );


  if (!stat) {

    return null;

  }


  const winnerId =
    match.winner?.teamId ||
    match.winner?.id;


  const playerTeamId =
    player.development?.team ||
    player.teamId;


  const win =
    Boolean(
      winnerId &&
      playerTeamId &&
      winnerId === playerTeamId
    );


  const mvpId =
    match.mvp?.playerId ||
    match.mvp?.player?.id;


  const isMVP =
    Boolean(
      mvpId &&
      mvpId === player.id
    );


  return processPlayerMatchResult(

    player,

    stat,

    {

      win,

      mvp: isMVP

    }

  );

}


// ========================================
// PROCESS MATCH FOR MULTIPLE PLAYERS
// ========================================
//
// Dùng khi cần xử lý nhiều Player,
// không dùng để generate NPC performance.
//
// ========================================

export function processMatchForPlayers(
  match,
  players
) {

  if (
    !match ||
    !Array.isArray(players)
  ) {

    return [];

  }


  const results = [];


  for (
    const player of players
  ) {

    const result =
      processMatchForPlayer(
        match,
        player
      );


    if (result) {

      results.push(
        result
      );

    }

  }


  return results;

}


// ========================================
// EXPORT
// ========================================

export default {

  random,

  createMatchPerformance,

  updatePerformance,

  updateMatchPerformance,

  calculatePerformanceRating,

  processPlayerMatchResult,

  findPlayerMatchStat,

  processMatchForPlayer,

  processMatchForPlayers

};