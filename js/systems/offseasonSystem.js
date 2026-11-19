// ============================================================
// OFFSEASON SYSTEM
// ============================================================
// Điều phối offseason.
//
// KHÔNG tạo lại roster BLA.
// KHÔNG tạo lại team.
// KHÔNG tạo draft roster mới.
//
// Flow:
//
// Season End
//     ↓
// Contract Expiry
//     ↓
// Free Agency
//     ↓
// NPC Trade
//     ↓
// Draft
//     ↓
// Roster Cleanup
//     ↓
// New Season
//
// BLA MAX ROSTER = 13
// DRAFT = 60 PROSPECTS được tạo ở draft/data system,
//           file này chỉ điều phối draft.
// ============================================================


import {
  advanceContracts
} from "./contractSystem.js";

import {
  processNPCFreeAgency
} from "./freeAgency.js";

import {
  autoTradeNPC
} from "./tradeSystem.js";

import {
  startDraft,
  draftPlayer
} from "./draftSystem.js";

import {
  addFreeAgent,
  getAllFreeAgents
} from "../data/freeAgents.js";

import {
  startOffseason,
  enterBLA,
  nextYear,
  seasonState,
  SeasonPhase
} from "./seasonSystem.js";


// ============================================================
// CONSTANTS
// ============================================================

export const MAX_BLA_ROSTER = 13;

export const DRAFT_SIZE = 60;


// ============================================================
// OFFSEASON STATE
// ============================================================

export const offseasonState = {

  active: false,

  year: null,

  contractsProcessed: false,

  freeAgencyProcessed: false,

  tradesProcessed: false,

  draftStarted: false,

  draftFinished: false,

  rosterCleaned: false,

  completed: false

};


// ============================================================
// RESET OFFSEASON
// ============================================================

export function resetOffseason() {

  offseasonState.active =
      false;

  offseasonState.year =
      null;

  offseasonState.contractsProcessed =
      false;

  offseasonState.freeAgencyProcessed =
      false;

  offseasonState.tradesProcessed =
      false;

  offseasonState.draftStarted =
      false;

  offseasonState.draftFinished =
      false;

  offseasonState.rosterCleaned =
      false;

  offseasonState.completed =
      false;

}


// ============================================================
// START OFFSEASON
// ============================================================

export function beginOffseason(
  year = seasonState.year
) {

  resetOffseason();


  offseasonState.active =
      true;

  offseasonState.year =
      year;


  startOffseason();


  return {

      success: true,

      year,

      phase:
          SeasonPhase.OFFSEASON

  };

}


// ============================================================
// TEAM HELPERS
// ============================================================

function getTeams(
  leagues
) {

  if (
      !leagues?.BLA?.teams
  ) {

      return [];

  }


  return leagues.BLA.teams;

}


function getRoster(
  team
) {

  if (
      !Array.isArray(team.players)
  ) {

      team.players = [];

  }


  return team.players;

}


function rosterSize(
  team
) {

  return getRoster(team).length;

}


function hasSpace(
  team
) {

  return (
      rosterSize(team) <
      MAX_BLA_ROSTER
  );

}


// ============================================================
// CONTRACT PHASE
// ============================================================
//
// Player:
// contract hết hạn → FA.
//
// NPC:
// contract hết hạn → AI renew hoặc FA.
//
// Không tạo contract mới cho Player tự động.
// ============================================================

export function processOffseasonContracts(
  teams
) {

  const result =
      advanceContracts(
          teams
      );


  offseasonState.contractsProcessed =
      true;


  return result;

}


// ============================================================
// FREE AGENCY PHASE
// ============================================================
//
// NPC:
// tự chọn offer.
//
// Player:
// KHÔNG tự động ký.
// Player phải thông qua UI/gameplay.
//
// ============================================================

export function processOffseasonFreeAgency(
  teams,
  offers = []
) {

  const freeAgents =
      getAllFreeAgents();


  const npcResults =
      processNPCFreeAgency(

          freeAgents,

          offers,

          teams

      );


  offseasonState.freeAgencyProcessed =
      true;


  return {

      success: true,

      npcResults,

      playerFreeAgents:
          getAllFreeAgents()
              .filter(
                  player =>
                      player.careerMode ===
                      "FREE" ||
                      player.isPlayer === true
              )

  };

}


// ============================================================
// NPC TRADE PHASE
// ============================================================
//
// Trade chỉ chạy cho NPC.
// Player không bị tự động trade.
//
// Mỗi trade phải là 1-for-1.
// Không tạo player mới.
// Không reset contract.
// ============================================================

export function processNPCTrades(
  tradePlans = []
) {

  const results = [];


  for (
      const plan of tradePlans
  ) {

      if (
          !plan?.fromTeam ||
          !plan?.toTeam ||
          !plan?.sendingPlayer ||
          !plan?.receivingPlayer
      ) {

          continue;

      }


      // Không tự trade Player.
      if (
          plan.sendingPlayer.isPlayer === true ||
          plan.receivingPlayer.isPlayer === true ||
          plan.sendingPlayer.careerMode === "FREE" ||
          plan.receivingPlayer.careerMode === "FREE"
      ) {

          continue;

      }


      const result =
          autoTradeNPC(

              plan.fromTeam,

              plan.toTeam,

              plan.sendingPlayer,

              plan.receivingPlayer

          );


      results.push(
          result
      );

  }


  offseasonState.tradesProcessed =
      true;


  return results;

}


// ============================================================
// DRAFT PHASE
// ============================================================
//
// IMPORTANT:
//
// Draft không tạo 30.
// Draft không tạo roster mới.
//
// Prospect pool 60 phải được tạo ở draft/data layer.
//
// File này chỉ:
// 1. startDraft()
// 2. nhận prospect pool
// 3. draftPlayer()
// 4. kiểm tra roster 13
//
// BLA hiện tại vẫn là roster cũ.
// ============================================================

export function startOffseasonDraft(
  year,
  prospects = []
) {

  if (
      year < 2026
  ) {

      return {

          success: false,

          message:
              "Draft has not started yet"

      };

  }


  if (
      prospects.length !== DRAFT_SIZE
  ) {

      return {

          success: false,

          message:
              `Draft requires ${DRAFT_SIZE} prospects`,

          count:
              prospects.length

      };

  }


  const result =
      startDraft(
          year
      );


  if (
      !result.success
  ) {

      return result;

  }


  offseasonState.draftStarted =
      true;


  offseasonState.draftFinished =
      false;


  return {

      success: true,

      year,

      prospects:
          prospects.length

  };

}


// ============================================================
// DRAFT ONE PLAYER
// ============================================================

export function draftOnePlayer(
  team,
  prospect
) {

  if (
      !team ||
      !prospect
  ) {

      return {

          success: false,

          message:
              "Invalid draft data"

      };

  }


  if (
      rosterSize(team) >=
      MAX_BLA_ROSTER
  ) {

      // draftSystem sẽ xử lý
      // Two-Way / Free Agent.
      return draftPlayer(
          team,
          prospect
      );

  }


  return draftPlayer(
      team,
      prospect
  );

}


// ============================================================
// DRAFT ALL SELECTED PLAYERS
// ============================================================
//
// selections:
//
// [
//   {
//      team,
//      player
//   }
// ]
//
// Không tự generate player.
// Không tự generate team.
// ============================================================

export function processDraftSelections(
  selections = []
) {

  if (
      !offseasonState.draftStarted
  ) {

      return {

          success: false,

          message:
              "Draft has not started"

      };

  }


  const results = [];


  for (
      const selection of selections
  ) {

      if (
          !selection?.team ||
          !selection?.player
      ) {

          continue;

      }


      const result =
          draftOnePlayer(

              selection.team,

              selection.player

          );


      results.push({

          teamId:
              selection.team.teamId,

          playerId:
              selection.player.id,

          result

      });

  }


  offseasonState.draftFinished =
      true;


  return {

      success: true,

      results

  };

}


// ============================================================
// ROSTER CLEANUP
// ============================================================
//
// Chỉ sửa dữ liệu lỗi.
// Không tự cắt player nếu roster <= 13.
//
// Nếu >13:
// giữ 13 người đầu tiên,
// phần dư chuyển FA.
//
// Đây là safety net, không phải cách tạo roster.
// ============================================================

export function cleanupBLARosters(
  teams
) {

  const results = [];


  for (
      const team of teams
  ) {

      const roster =
          getRoster(team);


      if (
          roster.length <=
          MAX_BLA_ROSTER
      ) {

          results.push({

              teamId:
                  team.teamId,

              before:
                  roster.length,

              after:
                  roster.length,

              removed:
                  []

          });

          continue;

      }


      const removed =
          roster.splice(
              MAX_BLA_ROSTER
          );


      for (
          const player of removed
      ) {

          player.teamId =
              null;

          player.league =
              "FREE_AGENT";


          // Chỉ add nếu chưa nằm trong FA pool.
          const existing =
              getAllFreeAgents()
                  .some(
                      freeAgent =>
                          freeAgent.id ===
                          player.id
                  );


          if (!existing) {
             
              addFreeAgent(player);

          }

      }


      results.push({

          teamId:
              team.teamId,

          before:
              roster.length +
              removed.length,

          after:
              roster.length,

          removed:
              removed.map(
                  player =>
                      player.id
              )

      });

  }


  offseasonState.rosterCleaned =
      true;


  return results;

}


// ============================================================
// INTERNAL FREE AGENT ADDER
// ============================================================
//
// Dùng để tránh tạo thêm data system.
// ============================================================



// ============================================================
// VALIDATE ROSTERS
// ============================================================
//
// Không thay đổi data.
// Chỉ kiểm tra.
// ============================================================

export function validateBLARosters(
  teams
) {

  const errors = [];


  for (
      const team of teams
  ) {

      const roster =
          getRoster(team);


      if (
          roster.length >
          MAX_BLA_ROSTER
      ) {

          errors.push({

              teamId:
                  team.teamId,

              type:
                  "ROSTER_OVER_13",

              size:
                  roster.length

          });

      }


      const ids =
          new Set();


      for (
          const player of roster
      ) {

          if (
              ids.has(player.id)
          ) {

              errors.push({

                  teamId:
                      team.teamId,

                  playerId:
                      player.id,

                  type:
                      "DUPLICATE_PLAYER"

              });

          }


          ids.add(
              player.id
          );


          if (
              player.teamId !==
              team.teamId
          ) {

              errors.push({

                  teamId:
                      team.teamId,

                  playerId:
                      player.id,

                  type:
                      "WRONG_TEAM_ID"

              });

          }

      }

  }


  return {

      valid:
          errors.length === 0,

      errors

  };

}


// ============================================================
// PREPARE NEXT SEASON
// ============================================================
//
// Không tạo roster.
// Không tạo player.
// Không reset player.
// Chỉ chuyển state sang season mới.
// ============================================================

export function prepareNextSeason() {

  const teams =
      arguments[0] || [];


  const validation =
      validateBLARosters(
          teams
      );


  if (
      !validation.valid
  ) {

      return {

          success: false,

          message:
              "Cannot start next season",

          errors:
              validation.errors

      };

  }


  offseasonState.completed =
      true;


  offseasonState.active =
      false;


  seasonState.offseason =
      false;

  seasonState.seasonFinished =
      false;

  seasonState.draftFinished =
      true;

  seasonState.gamePlayed =
      0;


  // Chuyển sang năm kế tiếp.
  nextYear();


  seasonState.phase =
      SeasonPhase.BLA;


  return {

      success: true,

      year:
          seasonState.year,

      phase:
          seasonState.phase

  };

}


// ============================================================
// RUN COMPLETE OFFSEASON
// ============================================================
//
// Đây là function chính.
//
// Có thể gọi từng phase riêng,
// hoặc dùng function này khi hệ thống đã hoàn thiện.
//
// options:
//
// {
//   contractTeams,
//   freeAgencyOffers,
//   tradePlans,
//   draftYear,
//   prospects,
//   draftSelections
// }
// ============================================================

export function runOffseason(
  options = {}
) {

  const teams =
      options.contractTeams ||
      options.teams ||
      [];


  if (!offseasonState.active) {

      beginOffseason(
          seasonState.year
      );

  }


  const output = {

      contracts:
          null,

      freeAgency:
          null,

      trades:
          null,

      draft:
          null,

      validation:
          null

  };


  // --------------------------------------------------------
  // 1. CONTRACTS
  // --------------------------------------------------------

  if (
      !offseasonState.contractsProcessed
  ) {

      output.contracts =
          processOffseasonContracts(
              teams
          );

  }


  // --------------------------------------------------------
  // 2. FREE AGENCY
  // --------------------------------------------------------

  if (
      !offseasonState.freeAgencyProcessed
  ) {

      output.freeAgency =
          processOffseasonFreeAgency(

              teams,

              options.freeAgencyOffers ||
              []

          );

  }


  // --------------------------------------------------------
  // 3. TRADES
  // --------------------------------------------------------

  if (
      !offseasonState.tradesProcessed
  ) {

      output.trades =
          processNPCTrades(

              options.tradePlans ||
              []

          );

  }


  // --------------------------------------------------------
  // 4. DRAFT
  // --------------------------------------------------------

  if (
      options.prospects &&
      !offseasonState.draftStarted
  ) {

      output.draft =
          startOffseasonDraft(

              options.draftYear ||
              seasonState.year,

              options.prospects

          );

  }


  // --------------------------------------------------------
  // 5. VALIDATE
  // --------------------------------------------------------

  output.validation =
      validateBLARosters(
          teams
      );


  return {

      success:
          output.validation.valid,

      offseason:
          offseasonState,

      output

  };

}


// ============================================================
// FINISH OFFSEASON
// ============================================================

export function finishOffseason(
  teams
) {

  const validation =
      validateBLARosters(
          teams
      );


  if (
      !validation.valid
  ) {

      return {

          success: false,

          message:
              "Roster validation failed",

          errors:
              validation.errors

      };

  }


  return prepareNextSeason(
      teams
  );

}


// ============================================================
// GET OFFSEASON STATE
// ============================================================

export function getOffseasonState() {

  return {
      ...offseasonState
  };

}


// ============================================================
// CHECK OFFSEASON
// ============================================================

export function isOffseasonActive() {

  return (
      offseasonState.active ===
      true
  );

}


// ============================================================
// EXPORT
// ============================================================

export default {

  beginOffseason,

  resetOffseason,

  processOffseasonContracts,

  processOffseasonFreeAgency,

  processNPCTrades,

  startOffseasonDraft,

  draftOnePlayer,

  processDraftSelections,

  cleanupBLARosters,

  validateBLARosters,

  prepareNextSeason,

  runOffseason,

  finishOffseason,

  getOffseasonState,

  isOffseasonActive

};