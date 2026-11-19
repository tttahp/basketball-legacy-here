// data/financeSystem.js


// ============================================================
// FINANCE SYSTEM
// ============================================================
//
// RESPONSIBILITY
// - Wallet / bank balance
// - Transaction history
// - Initial family support
// - Monthly family support
// - Scholarships
// - School tuition
// - Tuition debt
// - Tuition penalties
// - Financial analysis data
//
// DOES NOT HANDLE
// - Events
// - Match events
// - Event dialogue
// - Player development
// - Contracts
// ============================================================


// ============================================================
// CONSTANTS
// ============================================================

export const SCHOOL_TUITION = {

  SPECIALIZED: 25000,

  INTERNATIONAL: 15000

};


export const INITIAL_FAMILY_SUPPORT = 10000;


export const MONTHLY_FAMILY_SUPPORT = {

  MIN: 200,

  MAX: 500,

  STEP: 2

};


export const TUITION_DEBT = {

  YEAR_END_PENALTY: 5000,

  WEEKLY_PENALTY: 5000

};


// ============================================================
// INTERNAL HELPERS
// ============================================================

function ensureBank(player) {

  if (!player.bank) {

      player.bank = {};

  }


  if (
      typeof player.bank.balance !== "number"
  ) {

      player.bank.balance = 0;

  }


  if (!Array.isArray(player.bank.history)) {

      player.bank.history = [];

  }


  if (!player.bank.debt) {

      player.bank.debt = {

          total: 0,

          tuition: 0

      };

  }


  if (
      typeof player.bank.debt.total !== "number"
  ) {

      player.bank.debt.total = 0;

  }


  if (
      typeof player.bank.debt.tuition !== "number"
  ) {

      player.bank.debt.tuition = 0;

  }


  return player.bank;

}


function generateId(prefix = "TX") {

  return (

      prefix +

      "_" +

      Date.now().toString(36) +

      "_" +

      Math.random()
          .toString(36)
          .slice(2, 8)

  );

}


function getRandomInt(min, max) {

  return Math.floor(

      Math.random() *
      (max - min + 1)

  ) + min;

}


function getRandomEven(min, max) {

  const value = getRandomInt(min, max);

  if (value % 2 === 0) {

      return value;

  }

  return value - 1;

}


// ============================================================
// TRANSACTION HISTORY
// ============================================================

export function addTransaction(

  player,

  {

      type,

      category,

      amount,

      direction,

      description = "",

      source = null,

      season = null,

      year = null,

      month = null,

      day = null,

      metadata = {}

  }

) {

  if (!player) return null;


  const bank = ensureBank(player);


  const transactionAmount =
      Math.abs(Number(amount) || 0);


  const signedAmount =
      direction === "EXPENSE" ||
      direction === "DEBT"

          ? -transactionAmount

          : transactionAmount;


  bank.balance += signedAmount;


  const transaction = {

      id: generateId("TX"),

      type,

      category,

      amount: transactionAmount,

      direction,

      balanceAfter: bank.balance,

      description,

      source,

      season,

      year,

      month,

      day,

      timestamp: Date.now(),

      metadata

  };


  bank.history.push(transaction);


  return transaction;

}


// ============================================================
// INCOME
// ============================================================

export function addIncome(

  player,

  amount,

  options = {}

) {

  return addTransaction(

      player,

      {

          ...options,

          amount,

          direction: "INCOME"

      }

  );

}


// ============================================================
// EXPENSE
// ============================================================

export function addExpense(

  player,

  amount,

  options = {}

) {

  return addTransaction(

      player,

      {

          ...options,

          amount,

          direction: "EXPENSE"

      }

  );

}


// ============================================================
// CURRENT BALANCE
// ============================================================

export function getBalance(player) {

  if (!player) return 0;

  return ensureBank(player).balance;

}


// ============================================================
// INITIAL FAMILY SUPPORT
// ============================================================
//
// Every Free player receives $10,000 at the beginning.
// ============================================================

export function giveInitialFamilySupport(player) {

  if (!player) return null;


  const bank = ensureBank(player);


  if (bank.initialFamilySupportReceived) {

      return null;

  }


  bank.initialFamilySupportReceived = true;


  return addIncome(

      player,

      INITIAL_FAMILY_SUPPORT,

      {

          type: "FAMILY_SUPPORT",

          category: "FAMILY",

          description:
              "Initial family support",

          source:
              "INITIAL_SUPPORT"

      }

  );

}


// ============================================================
// MONTHLY FAMILY SUPPORT
// ============================================================
//
// Random even value:
// $200 / $202 / $204 ... $500
//
// ============================================================

export function generateMonthlyFamilySupport() {

  return getRandomEven(

      MONTHLY_FAMILY_SUPPORT.MIN,

      MONTHLY_FAMILY_SUPPORT.MAX

  );

}


export function giveMonthlyFamilySupport(

  player,

  season = null,

  year = null,

  month = null,

  day = null

) {

  if (!player) return null;


  const amount =
      generateMonthlyFamilySupport();


  return addIncome(

      player,

      amount,

      {

          type: "FAMILY_SUPPORT",

          category: "FAMILY",

          description:
              "Monthly family support",

          source:
              "MONTHLY_SUPPORT",

          season,

          year,

          month,

          day

      }

  );

}


// ============================================================
// SCHOLARSHIP AMOUNT ROLL
// ============================================================
//
// 40k - 50k : 1%
// 30k - 40k : 3%
// 20k - 30k : 5%
// 15k - 20k : 10%
// 10k - 15k : 15%
// 5k  - 10k : 45%
// 1k  - 5k  : 21%
//
// ============================================================

const SCHOLARSHIP_TIERS = [

  {
      min: 40000,
      max: 50000,
      chance: 1
  },

  {
      min: 30000,
      max: 40000,
      chance: 3
  },

  {
      min: 20000,
      max: 30000,
      chance: 5
  },

  {
      min: 15000,
      max: 20000,
      chance: 10
  },

  {
      min: 10000,
      max: 15000,
      chance: 15
  },

  {
      min: 5000,
      max: 10000,
      chance: 45
  },

  {
      min: 1000,
      max: 5000,
      chance: 21
  }

];


export function rollScholarshipAmount() {

  const roll =
      Math.random() * 100;


  let cumulative = 0;


  for (
      const tier of SCHOLARSHIP_TIERS
  ) {

      cumulative += tier.chance;


      if (roll < cumulative) {

          return getRandomEven(

              tier.min,

              tier.max

          );

      }

  }


  return 5000;

}


// ============================================================
// CREATE SCHOLARSHIP OFFER
// ============================================================
//
// Finance system creates financial terms only.
// eventData decides how the offer is presented.
// ============================================================

export function createScholarshipOffer(

  {

      provider,

      providerType,

      payoutType,

      years = 1,

      monthlyAmount = null,

      annualAmount = null,

      amount = null,

      conditions = []

  }

) {

  let value = amount;


  if (value === null) {

      value =
          rollScholarshipAmount();

  }


  return {

      id: generateId("SCHOLARSHIP"),

      provider,

      providerType,

      payoutType,

      amount: value,

      years,

      monthlyAmount,

      annualAmount,

      conditions,

      selected: false,

      active: false,

      completed: false

  };

}


// ============================================================
// SCHOLARSHIP TYPES
// ============================================================
//
// School:
// One immediate payment covering the scholarship.
//
// BLA:
// One payment each school year.
//
// Brand:
// Monthly payments.
// ============================================================

export function createSchoolScholarship(

  provider = "School"

) {

  return createScholarshipOffer({

      provider,

      providerType: "SCHOOL",

      payoutType: "LUMP_SUM",

      years: 2

  });

}


export function createBLAScholarship(

  provider = "BLA"

) {

  return createScholarshipOffer({

      provider,

      providerType: "BLA",

      payoutType: "YEARLY",

      years: 2

  });

}


export function createBrandScholarship(

  provider

) {

  return createScholarshipOffer({

      provider,

      providerType: "BRAND",

      payoutType: "MONTHLY",

      years: 2,

      conditions: []

  });

}


// ============================================================
// GENERATE THREE SCHOLARSHIP OFFERS
// ============================================================
//
// Exactly three:
// 1. School
// 2. BLA
// 3. Brand
//
// ============================================================

export function generateScholarshipOffers(

  brand

) {

  return [

      createSchoolScholarship(),

      createBLAScholarship(),

      createBrandScholarship(

          brand

      )

  ];

}


// ============================================================
// ACCEPT SCHOLARSHIP
// ============================================================
//
// Money is NOT automatically used for tuition.
// ============================================================

export function acceptScholarship(

  player,

  scholarship,

  season = null,

  year = null,

  month = null,

  day = null

) {

  if (!player || !scholarship) {

      return null;

  }


  scholarship.selected = true;

  scholarship.active = true;


  if (
      scholarship.payoutType ===
      "LUMP_SUM"
  ) {

      return addIncome(

          player,

          scholarship.amount,

          {

              type: "SCHOLARSHIP",

              category: "EDUCATION",

              description:
                  `${scholarship.provider} scholarship`,

              source:
                  scholarship.provider,

              season,

              year,

              month,

              day

          }

      );

  }


  if (
      scholarship.payoutType ===
      "YEARLY"
  ) {

      scholarship.annualAmount =
          scholarship.amount;


      return null;

  }


  if (
      scholarship.payoutType ===
      "MONTHLY"
  ) {

      scholarship.monthlyAmount =
          scholarship.amount;


      return null;

  }


  return null;

}


// ============================================================
// SCHOLARSHIP YEARLY PAYMENT
// ============================================================

export function payAnnualScholarship(

  player,

  scholarship,

  season = null,

  year = null,

  month = null,

  day = null

) {

  if (
      !player ||
      !scholarship ||
      !scholarship.active
  ) {

      return null;

  }


  if (
      scholarship.payoutType !==
      "YEARLY"
  ) {

      return null;

  }


  if (
      scholarship.years <= 0
  ) {

      return null;

  }


  scholarship.years--;


  return addIncome(

      player,

      scholarship.annualAmount,

      {

          type: "SCHOLARSHIP",

          category: "EDUCATION",

          description:
              `${scholarship.provider} yearly scholarship`,

          source:
              scholarship.provider,

          season,

          year,

          month,

          day

      }

  );

}


// ============================================================
// SCHOLARSHIP MONTHLY PAYMENT
// ============================================================

export function payMonthlyScholarship(

  player,

  scholarship,

  season = null,

  year = null,

  month = null,

  day = null

) {

  if (
      !player ||
      !scholarship ||
      !scholarship.active
  ) {

      return null;

  }


  if (
      scholarship.payoutType !==
      "MONTHLY"
  ) {

      return null;

  }


  return addIncome(

      player,

      scholarship.monthlyAmount,

      {

          type: "SCHOLARSHIP",

          category: "EDUCATION",

          description:
              `${scholarship.provider} monthly scholarship`,

          source:
              scholarship.provider,

          season,

          year,

          month,

          day

      }

  );

}


// ============================================================
// SCHOOL TUITION
// ============================================================

export function getSchoolTuition(

  schoolType

) {

  if (
      schoolType ===
      "SPECIALIZED"
  ) {

      return SCHOOL_TUITION.SPECIALIZED;

  }


  if (
      schoolType ===
      "INTERNATIONAL"
  ) {

      return SCHOOL_TUITION.INTERNATIONAL;

  }


  return 0;

}


// ============================================================
// CREATE TUITION RECORD
// ============================================================

export function createTuitionRecord(

  player,

  schoolType

) {

  if (!player) return null;


  if (!player.education) {

      player.education = {};

  }


  if (!Array.isArray(
      player.education.tuition
  )) {

      player.education.tuition = [];

  }


  const tuition = {

      id: generateId("TUITION"),

      schoolType,

      amount:
          getSchoolTuition(
              schoolType
          ),

      paid: 0,

      remaining:
          getSchoolTuition(
              schoolType
          ),

      status: "UNPAID",

      schoolYear: 1,

      yearEndPenaltyApplied: false,

      weeklyPenaltyWeeks: 0

  };


  player.education.tuition.push(

      tuition

  );


  return tuition;

}


// ============================================================
// PAY TUITION
// ============================================================
//
// Player manually pays tuition.
// Scholarship money is never automatically used.
// ============================================================

export function payTuition(

  player,

  tuitionId,

  amount = null,

  season = null,

  year = null,

  month = null,

  day = null

) {

  if (!player) return null;


  const bank =
      ensureBank(player);


  if (
      !player.education ||
      !Array.isArray(
          player.education.tuition
      )
  ) {

      return null;

  }


  const tuition =
      player.education.tuition.find(

          item =>
              item.id ===
              tuitionId

      );


  if (!tuition) {

      return null;

  }


  if (
      tuition.remaining <= 0
  ) {

      return tuition;

  }


  const requested =
      amount === null

          ? tuition.remaining

          : Math.abs(amount);


  const payment =
      Math.min(

          requested,

          bank.balance,

          tuition.remaining

      );


  if (payment <= 0) {

      return {

          success: false,

          reason:
              "INSUFFICIENT_FUNDS",

          tuition

      };

  }


  addExpense(

      player,

      payment,

      {

          type: "TUITION_PAYMENT",

          category: "EDUCATION",

          description:
              "School tuition payment",

          source:
              tuition.id,

          season,

          year,

          month,

          day

      }

  );


  tuition.paid += payment;


  tuition.remaining -= payment;


  if (
      tuition.remaining <= 0
  ) {

      tuition.remaining = 0;

      tuition.status = "PAID";

  }

  else {

      tuition.status = "PARTIAL";

  }


  return {

      success: true,

      payment,

      tuition

  };

}


// ============================================================
// YEAR-END TUITION CHECK
// ============================================================
//
// If Year 1 remains unpaid:
// +$5,000 debt
//
// ============================================================

export function processTuitionYearEnd(

  player

) {

  if (!player) return null;


  if (
      !player.education ||
      !Array.isArray(
          player.education.tuition
      )
  ) {

      return null;

  }


  const tuition =
      player.education.tuition.find(

          item =>
              item.schoolYear === 1 &&
              item.remaining > 0

      );


  if (!tuition) {

      return null;

  }


  if (
      tuition.yearEndPenaltyApplied
  ) {

      return tuition;

  }


  tuition.yearEndPenaltyApplied = true;


  tuition.status = "OVERDUE";


  addTuitionDebt(

      player,

      TUITION_DEBT.YEAR_END_PENALTY,

      {

          reason:
              "Year 1 tuition unpaid"

      }

  );


  return tuition;

}


// ============================================================
// WEEKLY TUITION DEBT
// ============================================================
//
// Every unpaid week after the year-end penalty:
// +$5,000
//
// ============================================================

export function processWeeklyTuitionDebt(

  player

) {

  if (!player) return null;


  if (
      !player.education ||
      !Array.isArray(
          player.education.tuition
      )
  ) {

      return null;

  }


  const overdue =
      player.education.tuition.find(

          item =>
              item.status === "OVERDUE" &&
              item.remaining > 0

      );


  if (!overdue) {

      return null;

  }


  overdue.weeklyPenaltyWeeks++;


  addTuitionDebt(

      player,

      TUITION_DEBT.WEEKLY_PENALTY,

      {

          reason:
              "Weekly unpaid tuition penalty",

          tuitionId:
              overdue.id

      }

  );


  return overdue;

}


// ============================================================
// ADD TUITION DEBT
// ============================================================

export function addTuitionDebt(

  player,

  amount,

  metadata = {}

) {

  if (!player) return null;


  const bank =
      ensureBank(player);


  const debt =
      Math.abs(amount);


  bank.debt.tuition += debt;

  bank.debt.total += debt;


  return addTransaction(

      player,

      {

          type: "DEBT",

          category: "EDUCATION_DEBT",

          amount: debt,

          direction: "DEBT",

          description:
              metadata.reason ||
              "Tuition debt",

          source:
              "TUITION",

          metadata

      }

  );

}


// ============================================================
// FINANCIAL ANALYSIS
// ============================================================

export function getFinancialAnalysis(

  player

) {

  if (!player) {

      return null;

  }


  const bank =
      ensureBank(player);


  const history =
      bank.history;


  let income = 0;

  let expenses = 0;

  let scholarshipIncome = 0;

  let familySupport = 0;

  let tuitionPaid = 0;

  let debtAdded = 0;


  const categories = {};


  for (
      const transaction of history
  ) {

      if (
          transaction.direction ===
          "INCOME"
      ) {

          income +=
              transaction.amount;

      }


      if (
          transaction.direction ===
          "EXPENSE"
      ) {

          expenses +=
              transaction.amount;

      }


      if (
          transaction.direction ===
          "DEBT"
      ) {

          debtAdded +=
              transaction.amount;

      }


      if (
          transaction.type ===
          "SCHOLARSHIP"
      ) {

          scholarshipIncome +=
              transaction.amount;

      }


      if (
          transaction.type ===
          "FAMILY_SUPPORT"
      ) {

          familySupport +=
              transaction.amount;

      }


      if (
          transaction.type ===
          "TUITION_PAYMENT"
      ) {

          tuitionPaid +=
              transaction.amount;

      }


      const category =
          transaction.category ||
          "OTHER";


      if (
          !categories[category]
      ) {

          categories[category] = 0;

      }


      if (
          transaction.direction ===
          "EXPENSE"
      ) {

          categories[category] +=
              transaction.amount;

      }

  }


  return {

      balance:
          bank.balance,

      debt:
          bank.debt.total,

      tuitionDebt:
          bank.debt.tuition,

      totalIncome:
          income,

      totalExpenses:
          expenses,

      netCashFlow:
          income - expenses,

      scholarshipIncome,

      familySupport,

      tuitionPaid,

      debtAdded,

      spendingByCategory:
          categories,

      transactionCount:
          history.length

  };

}


// ============================================================
// EXPORT
// ============================================================

export default {

  SCHOOL_TUITION,

  INITIAL_FAMILY_SUPPORT,

  MONTHLY_FAMILY_SUPPORT,

  TUITION_DEBT,

  addTransaction,

  addIncome,

  addExpense,

  getBalance,

  giveInitialFamilySupport,

  generateMonthlyFamilySupport,

  giveMonthlyFamilySupport,

  rollScholarshipAmount,

  createScholarshipOffer,

  createSchoolScholarship,

  createBLAScholarship,

  createBrandScholarship,

  generateScholarshipOffers,

  acceptScholarship,

  payAnnualScholarship,

  payMonthlyScholarship,

  getSchoolTuition,

  createTuitionRecord,

  payTuition,

  processTuitionYearEnd,

  processWeeklyTuitionDebt,

  addTuitionDebt,

  getFinancialAnalysis

};