// ============================================================
// NPC GENERATOR
// ============================================================
// Hệ thống NPC riêng hoàn toàn với PLAYER.
//
// NPC chỉ được tạo khi game cần.
// Không mô phỏng toàn bộ thế giới cùng lúc.
//
// Player đang ở league nào:
// -> tạo NPC cần thiết cho league đó.
//
// Player rời league:
// -> NPC không có relationship có thể xóa.
// -> NPC có relationship được giữ lại để sinh event.
//
// NPC có development đơn giản:
// -> Normal
// -> Early Peak
// -> Late Bloomer
// -> Steady
//
// Sau peak sẽ có một khoảng thời gian ổn định.
// Sau đó mới bắt đầu decline.
//
// NPC cũng có thể:
// -> chấn thương
// -> nghỉ một mùa
// -> giải nghệ sớm
// -> giải nghệ bình thường
//
// Mục tiêu:
// đủ để thế giới sống động,
// nhưng không mô phỏng NPC sâu như PLAYER.
// ============================================================


// ============================================================
// RANDOM HELPERS
// ============================================================

// Random số nguyên từ min tới max.
function randomInt(min, max) {

  return Math.floor(
      Math.random() * (max - min + 1)
  ) + min;

}


// Random một phần tử trong array.
function randomChoice(array) {

  return array[
      Math.floor(
          Math.random() * array.length
      )
  ];

}


// Giới hạn một giá trị trong khoảng min -> max.
function clamp(value, min, max) {

  return Math.max(
      min,
      Math.min(
          max,
          value
      )
  );

}


// ============================================================
// POSITION PROFILES
// ============================================================
// Profile quyết định bản sắc position.
//
// Đây KHÔNG phải OVR.
// OVR được tạo riêng theo nguồn NPC.
//
// Stat vẫn bị giới hạn bởi:
// - position
// - overall
// - source ceiling
//
// Vì vậy NPC School không thể có stat 95 chỉ vì random.
// ============================================================

const POSITION_PROFILES = {

  PG: {

      speed: [45, 95],
      strength: [30, 82],
      stamina: [45, 99],

      shoot: [35, 96],
      threePoint: [30, 98],

      pass: [40, 99],

      rebound: [20, 75],
      defense: [25, 93],

      dunk: [15, 85],

      handle: [40, 99]

  },


  SG: {

      speed: [40, 95],
      strength: [30, 81],
      stamina: [45, 99],

      shoot: [40, 98],
      threePoint: [35, 99],

      pass: [25, 80],

      rebound: [20, 75],
      defense: [25, 89],

      dunk: [25, 92],

      handle: [35, 92]

  },


  SF: {

      speed: [35, 90],
      strength: [35, 91],
      stamina: [45, 99],

      shoot: [35, 95],
      threePoint: [30, 92],

      pass: [25, 82],

      rebound: [30, 90],
      defense: [30, 93],

      dunk: [30, 95],

      handle: [25, 84]

  },


  PF: {

      speed: [25, 80],
      strength: [45, 97],
      stamina: [45, 99],

      shoot: [30, 92],
      threePoint: [20, 85],

      pass: [20, 75],

      rebound: [45, 97],
      defense: [40, 98],

      dunk: [35, 98],

      handle: [15, 73]

  },


  C: {

      speed: [20, 70],
      strength: [50, 99],
      stamina: [45, 99],

      shoot: [25, 90],
      threePoint: [15, 84],

      pass: [20, 75],

      rebound: [50, 99],
      defense: [45, 99],

      dunk: [40, 99],

      handle: [10, 69]

  }

};


// ============================================================
// NPC SOURCE CONFIG
// ============================================================
// Mỗi nguồn có giới hạn riêng.
//
// SCHOOL  -> OVR tối đa 65
// DLEAGUE -> OVR tối đa 85
// DRAFT   -> OVR 67-82
// BLA     -> OVR tối đa 99
//
// Draft tuyệt đối không dùng BLA config.
// ============================================================

const NPC_SOURCE_CONFIG = {

  SCHOOL: {

      age: [16, 18],

      overall: [35, 65],

      overallMax: 65

  },


  DLEAGUE: {

      age: [19, 45],

      overall: [45, 85],

      overallMax: 85

  },


  DRAFT: {

      age: [18, 22],

      overall: [67, 82],

      overallMax: 82

  },


  BLA: {

      age: [19, 50],

      overall: [60, 99],

      overallMax: 99

  }

};


// ============================================================
// BODY TYPES
// ============================================================

const BODY_TYPES = [

  "Slim",
  "Balance",
  "Athletic",
  "Big"

];


// ============================================================
// DEVELOPMENT TYPES
// ============================================================
// "Decline" KHÔNG phải development type.
//
// Decline là giai đoạn sau peak.
//
// Mỗi NPC chỉ có 4 type:
// Normal
// Early Peak
// Late Bloomer
// Steady
//
// declineAge luôn được tính từ peakAge.
// ============================================================

const DEVELOPMENT_TYPES = [

  "Normal",
  "Early Peak",
  "Late Bloomer",
  "Steady"

];


// ============================================================
// ROLE
// ============================================================
// Role dựa trên OVR.
//
// Role không khóa vĩnh viễn.
// Có thể thay đổi khi OVR thay đổi.
// ============================================================

function getRole(overall) {

  if (overall >= 90) {

      return "Star/Franchise Player";

  }


  if (overall >= 82) {

      return "Starter";

  }


  if (overall >= 76) {

      return "Sixth Man";

  }


  if (overall >= 68) {

      return "Role Player/Bench";

  }


  return "Prospect/Bench Warmer";

}


// ============================================================
// MORALE
// ============================================================
// Các mức morale:
// Untouchable
// Happy
// Normal
// Unhappy
// Angry
// ============================================================

function generateMorale() {

  const roll =
      Math.random();


  if (roll < 0.05) {

      return "Untouchable";

  }


  if (roll < 0.25) {

      return "Happy";

  }


  if (roll < 0.85) {

      return "Normal";

  }


  if (roll < 0.97) {

      return "Unhappy";

  }


  return "Angry";

}


// ============================================================
// CONDITION
// ============================================================
// Các mức condition:
// Excellent
// Good
// Healthy
// Sick
// Exhausted
//
// MatchEngine quyết định effect.
// NPC generator chỉ tạo trạng thái.
// ============================================================

function generateCondition() {

  const roll =
      Math.random();


  if (roll < 0.04) {

      return "Excellent";

  }


  if (roll < 0.25) {

      return "Good";

  }


  if (roll < 0.82) {

      return "Healthy";

  }


  if (roll < 0.97) {

      return "Sick";

  }


  return "Exhausted";

}


// ============================================================
// DEVELOPMENT GENERATOR
// ============================================================
// Mỗi NPC có:
// - type
// - peakAge
// - declineAge
//
// declineAge KHÔNG random độc lập.
//
// declineAge = peakAge + 2-5 tuổi.
//
// Ví dụ:
// Late Bloomer peak 30
// -> decline chỉ có thể từ 32-35.
// ============================================================

function generateDevelopment() {

  // Chọn kiểu phát triển.
  const type =
      randomChoice(
          DEVELOPMENT_TYPES
      );


  let peakAge;


  switch (type) {

      // Phát triển bình thường.
      case "Normal":

          peakAge =
              randomInt(25, 29);

          break;


      // Peak sớm.
      case "Early Peak":

          peakAge =
              randomInt(22, 27);

          break;


      // Late bloomer.
      case "Late Bloomer":

          peakAge =
              randomInt(29, 33);

          break;


      // Phát triển ổn định.
      case "Steady":

          peakAge =
              randomInt(27, 31);

          break;


      default:

          peakAge =
              randomInt(25, 29);

  }


  // Decline luôn xảy ra sau peak.
  const declineAge =
      peakAge +
      randomInt(2, 5);


  return {

      // Kiểu career development.
      type,

      // Tuổi peak.
      peakAge,

      // Tuổi bắt đầu decline.
      declineAge,

      // Số mùa đã chơi.
      seasonsPlayed: 0,

      // Đã giải nghệ chưa.
      retired: false,

      // Lý do giải nghệ.
      retiredReason: null,

      // Có đang inactive không.
      inactive: false,

      // Chấn thương hiện tại.
      injury: null

  };

}


// ============================================================
// GENERATE ATTRIBUTES
// ============================================================
// Stat được tạo dựa trên:
// 1. Position
// 2. Overall
// 3. Source
//
// Stat có thể mạnh hơn OVR tối đa 5 điểm,
// nhưng không vượt source ceiling.
//
// Vì vậy:
// School OVR 60 -> stat tối đa 65.
// Draft OVR 75 -> stat tối đa 80.
// BLA OVR 90 -> stat tối đa 95,
// tùy position profile.
// ============================================================

function generateAttributes(
  position,
  overall,
  source
) {

  const profile =
      POSITION_PROFILES[position] ||
      POSITION_PROFILES.SF;


  const attributes = {};


  const config =
      NPC_SOURCE_CONFIG[source] ||
      NPC_SOURCE_CONFIG.BLA;


  // Trần stat theo source.
  const sourceCeiling =
      config.overallMax;


  for (
      const stat in profile
  ) {

      const [
          positionMin,
          positionMax
      ] =
          profile[stat];


      // Stat mạnh có thể cao hơn OVR tối đa 5.
      const maxByOverall =
          overall + 5;


      // Stat không được vượt:
      // - position profile
      // - OVR + 5
      // - source ceiling
      // - 99
      const max =
          Math.min(
              positionMax,
              maxByOverall,
              sourceCeiling,
              99
          );


      // Cho phép NPC có điểm yếu.
      const min =
          Math.max(
              1,
              Math.min(
                  positionMin,
                  overall - 20
              )
          );


      // Fallback nếu range không hợp lệ.
      if (min > max) {

          attributes[stat] =
              clamp(
                  overall,
                  1,
                  sourceCeiling
              );

      } else {

          attributes[stat] =
              randomInt(
                  min,
                  max
              );

      }

  }


  return attributes;

}


// ============================================================
// GENERATE NPC NAME
// ============================================================
// Tạm dùng tên kỹ thuật.
// Sau này có name database thì chỉ thay function này.
// ============================================================

function generateName(
  source,
  teamId,
  index
) {

  return `NPC ${source} ${teamId} ${index}`;

}


// ============================================================
// GENERATE SINGLE NPC
// ============================================================
// Tạo một NPC.
//
// overallRange cho phép Draft chỉ định range riêng:
// - prospect thường: 67-79
// - prospect cao: 80-82
// ============================================================

function generateNPC({

  source = "DLEAGUE",

  teamId = "",

  season = 1,

  index = 1,

  overallRange = null

} = {}) {

  // Kiểm tra source.
  const config =
      NPC_SOURCE_CONFIG[source];


  if (!config) {

      throw new Error(
          `Unknown NPC source: ${source}`
      );

  }


  // Random position.
  const position =
      randomChoice(
          Object.keys(
              POSITION_PROFILES
          )
      );


  // Nếu có range riêng thì dùng range đó.
  // Nếu không thì dùng range mặc định của source.
  const range =
      overallRange ||
      config.overall;


  // OVR không thể vượt source ceiling.
  const overall =
      randomInt(
          range[0],
          Math.min(
              range[1],
              config.overallMax
          )
      );


  // Random tuổi.
  const age =
      randomInt(
          config.age[0],
          config.age[1]
      );


  // Random body type.
  const bodyType =
      randomChoice(
          BODY_TYPES
      );


  // Generate attribute theo position + OVR + source.
  const attributes =
      generateAttributes(
          position,
          overall,
          source
      );


  // Generate development.
  const development =
      generateDevelopment();


  return {

      // ID NPC.
      id:
          `NPC_${source}_${season}_${teamId}_${index}`,


      // Tên NPC.
      name:
          generateName(
              source,
              teamId,
              index
          ),


      // Tuổi.
      age,


      // Position.
      position,


      // Chiều cao.
      height:
          randomInt(
              175,
              225
          ),


      // Body type.
      bodyType,


      // OVR.
      overall,


      // Attributes.
      attributes,


      // Role.
      role:
          getRole(
              overall
          ),


      // Morale.
      morale:
          generateMorale(),


      // Condition.
      condition:
          generateCondition(),


      // Nguồn NPC hiện tại.
      source,


      // Giữ field league để code cũ
      // vẫn có thể đọc npc.league.
      league:
          source,


      // Badge.
      badges: [],


      // Team hiện tại.
      teamId,


      // Potential đơn giản.
      //
      // Không phải hidden potential engine.
      potential:
          randomChoice([
              "C",
              "B",
              "A",
              "S"
          ]),


      // Relationship mặc định null.
      //
      // Chỉ relationship/event system mới gán.
      relationship: null,


      // Career development.
      development

  };

}


// ============================================================
// GENERATE NPC ROSTER
// ============================================================
// Chỉ gọi khi PLAYER thực sự cần league đó.
//
// Không generate toàn bộ School/D-League/BLA cùng lúc.
// ============================================================

function generateNPCRoster({

  league,

  teamId,

  season,

  size = 12

} = {}) {

  // Kiểm tra source/league.
  if (
      !NPC_SOURCE_CONFIG[league]
  ) {

      throw new Error(
          `Unknown NPC league: ${league}`
      );

  }


  const roster = [];


  // Tạo số lượng NPC cần thiết.
  for (
      let i = 1;
      i <= size;
      i++
  ) {

      roster.push(

          generateNPC({

              source: league,

              teamId,

              season,

              index: i

          })

      );

  }


  return roster;

}


// ============================================================
// GENERATE DRAFT CLASS
// ============================================================
// Từ Season 2 trở đi.
//
// Mỗi mùa tạo một draft class mới.
// Không giữ toàn bộ draft class cũ.
//
// Draft:
// - OVR 67-82.
// - Tối đa 2 thằng OVR 80+.
// - Các thằng còn lại 67-79.
//
// Không dùng DLEAGUE config.
// Không dùng BLA config.
// ============================================================

function generateDraftClass({

  season,

  size = 60

} = {}) {

  const draftClass = [];


  // Có thể có 0, 1 hoặc 2 prospect 80+.
  // Không bắt buộc draft nào cũng có sao.
  const highProspectCount =
      randomInt(
          0,
          2
      );


  // --------------------------------------------------------
  // Tạo prospect cao.
  // OVR 80-82.
  // --------------------------------------------------------

  for (
      let i = 0;
      i < highProspectCount;
      i++
  ) {

      draftClass.push(

          generateNPC({

              source: "DRAFT",

              teamId: "DRAFT",

              season,

              index: i + 1,

              overallRange: [
                  80,
                  82
              ]

          })

      );

  }


  // --------------------------------------------------------
  // Tạo các prospect còn lại.
  // OVR 67-79.
  //
  // Vì range dừng ở 79 nên không thể
  // vô tình sinh thêm thằng 80+.
  // --------------------------------------------------------

  for (
      let i =
          highProspectCount;

      i < size;

      i++
  ) {

      draftClass.push(

          generateNPC({

              source: "DRAFT",

              teamId: "DRAFT",

              season,

              index: i + 1,

              overallRange: [
                  67,
                  79
              ]

          })

      );

  }


  // --------------------------------------------------------
  // Shuffle draft class.
  //
  // Để prospect 80+ không luôn nằm đầu danh sách.
  // --------------------------------------------------------

  for (
      let i =
          draftClass.length - 1;

      i > 0;

      i--
  ) {

      const j =
          randomInt(
              0,
              i
          );


      [
          draftClass[i],
          draftClass[j]
      ] =
      [
          draftClass[j],
          draftClass[i]
      ];

  }


  return draftClass;

}


// ============================================================
// PROCESS NPC STATUS
// ============================================================
// Nếu NPC đang injured:
//
// -> nghỉ
// -> không development
// -> injury giảm 1 mùa
//
// Khi injury hết:
// -> trở lại.
// ============================================================

function processNPCStatus(npc) {

  const development =
      npc.development;


  // Không có injury.
  if (
      !development.injury
  ) {

      return false;

  }


  // Giảm thời gian injury.
  development.injury.seasons -= 1;


  // Injury đã hết.
  if (
      development.injury.seasons <= 0
  ) {

      development.injury = null;

      development.inactive = false;

      return false;

  }


  // Vẫn đang injured.
  development.inactive = true;


  return true;

}


// ============================================================
// GET DEVELOPMENT CHANGE
// ============================================================
// Trước peak:
// -> phát triển.
//
// Từ peak tới decline:
// -> gần như ổn định.
//
// Sau decline:
// -> bắt đầu giảm.
//
// Peak và decline là 2 giai đoạn khác nhau.
// ============================================================

function getDevelopmentChange(
  npc
) {

  const development =
      npc.development;


  // --------------------------------------------------------
  // BEFORE PEAK
  // --------------------------------------------------------

  if (
      npc.age <
      development.peakAge
  ) {

      switch (
          development.type
      ) {

          case "Early Peak":

              return randomInt(0, 2);


          case "Late Bloomer":

              // Late bloomer phát triển chậm
              // trước khi breakout.
              return randomInt(0, 1);


          case "Steady":

              return randomInt(0, 2);


          case "Normal":

          default:

              return randomInt(0, 2);

      }

  }


  // --------------------------------------------------------
  // BETWEEN PEAK AND DECLINE
  // --------------------------------------------------------
  //
  // NPC chưa decline chỉ vì vừa đạt peak.
  // --------------------------------------------------------

  if (
      npc.age <
      development.declineAge
  ) {

      switch (
          development.type
      ) {

          case "Early Peak":

              return randomInt(-1, 1);


          case "Late Bloomer":

              return randomInt(-1, 1);


          case "Steady":

              return randomInt(0, 1);


          case "Normal":

          default:

              return randomInt(-1, 1);

      }

  }


  // --------------------------------------------------------
  // AFTER DECLINE AGE
  // --------------------------------------------------------

  switch (
      development.type
  ) {

      case "Early Peak":

          return randomInt(-2, 0);


      case "Late Bloomer":

          return randomInt(-2, 0);


      case "Steady":

          return randomInt(-1, 0);


      case "Normal":

      default:

          return randomInt(-2, 0);

  }

}


// ============================================================
// DEVELOP NPC
// ============================================================
// Chạy một lần mỗi offseason.
//
// NPC có thể:
// - tăng OVR
// - giữ OVR
// - giảm OVR sau decline
// - injury
// - nghỉ mùa
// - retirement
// ============================================================

function developNPC(npc) {

  // Không có NPC.
  if (!npc) {

      return npc;

  }


  // NPC đã retire.
  if (
      npc.development?.retired
  ) {

      return npc;

  }


  const development =
      npc.development;


  // --------------------------------------------------------
  // INJURY CHECK
  // --------------------------------------------------------
  //
  // Nếu injured:
  // -> chỉ hồi phục.
  // -> không development.
  // --------------------------------------------------------

  if (
      processNPCStatus(npc)
  ) {

      npc.age += 1;

      development.seasonsPlayed += 1;

      return npc;

  }


  // --------------------------------------------------------
  // DEVELOPMENT CHANGE
  // --------------------------------------------------------

  const change =
      getDevelopmentChange(
          npc
      );


  // --------------------------------------------------------
  // APPLY OVR
  // --------------------------------------------------------

  const sourceConfig =
      NPC_SOURCE_CONFIG[npc.source] ||
      NPC_SOURCE_CONFIG[npc.league] ||
      NPC_SOURCE_CONFIG.BLA;


  npc.overall =
      clamp(
          npc.overall + change,
          1,
          sourceConfig.overallMax
      );


  // --------------------------------------------------------
  // APPLY ATTRIBUTE CHANGE
  // --------------------------------------------------------
  //
  // Không cần XP system.
  // Một số stat thay đổi nhẹ theo OVR.
  // --------------------------------------------------------

  if (
      change !== 0
  ) {

      for (
          const stat in npc.attributes
      ) {

          // Không phải stat nào cũng đổi.
          if (
              Math.random() >= 0.65
          ) {

              continue;

          }


          const statChange =
              change > 0
                  ? 1
                  : -1;


          npc.attributes[stat] =
              clamp(
                  npc.attributes[stat]
                  + statChange,
                  1,
                  sourceConfig.overallMax
              );

      }

  }


  // --------------------------------------------------------
  // UPDATE ROLE
  // --------------------------------------------------------

  npc.role =
      getRole(
          npc.overall
      );


  // --------------------------------------------------------
  // AGE
  // --------------------------------------------------------

  npc.age += 1;


  // Ghi nhận thêm một mùa.
  development.seasonsPlayed += 1;


  // --------------------------------------------------------
  // LIFE EVENTS
  // --------------------------------------------------------

  handleNPCLifeEvents(
      npc
  );


  return npc;

}


// ============================================================
// NPC LIFE EVENTS
// ============================================================
// Event nhẹ.
//
// Không phải NPC nào cũng có event.
// Phần lớn NPC chỉ phát triển bình thường.
// ============================================================

function handleNPCLifeEvents(npc) {

  const development =
      npc.development;


  // Đã retire thì dừng.
  if (
      development.retired
  ) {

      return;

  }


  // --------------------------------------------------------
  // MAJOR INJURY
  // --------------------------------------------------------
  //
  // Xác suất thấp.
  // Nghỉ 1-2 mùa.
  // --------------------------------------------------------

  if (
      Math.random() < 0.015
  ) {

      development.injury = {

          type: "Major Injury",

          seasons:
              randomInt(1, 2)

      };


      development.inactive = true;


      return;

  }


  // --------------------------------------------------------
  // MISS ONE SEASON
  // --------------------------------------------------------
  //
  // Một số NPC nghỉ một mùa.
  // --------------------------------------------------------

  if (
      Math.random() < 0.01
  ) {

      development.inactive = true;


      return;

  }


  // --------------------------------------------------------
  // EARLY RETIREMENT
  // --------------------------------------------------------
  //
  // Một tỷ lệ cực nhỏ giải nghệ sớm.
  // --------------------------------------------------------

  if (
      npc.age >= 26 &&
      Math.random() < 0.007
  ) {

      development.retired = true;

      development.retiredReason =
          "Early Retirement";


      return;

  }


  // --------------------------------------------------------
  // NORMAL RETIREMENT
  // --------------------------------------------------------
  //
  // Sau 35 tuổi xác suất retirement tăng.
  // --------------------------------------------------------

  if (
      npc.age >= 35
  ) {

      const retirementChance =
          Math.min(
              0.45,
              0.08 +
              (
                  (npc.age - 35)
                  * 0.07
              )
          );


      if (
          Math.random() <
          retirementChance
      ) {

          development.retired = true;

          development.retiredReason =
              "Retirement";

      }

  }

}


// ============================================================
// SHOULD NPC PERSIST
// ============================================================
// NPC chỉ cần sống lâu dài nếu có relationship.
//
// Không có relationship:
// -> có thể xóa khi player rời league.
//
// Có relationship:
// -> giữ lại để event system sử dụng.
// ============================================================

function shouldPersistNPC(npc) {

  if (!npc) {

      return false;

  }


  return (
      npc.relationship !== null &&
      npc.relationship !== undefined
  );

}


// ============================================================
// CLEANUP NPC DATA
// ============================================================
// Dùng khi player rời league.
//
// NPC không có relationship:
// -> xóa.
//
// NPC có relationship:
// -> giữ.
//
// Giúp data không phình lên theo mùa.
// ============================================================

function cleanupNPCData(
  npcList = []
) {

  return npcList.filter(
      npc =>
          shouldPersistNPC(
              npc
          )
  );

}


// ============================================================
// PRUNE INACTIVE NPCs
// ============================================================
// Alias dễ hiểu để hệ roster gọi.
//
// Chỉ giữ NPC có relationship.
// ============================================================

function pruneInactiveNPCs(
  npcList = []
) {

  return npcList.filter(
      npc =>
          shouldPersistNPC(
              npc
          )
  );

}


// ============================================================
// GET ACTIVE NPC ROSTER
// ============================================================
// Lấy những NPC hiện đang có thể thi đấu.
//
// NPC inactive:
// -> không nằm trong active roster.
//
// NPC retired:
// -> không nằm trong active roster.
//
// NPC có relationship nhưng inactive/retired
// vẫn có thể nằm trong relationship storage.
// ============================================================

function getActiveNPCRoster(
  npcList = []
) {

  return npcList.filter(
      npc =>
          npc &&
          !npc.development?.inactive &&
          !npc.development?.retired
  );

}


// ============================================================
// EXPORTS
// ============================================================

export {

  // Tạo một NPC.
  generateNPC,

  // Tạo roster NPC.
  generateNPCRoster,

  // Tạo draft class.
  generateDraftClass,

  // Development mỗi offseason.
  developNPC,

  // Kiểm tra NPC có cần giữ không.
  shouldPersistNPC,

  // Xóa NPC không còn cần.
  cleanupNPCData,

  // Giữ NPC có relationship.
  pruneInactiveNPCs,

  // Lấy NPC đang active.
  getActiveNPCRoster

};


// Default export.
export default generateNPC;