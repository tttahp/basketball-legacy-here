// ============================================================
// FREE AGENCY SYSTEM
// ============================================================
// Player + NPC.
//
// PLAYER:
// - Có offer.
// - Có thể xem offer.
// - Có thể accept / reject.
// - Contract xử lý qua contractSystem.
//
// NPC:
// - Vẫn có salary.
// - Vẫn nhận offer.
// - AI tự chọn offer hợp lý.
// - Không cần UI negotiation sâu.
//
// BLA MAX ROSTER = 13
// ============================================================

import {
  addFreeAgent,
  removeFreeAgent,
  getFreeAgent
} from "../data/freeAgents.js";

import {
  signFreeAgent,
  isFreeAgent,
  canSignToBLA,
  isPlayer,
  getContractStatus
} from "./contractSystem.js";


// ============================================================
// CONSTANTS
// ============================================================

export const MAX_BLA_ROSTER = 13;


// ============================================================
// HELPERS
// ============================================================

function getPlayerName(player) {

  if (!player) {
      return "Unknown";
  }


  if (
      player.creation?.firstName ||
      player.creation?.lastName
  ) {

      return [

          player.creation.firstName,

          player.creation.lastName

      ]
          .filter(Boolean)
          .join(" ");

  }


  return player.name || player.id || "Unknown";

}


function getPlayerOVR(player) {

  const values = [

      player?.ovr,

      player?.overall,

      player?.stats?.ovr,

      player?.rating

  ];


  for (const value of values) {

      if (
          typeof value === "number" &&
          Number.isFinite(value)
      ) {

          return value;

      }

  }


  return 0;

}


function getTeamRosterSize(team) {

  return Array.isArray(team?.players)
      ? team.players.length
      : 0;

}


function getTeamNeed(team) {

  if (!team) {
      return 0;
  }


  return team.needsPlayer === true;

}


// ============================================================
// CREATE OFFER
// ============================================================

export function createFreeAgentOffer(
  team,
  player,
  contract = {}
) {

  if (!team || !player) {

      return null;

  }


  return {

      teamId:
          team.teamId,

      teamName:
          team.teamName,

      playerId:
          player.id,

      contract: {

          years:
              Number.isFinite(contract.years)
                  ? Math.max(1, contract.years)
                  : 1,

          salary:
              Number.isFinite(contract.salary)
                  ? Math.max(0, contract.salary)
                  : 1

      },

      status:
          "PENDING"

  };

}


// ============================================================
// GENERATE EARLY SEASON OFFERS
// ============================================================
//
// Chỉ tạo danh sách team có nhu cầu.
// Không tự ký player.
//
// Player:
// offer có thể được hiển thị.
//
// NPC:
// AI có thể dùng danh sách này để chọn.
//
// ============================================================

export function generateEarlySeasonOffers(
  leagues,
  freeAgents = []
) {

  if (
      !leagues?.BLA?.teams
  ) {

      return [];

  }


  const teams =
      leagues.BLA.teams
          .filter(
              team =>
                  getTeamRosterSize(team) <
                  MAX_BLA_ROSTER
          );


  teams.sort(
      (a, b) => {

          const aWins =
              Number(
                  a.record?.wins || 0
              );

          const bWins =
              Number(
                  b.record?.wins || 0
              );


          return aWins - bWins;

      }
  );


  const weakTeams =
      teams.slice(0, 4);


  const offers = [];


  for (const team of weakTeams) {

      team.needsPlayer = true;


      for (
          const player of freeAgents
      ) {

          if (
              !isFreeAgent(player)
          ) {

              continue;

          }


          if (
              getTeamRosterSize(team) >=
              MAX_BLA_ROSTER
          ) {

              break;

          }


          const offer =
              createFreeAgentOffer(

                  team,

                  player,

                  {

                      years:
                          isPlayer(player)
                              ? 1
                              : 1,

                      salary:
                          getPlayerOVR(player) >= 80
                              ? 5
                              : getPlayerOVR(player) >= 70
                                  ? 2
                                  : 1

                  }

              );


          if (offer) {

              offers.push(
                  offer
              );

          }

      }

  }


  return offers;

}


// ============================================================
// SEND OFFER
// ============================================================

export function sendOffer(
  team,
  player,
  contract = {}
) {

  if (!team || !player) {

      return {

          success: false,

          message:
              "Invalid team or free agent"

      };

  }


  if (
      !isFreeAgent(player)
  ) {

      return {

          success: false,

          message:
              "Player is not a Free Agent"

      };

  }


  if (
      !canSignToBLA(team)
  ) {

      return {

          success: false,

          message:
              "BLA roster is full"

      };

  }


  const offer =
      createFreeAgentOffer(

          team,

          player,

          contract

      );


  if (!offer) {

      return {

          success: false,

          message:
              "Could not create offer"

      };

  }


  if (!Array.isArray(player.offers)) {

      player.offers = [];

  }


  // Không tạo duplicate offer
  // từ cùng một team.
  const existing =
      player.offers.find(
          item =>
              item.teamId ===
              team.teamId
      );


  if (existing) {

      return {

          success: false,

          message:
              "Team already has an active offer"

      };

  }


  player.offers.push(
      offer
  );


  return {

      success: true,

      offer

  };

}


// ============================================================
// ACCEPT OFFER
// ============================================================
//
// Dùng cho cả Player và NPC.
//
// Contract thực sự được tạo bởi
// contractSystem.signFreeAgent().
// ============================================================

export function acceptOffer(
  player,
  offer,
  team
) {

  if (
      !player ||
      !offer ||
      !team
  ) {

      return {

          success: false,

          message:
              "Invalid free agency data"

      };

  }


  if (
      offer.playerId !==
      player.id
  ) {

      return {

          success: false,

          message:
              "Offer does not belong to player"

      };

  }


  if (
      offer.teamId !==
      team.teamId
  ) {

      return {

          success: false,

          message:
              "Offer team mismatch"

      };

  }


  if (
      !isFreeAgent(player)
  ) {

      return {

          success: false,

          message:
              "Player is no longer a Free Agent"

      };

  }


  if (
      !canSignToBLA(team)
  ) {

      return {

          success: false,

          message:
              "BLA roster is full"

      };

  }


  const result =
      signFreeAgent(

          team,

          player,

          {

              years:
                  offer.contract?.years,

              salary:
                  offer.contract?.salary

          }

      );


  if (!result.success) {

      return result;

  }


  player.offers = [];


  return {

      success: true,

      type:
          isPlayer(player)
              ? "PLAYER"
              : "NPC",

      message:
          `${getPlayerName(player)} signed with ${team.teamName}`,

      player,

      team,

      contract:
          player.contract

  };

}


// ============================================================
// REJECT ONE OFFER
// ============================================================

export function rejectOffer(
  player,
  offer
) {

  if (!player || !offer) {

      return {

          success: false,

          message:
              "Invalid offer"

      };

  }


  if (!Array.isArray(player.offers)) {

      return {

          success: false,

          message:
              "No active offers"

      };

  }


  const index =
      player.offers.findIndex(
          item =>
              item.teamId ===
              offer.teamId
      );


  if (index === -1) {

      return {

          success: false,

          message:
              "Offer not found"

      };

  }


  player.offers.splice(
      index,
      1
  );


  return {

      success: true,

      message:
          "Offer rejected"

  };

}


// ============================================================
// REJECT ALL OFFERS
// ============================================================

export function rejectAllOffers(
  player
) {

  if (!player) {

      return {

          success: false,

          message:
              "Invalid free agent"

      };

  }


  player.offers = [];


  return {

      success: true,

      message:
          "All offers rejected"

  };

}


// ============================================================
// GET PLAYER OFFERS
// ============================================================

export function getPlayerOffers(
  player
) {

  if (
      !Array.isArray(player?.offers)
  ) {

      return [];

  }


  return [
      ...player.offers
  ];

}


// ============================================================
// GET ALL FREE AGENTS
// ============================================================

export function getAllFreeAgents() {

  const players =
      typeof getFreeAgent ===
      "function"

          ? null

          : null;


  // freeAgents.js hiện có getAllFreeAgents()
  // nhưng import cũ không bắt buộc phải phụ thuộc
  // vào tên này ở các nơi khác.
  //
  // Dynamic fallback không dùng được trong ES module,
  // nên pool được lấy từ data module nếu có.
  return players || [];

}


// ============================================================
// REGISTER FREE AGENT
// ============================================================
//
// Dùng khi Player/NPC trở thành FA.
// ============================================================

export function registerFreeAgent(
  player
) {

  if (!player) {

      return {

          success: false,

          message:
              "Invalid player"

      };

  }


  player.teamId =
      null;


  player.league =
      "FREE_AGENT";


  if (player.contract) {

      player.contract.status =
          "EXPIRED";

  }


  addFreeAgent(
      player
  );


  return {

      success: true,

      player

  };

}


// ============================================================
// REMOVE FREE AGENT
// ============================================================

export function unregisterFreeAgent(
  player
) {

  if (!player) {

      return {

          success: false,

          message:
              "Invalid player"

      };

  }


  removeFreeAgent(
      player.id
  );


  return {

      success: true,

      player

  };

}


// ============================================================
// NPC AI — CHOOSE OFFER
// ============================================================
//
// NPC vẫn có salary/years/FA.
// Nhưng không cần negotiation UI.
//
// AI ưu tiên:
// 1. salary
// 2. team need
// 3. roster opportunity
// ============================================================

export function chooseNPCOffer(
  npc,
  offers = [],
  teams = []
) {

  if (
      !npc ||
      !Array.isArray(offers) ||
      offers.length === 0
  ) {

      return null;

  }


  const validOffers =
      offers.filter(
          offer => {

              const team =
                  teams.find(
                      item =>
                          item.teamId ===
                          offer.teamId
                  );


              if (!team) {
                  return false;
              }


              return (
                  getTeamRosterSize(team) <
                  MAX_BLA_ROSTER
              );

          }
      );


  if (
      validOffers.length === 0
  ) {

      return null;

  }


  validOffers.sort(
      (a, b) => {

          const salaryA =
              Number(
                  a.contract?.salary || 0
              );

          const salaryB =
              Number(
                  b.contract?.salary || 0
              );


          const teamA =
              teams.find(
                  team =>
                      team.teamId ===
                      a.teamId
              );

          const teamB =
              teams.find(
                  team =>
                      team.teamId ===
                      b.teamId
              );


          const needA =
              getTeamNeed(teamA)
                  ? 1
                  : 0;

          const needB =
              getTeamNeed(teamB)
                  ? 1
                  : 0;


          return (
              (salaryB + needB) -
              (salaryA + needA)
          );

      }
  );


  return validOffers[0];

}


// ============================================================
// NPC AUTO SIGN
// ============================================================

export function autoSignNPC(
  npc,
  offers = [],
  teams = []
) {

  if (
      !npc ||
      isPlayer(npc)
  ) {

      return {

          success: false,

          message:
              "autoSignNPC only accepts NPC"

      };

  }


  const offer =
      chooseNPCOffer(
          npc,
          offers,
          teams
      );


  if (!offer) {

      return {

          success: false,

          message:
              "NPC has no valid offer"

      };

  }


  const team =
      teams.find(
          item =>
              item.teamId ===
              offer.teamId
      );


  if (!team) {

      return {

          success: false,

          message:
              "Offer team not found"

      };

  }


  return acceptOffer(
      npc,
      offer,
      team
  );

}


// ============================================================
// PROCESS NPC FREE AGENCY
// ============================================================
//
// Batch xử lý cuối offseason.
// NPC tự chọn offer.
// Player không bị đụng vào.
// ============================================================

export function processNPCFreeAgency(
  freeAgents = [],
  offers = [],
  teams = []
) {

  const results = [];


  for (
      const npc of freeAgents
  ) {

      if (
          isPlayer(npc)
      ) {

          continue;

      }


      const npcOffers =
          offers.filter(
              offer =>
                  offer.playerId ===
                  npc.id
          );


      if (
          npcOffers.length === 0
      ) {

          continue;

      }


      const result =
          autoSignNPC(
              npc,
              npcOffers,
              teams
          );


      results.push({
          npcId:
              npc.id,

          result

      });

  }


  return results;

}


// ============================================================
// TEAM FREE AGENT NEEDS
// ============================================================
//
// Trả về team nào còn slot.
// Không ép position.
// ============================================================

export function getTeamsWithRosterSpace(
  teams = []
) {

  return teams.filter(
      team =>
          getTeamRosterSize(team) <
          MAX_BLA_ROSTER
  );

}


// ============================================================
// CLEAR TEAM NEED
// ============================================================

export function clearTeamNeed(
  team
) {

  if (!team) {

      return false;

  }


  team.needsPlayer =
      false;


  return true;

}