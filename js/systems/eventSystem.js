// data/eventSystem.js


// ============================================================
// EVENT TYPES
// ============================================================

export const EVENT_TYPE = {

  LIFE: "LIFE",
  CAREER: "CAREER",
  SCHOOL: "SCHOOL",
  RELATIONSHIP: "RELATIONSHIP",
  HEALTH: "HEALTH",
  MONEY: "MONEY",
  MEDIA: "MEDIA",
  INTERNATIONAL: "INTERNATIONAL",
  MANAGER: "MANAGER",
  PRESIDENT: "PRESIDENT"

};


// ============================================================
// EVENT MODES
// ============================================================

export const EVENT_MODE = {

  DYNAMIC: "DYNAMIC",
  STATIC: "STATIC"

};


// ============================================================
// EVENT RARITY
// ============================================================

export const EVENT_RARITY = {

  COMMON: "COMMON",
  UNCOMMON: "UNCOMMON",
  RARE: "RARE",
  EPIC: "EPIC",
  CAREER: "CAREER"

};


// ============================================================
// SPECIAL EVENT FLAGS
// ============================================================

export const EVENT_FLAG = {

  TEMPTATION: "TEMPTATION"

};


// ============================================================
// MONTHLY LIMITS
// ============================================================
//
// Life dynamic:
//     target around 2-3 / month
//
// Static:
//     maximum 2 / month
//
// Other event types are not forced into these limits.
// Career / Manager / President events use their own
// conditions and cooldowns.
// ============================================================

const MONTHLY_LIMITS = {

  LIFE_DYNAMIC: 3,
  STATIC: 2

};


// ============================================================
// BASIC HELPERS
// ============================================================

function randomInt(min, max) {

  return Math.floor(
      Math.random() * (max - min + 1)
  ) + min;

}


function randomItem(array) {

  if (
      !Array.isArray(array) ||
      array.length === 0
  ) {

      return null;

  }

  return array[
      randomInt(
          0,
          array.length - 1
      )
  ];

}


function clamp(value, min, max) {

  return Math.min(
      Math.max(value, min),
      max
  );

}


// ============================================================
// PLAYER PATH
// ============================================================

export function getValue(player, path) {

  if (
      !player ||
      !path
  ) {

      return undefined;

  }


  const parts =
      path.split(".");


  let value = player;


  for (
      const part of parts
  ) {

      if (
          value === null ||
          value === undefined
      ) {

          return undefined;

      }


      value =
          value[part];

  }


  return value;

}


// ============================================================
// CURRENT DAY
// ============================================================

export function getCurrentDay(player) {

  const day =
      Number(
          player?.eventState?.currentDay
      );


  if (
      Number.isFinite(day)
  ) {

      return day;

  }


  const developmentDay =
      Number(
          player?.development?.day
      );


  if (
      Number.isFinite(
          developmentDay
      )
  ) {

      return developmentDay;

  }


  return 0;

}


// ============================================================
// CURRENT MONTH
// ============================================================

export function getCurrentMonth(player) {

  const month =
      Number(
          player?.eventState?.currentMonth
      );


  if (
      Number.isFinite(month)
  ) {

      return month;

  }


  const developmentMonth =
      Number(
          player?.development?.month
      );


  if (
      Number.isFinite(
          developmentMonth
      )
  ) {

      return developmentMonth;

  }


  return 0;

}


// ============================================================
// EVENT STATE
// ============================================================

export function ensureEventState(player) {

  if (!player) {

      return null;

  }


  if (!player.eventState) {

      player.eventState = {};

  }


  if (
      !Number.isFinite(
          Number(
              player.eventState.currentDay
          )
      )
  ) {

      player.eventState.currentDay =
          getCurrentDay(player);

  }


  if (
      !Number.isFinite(
          Number(
              player.eventState.currentMonth
          )
      )
  ) {

      player.eventState.currentMonth =
          getCurrentMonth(player);

  }


  if (
      !Number.isFinite(
          Number(
              player.eventState.lifeDynamicThisMonth
          )
      )
  ) {

      player.eventState
          .lifeDynamicThisMonth = 0;

  }


  if (
      !Number.isFinite(
          Number(
              player.eventState.staticThisMonth
          )
      )
  ) {

      player.eventState
          .staticThisMonth = 0;

  }


  if (!player.eventState.lastEventId) {

      player.eventState.lastEventId =
          null;

  }


  if (!player.eventState.lastEventType) {

      player.eventState.lastEventType =
          null;

  }


  if (!player.eventState.recentActions) {

      player.eventState.recentActions = {};

  }


  if (!player.eventState.history) {

      player.eventState.history = {};

  }


  return player.eventState;

}


// ============================================================
// SYNC TIME
// ============================================================
//
// Call this when the game calendar advances.
// If month changes, monthly counters reset.
// ============================================================

export function syncEventTime(
  player,
  day,
  month
) {

  if (!player) return;


  const state =
      ensureEventState(player);


  const nextDay =
      Number(day);


  const nextMonth =
      Number(month);


  if (
      Number.isFinite(nextDay)
  ) {

      state.currentDay =
          nextDay;

  }


  if (
      Number.isFinite(nextMonth) &&
      nextMonth !==
          state.currentMonth
  ) {

      state.currentMonth =
          nextMonth;

      state.lifeDynamicThisMonth =
          0;

      state.staticThisMonth =
          0;

  }

}


// ============================================================
// MONTH RESET
// ============================================================

export function resetMonthlyEvents(player) {

  if (!player) return;


  const state =
      ensureEventState(player);


  state.lifeDynamicThisMonth =
      0;

  state.staticThisMonth =
      0;

}


// ============================================================
// RECENT ACTION
// ============================================================
//
// Used for contextual events.
//
// Example:
//
// party
//    ↓
// next day
// party aftermath
//
// The event system does not invent the action.
// Other systems/events record it here.
// ============================================================

export function recordRecentAction(
  player,
  actionId,
  data = {}
) {

  if (
      !player ||
      !actionId
  ) {

      return;

  }


  const state =
      ensureEventState(player);


  state.recentActions[
      actionId
  ] = {

      day:
          getCurrentDay(player),

      month:
          getCurrentMonth(player),

      data

  };

}


// ============================================================
// GET RECENT ACTION
// ============================================================

export function getRecentAction(
  player,
  actionId
) {

  if (
      !player ||
      !actionId
  ) {

      return null;

  }


  const state =
      ensureEventState(player);


  return (
      state.recentActions[
          actionId
      ] || null
  );

}


// ============================================================
// CHECK RECENT ACTION
// ============================================================

function checkRecentAction(
  player,
  condition
) {

  if (!condition) {

      return true;

  }


  const action =
      getRecentAction(
          player,
          condition.actionId
      );


  if (!action) {

      return false;

  }


  const currentDay =
      getCurrentDay(player);


  const daysAgo =
      currentDay -
      Number(action.day);


  if (
      condition.maxDaysAgo !==
      undefined
  ) {

      if (
          daysAgo >
          condition.maxDaysAgo
      ) {

          return false;

      }

  }


  if (
      condition.minDaysAgo !==
      undefined
  ) {

      if (
          daysAgo <
          condition.minDaysAgo
      ) {

          return false;

      }

  }


  return true;

}


// ============================================================
// CONDITION VALUE
// ============================================================

function compareCondition(
  player,
  condition
) {

  if (!condition) {

      return true;

  }


  // --------------------------------------------------------
  // PATH EXISTS
  // --------------------------------------------------------

  if (
      condition.exists !==
      undefined
  ) {

      const value =
          getValue(
              player,
              condition.path
          );


      return condition.exists
          ? value !== undefined &&
            value !== null
          : value === undefined ||
            value === null;

  }


  // --------------------------------------------------------
  // EQUALS
  // --------------------------------------------------------

  if (
      condition.equals !==
      undefined
  ) {

      return (
          getValue(
              player,
              condition.path
          ) ===
          condition.equals
      );

  }


  // --------------------------------------------------------
  // NOT EQUALS
  // --------------------------------------------------------

  if (
      condition.notEquals !==
      undefined
  ) {

      return (
          getValue(
              player,
              condition.path
          ) !==
          condition.notEquals
      );

  }


  // --------------------------------------------------------
  // ONE OF
  // --------------------------------------------------------

  if (
      Array.isArray(
          condition.oneOf
      )
  ) {

      return condition.oneOf.includes(
          getValue(
              player,
              condition.path
          )
      );

  }


  // --------------------------------------------------------
  // NONE OF
  // --------------------------------------------------------

  if (
      Array.isArray(
          condition.noneOf
      )
  ) {

      return !condition.noneOf.includes(
          getValue(
              player,
              condition.path
          )
      );

  }


  // --------------------------------------------------------
  // MINIMUM
  // --------------------------------------------------------

  if (
      condition.min !==
      undefined
  ) {

      const value =
          Number(
              getValue(
                  player,
                  condition.path
              )
          );


      if (
          !Number.isFinite(value) ||
          value < condition.min
      ) {

          return false;

      }

  }


  // --------------------------------------------------------
  // MAXIMUM
  // --------------------------------------------------------

  if (
      condition.max !==
      undefined
  ) {

      const value =
          Number(
              getValue(
                  player,
                  condition.path
              )
          );


      if (
          !Number.isFinite(value) ||
          value > condition.max
      ) {

          return false;

      }

  }


  // --------------------------------------------------------
  // RECENT ACTION
  // --------------------------------------------------------

  if (
      condition.recentAction
  ) {

      if (
          !checkRecentAction(
              player,
              condition.recentAction
          )
      ) {

          return false;

      }

  }


  return true;

}


// ============================================================
// AND CONDITIONS
// ============================================================

export function checkConditions(
  player,
  conditions = []
) {

  if (
      !Array.isArray(
          conditions
      )
  ) {

      return true;

  }


  return conditions.every(
      condition =>
          compareCondition(
              player,
              condition
          )
  );

}


// ============================================================
// OR CONDITIONS
// ============================================================
//
// Useful for:
//
// morale Unhappy OR Angry
//
// ============================================================

export function checkAnyConditions(
  player,
  conditions = []
) {

  if (
      !Array.isArray(
          conditions
      ) ||
      conditions.length === 0
  ) {

      return true;

  }


  return conditions.some(
      condition =>
          compareCondition(
              player,
              condition
          )
  );

}


// ============================================================
// EVENT CONDITION GROUP
// ============================================================

export function checkEventConditions(
  player,
  event
) {

  if (!event) {

      return false;

  }


  if (
      !checkConditions(
          player,
          event.conditions
      )
  ) {

      return false;

  }


  if (
      event.anyConditions &&
      !checkAnyConditions(
          player,
          event.anyConditions
      )
  ) {

      return false;

  }


  return true;

}


// ============================================================
// EVENT HISTORY
// ============================================================

export function getEventHistory(
  player,
  eventId
) {

  const state =
      ensureEventState(player);


  if (
      !state ||
      !eventId
  ) {

      return null;

  }


  return (
      state.history[eventId] ||
      null
  );

}


// ============================================================
// EVENT OCCURRED
// ============================================================

export function hasEventOccurred(
  player,
  eventId
) {

  return Boolean(
      getEventHistory(
          player,
          eventId
      )
  );

}


// ============================================================
// EVENT COOLDOWN
// ============================================================

function isEventOnCooldown(
  player,
  event
) {

  if (
      !event.cooldownDays
  ) {

      return false;

  }


  const history =
      getEventHistory(
          player,
          event.id
      );


  if (!history) {

      return false;

  }


  const currentDay =
      getCurrentDay(player);


  const lastDay =
      Number(
          history.lastDay
      );


  if (
      !Number.isFinite(lastDay)
  ) {

      return false;

  }


  return (
      currentDay -
      lastDay <
      Number(
          event.cooldownDays
      )
  );

}


// ============================================================
// ONCE ONLY
// ============================================================

function isOnceOnlyBlocked(
  player,
  event
) {

  if (
      !event.onceOnly
  ) {

      return false;

  }


  return hasEventOccurred(
      player,
      event.id
  );

}


// ============================================================
// CONSECUTIVE EVENT BLOCK
// ============================================================
//
// Default:
//
// A → B → A = allowed
//
// A → A = blocked
//
// Exception:
// TEMPTATION can repeat.
// ============================================================

export function isConsecutiveBlocked(
  player,
  event
) {

  const state =
      ensureEventState(player);


  if (!state) {

      return false;

  }


  if (
      event.flags?.includes(
          EVENT_FLAG.TEMPTATION
      )
  ) {

      return false;

  }


  if (
      event.allowConsecutive
  ) {

      return false;

  }


  return (
      state.lastEventId ===
      event.id
  );

}


// ============================================================
// MONTHLY LIMIT CHECK
// ============================================================

function isMonthlyLimitReached(
  player,
  event
) {

  const state =
      ensureEventState(player);


  if (!state) {

      return true;

  }


  // --------------------------------------------------------
  // LIFE DYNAMIC
  // --------------------------------------------------------

  if (
      event.type === EVENT_TYPE.LIFE &&
      event.mode === EVENT_MODE.DYNAMIC
  ) {

      return (
          state.lifeDynamicThisMonth >=
          MONTHLY_LIMITS.LIFE_DYNAMIC
      );

  }


  // --------------------------------------------------------
  // STATIC
  // --------------------------------------------------------

  if (
      event.mode === EVENT_MODE.STATIC
  ) {

      return (
          state.staticThisMonth >=
          MONTHLY_LIMITS.STATIC
      );

  }


  return false;

}


// ============================================================
// EVENT ELIGIBILITY
// ============================================================

export function isEventEligible(
  player,
  event
) {

  if (
      !player ||
      !event
  ) {

      return false;

  }


  if (
      !event.id ||
      !event.type ||
      !event.mode
  ) {

      return false;

  }


  if (
      isOnceOnlyBlocked(
          player,
          event
      )
  ) {

      return false;

  }


  if (
      isEventOnCooldown(
          player,
          event
      )
  ) {

      return false;

  }


  if (
      isConsecutiveBlocked(
          player,
          event
      )
  ) {

      return false;

  }


  if (
      isMonthlyLimitReached(
          player,
          event
      )
  ) {

      return false;

  }


  if (
      !checkEventConditions(
          player,
          event
      )
  ) {

      return false;

  }


  return true;

}


// ============================================================
// EVENT WEIGHT
// ============================================================

export function getEventWeight(event) {

  const explicitWeight =
      Number(
          event?.weight
      );


  if (
      Number.isFinite(
          explicitWeight
      ) &&
      explicitWeight > 0
  ) {

      return explicitWeight;

  }


  switch (
      event?.rarity
  ) {

      case EVENT_RARITY.COMMON:

          return 55;


      case EVENT_RARITY.UNCOMMON:

          return 26;


      case EVENT_RARITY.RARE:

          return 12;


      case EVENT_RARITY.EPIC:

          return 5;


      case EVENT_RARITY.CAREER:

          return 2;


      default:

          return 2;

  }

}


// ============================================================
// FILTER EVENTS
// ============================================================

export function getEligibleEvents(
  player,
  events = []
) {

  if (
      !Array.isArray(events)
  ) {

      return [];

  }


  return events.filter(
      event =>
          isEventEligible(
              player,
              event
          )
  );

}


// ============================================================
// WEIGHTED RANDOM EVENT
// ============================================================

export function selectRandomEvent(
  player,
  events = []
) {

  const eligible =
      getEligibleEvents(
          player,
          events
      );


  if (
      eligible.length === 0
  ) {

      return null;

  }


  const totalWeight =
      eligible.reduce(
          (
              total,
              event
          ) =>
              total +
              getEventWeight(
                  event
              ),
          0
      );


  let roll =
      Math.random() *
      totalWeight;


  for (
      const event of eligible
  ) {

      roll -=
          getEventWeight(
              event
          );


      if (
          roll <= 0
      ) {

          return event;

      }

  }


  return (
      eligible[
          eligible.length - 1
      ]
  );

}


// ============================================================
// EVENT RESULT TEXT
// ============================================================
//
// Choice titles stay fixed.
// Result narrative can have multiple variants.
//
// Example data:
//
// resultTexts: {
//     success: ["...", "...", "..."],
//     fail: ["...", "...", "..."]
// }
//
// The system randomly picks one.
// ============================================================

export function getResultText(
  result
) {

  if (
      !result
  ) {

      return null;

  }


  if (
      Array.isArray(
          result.text
      )
  ) {

      return randomItem(
          result.text
      );

  }


  if (
      typeof result.text ===
      "string"
  ) {

      return result.text;

  }


  return null;

}


// ============================================================
// EFFECT TARGET CREATION
// ============================================================

function ensurePath(
  player,
  path
) {

  const parts =
      path.split(".");


  const key =
      parts.pop();


  let target =
      player;


  for (
      const part of parts
  ) {

      if (
          target[part] ===
              undefined ||
          target[part] ===
              null
      ) {

          target[part] = {};

      }


      target =
          target[part];

  }


  return {
      target,
      key
  };

}


// ============================================================
// APPLY BASIC EFFECT
// ============================================================

export function applyEffect(
  player,
  effect
) {

  if (
      !player ||
      !effect
  ) {

      return;

  }


  // --------------------------------------------------------
  // SET
  // --------------------------------------------------------

  if (
      effect.set !== undefined
  ) {

      const {
          target,
          key
      } =
          ensurePath(
              player,
              effect.path
          );


      target[key] =
          effect.set;


      return;

  }


  // --------------------------------------------------------
  // ADD
  // --------------------------------------------------------

  const {
      target,
      key
  } =
      ensurePath(
          player,
          effect.path
      );


  const oldValue =
      Number(
          target[key]
      );


  const amount =
      Number(
          effect.amount
      ) || 0;


  if (
      Number.isFinite(
          oldValue
      )
  ) {

      target[key] =
          oldValue +
          amount;

  }

  else {

      target[key] =
          amount;

  }

}


// ============================================================
// APPLY EFFECTS
// ============================================================

export function applyEffects(
  player,
  effects = []
) {

  if (
      !Array.isArray(
          effects
      )
  ) {

      return;

  }


  for (
      const effect of effects
  ) {

      applyEffect(
          player,
          effect
      );

  }

}


// ============================================================
// RECORD EVENT
// ============================================================

export function recordEvent(
  player,
  event
) {

  if (
      !player ||
      !event
  ) {

      return;

  }


  const state =
      ensureEventState(player);


  const day =
      getCurrentDay(player);


  const month =
      getCurrentMonth(player);


  if (
      !state.history[event.id]
  ) {

      state.history[event.id] = {

          count: 0,

          lastDay: null,

          lastMonth: null

      };

  }


  const history =
      state.history[event.id];


  history.count += 1;

  history.lastDay =
      day;

  history.lastMonth =
      month;


  state.lastEventId =
      event.id;

  state.lastEventType =
      event.type;


  if (
      event.mode ===
      EVENT_MODE.DYNAMIC &&
      event.type ===
      EVENT_TYPE.LIFE
  ) {

      state.lifeDynamicThisMonth +=
          1;

  }


  if (
      event.mode ===
      EVENT_MODE.STATIC
  ) {

      state.staticThisMonth +=
          1;

  }

}


// ============================================================
// RESOLVE EVENT RESULT
// ============================================================
//
// Dynamic event:
//     choice → result → effects
//
// Static event:
//     effects directly
//
// ============================================================

export function resolveEvent(
  player,
  event,
  choiceId = null,
  resultId = null
) {

  if (
      !player ||
      !event
  ) {

      return {

          success: false,

          reason:
              "INVALID_EVENT"

      };

  }


  if (
      !isEventEligible(
          player,
          event
      )
  ) {

      return {

          success: false,

          reason:
              "EVENT_NOT_ELIGIBLE"

      };

  }


  // ========================================================
  // STATIC
  // ========================================================

  if (
      event.mode ===
      EVENT_MODE.STATIC
  ) {

      applyEffects(
          player,
          event.effects
      );


      recordEvent(
          player,
          event
      );


      return {

          success: true,

          eventId:
              event.id,

          mode:
              EVENT_MODE.STATIC,

          effects:
              event.effects || [],

          text:
              event.message ||
              null

      };

  }


  // ========================================================
  // DYNAMIC
  // ========================================================

  if (
      event.mode !==
      EVENT_MODE.DYNAMIC
  ) {

      return {

          success: false,

          reason:
              "INVALID_EVENT_MODE"

      };

  }


  const choice =
      event.choices?.find(
          item =>
              item.id ===
              choiceId
      );


  if (!choice) {

      return {

          success: false,

          reason:
              "INVALID_CHOICE"

      };

  }


  // --------------------------------------------------------
  // RESULT
  // --------------------------------------------------------

  let result =
      null;


  if (
      Array.isArray(
          choice.results
      ) &&
      choice.results.length > 0
  ) {

      if (resultId) {

          result =
              choice.results.find(
                  item =>
                      item.id ===
                      resultId
              );

      }


      if (!result) {

          result =
              randomItem(
                  choice.results
              );

      }

  }


  // --------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------

  applyEffects(
      player,
      choice.effects
  );


  if (
      result
  ) {

      applyEffects(
          player,
          result.effects
      );

  }


  // --------------------------------------------------------
  // RECENT ACTION
  // --------------------------------------------------------

  if (
      choice.recordAction
  ) {

      recordRecentAction(
          player,
          choice.recordAction.id,
          choice.recordAction.data ||
              {}
      );

  }


  // --------------------------------------------------------
  // EVENT RECORD
  // --------------------------------------------------------

  recordEvent(
      player,
      event
  );


  return {

      success: true,

      eventId:
          event.id,

      mode:
          EVENT_MODE.DYNAMIC,

      choiceId:
          choice.id,

      resultId:
          result?.id ||
          null,

      resultText:
          getResultText(
              result
          ),

      effects: [
          ...(choice.effects || []),
          ...(result?.effects || [])
      ],

      nextEventId:
          result?.nextEventId ||
          choice.nextEventId ||
          null

  };

}


// ============================================================
// GENERATE LIFE DYNAMIC EVENT
// ============================================================

export function generateLifeEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.type ===
                  EVENT_TYPE.LIFE &&
              event.mode ===
                  EVENT_MODE.DYNAMIC
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// GENERATE STATIC EVENT
// ============================================================

export function generateStaticEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.mode ===
              EVENT_MODE.STATIC
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// GENERATE CAREER EVENT
// ============================================================

export function generateCareerEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.type ===
              EVENT_TYPE.CAREER
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// GENERATE SCHOOL EVENT
// ============================================================

export function generateSchoolEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.type ===
              EVENT_TYPE.SCHOOL
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// GENERATE MANAGER EVENT
// ============================================================

export function generateManagerEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.type ===
              EVENT_TYPE.MANAGER
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// GENERATE PRESIDENT EVENT
// ============================================================

export function generatePresidentEvent(
  player,
  events = []
) {

  const pool =
      events.filter(
          event =>
              event.type ===
              EVENT_TYPE.PRESIDENT
      );


  return selectRandomEvent(
      player,
      pool
  );

}


// ============================================================
// RESOLVE DYNAMIC EVENT
// ============================================================

export function resolveDynamicEvent(
  player,
  event,
  choiceId,
  resultId = null
) {

  if (
      event?.mode !==
      EVENT_MODE.DYNAMIC
  ) {

      return {

          success: false,

          reason:
              "NOT_DYNAMIC_EVENT"

      };

  }


  return resolveEvent(
      player,
      event,
      choiceId,
      resultId
  );

}


// ============================================================
// RESOLVE STATIC EVENT
// ============================================================

export function resolveStaticEvent(
  player,
  event
) {

  if (
      event?.mode !==
      EVENT_MODE.STATIC
  ) {

      return {

          success: false,

          reason:
              "NOT_STATIC_EVENT"

      };

  }


  return resolveEvent(
      player,
      event
  );

}


// ============================================================
// EXPORT
// ============================================================

export default {

  EVENT_TYPE,

  EVENT_MODE,

  EVENT_RARITY,

  EVENT_FLAG,

  getValue,

  getCurrentDay,

  getCurrentMonth,

  ensureEventState,

  syncEventTime,

  resetMonthlyEvents,

  recordRecentAction,

  getRecentAction,

  checkConditions,

  checkAnyConditions,

  checkEventConditions,

  getEventHistory,

  hasEventOccurred,

  isEventEligible,

  getEventWeight,

  getEligibleEvents,

  selectRandomEvent,

  getResultText,

  applyEffect,

  applyEffects,

  recordEvent,

  resolveEvent,

  generateLifeEvent,

  generateStaticEvent,

  generateCareerEvent,

  generateSchoolEvent,

  generateManagerEvent,

  generatePresidentEvent,

  resolveDynamicEvent,

  resolveStaticEvent

};