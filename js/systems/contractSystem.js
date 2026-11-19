// ============================================================
// CONTRACT SYSTEM
// ============================================================
// Player + NPC contract management.
//
// PLAYER:
// - Contract sâu hơn.
// - Salary / years / renewal.
// - Negotiation.
// - Contract history.
// - Release / FA / trade.
// - Two-Way.
//
// NPC:
// - Vẫn có salary / years / renewal.
// - Vẫn có FA / release / trade.
// - AI xử lý đơn giản, không cần mô phỏng negotiation sâu.
//
// BLA MAX ROSTER = 13
// ============================================================

import {
  addFreeAgent,
  removeFreeAgent,
  getFreeAgent
} from "../data/freeAgents.js";


// ============================================================
// CONSTANTS
// ============================================================

export const MAX_BLA_ROSTER = 13;

export const MAX_TWO_WAY = 2;


// ============================================================
// CONTRACT TYPES
// ============================================================

export const CONTRACT_TYPE = {

  BLA: "BLA",

  TWO_WAY: "TWO_WAY",

  FREE_AGENT: "FREE_AGENT",

  NONE: "NONE"

};


// ============================================================
// PLAYER CONTRACT TYPES
// ============================================================

export const PLAYER_CONTRACT_TYPE = {

  STANDARD: "STANDARD",

  ROOKIE: "ROOKIE",

  MAX: "MAX",

  TWO_WAY: "TWO_WAY"

};


// ============================================================
// NPC CONTRACT TYPES
// ============================================================

export const NPC_CONTRACT_TYPE = {

  STANDARD: "STANDARD",

  ROOKIE: "ROOKIE",

  VETERAN: "VETERAN",

  TWO_WAY: "TWO_WAY"

};


// ============================================================
// BASIC HELPERS
// ============================================================

export function getRosterCount(team) {

  return Array.isArray(team?.players)
      ? team.players.length
      : 0;

}


export function getTwoWayCount(team) {

  return Array.isArray(team?.twoWayPlayers)
      ? team.twoWayPlayers.length
      : 0;

}


export function canSignToBLA(team) {

  return getRosterCount(team) < MAX_BLA_ROSTER;

}


export function canSignTwoWay(team) {

  return getTwoWayCount(team) < MAX_TWO_WAY;

}


// ============================================================
// ENTITY DETECTION
// ============================================================
//
// Player thật có creation/development/career.
// NPC không cần có toàn bộ Player structure.
//
// Không dùng class riêng.
// ============================================================

export function isPlayer(entity) {

  if (!entity) return false;

  return !!(
      entity.creation ||
      entity.development ||
      entity.careerMode ||
      entity.career
  );

}


export function isNPC(entity) {

  if (!entity) return false;

  return !isPlayer(entity);

}


// ============================================================
// BASIC PLAYER INFO
// ============================================================

function getEntityName(entity) {

  if (!entity) {
      return "Unknown Player";
  }


  if (
      entity.creation?.firstName ||
      entity.creation?.lastName
  ) {

      return [

          entity.creation.firstName,

          entity.creation.lastName

      ]
          .filter(Boolean)
          .join(" ");

  }


  if (entity.name) {

      return entity.name;

  }


  return entity.id || "Unknown Player";

}


// ============================================================
// CONTRACT NORMALIZATION
// ============================================================
//
// Contract luôn có cấu trúc tối thiểu:
//
// {
//   type,
//   years,
//   remainingYears,
//   salary,
//   status
// }
//
// Player có thể có thêm metadata.
// NPC chỉ cần những field cơ bản.
// ============================================================

export function createContract(
  entity,
  data = {}
) {

  const isPlayerEntity =
      isPlayer(entity);


  const defaultType =
      isPlayerEntity
          ? PLAYER_CONTRACT_TYPE.STANDARD
          : NPC_CONTRACT_TYPE.STANDARD;


  const years =
      Number.isFinite(data.years)
          ? Math.max(0, data.years)
          : 1;


  const salary =
      Number.isFinite(data.salary)
          ? Math.max(0, data.salary)
          : 0;


  const contract = {

      type:
          data.type || defaultType,

      years,

      remainingYears:
          Number.isFinite(data.remainingYears)
              ? Math.max(
                  0,
                  data.remainingYears
              )
              : years,

      salary,

      status:
          data.status || "ACTIVE"

  };


  // Player contract có thêm thông tin.
  if (isPlayerEntity) {

      contract.playerContract = true;

      contract.negotiable =
          data.negotiable !== false;

      contract.options =
          data.options || null;

      contract.history =
          Array.isArray(data.history)
              ? [...data.history]
              : [];

  } else {

      // NPC contract đơn giản hơn.
      contract.playerContract = false;

      contract.negotiable = false;

  }


  return contract;

}


// ============================================================
// APPLY CONTRACT
// ============================================================

export function applyContract(
  entity,
  contract,
  teamId = null
) {

  if (!entity) {

      return null;

  }


  entity.contract =
      createContract(
          entity,
          contract
      );


  if (teamId !== null) {

      entity.teamId =
          teamId;

  }


  if (isPlayer(entity)) {

      if (!entity.status) {

          entity.status = {};

      }


      entity.status.contractType =
          contract.type ||
          CONTRACT_TYPE.BLA;


      if (!entity.development) {

          entity.development = {};

      }


      entity.development.team =
          teamId || "";

  } else {

      // NPC dùng structure đơn giản.
      entity.league =
          teamId
              ? "BLA"
              : "FREE_AGENT";

  }


  return entity;

}


// ============================================================
// SIGN PLAYER TO BLA
// ============================================================

export function signPlayerBLA(
  team,
  player,
  contract = {}
) {

  if (!team || !player) {

      return {

          success: false,

          message: "Invalid team or player"

      };

  }


  if (!canSignToBLA(team)) {

      return {

          success: false,

          message: "BLA roster is full"

      };

  }


  const finalContract =
      createContract(

          player,

          {
              ...contract,

              type:
                  contract.type ||
                  PLAYER_CONTRACT_TYPE.STANDARD

          }

      );


  applyContract(

      player,

      finalContract,

      team.teamId

  );


  if (!Array.isArray(team.players)) {

      team.players = [];

  }


  team.players.push(
      player
  );


  removeFreeAgent(
      player.id
  );


  return {

      success: true,

      type: "PLAYER",

      message:
          `${getEntityName(player)} signed to BLA`,

      player,

      contract:
          finalContract

  };

}


// ============================================================
// SIGN NPC TO BLA
// ============================================================

export function signNPCBLA(
  team,
  npc,
  contract = {}
) {

  if (!team || !npc) {

      return {

          success: false,

          message: "Invalid team or NPC"

      };

  }


  if (!canSignToBLA(team)) {

      return {

          success: false,

          message: "BLA roster is full"

      };

  }


  const finalContract =
      createContract(

          npc,

          {
              ...contract,

              type:
                  contract.type ||
                  NPC_CONTRACT_TYPE.STANDARD,

              years:
                  Number.isFinite(contract.years)
                      ? contract.years
                      : 1,

              salary:
                  Number.isFinite(contract.salary)
                      ? contract.salary
                      : 1

          }

      );


  applyContract(

      npc,

      finalContract,

      team.teamId

  );


  if (!Array.isArray(team.players)) {

      team.players = [];

  }


  team.players.push(
      npc
  );


  removeFreeAgent(
      npc.id
  );


  return {

      success: true,

      type: "NPC",

      message:
          `${getEntityName(npc)} signed to BLA`,

      player:
          npc,

      contract:
          finalContract

  };

}


// ============================================================
// LEGACY SIGN BLA
// ============================================================
//
// Giữ tên cũ để code hiện tại không vỡ.
// Tự nhận diện Player / NPC.
// ============================================================

export function signBLA(
  team,
  entity,
  contract = {}
) {

  if (isPlayer(entity)) {

      return signPlayerBLA(
          team,
          entity,
          contract
      );

  }


  return signNPCBLA(
      team,
      entity,
      contract
  );

}


// ============================================================
// SIGN PLAYER TWO-WAY
// ============================================================

export function signPlayerTwoWay(
  team,
  player,
  contract = {}
) {

  if (!team || !player) {

      return {

          success: false,

          message: "Invalid team or player"

      };

  }


  if (!canSignTwoWay(team)) {

      return {

          success: false,

          message: "Two-Way slots full"

      };

  }


  const finalContract =
      createContract(

          player,

          {

              ...contract,

              type:
                  PLAYER_CONTRACT_TYPE.TWO_WAY,

              years:
                  Number.isFinite(contract.years)
                      ? contract.years
                      : 1

          }

      );


  applyContract(

      player,

      finalContract,

      team.teamId

  );


  player.status.contractType =
      CONTRACT_TYPE.TWO_WAY;


  player.development.league =
      "DLEAGUE";


  if (!Array.isArray(team.twoWayPlayers)) {

      team.twoWayPlayers = [];

  }


  team.twoWayPlayers.push(
      player
  );


  removeFreeAgent(
      player.id
  );


  return {

      success: true,

      type: "PLAYER",

      message:
          `${getEntityName(player)} signed Two-Way`,

      player,

      contract:
          finalContract

  };

}


// ============================================================
// SIGN NPC TWO-WAY
// ============================================================

export function signNPCTwoWay(
  team,
  npc,
  contract = {}
) {

  if (!team || !npc) {

      return {

          success: false,

          message: "Invalid team or NPC"

      };

  }


  if (!canSignTwoWay(team)) {

      return {

          success: false,

          message: "Two-Way slots full"

      };

  }


  const finalContract =
      createContract(

          npc,

          {

              ...contract,

              type:
                  NPC_CONTRACT_TYPE.TWO_WAY,

              years:
                  Number.isFinite(contract.years)
                      ? contract.years
                      : 1,

              salary:
                  Number.isFinite(contract.salary)
                      ? contract.salary
                      : 1

          }

      );


  applyContract(

      npc,

      finalContract,

      team.teamId

  );


  npc.league =
      "DLEAGUE";


  if (!Array.isArray(team.twoWayPlayers)) {

      team.twoWayPlayers = [];

  }


  team.twoWayPlayers.push(
      npc
  );


  removeFreeAgent(
      npc.id
  );


  return {

      success: true,

      type: "NPC",

      message:
          `${getEntityName(npc)} signed Two-Way`,

      player:
          npc,

      contract:
          finalContract

  };

}


// ============================================================
// LEGACY SIGN TWO-WAY
// ============================================================

export function signTwoWay(
  team,
  entity,
  contract = {}
) {

  if (isPlayer(entity)) {

      return signPlayerTwoWay(
          team,
          entity,
          contract
      );

  }


  return signNPCTwoWay(
      team,
      entity,
      contract
  );

}


// ============================================================
// CALL UP FROM TWO-WAY
// ============================================================

export function callUpFromTwoWay(
  team,
  entity
) {

  if (!team || !entity) {

      return {

          success: false,

          message: "Invalid team or player"

      };

  }


  if (!canSignToBLA(team)) {

      return {

          success: false,

          message: "No BLA roster slot available"

      };

  }


  if (!Array.isArray(team.twoWayPlayers)) {

      return {

          success: false,

          message: "Two-Way player not found"

      };

  }


  const index =
      team.twoWayPlayers.findIndex(
          p =>
              p.id === entity.id
      );


  if (index === -1) {

      return {

          success: false,

          message: "Two-Way player not found"

      };

  }


  team.twoWayPlayers.splice(
      index,
      1
  );


  const contract =
      entity.contract || {};


  contract.type =
      isPlayer(entity)
          ? PLAYER_CONTRACT_TYPE.STANDARD
          : NPC_CONTRACT_TYPE.STANDARD;


  contract.status =
      "ACTIVE";


  applyContract(

      entity,

      contract,

      team.teamId

  );


  if (isPlayer(entity)) {

      entity.status.contractType =
          CONTRACT_TYPE.BLA;

  }


  entity.league =
      "BLA";


  if (!Array.isArray(team.players)) {

      team.players = [];

  }


  team.players.push(
      entity
  );


  return {

      success: true,

      message:
          `${getEntityName(entity)} promoted to BLA`,

      player:
          entity

  };

}

// ============================================================
// CONTRACT SYSTEM — PART 2/2
// ============================================================


// ============================================================
// RENEW PLAYER CONTRACT
// ============================================================
//
// Player có thể thương lượng lại.
// Có history để UI/career hiển thị.
// ============================================================

export function renewPlayerContract(
  player,
  offer = {}
) {

  if (!player) {

      return {
          success: false,
          message: "Invalid player"
      };

  }


  if (!isPlayer(player)) {

      return renewNPCContract(
          player,
          offer
      );

  }


  const oldContract =
      player.contract
          ? { ...player.contract }
          : null;


  const years =
      Number.isFinite(offer.years)
          ? Math.max(1, offer.years)
          : 1;


  const salary =
      Number.isFinite(offer.salary)
          ? Math.max(0, offer.salary)
          : (
              oldContract?.salary || 0
          );


  const newContract =
      createContract(

          player,

          {

              ...offer,

              type:
                  offer.type ||
                  PLAYER_CONTRACT_TYPE.STANDARD,

              years,

              remainingYears:
                  years,

              salary,

              status:
                  "ACTIVE"

          }

      );


  if (
      !Array.isArray(
          newContract.history
      )
  ) {

      newContract.history = [];

  }


  if (oldContract) {

      newContract.history.push({
          ...oldContract,
          endedReason: "RENEWED"
      });

  }


  player.contract =
      newContract;


  return {

      success: true,

      type: "PLAYER",

      message:
          `${getEntityName(player)} contract renewed`,

      player,

      contract:
          newContract

  };

}


// ============================================================
// RENEW NPC CONTRACT
// ============================================================
//
// NPC không negotiation sâu.
// AI chỉ truyền offer cuối cùng.
// ============================================================

export function renewNPCContract(
  npc,
  offer = {}
) {

  if (!npc) {

      return {
          success: false,
          message: "Invalid NPC"
      };

  }


  const oldContract =
      npc.contract
          ? { ...npc.contract }
          : null;


  const years =
      Number.isFinite(offer.years)
          ? Math.max(1, offer.years)
          : 1;


  const salary =
      Number.isFinite(offer.salary)
          ? Math.max(0, offer.salary)
          : (
              oldContract?.salary || 1
          );


  npc.contract =
      createContract(

          npc,

          {

              type:
                  offer.type ||
                  NPC_CONTRACT_TYPE.STANDARD,

              years,

              remainingYears:
                  years,

              salary,

              status:
                  "ACTIVE"

          }

      );


  npc.contract.previousContract =
      oldContract
          ? {
              years:
                  oldContract.years,

              salary:
                  oldContract.salary
          }
          : null;


  return {

      success: true,

      type: "NPC",

      message:
          `${getEntityName(npc)} contract renewed`,

      player:
          npc,

      contract:
          npc.contract

  };

}


// ============================================================
// LEGACY RENEW
// ============================================================

export function renewContract(
  entity,
  offer = {}
) {

  if (isPlayer(entity)) {

      return renewPlayerContract(
          entity,
          offer
      );

  }


  return renewNPCContract(
      entity,
      offer
  );

}


// ============================================================
// PLAYER CONTRACT NEGOTIATION
// ============================================================
//
// Đây là phần sâu dành riêng cho Player.
//
// NPC không dùng hệ này.
// ============================================================

export function negotiatePlayerContract(
  player,
  offer = {}
) {

  if (!player || !isPlayer(player)) {

      return {

          success: false,

          accepted: false,

          message:
              "Player contract negotiation requires a Player"

      };

  }


  const currentSalary =
      player.contract?.salary || 0;


  const requestedSalary =
      Number.isFinite(
          offer.salary
      )
          ? Math.max(
              0,
              offer.salary
          )
          : currentSalary;


  const requestedYears =
      Number.isFinite(
          offer.years
      )
          ? Math.max(
              1,
              offer.years
          )
          : 1;


  // Player không có contract
  // → offer mặc định được chấp nhận.
  if (!player.contract) {

      return {

          success: true,

          accepted: true,

          counter: false,

          offer: {

              salary:
                  requestedSalary,

              years:
                  requestedYears

          }

      };

  }


  // --------------------------------------------------------
  // Simple negotiation logic
  // --------------------------------------------------------
  //
  // Không biến thành game kinh tế phức tạp.
  // Chỉ tạo khoảng counter hợp lý.
  // --------------------------------------------------------

  const minimumSalary =
      currentSalary > 0
          ? currentSalary * 0.9
          : 0;


  const maximumSalary =
      currentSalary > 0
          ? currentSalary * 1.5
          : requestedSalary;


  if (
      requestedSalary >=
      minimumSalary
  ) {

      return {

          success: true,

          accepted: true,

          counter: false,

          offer: {

              salary:
                  Math.min(
                      requestedSalary,
                      maximumSalary
                  ),

              years:
                  requestedYears

          }

      };

  }


  const counterSalary =
      Math.max(
          minimumSalary,
          requestedSalary
      );


  return {

      success: true,

      accepted: false,

      counter: true,

      offer: {

          salary:
              counterSalary,

          years:
              requestedYears

      }

  };

}


// ============================================================
// RELEASE PLAYER
// ============================================================

export function releasePlayer(
  team,
  player,
  reason = "RELEASED"
) {

  if (!team || !player) {

      return {

          success: false,

          message:
              "Invalid team or player"

      };

  }


  if (!Array.isArray(team.players)) {

      return {

          success: false,

          message:
              "Roster not found"

      };

  }


  const index =
      team.players.findIndex(
          p =>
              p.id === player.id
      );


  if (index === -1) {

      return {

          success: false,

          message:
              "Player not found on roster"

      };

  }


  team.players.splice(
      index,
      1
  );


  player.teamId =
      null;


  player.league =
      "FREE_AGENT";


  if (!player.status) {

      player.status = {};

  }


  player.status.contractType =
      CONTRACT_TYPE.FREE_AGENT;


  if (player.contract) {

      player.contract.status =
          "TERMINATED";

      player.contract.endedReason =
          reason;

  }


  addFreeAgent(
      player
  );


  return {

      success: true,

      type: "PLAYER",

      message:
          `${getEntityName(player)} released`,

      player

  };

}


// ============================================================
// RELEASE NPC
// ============================================================

export function releaseNPC(
  team,
  npc,
  reason = "RELEASED"
) {

  if (!team || !npc) {

      return {

          success: false,

          message:
              "Invalid team or NPC"

      };

  }


  if (!Array.isArray(team.players)) {

      return {

          success: false,

          message:
              "Roster not found"

      };

  }


  const index =
      team.players.findIndex(
          p =>
              p.id === npc.id
      );


  if (index === -1) {

      return {

          success: false,

          message:
              "NPC not found on roster"

      };

  }


  team.players.splice(
      index,
      1
  );


  npc.teamId =
      null;


  npc.league =
      "FREE_AGENT";


  if (npc.contract) {

      npc.contract.status =
          "TERMINATED";

      npc.contract.endedReason =
          reason;

  }


  addFreeAgent(
      npc
  );


  return {

      success: true,

      type: "NPC",

      message:
          `${getEntityName(npc)} released`,

      player:
          npc

  };

}


// ============================================================
// LEGACY RELEASE
// ============================================================

export function releasePlayerFromTeam(
  team,
  entity
) {

  if (isPlayer(entity)) {

      return releasePlayer(
          team,
          entity
      );

  }


  return releaseNPC(
      team,
      entity
  );

}


// ============================================================
// TRADE PLAYER
// ============================================================

export function tradePlayer(
  fromTeam,
  toTeam,
  player
) {

  if (
      !fromTeam ||
      !toTeam ||
      !player
  ) {

      return {

          success: false,

          message:
              "Invalid trade data"

      };

  }


  if (!canSignToBLA(toTeam)) {

      return {

          success: false,

          message:
              "Receiving BLA roster is full"

      };

  }


  if (!Array.isArray(fromTeam.players)) {

      return {

          success: false,

          message:
              "Source roster not found"

      };

  }


  const index =
      fromTeam.players.findIndex(
          p =>
              p.id === player.id
      );


  if (index === -1) {

      return {

          success: false,

          message:
              "Player not found on source roster"

      };

  }


  fromTeam.players.splice(
      index,
      1
  );


  if (!Array.isArray(toTeam.players)) {

      toTeam.players = [];

  }


  toTeam.players.push(
      player
  );


  player.teamId =
      toTeam.teamId;


  if (isPlayer(player)) {

      if (!player.development) {

          player.development = {};

      }


      player.development.team =
          toTeam.teamId;

  }


  return {

      success: true,

      type: "PLAYER",

      message:
          `${getEntityName(player)} traded`,

      player,

      fromTeam:
          fromTeam.teamId,

      toTeam:
          toTeam.teamId

  };

}


// ============================================================
// TRADE NPC
// ============================================================
//
// NPC trade không cần negotiation package.
// Chỉ kiểm tra roster + chuyển người.
// ============================================================

export function tradeNPC(
  fromTeam,
  toTeam,
  npc
) {

  if (
      !fromTeam ||
      !toTeam ||
      !npc
  ) {

      return {

          success: false,

          message:
              "Invalid trade data"

      };

  }


  if (!canSignToBLA(toTeam)) {

      return {

          success: false,

          message:
              "Receiving BLA roster is full"

      };

  }


  if (!Array.isArray(fromTeam.players)) {

      return {

          success: false,

          message:
              "Source roster not found"

      };

  }


  const index =
      fromTeam.players.findIndex(
          p =>
              p.id === npc.id
      );


  if (index === -1) {

      return {

          success: false,

          message:
              "NPC not found on source roster"

      };

  }


  fromTeam.players.splice(
      index,
      1
  );


  if (!Array.isArray(toTeam.players)) {

      toTeam.players = [];

  }


  toTeam.players.push(
      npc
  );


  npc.teamId =
      toTeam.teamId;


  npc.league =
      "BLA";


  return {

      success: true,

      type: "NPC",

      message:
          `${getEntityName(npc)} traded`,

      player:
          npc,

      fromTeam:
          fromTeam.teamId,

      toTeam:
          toTeam.teamId

  };

}


// ============================================================
// LEGACY TRADE
// ============================================================

export function tradeEntity(
  fromTeam,
  toTeam,
  entity
) {

  if (isPlayer(entity)) {

      return tradePlayer(
          fromTeam,
          toTeam,
          entity
      );

  }


  return tradeNPC(
      fromTeam,
      toTeam,
      entity
  );

}


// ============================================================
// CONTRACT EXPIRY
// ============================================================
//
// Gọi cuối season.
//
// Không tự động tạo hợp đồng mới.
// Entity hết hạn → FA.
// ============================================================

export function processContractExpiry(
  entity
) {

  if (!entity?.contract) {

      return {

          success: false,

          message:
              "No contract found"

      };

  }


  const contract =
      entity.contract;


  contract.remainingYears =
      Math.max(
          0,
          (contract.remainingYears ?? contract.years) - 1
      );


  if (
      contract.remainingYears > 0
  ) {

      return {

          success: true,

          expired: false,

          entity,

          contract

      };

  }


  contract.status =
      "EXPIRED";


  entity.teamId =
      null;


  entity.league =
      "FREE_AGENT";


  if (isPlayer(entity)) {

      if (!entity.status) {

          entity.status = {};

      }


      entity.status.contractType =
          CONTRACT_TYPE.FREE_AGENT;

  }


  addFreeAgent(
      entity
  );


  return {

      success: true,

      expired: true,

      entity,

      contract

  };

}


// ============================================================
// PROCESS NPC CONTRACTS
// ============================================================
//
// AI-side batch processing.
// NPC không cần UI negotiation.
// ============================================================

export function processNPCContracts(
  teams = []
) {

  const results = [];


  for (const team of teams) {

      if (!Array.isArray(team.players)) {
          continue;
      }


      // Copy để tránh lỗi khi player
      // bị chuyển sang FA trong loop.
      const players = [
          ...team.players
      ];


      for (const npc of players) {

          if (isPlayer(npc)) {
              continue;
          }


          if (!npc.contract) {

              continue;

          }


          const contract =
              npc.contract;


          contract.remainingYears =
              Math.max(
                  0,
                  (
                      contract.remainingYears ??
                      contract.years ??
                      1
                  ) - 1
              );


          if (
              contract.remainingYears > 0
          ) {

              results.push({

                  npcId:
                      npc.id,

                  teamId:
                      team.teamId,

                  action:
                      "CONTINUE"

              });

              continue;

          }


          // NPC hết hạn:
          // AI đơn giản quyết định renew
          // hoặc FA.
          const ovr =
              Number(npc.ovr ?? 0);


          const renewChance =
              ovr >= 80
                  ? 0.8
                  : ovr >= 70
                      ? 0.55
                      : 0.35;


          const renew =
              Math.random() <
              renewChance;


          if (renew) {

              const oldSalary =
                  Number(
                      contract.salary || 1
                  );


              const salary =
                  Math.max(
                      1,
                      Math.round(
                          oldSalary *
                          (
                              0.9 +
                              Math.random() *
                              0.25
                          )
                      )
                  );


              const years =
                  ovr >= 80
                      ? 2
                      : 1;


              renewNPCContract(

                  npc,

                  {

                      salary,

                      years,

                      type:
                          NPC_CONTRACT_TYPE.STANDARD

                  }

              );


              results.push({

                  npcId:
                      npc.id,

                  teamId:
                      team.teamId,

                  action:
                      "RENEW",

                  salary,

                  years

              });

          } else {

              releaseNPC(
                  team,
                  npc,
                  "CONTRACT_EXPIRED"
              );


              results.push({

                  npcId:
                      npc.id,

                  teamId:
                      team.teamId,

                  action:
                      "FREE_AGENT"

              });

          }

      }

  }


  return results;

}


// ============================================================
// GET CONTRACT STATUS
// ============================================================

export function getContractStatus(
  entity
) {

  if (!entity) {

      return null;

  }


  if (!entity.contract) {

      return {

          type:
              "NONE",

          status:
              "NONE"

      };

  }


  return {

      type:
          entity.contract.type,

      status:
          entity.contract.status,

      salary:
          entity.contract.salary,

      years:
          entity.contract.years,

      remainingYears:
          entity.contract.remainingYears

  };

}


// ============================================================
// CHECK FREE AGENT
// ============================================================

export function isFreeAgent(
  entity
) {

  if (!entity) {
      return false;
  }


  return (
      entity.league ===
          "FREE_AGENT" ||
      entity.contract?.status ===
          "EXPIRED" ||
      entity.contract?.status ===
          "TERMINATED"
  );

}


// ============================================================
// SIGN FREE AGENT
// ============================================================
//
// Dùng cho cả Player và NPC.
// Player → contract chi tiết.
// NPC → contract đơn giản.
// ============================================================

export function signFreeAgent(
  team,
  entity,
  offer = {}
) {

  if (!team || !entity) {

      return {

          success: false,

          message:
              "Invalid team or entity"

      };

  }


  if (!isFreeAgent(entity)) {

      return {

          success: false,

          message:
              "Entity is not a free agent"

      };

  }


  if (isPlayer(entity)) {

      return signPlayerBLA(

          team,

          entity,

          {

              ...offer,

              type:
                  offer.type ||
                  PLAYER_CONTRACT_TYPE.STANDARD

          }

      );

  }


  return signNPCBLA(

      team,

      entity,

      {

          ...offer,

          type:
              offer.type ||
              NPC_CONTRACT_TYPE.STANDARD

      }

  );

}


// ============================================================
// ADVANCE CONTRACTS ONE SEASON
// ============================================================
//
// Player:
// chỉ giảm remainingYears.
//
// NPC:
// dùng processNPCContracts() để AI xử lý
// renew / FA.
//
// ============================================================

export function advanceContracts(
  teams = []
) {

  const results = {

      players: [],

      npcs: []

  };


  for (const team of teams) {

      if (!Array.isArray(team.players)) {
          continue;
      }


      for (const entity of [...team.players]) {

          if (isPlayer(entity)) {

              const result =
                  processContractExpiry(
                      entity
                  );


              results.players.push(
                  result
              );

          }

      }

  }


  results.npcs =
      processNPCContracts(
          teams
      );


  return results;

}