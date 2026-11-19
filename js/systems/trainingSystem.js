// data/trainingSystem.js

import {

  addAttributeXP,

  processGrowth,

  updateDevelopmentScore

} from "./growthSystem.js";


// ========================================
// POSITION TRAINING FOCUS
// ========================================
//
// Primary   = tăng mạnh
// Secondary = tăng vừa
// Minor     = tăng nhẹ
//
// Không khóa player vào position.
// Position chỉ quyết định hướng training.
//
// Ví dụ:
// C vẫn có thể tăng threePoint.
// Chỉ là threePoint không phải focus chính.
// ========================================

const POSITION_FOCUS = {

  PG: {

    primary: [
      "pass",
      "handle",
      "threePoint"
    ],

    secondary: [
      "speed",
      "shoot",
      "defense"
    ],

    minor: [
      "stamina",
      "strength",
      "rebound",
      "dunk"
    ]

  },


  SG: {

    primary: [
      "shoot",
      "threePoint",
      "handle"
    ],

    secondary: [
      "speed",
      "defense",
      "dunk"
    ],

    minor: [
      "pass",
      "stamina",
      "strength",
      "rebound"
    ]

  },


  SF: {

    primary: [
      "shoot",
      "defense",
      "rebound"
    ],

    secondary: [
      "speed",
      "dunk",
      "handle"
    ],

    minor: [
      "pass",
      "threePoint",
      "strength",
      "stamina"
    ]

  },


  PF: {

    primary: [
      "rebound",
      "defense",
      "strength"
    ],

    secondary: [
      "dunk",
      "shoot",
      "stamina"
    ],

    minor: [
      "pass",
      "speed",
      "threePoint",
      "handle"
    ]

  },


  C: {

    primary: [
      "rebound",
      "defense",
      "strength"
    ],

    secondary: [
      "dunk",
      "stamina",
      "shoot"
    ],

    minor: [
      "pass",
      "speed",
      "threePoint",
      "handle"
    ]

  }

};


// ========================================
// XP VALUES
// ========================================

const TRAINING_XP = {

  primary: 20,

  secondary: 10,

  minor: 5

};


const PENALTY_XP = {

  primary: 10,

  secondary: 5,

  minor: 1

};


// ========================================
// MATCH XP
// ========================================

const MATCH_XP = {

  played: 5,

  didNotPlay: 1,

  mvpBonus: 1,

  doubleDoubleBonus: 1,

  tripleDoubleBonus: 5

};


// ========================================
// POSITION
// ========================================

function getPrimaryPosition(
  player
) {

  return (
    player?.creation?.position ??
    null
  );

}


// ========================================
// TRAINING FOCUS
// ========================================

function getTrainingFocus(
  player
) {

  const position =
    getPrimaryPosition(
      player
    );


  return (
    POSITION_FOCUS[position] ||
    null
  );

}


// ========================================
// APPLY XP GROUP
// ========================================

function applyFocusXP(
  player,
  attributes,
  amount
) {

  for (
    const attribute of attributes
  ) {

    addAttributeXP(
      player,
      attribute,
      amount
    );

  }

}


// ========================================
// TRAINING DAY
// ========================================

export function trainingDay(
  player,
  penalty = false
) {

  if (!player) return;


  const focus =
    getTrainingFocus(
      player
    );


  const primaryXP =
    penalty
      ? PENALTY_XP.primary
      : TRAINING_XP.primary;


  const secondaryXP =
    penalty
      ? PENALTY_XP.secondary
      : TRAINING_XP.secondary;


  const minorXP =
    penalty
      ? PENALTY_XP.minor
      : TRAINING_XP.minor;


  applyFocusXP(

    player,

    focus.primary,

    primaryXP

  );


  applyFocusXP(

    player,

    focus.secondary,

    secondaryXP

  );


  applyFocusXP(

    player,

    focus.minor,

    minorXP

  );


  // XP -> attributes -> OVR
  processGrowth(
    player
  );


  // Training improves development progress.
  updateDevelopmentScore(
    player,
    penalty
      ? 0.05
      : 0.1
  );

}


// ========================================
// MATCH DAY
// ========================================
//
// Match performance also contributes to
// development, but less than dedicated training.
//
// MVP / Triple Double give bonus XP.
// ========================================

export function matchDay(

  player,

  played,

  isMVP = false,

  tripleDouble = false

) {

  if (!player) return;


  const focus =
    getTrainingFocus(
      player
    );


  let xp =
    played
      ? MATCH_XP.played
      : MATCH_XP.didNotPlay;


  if (isMVP) {

    xp +=
      MATCH_XP.mvpBonus;

  }


  if (tripleDouble) {

    xp +=
      MATCH_XP.tripleDoubleBonus;

  }


  // Match XP is focused on primary skills.
  applyFocusXP(

    player,

    focus.primary,

    xp

  );


  processGrowth(
    player
  );


  if (played) {

    updateDevelopmentScore(
      player,
      0.05
    );

  }

}


// ========================================
// SUSPENDED TRAINING
// ========================================
//
// Suspension means no training progress.
// Không cộng XP.
// Không trừ attribute.
// ========================================

export function suspendedTraining(
  player
) {

  if (!player) return;


  // Intentionally no growth.

}


// ========================================
// FULL TRAINING WEEK
// ========================================
//
// School/training week:
// Monday -> Friday = 5 training days.
//
// Không phải 4 ngày.
// ========================================

export function fullTrainingWeek(
  player
) {

  if (!player) return;


  for (
    let day = 0;
    day < 5;
    day++
  ) {

    trainingDay(
      player
    );

  }

}


// ========================================
// PENALTY TRAINING
// ========================================
//
// Dùng khi player có event xấu,
// bỏ tập, vi phạm discipline...
//
// Vẫn có growth nhưng thấp hơn.
// ========================================

export function penaltyTraining(
  player
) {

  trainingDay(
    player,
    true
  );

}


// ========================================
// EXPORT
// ========================================

export default {

  trainingDay,

  matchDay,

  suspendedTraining,

  fullTrainingWeek,

  penaltyTraining

};