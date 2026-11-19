// ============================================================
// ROSTER GENERATOR
// ------------------------------------------------------------
// Chỉ chịu trách nhiệm tạo roster mới.
//
// PLAYER:
//   playerGenerator.js
//
// NPC:
//   npcGenerator.js
//
// BLA:
//   Không reset roster mỗi mùa.
//
// DRAFT:
//   60 prospects cố định mỗi mùa.
//
// LƯU Ý:
//   "capacity" = tổng số slot của trường.
//   "NPC size" = số NPC được tạo sẵn.
//   Hai thứ này KHÔNG phải một.
// ============================================================

import {
  generateNPCRoster,
  generateDraftClass
} from "./npcGenerator.js";


// ============================================================
// SCHOOL CONFIG
// ============================================================
//
// NORMAL:
//   15 slot tổng.
//   NPC ban đầu random 14–15.
//   Có thể full → player phải chọn trường khác.
//
// INTERNATIONAL:
//   25 slot tổng.
//   NPC ban đầu random 20–24.
//   Luôn còn ít nhất 1 slot cho player.
// ============================================================

const SCHOOL_CONFIG = {

  NORMAL: {
      capacity: 15,
      npcMin: 14,
      npcMax: 15
  },

  INTERNATIONAL: {
      capacity: 20,
      npcMin: 17,
      npcMax: 19
  }

};


// ============================================================
// D-LEAGUE CONFIG
// ============================================================

const DLEAGUE_CONFIG = {

  capacity: 15,
  npcMin: 12,
  npcMax: 15

};


// ============================================================
// DRAFT CONFIG
// ============================================================
//
// 60 prospect / draft class.
// CỐ ĐỊNH 60.
// ============================================================

const DRAFT_SIZE = 60;


// ============================================================
// RANDOM
// ============================================================

function randomInt(min, max) {

  return Math.floor(
      Math.random() * (max - min + 1)
  ) + min;

}


// ============================================================
// GET SCHOOL NPC SIZE
// ============================================================

function getSchoolNPCSize(
  type = "NORMAL"
) {

  const config =
      SCHOOL_CONFIG[type];

  if (!config) {

      throw new Error(
          `Unknown school type: ${type}`
      );

  }

  return randomInt(
      config.npcMin,
      config.npcMax
  );

}


// ============================================================
// GET SCHOOL CAPACITY
// ============================================================
//
// Dùng cho việc kiểm tra player còn slot hay không.
// Không liên quan trực tiếp tới số NPC generate.
// ============================================================

function getSchoolCapacity(
  type = "NORMAL"
) {

  const config =
      SCHOOL_CONFIG[type];

  if (!config) {

      throw new Error(
          `Unknown school type: ${type}`
      );

  }

  return config.capacity;

}


// ============================================================
// SCHOOL ROSTER
// ============================================================

function generateSchoolRoster({

  teamId,

  season = 1,

  type = "NORMAL",

  size = null

} = {}) {

  const rosterSize =
      size !== null
          ? Math.min(
              size,
              SCHOOL_CONFIG[type].capacity
          )
          : getSchoolNPCSize(type);

  return generateNPCRoster({

      league: "SCHOOL",

      teamId,

      season,

      size: rosterSize

  });

}


// ============================================================
// INTERNATIONAL SCHOOL ROSTER
// ============================================================
//
// International luôn có capacity = 25.
// NPC tối đa = 24.
// → luôn có ít nhất 1 slot cho player.
//
// Nếu truyền size thủ công > 24 thì vẫn bị giới hạn.
// ============================================================

function generateInternationalRoster({

  teamId,

  season = 1,

  size = null

} = {}) {

  const config =
      SCHOOL_CONFIG.INTERNATIONAL;

  const rosterSize =
      size !== null
          ? Math.min(
              size,
              config.capacity - 1
          )
          : randomInt(
              config.npcMin,
              config.npcMax
          );

  return generateNPCRoster({

      league: "SCHOOL",

      teamId,

      season,

      size: rosterSize

  });

}


// ============================================================
// D-LEAGUE ROSTER
// ============================================================
//
// D-League không liên quan slot School.
// Đây chỉ là số NPC trong roster D-League.
// ============================================================

function generateDLeagueRoster({

  teamId,

  season = 1,

  size = null

} = {}) {

  const rosterSize =
      size !== null
          ? Math.min(
              size,
              DLEAGUE_CONFIG.capacity
          )
          : randomInt(
              DLEAGUE_CONFIG.npcMin,
              DLEAGUE_CONFIG.npcMax
          );

  return generateNPCRoster({

      league: "DLEAGUE",

      teamId,

      season,

      size: rosterSize

  });

}


// ============================================================
// GENERATE MULTIPLE SCHOOL / D-LEAGUE ROSTERS
// ============================================================
//
// Chỉ dùng khi cần tạo roster mới.
// Không dùng để reset roster đang tồn tại.
// ============================================================

function generateLeagueRosters({

  league,

  season,

  teamIds = [],

  rosterSize = null

} = {}) {

  const teams = {};

  for (const teamId of teamIds) {

      let size = rosterSize;

      if (size === null) {

          if (league === "SCHOOL") {

              size = randomInt(
                  SCHOOL_CONFIG.NORMAL.npcMin,
                  SCHOOL_CONFIG.NORMAL.npcMax
              );

          } else if (
              league === "DLEAGUE"
          ) {

              size = randomInt(
                  DLEAGUE_CONFIG.npcMin,
                  DLEAGUE_CONFIG.npcMax
              );

          } else {

              throw new Error(
                  `Unsupported roster league: ${league}`
              );

          }

      }

      teams[teamId] =
          generateNPCRoster({

              league,

              teamId,

              season,

              size

          });

  }

  return teams;

}


// ============================================================
// BLA DRAFT CLASS
// ============================================================
//
// Mỗi draft = ĐÚNG 60 prospects.
//
// Đây chỉ là pool.
// Không thay thế roster BLA hiện tại.
//
// Draft system sau này mới quyết định:
//   - ai được chọn
//   - đội nào chọn
//   - pick nào
//   - ai không được chọn
// ============================================================

function generateBLADraftClass({

  season

} = {}) {

  return generateDraftClass({

      season,

      size: DRAFT_SIZE

  });

}


// ============================================================
// EXPORT
// ============================================================

export {

  SCHOOL_CONFIG,

  DLEAGUE_CONFIG,

  DRAFT_SIZE,

  getSchoolNPCSize,

  getSchoolCapacity,

  generateSchoolRoster,

  generateInternationalRoster,

  generateDLeagueRoster,

  generateLeagueRosters,

  generateBLADraftClass

};