// data/gameEngine.js

import { nextDay } from "../systems/seasonSystem.js";

import {
  trainingDay
} from "../systems/trainingSystem.js";

import {
  processMatchForPlayer
} from "./performanceEngine.js";


// ========================================
// DAY TYPE
// ========================================

const DAY_TYPE = {

  TRAINING: "TRAINING",

  MATCH: "MATCH",

  EVENT: "EVENT",

  REST: "REST"

};


// ========================================
// GET TODAY
// ========================================

function getToday(
  calendar
) {

  if (!calendar) return null;

  if (
    !Array.isArray(calendar.days)
  ) {

    return null;

  }

  return (
    calendar.days[
      calendar.currentDay
    ] || null
  );

}


// ========================================
// DAY CHECKS
// ========================================

function isTrainingDay(
  day
) {

  return (
    day?.type ===
    DAY_TYPE.TRAINING
  );

}


function isMatchDay(
  day
) {

  return (
    day?.type ===
    DAY_TYPE.MATCH
  );

}


function isEventDay(
  day
) {

  return (
    day?.type ===
    DAY_TYPE.EVENT
  );

}


function isRestDay(
  day
) {

  return (
    day?.type ===
    DAY_TYPE.REST
  );

}


// ========================================
// ADVANCE DAY
// ========================================

export function advanceDay(
  game
) {

  if (!game) {

    return {
      stop: true,
      reason: "INVALID_GAME"
    };

  }


  const today =
    getToday(
      game.calendar
    );


  if (!today) {

    return {
      stop: true,
      reason: "CALENDAR_COMPLETE"
    };

  }


  // ======================================
  // TRAINING
  // ======================================

  if (
    isTrainingDay(today)
  ) {

    runTraining(
      game.player,
      today
    );

    nextDay(
      game.calendar
    );

    return {
      stop: false,
      type: DAY_TYPE.TRAINING
    };

  }


  // ======================================
  // MATCH
  // ======================================

  if (
    isMatchDay(today)
  ) {

    return {

      stop: true,

      screen: "MATCH",

      type: DAY_TYPE.MATCH,

      day: today

    };

  }


  // ======================================
  // EVENT
  // ======================================

  if (
    isEventDay(today)
  ) {

    return {

      stop: true,

      screen: "EVENT",

      type: DAY_TYPE.EVENT,

      day: today

    };

  }


  // ======================================
  // REST
  // ======================================

  if (
    isRestDay(today)
  ) {

    runRecovery(
      game.player
    );

    nextDay(
      game.calendar
    );

    return {

      stop: false,

      type: DAY_TYPE.REST

    };

  }


  // ======================================
  // UNKNOWN DAY
  // ======================================

  nextDay(
    game.calendar
  );


  return {

    stop: false,

    type: "UNKNOWN"

  };

}


// ========================================
// FINISH MATCH
// ========================================
//
// result phải chứa boxscore thật từ
// matchEngine.
//
// performanceEngine xử lý:
// - performance rating
// - MVP
// - DD / TD
// - match development
// - training/growth
//
// gameEngine chỉ orchestration.
// ========================================

export function finishMatch(
  game,
  result
) {

  if (
    !game ||
    !game.player ||
    !result
  ) {

    return {

      success: false,

      reason: "INVALID_MATCH_RESULT"

    };

  }


  const performance =
    processMatchForPlayer(

      result,

      game.player

    );


  // --------------------------------------
  // Compatibility fallback
  // --------------------------------------
  //
  // Nếu matchEngine result chưa có boxscore
  // thì không tự cộng XP.
  //
  // Không quay lại matchDay() trực tiếp
  // vì như vậy sẽ bypass performanceEngine.
  // --------------------------------------

  nextDay(
    game.calendar
  );


  return {

    success: true,

    performance

  };

}


// ========================================
// FINISH EVENT
// ========================================

export function finishEvent(
  game
) {

  if (
    !game?.calendar
  ) {

    return {

      success: false,

      reason: "INVALID_GAME"

    };

  }


  nextDay(
    game.calendar
  );


  return {

    success: true

  };

}


// ========================================
// RUN TRAINING
// ========================================

function runTraining(
  player,
  today
) {

  if (!player) return;


  trainingDay(

    player,

    Boolean(
      today?.trainingPenalty
    )

  );

}


// ========================================
// RECOVERY
// ========================================
//
// Condition vocabulary đã chốt:
//
// Excellent
// Good
// Well
// Healthy
// Sick
// Exhausted
//
// Không dùng "Tired".
// ========================================

function runRecovery(
  player
) {

  if (!player) return;

  if (!player.status) return;


  const condition =
    player.status.condition;


  if (
    condition === "Exhausted"
  ) {

    player.status.condition =
      "Sick";

    return;

  }


  if (
    condition === "Sick"
  ) {

    player.status.condition =
      "Healthy";

    return;

  }


  if (
    condition === "Healthy"
  ) {

    return;

  }


  if (
    condition === "Well"
  ) {

    player.status.condition =
      "Healthy";

    return;

  }


  if (
    condition === "Good"
  ) {

    player.status.condition =
      "Excellent";

    return;

  }


  if (
    condition === "Excellent"
  ) {

    return;

  }

}


// ========================================
// ADVANCE MULTIPLE DAYS
// ========================================

function advanceUntilStop(
  game,
  maxDays
) {

  if (!game) {

    return {

      stop: true,

      reason: "INVALID_GAME"

    };

  }


  for (
    let i = 0;
    i < maxDays;
    i++
  ) {

    const result =
      advanceDay(
        game
      );


    if (
      result.stop
    ) {

      return result;

    }

  }


  return {

    stop: true,

    reason: "ADVANCE_LIMIT"

  };

}


// ========================================
// ADVANCE WEEK
// ========================================

export function advanceWeek(
  game
) {

  return advanceUntilStop(
    game,
    7
  );

}


// ========================================
// ADVANCE MONTH
// ========================================

export function advanceMonth(
  game
) {

  return advanceUntilStop(
    game,
    31
  );

}


// ========================================
// ADVANCE TO NEXT EVENT
// ========================================
//
// Không dùng while(true).
// Tối đa 366 ngày để tránh loop vô hạn.
// ========================================

export function advanceToNextEvent(
  game
) {

  if (!game) {

    return {

      stop: true,

      reason: "INVALID_GAME"

    };

  }


  for (
    let i = 0;
    i < 366;
    i++
  ) {

    const result =
      advanceDay(
        game
      );


    if (
      result.stop
    ) {

      return result;

    }

  }


  return {

    stop: true,

    reason: "NO_EVENT_FOUND"

  };

}


// ========================================
// EXPORT
// ========================================

export default {

  advanceDay,

  finishMatch,

  finishEvent,

  advanceWeek,

  advanceMonth,

  advanceToNextEvent

};