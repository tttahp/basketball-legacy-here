// data/growthSystem.js

import {
  updateOverall
} from "./overallSystem.js";


// ========================================
// XP REQUIREMENT TABLE
// ========================================

const XP_TABLE = [

  { min: 0, required: 500 },

  { min: 60, required: 800 },

  { min: 70, required: 1200 },

  { min: 80, required: 1800 },

  { min: 85, required: 2800 },

  { min: 90, required: 4500 },

  { min: 95, required: 7000 }

];


// ========================================
// XP REQUIRED
// ========================================

export function getRequiredXP(attributeValue) {

  let xp = 500;

  for (const tier of XP_TABLE) {

    if (attributeValue >= tier.min) {

      xp = tier.required;

    }

  }

  return xp;

}


// ========================================
// TALENT BONUS
// ========================================

export function getTalentMultiplier(
  player,
  attribute
) {

  if (!player) return 1;

  const talent =
    player.potential?.hiddenTalent?.[attribute];

  return (
    talent ?? 100
  ) / 100;

}


// ========================================
// TOTAL GROWTH MULTIPLIER
// ========================================

export function getGrowthMultiplier(
  player,
  attribute
) {

  return getTalentMultiplier(
    player,
    attribute
  );

}


// ========================================
// MAX ATTRIBUTE
// ========================================

export function isAttributeMax(
  player,
  attribute
) {

  if (!player) return true;

  return (
    Number(
      player.attributes?.[attribute] ?? 0
    ) >= 99
  );

}


// ========================================
// MAX OVR
// ========================================

export function reachedMaxOverall(
  player
) {

  if (!player) return true;

  const maxOverall =
    Number(
      player.development?.maxOverall
    );

  if (!Number.isFinite(maxOverall)) {

    return false;

  }

  return (
    Number(
      player.overall ?? 0
    ) >= maxOverall
  );

}


// ========================================
// ATTRIBUTE XP
// ========================================

export function addAttributeXP(
  player,
  attribute,
  amount
) {

  if (!player) return;

  if (!player.attributes?.hasOwnProperty(attribute)) {

    return;

  }

  if (isAttributeMax(
    player,
    attribute
  )) {

    return;

  }

  if (reachedMaxOverall(
    player
  )) {

    return;

  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    return;

  }

  if (!player.attributeXP) {

    player.attributeXP = {};

  }

  if (
    typeof player.attributeXP[attribute] !==
    "number"
  ) {

    player.attributeXP[attribute] = 0;

  }

  const multiplier =
    getGrowthMultiplier(
      player,
      attribute
    );

  player.attributeXP[attribute] +=
    Math.round(
      amount * multiplier
    );

}


// ========================================
// REMOVE XP
// ========================================

export function removeAttributeXP(
  player,
  attribute,
  amount
) {

  if (!player) return;

  if (!player.attributeXP) return;

  if (
    typeof player.attributeXP[attribute] !==
    "number"
  ) {

    player.attributeXP[attribute] = 0;

  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    return;

  }

  player.attributeXP[attribute] -= amount;

  if (
    player.attributeXP[attribute] < 0
  ) {

    player.attributeXP[attribute] = 0;

  }

}


// ========================================
// ATTRIBUTE LEVEL UP
// ========================================

export function levelUpAttribute(
  player,
  attribute
) {

  if (!player) return false;

  if (!player.attributes?.hasOwnProperty(attribute)) {

    return false;

  }

  if (isAttributeMax(
    player,
    attribute
  )) {

    return false;

  }

  if (reachedMaxOverall(
    player
  )) {

    return false;

  }

  if (!player.attributeXP) {

    player.attributeXP = {};

  }

  if (
    typeof player.attributeXP[attribute] !==
    "number"
  ) {

    player.attributeXP[attribute] = 0;

  }

  const current =
    Number(
      player.attributes[attribute]
    );

  const need =
    getRequiredXP(
      current
    );

  if (
    player.attributeXP[attribute] <
    need
  ) {

    return false;

  }

  player.attributeXP[attribute] -=
    need;

  player.attributes[attribute] =
    Math.min(
      99,
      current + 1
    );

  updateOverall(
    player
  );

  return true;

}


// ========================================
// DEVELOPMENT SCORE
// ========================================

export function updateDevelopmentScore(
  player,
  amount
) {

  if (!player) return;

  if (!player.development) {

    player.development = {};

  }

  const current =
    Number(
      player.development.developmentScore
    );

  const score =
    Number.isFinite(current)
      ? current
      : 50;

  const change =
    Number(amount);

  if (
    !Number.isFinite(change)
  ) {

    return;

  }

  player.development.developmentScore =
    Math.max(
      0,
      Math.min(
        100,
        score + change
      )
    );

}


// ========================================
// CHECK ALL ATTRIBUTE
// ========================================

export function processGrowth(
  player
) {

  if (!player) return;

  if (!player.attributes) return;

  for (
    const attribute in player.attributes
  ) {

    while (
      levelUpAttribute(
        player,
        attribute
      )
    ) {}

  }

}


// ========================================
// EXPORT
// ========================================

export default {

  getRequiredXP,

  getTalentMultiplier,

  getGrowthMultiplier,

  isAttributeMax,

  reachedMaxOverall,

  addAttributeXP,

  removeAttributeXP,

  levelUpAttribute,

  processGrowth,

  updateDevelopmentScore

};