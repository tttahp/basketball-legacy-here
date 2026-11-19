// data/scholarshipSystem.js


// ============================================================
// SCHOLARSHIP AMOUNT TIERS
// ============================================================

const STANDARD_SCHOLARSHIP_TIERS = [

  {
      min: 40000,
      max: 50000,
      weight: 1
  },

  {
      min: 30000,
      max: 40000,
      weight: 3
  },

  {
      min: 20000,
      max: 30000,
      weight: 5
  },

  {
      min: 15000,
      max: 20000,
      weight: 10
  },

  {
      min: 10000,
      max: 15000,
      weight: 15
  },

  {
      min: 5000,
      max: 10000,
      weight: 45
  },

  {
      min: 1000,
      max: 5000,
      weight: 21
  }

];


// ============================================================
// BRAND SCHOLARSHIP
// ============================================================

const BRAND_SCHOLARSHIP_TIERS = [

  {
      min: 40000,
      max: 50000,
      weight: 5
  },

  {
      min: 20000,
      max: 40000,
      weight: 15
  },

  {
      min: 10000,
      max: 20000,
      weight: 30
  },

  {
      min: 5000,
      max: 10000,
      weight: 50
  }

];


// ============================================================
// CONSTANTS
// ============================================================

const SCHOLARSHIP_DURATION_MONTHS = 24;

const BRAND_TVC_COMMISSION = 50;

const BRAND_TVC_ENERGY_COST = 30;

const BRAND_TVC_FANS = 50;

const BRAND_TVC_SKIP_PENALTY = -100;

const BRAND_TVC_SKIP_ENERGY = 10;

const BRAND_TVC_SKIP_COACH_TRUST = 1;


// ============================================================
// BRANDS
// ============================================================

const NORMAL_BRANDS = [

  "NAKI",
  "ALIDOS",
  "NATFLEX",
  "HOLLYGOOD",
  "LIKE-NEW"

];


const BETTING_BRANDS = [

  "BETKING",
  "ODDSMAX",
  "WINZONE"

];


// ============================================================
// HELPERS
// ============================================================

function randomInt(min, max) {

  return Math.floor(
      Math.random() *
      (max - min + 1)
  ) + min;

}


function randomEvenInt(min, max) {

  const first =
      Math.ceil(min / 2);

  const last =
      Math.floor(max / 2);

  return randomInt(
      first,
      last
  ) * 2;

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


function randomTier(tiers) {

  const totalWeight =
      tiers.reduce(
          (
              total,
              tier
          ) =>
              total +
              tier.weight,
          0
      );


  let roll =
      Math.random() *
      totalWeight;


  for (const tier of tiers) {

      roll -= tier.weight;

      if (roll <= 0) {

          return tier;

      }

  }


  return tiers[
      tiers.length - 1
  ];

}


// ============================================================
// SCHOLARSHIP AMOUNT
// ============================================================

export function generateScholarshipAmount() {

  const tier =
      randomTier(
          STANDARD_SCHOLARSHIP_TIERS
      );


  return randomEvenInt(
      tier.min,
      tier.max
  );

}


export function generateBrandScholarshipAmount() {

  const tier =
      randomTier(
          BRAND_SCHOLARSHIP_TIERS
      );


  return randomEvenInt(
      tier.min,
      tier.max
  );

}


// ============================================================
// SCHOOL SCHOLARSHIP
// ============================================================

export function createSchoolScholarshipOffer() {

  return {

      type:
          "SCHOOL",

      totalAmount:
          generateScholarshipAmount(),

      durationMonths:
          SCHOLARSHIP_DURATION_MONTHS,

      effects: [

          {
              type:
                  "TRAINING_EFFICIENCY",

              amount:
                  10,

              durationMonths:
                  6

          }

      ]

  };

}


// ============================================================
// BLA SCHOLARSHIP
// ============================================================

export function createBLAScholarshipOffer() {

  return {

      type:
          "BLA",

      totalAmount:
          generateScholarshipAmount(),

      durationMonths:
          SCHOLARSHIP_DURATION_MONTHS,

      effects: [

          {
              path:
                  "fanbase",

              amount:
                  1000

          }

      ]

  };

}


// ============================================================
// BRAND SCHOLARSHIP
// ============================================================
//
// totalAmount = tổng giá trị scholarship trong 24 tháng.
//
// Không phải số tiền nhận mỗi tháng.
//
// Mỗi tháng player phải đi TVC mới nhận kỳ đó.
// ============================================================

export function createBrandScholarshipOffer() {

  const totalAmount =
      generateBrandScholarshipAmount();


  const isBettingBrand =
      Math.random() < 0.08;


  const brand =
      isBettingBrand

          ? randomItem(
              BETTING_BRANDS
          )

          : randomItem(
              NORMAL_BRANDS
          );


  return {

      type:
          "BRAND",

      brand,

      totalAmount,

      durationMonths:
          SCHOLARSHIP_DURATION_MONTHS,

      effects: [

          {
              path:
                  "fanbase",

              amount:
                  -100

          }

      ],

      monthlyTVC: {

          required:
              true,

          attend: {

              scholarshipPayment:
                  true,

              commission:
                  BRAND_TVC_COMMISSION,

              energy:
                  -BRAND_TVC_ENERGY_COST,

              fanbase:
                  BRAND_TVC_FANS

          },

          skip: {

              scholarshipPayment:
                  false,

              money:
                  BRAND_TVC_SKIP_PENALTY,

              energy:
                  BRAND_TVC_SKIP_ENERGY,

              coachTrust:
                  BRAND_TVC_SKIP_COACH_TRUST

          }

      },

      bettingRestriction:
          isBettingBrand
              ? {
                  under18:
                      true,

                  bettingAccess:
                      false
              }
              : null

  };

}


// ============================================================
// THREE SCHOLARSHIP OFFERS
// ============================================================

export function generateScholarshipOffers() {

  return [

      createSchoolScholarshipOffer(),

      createBLAScholarshipOffer(),

      createBrandScholarshipOffer()

  ];

}


// ============================================================
// CREATE CONTRACT
// ============================================================

export function createScholarshipContract(
  offer
) {

  if (!offer) {

      return null;

  }


  return {

      type:
          offer.type,

      brand:
          offer.brand ||
          null,

      totalAmount:
          offer.totalAmount,

      durationMonths:
          offer.durationMonths,

      currentMonth:
          0,

      paidAmount:
          0,

      missedMonths:
          0

  };

}


// ============================================================
// MONTHLY SCHOLARSHIP PAYMENT
// ============================================================
//
// Quan trọng:
//
// Không dùng "remaining / remaining months"
// vì như vậy sẽ tự động bù tháng bị skip.
//
// Payment của mỗi kỳ được xác định theo:
// totalAmount / 24.
//
// Kỳ cuối chỉ nhận phần nguyên còn lại của
// các kỳ cố định đã được phép nhận.
//
// Nếu skip tháng nào -> kỳ đó = 0 vĩnh viễn.
//
// ============================================================

export function getScheduledMonthlyPayment(
  contract
) {

  if (!contract) {

      return 0;

  }


  const total =
      Number(
          contract.totalAmount
      ) || 0;


  const duration =
      Number(
          contract.durationMonths
      ) || SCHOLARSHIP_DURATION_MONTHS;


  if (
      total <= 0 ||
      duration <= 0
  ) {

      return 0;

  }


  return Math.floor(
      total / duration
  );

}


// ============================================================
// CURRENT MONTH PAYMENT
// ============================================================

export function getCurrentScholarshipPayment(
  contract
) {

  if (!contract) {

      return 0;

  }


  if (
      contract.currentMonth >=
      contract.durationMonths
  ) {

      return 0;

  }


  const scheduled =
      getScheduledMonthlyPayment(
          contract
      );


  // Không có bù tiền tháng skip.
  return scheduled;

}


// ============================================================
// PAY SCHOLARSHIP
// ============================================================
//
// Chỉ gọi hàm này khi player ĐI TVC.
//
// ============================================================

export function receiveScholarshipPayment(
  contract
) {

  if (!contract) {

      return 0;

  }


  const payment =
      getCurrentScholarshipPayment(
          contract
      );


  if (
      payment <= 0
  ) {

      return 0;

  }


  contract.paidAmount +=
      payment;


  return payment;

}


// ============================================================
// SKIP SCHOLARSHIP MONTH
// ============================================================
//
// Kỳ này mất vĩnh viễn.
// Không cộng vào tháng sau.
// Không bù vào tháng cuối.
//
// ============================================================

export function skipScholarshipPayment(
  contract
) {

  if (!contract) {

      return;

  }


  if (
      contract.currentMonth >=
      contract.durationMonths
  ) {

      return;

  }


  contract.missedMonths += 1;

}


// ============================================================
// ADVANCE MONTH
// ============================================================

export function advanceScholarshipMonth(
  contract
) {

  if (!contract) {

      return;

  }


  if (
      contract.currentMonth <
      contract.durationMonths
  ) {

      contract.currentMonth += 1;

  }

}


// ============================================================
// TVC RESULT
// ============================================================
//
// attend = true
//   + scholarship payment
//   +$50 commission
//   -30 energy
//   +50 fans
//
// attend = false
//   scholarship payment lost
//   -$100
//   +10 energy
//   +1 coach trust
//
// ============================================================

export function resolveBrandTVC(
  contract,
  attend
) {

  if (!contract) {

      return {

          success: false,

          reason:
              "INVALID_CONTRACT"

      };

  }


  if (
      contract.type !==
      "BRAND"
  ) {

      return {

          success: false,

          reason:
              "NOT_BRAND_CONTRACT"

      };

  }


  if (
      contract.currentMonth >=
      contract.durationMonths
  ) {

      return {

          success: false,

          reason:
              "CONTRACT_FINISHED"

      };

  }


  // --------------------------------------------------------
  // ATTEND
  // --------------------------------------------------------

  if (attend) {

      const scholarshipPayment =
          receiveScholarshipPayment(
              contract
          );


      advanceScholarshipMonth(
          contract
      );


      return {

          success: true,

          attended: true,

          scholarshipPayment,

          commission:
              BRAND_TVC_COMMISSION,

          energy:
              -BRAND_TVC_ENERGY_COST,

          fanbase:
              BRAND_TVC_FANS,

          coachTrust:
              0

      };

  }


  // --------------------------------------------------------
  // SKIP
  // --------------------------------------------------------

  skipScholarshipPayment(
      contract
  );


  advanceScholarshipMonth(
      contract
  );


  return {

      success: true,

      attended: false,

      scholarshipPayment:
          0,

      commission:
          0,

      money:
          BRAND_TVC_SKIP_PENALTY,

      energy:
          BRAND_TVC_SKIP_ENERGY,

      fanbase:
          0,

      coachTrust:
          BRAND_TVC_SKIP_COACH_TRUST

  };

}


// ============================================================
// EXPORT
// ============================================================

export default {

  generateScholarshipAmount,

  generateBrandScholarshipAmount,

  createSchoolScholarshipOffer,

  createBLAScholarshipOffer,

  createBrandScholarshipOffer,

  generateScholarshipOffers,

  createScholarshipContract,

  getScheduledMonthlyPayment,

  getCurrentScholarshipPayment,

  receiveScholarshipPayment,

  skipScholarshipPayment,

  advanceScholarshipMonth,

  resolveBrandTVC

};