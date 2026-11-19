// data/overallSystem.js


// ========================================
// ATTRIBUTE WEIGHT
// ========================================
//
// Tổng mỗi position = 100.
//
// OVR được tính từ attribute hiện tại,
// không random riêng.
//
// Position chỉ quyết định attribute nào
// quan trọng hơn khi tính OVR.
// ========================================

export const ATTRIBUTE_WEIGHT = {

  PG: {

    speed: 12,
    strength: 3,
    stamina: 8,

    shoot: 12,
    threePoint: 14,
    pass: 18,
    rebound: 3,
    defense: 10,
    dunk: 5,
    handle: 15

  },


  SG: {

    speed: 11,
    strength: 4,
    stamina: 8,

    shoot: 15,
    threePoint: 15,
    pass: 10,
    rebound: 4,
    defense: 10,
    dunk: 10,
    handle: 13

  },


  SF: {

    speed: 10,
    strength: 8,
    stamina: 8,

    shoot: 12,
    threePoint: 10,
    pass: 8,
    rebound: 10,
    defense: 14,
    dunk: 10,
    handle: 10

  },


  PF: {

    speed: 8,
    strength: 12,
    stamina: 8,

    shoot: 8,
    threePoint: 6,
    pass: 6,
    rebound: 18,
    defense: 16,
    dunk: 10,
    handle: 8

  },


  C: {

    speed: 5,
    strength: 16,
    stamina: 8,

    shoot: 5,
    threePoint: 2,
    pass: 6,
    rebound: 24,
    defense: 20,
    dunk: 10,
    handle: 4

  }

};


// ========================================
// VALID POSITIONS
// ========================================

const VALID_POSITIONS = new Set([
  "PG",
  "SG",
  "SF",
  "PF",
  "C"
]);


// ========================================
// PRIMARY POSITION
// ========================================
//
// Hỗ trợ:
//
// "PG"
// "PG/SG"
// "SF/PF"
//
// Nhưng KHÔNG tự biến position thiếu
// thành PG.
// ========================================

export function getPrimaryPosition(
  position
) {

  if (
    typeof position !== "string"
  ) {

    return null;

  }

  const primary =
    position
      .trim()
      .toUpperCase()
      .split("/")[0];


  if (
    !VALID_POSITIONS.has(primary)
  ) {

    return null;

  }


  return primary;

}


// ========================================
// GET ATTRIBUTE WEIGHT
// ========================================

export function getAttributeWeight(
  position
) {

  const primary =
    getPrimaryPosition(
      position
    );


  if (!primary) {

    return null;

  }


  return ATTRIBUTE_WEIGHT[
    primary
  ];

}


// ========================================
// SAFE ATTRIBUTE VALUE
// ========================================
//
// Không sửa trực tiếp data player.
// Chỉ giới hạn giá trị dùng để tính OVR.
//
// Min = 0
// Max = 99
// ========================================

function getAttributeValue(
  player,
  attribute
) {

  const raw =
    Number(
      player?.attributes?.[attribute]
    );


  if (
    !Number.isFinite(raw)
  ) {

    return 0;

  }


  return Math.max(
    0,
    Math.min(
      99,
      raw
    )
  );

}


// ========================================
// GET MAX OVERALL
// ========================================

function getMaxOverall(
  player
) {

  const max =
    Number(
      player?.development?.maxOverall
    );


  if (
    !Number.isFinite(max)
  ) {

    return 99;

  }


  return Math.max(
    0,
    Math.min(
      99,
      max
    )
  );

}


// ========================================
// CALCULATE OVERALL
// ========================================

export function calculateOverall(
  player
) {

  if (!player) return 0;


  const weight =
    getAttributeWeight(
      player.creation?.position
    );


  // Không có position hợp lệ
  // thì không tự đoán là PG.
  if (!weight) {

    return 0;

  }


  let total = 0;

  let weightTotal = 0;


  for (
    const attribute in weight
  ) {

    const attributeWeight =
      Number(
        weight[attribute]
      );


    if (
      !Number.isFinite(
        attributeWeight
      ) ||
      attributeWeight <= 0
    ) {

      continue;

    }


    const value =
      getAttributeValue(
        player,
        attribute
      );


    total +=
      value *
      attributeWeight;


    weightTotal +=
      attributeWeight;

  }


  if (
    weightTotal <= 0
  ) {

    return 0;

  }


  const calculated =
    Math.round(
      total /
      weightTotal
    );


  return Math.min(
    calculated,
    getMaxOverall(player)
  );

}


// ========================================
// UPDATE OVERALL
// ========================================

export function updateOverall(
  player
) {

  if (!player) return 0;


  const overall =
    calculateOverall(
      player
    );


  player.overall =
    overall;


  updateOverallHistory(
    player
  );


  updatePeakOverall(
    player
  );


  return overall;

}


// ========================================
// UPDATE PEAK OVERALL
// ========================================

export function updatePeakOverall(
  player
) {

  if (!player) return;


  if (!player.career) {

    player.career = {};

  }


  const currentOverall =
    Number(
      player.overall
    ) || 0;


  const previousPeak =
    Number(
      player.career.peakOverall
    );


  if (
    !Number.isFinite(
      previousPeak
    ) ||
    currentOverall >
      previousPeak
  ) {

    player.career.peakOverall =
      currentOverall;


    const age =
      Number(
        player.age
      );


    if (
      Number.isFinite(age)
    ) {

      player.career.peakAge =
        age;

    }

  }

}


// ========================================
// UPDATE OVERALL HISTORY
// ========================================

export function updateOverallHistory(
  player
) {

  if (!player) return;


  const currentOverall =
    Number(
      player.overall
    ) || 0;


  if (!player.overallHistory) {

    player.overallHistory = {

      highest:
        currentOverall,

      lowest:
        currentOverall

    };


    return;

  }


  const highest =
    Number(
      player.overallHistory.highest
    );


  const lowest =
    Number(
      player.overallHistory.lowest
    );


  player.overallHistory.highest =

    Number.isFinite(highest)

      ? Math.max(
          highest,
          currentOverall
        )

      : currentOverall;


  player.overallHistory.lowest =

    Number.isFinite(lowest)

      ? Math.min(
          lowest,
          currentOverall
        )

      : currentOverall;

}


// ========================================
// RECALCULATE PLAYER
// ========================================

export function recalculatePlayer(
  player
) {

  if (!player) return 0;


  return updateOverall(
    player
  );

}


// ========================================
// RECALCULATE ROSTER
// ========================================

export function recalculateRoster(
  roster
) {

  if (
    !Array.isArray(roster)
  ) {

    return;

  }


  for (
    const player of roster
  ) {

    recalculatePlayer(
      player
    );

  }

}


// ========================================
// EXPORT
// ========================================

export default {

  ATTRIBUTE_WEIGHT,

  getPrimaryPosition,

  getAttributeWeight,

  calculateOverall,

  updateOverall,

  updatePeakOverall,

  updateOverallHistory,

  recalculatePlayer,

  recalculateRoster

};