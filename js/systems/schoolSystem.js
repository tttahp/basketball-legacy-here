// data/schoolSystem.js

// ============================================================
// SCHOOL SYSTEM
// ============================================================
//
// Handles:
// - School selection
// - Tuition setup
// - 2-year school period
// - Tuition obligations
// - Tuition late/debt tracking
//
// Scholarship is NOT an event.
// Scholarship selection is handled by scholarshipSystem.js.
//
// Finance payments are NOT automatically made from scholarship.
// The player must manually pay tuition.
// ============================================================


// ============================================================
// SCHOOL TYPES
// ============================================================

export const SCHOOL_TYPE = {

  SPECIALIZED: "SPECIALIZED",

  INTERNATIONAL: "INTERNATIONAL"

};


// ============================================================
// SCHOOL TUITION
// ============================================================

export const SCHOOL_TUITION = {

  SPECIALIZED: 25000,

  INTERNATIONAL: 15000

};


export const SCHOOL_DURATION_YEARS = 2;


// ============================================================
// BASIC HELPERS
// ============================================================

function ensureFinance(player) {

  if (!player.finance) {

      player.finance = {};

  }

  return player.finance;

}


function ensureSchoolState(player) {

  if (!player.development) {

      player.development = {};

  }

  if (!player.development.school) {

      player.development.school = {};

  }

  const school =
      player.development.school;


  if (!Array.isArray(school.tuition)) {

      school.tuition = [];

  }

  if (!school.type) {

      school.type = null;

  }

  if (!school.id) {

      school.id = null;

  }

  if (!school.name) {

      school.name = null;

  }

  if (!Number.isFinite(Number(school.year))) {

      school.year = 1;

  }

  if (!Number.isFinite(Number(school.duration))) {

      school.duration =
          SCHOOL_DURATION_YEARS;

  }

  return school;

}


// ============================================================
// GET TUITION
// ============================================================

export function getAnnualTuition(
  schoolType
) {

  return (
      SCHOOL_TUITION[schoolType] ||
      0
  );

}


// ============================================================
// CREATE TUITION OBLIGATION
// ============================================================

function createTuitionRecord(
  year,
  amount
) {

  return {

      year,

      amount,

      paid: 0,

      remaining: amount,

      status: "UNPAID",

      overdue: false,

      debt: 0,

      lateWeeks: 0,

      lastPenaltyDay: null

  };

}


// ============================================================
// CREATE SCHOOL
// ============================================================

export function enrollPlayerInSchool(
  player,
  school
) {

  if (
      !player ||
      !school
  ) {

      return {

          success: false,

          reason: "INVALID_SCHOOL"

      };

  }


  const schoolState =
      ensureSchoolState(player);


  const finance =
      ensureFinance(player);


  const tuition =
      getAnnualTuition(
          school.type
      );


  if (!tuition) {

      return {

          success: false,

          reason: "INVALID_SCHOOL_TYPE"

      };

  }


  schoolState.id =
      school.id || null;


  schoolState.name =
      school.name || null;


  schoolState.type =
      school.type;


  schoolState.year =
      1;


  schoolState.duration =
      SCHOOL_DURATION_YEARS;


  schoolState.tuition = [

      createTuitionRecord(
          1,
          tuition
      ),

      createTuitionRecord(
          2,
          tuition
      )

  ];


  // Keep a finance-side reference.
  finance.tuition = {

      schoolId:
          school.id || null,

      schoolName:
          school.name || null,

      annualAmount:
          tuition,

      totalAmount:
          tuition *
          SCHOOL_DURATION_YEARS,

      paid:
          0,

      remaining:
          tuition *
          SCHOOL_DURATION_YEARS,

      currentYear:
          1,

      records:
          schoolState.tuition

  };


  return {

      success: true,

      school: schoolState,

      tuition:
          tuition,

      totalTuition:
          tuition *
          SCHOOL_DURATION_YEARS

  };

}


// ============================================================
// GET CURRENT TUITION
// ============================================================

export function getCurrentTuition(
  player
) {

  const school =
      ensureSchoolState(player);


  return (
      school.tuition[
          Math.max(
              0,
              Number(school.year) - 1
          )
      ] ||
      null
  );

}


// ============================================================
// PAY TUITION
// ============================================================
//
// IMPORTANT:
// Scholarship money is NOT automatically used.
// The player explicitly pays tuition.
//
// ============================================================

export function payTuition(
  player,
  amount
) {

  if (!player) {

      return {

          success: false,

          reason: "INVALID_PLAYER"

      };

  }


  const school =
      ensureSchoolState(player);


  const finance =
      ensureFinance(player);


  const tuition =
      getCurrentTuition(player);


  if (!tuition) {

      return {

          success: false,

          reason: "NO_TUITION"

      };

  }


  const requested =
      Number(amount);


  if (
      !Number.isFinite(requested) ||
      requested <= 0
  ) {

      return {

          success: false,

          reason: "INVALID_AMOUNT"

      };

  }


  const wallet =
      Number(finance.wallet) || 0;


  if (wallet < requested) {

      return {

          success: false,

          reason: "INSUFFICIENT_FUNDS",

          required:
              requested,

          wallet

      };

  }


  const payment =
      Math.min(
          requested,
          tuition.remaining
      );


  finance.wallet =
      wallet - payment;


  tuition.paid += payment;

  tuition.remaining -= payment;


  finance.tuition.paid =
      Number(
          finance.tuition.paid
      ) + payment;


  finance.tuition.remaining =
      Math.max(
          0,
          Number(
              finance.tuition.remaining
          ) - payment
      );


  if (
      tuition.remaining <= 0
  ) {

      tuition.remaining = 0;

      tuition.status = "PAID";

      tuition.overdue = false;

  }


  return {

      success: true,

      paid:
          payment,

      remaining:
          tuition.remaining,

      status:
          tuition.status

  };

}


// ============================================================
// ADVANCE SCHOOL YEAR
// ============================================================

export function advanceSchoolYear(
  player
) {

  if (!player) return null;


  const school =
      ensureSchoolState(player);


  if (
      school.year >=
      school.duration
  ) {

      return {

          success: false,

          reason: "SCHOOL_COMPLETED"

      };

  }


  school.year += 1;


  if (player.finance?.tuition) {

      player.finance.tuition.currentYear =
          school.year;

  }


  return {

      success: true,

      year:
          school.year

  };

}


// ============================================================
// TUITION LATE PENALTY
// ============================================================
//
// Year 1 unpaid when Year 2 begins:
// +$5,000 debt.
//
// After that:
// +$5,000 every week.
//
// The system does not silently take money.
// It creates debt that Finance can display.
// ============================================================

export function processTuitionDebt(
  player,
  currentDay
) {

  if (!player) return null;


  const school =
      ensureSchoolState(player);


  const finance =
      ensureFinance(player);


  const day =
      Number(currentDay);


  if (!Number.isFinite(day)) {

      return null;

  }


  const currentYear =
      Number(school.year);


  const result = {

      penalties: [],

      totalDebtAdded: 0

  };


  for (
      const tuition of school.tuition
  ) {

      if (
          tuition.status === "PAID"
      ) {

          continue;

      }


      // ----------------------------------------------------
      // Year 1 becomes overdue when Year 2 starts.
      // ----------------------------------------------------

      if (
          tuition.year <
          currentYear
      ) {

          if (!tuition.overdue) {

              tuition.overdue = true;

              tuition.status =
                  "OVERDUE";


              tuition.debt += 5000;

              tuition.remaining += 5000;

              tuition.lateWeeks = 1;

              tuition.lastPenaltyDay =
                  day;


              result.penalties.push({

                  year:
                      tuition.year,

                  amount:
                      5000,

                  reason:
                      "YEAR_ROLLOVER"

              });


              result.totalDebtAdded +=
                  5000;

          }

      }


      // ----------------------------------------------------
      // Every 7 days after first penalty:
      // +$5,000
      // ----------------------------------------------------

      if (
          tuition.overdue &&
          Number.isFinite(
              Number(
                  tuition.lastPenaltyDay
              )
          )
      ) {

          const daysSincePenalty =
              day -
              Number(
                  tuition.lastPenaltyDay
              );


          if (
              daysSincePenalty >= 7
          ) {

              const weeks =
                  Math.floor(
                      daysSincePenalty /
                      7
                  );


              const debt =
                  weeks * 5000;


              tuition.debt +=
                  debt;


              tuition.remaining +=
                  debt;


              tuition.lateWeeks +=
                  weeks;


              tuition.lastPenaltyDay =
                  day;


              result.penalties.push({

                  year:
                      tuition.year,

                  amount:
                      debt,

                  reason:
                      "WEEKLY_LATE_PENALTY",

                  weeks

              });


              result.totalDebtAdded +=
                  debt;

          }

      }

  }


  if (
      finance.tuition
  ) {

      finance.tuition.remaining =
          school.tuition.reduce(
              (
                  total,
                  item
              ) =>
                  total +
                  Number(
                      item.remaining
                  ),
              0
          );

  }


  return result;

}


// ============================================================
// SCHOOL COMPLETE
// ============================================================

export function isSchoolComplete(
  player
) {

  const school =
      ensureSchoolState(player);


  return (
      Number(school.year) >=
      Number(school.duration)
  );

}


// ============================================================
// EXPORT
// ============================================================

export default {

  SCHOOL_TYPE,

  SCHOOL_TUITION,

  SCHOOL_DURATION_YEARS,

  getAnnualTuition,

  enrollPlayerInSchool,

  getCurrentTuition,

  payTuition,

  advanceSchoolYear,

  processTuitionDebt,

  isSchoolComplete

};