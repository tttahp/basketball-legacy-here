// tradeSystem.js
// ============================================================
// TRADE SYSTEM — PLAYER + NPC
// ============================================================
// PLAYER:
// - Có trade proposal rõ ràng.
// - Giữ nguyên contract/salary.
// - Có thể kiểm tra giá trị, roster fit.
// - Có thể accept / reject / counter.
// - Có thể dùng cho Manager Mode sau này.
//
// NPC:
// - Vẫn có salary / contract / trade.
// - AI đánh giá đơn giản.
// - Không cần mô phỏng negotiation sâu.
//
// RULES:
// - BLA roster tối đa 13.
// - Không ép đủ PG/SG/SF/PF/C.
// - Không tạo Player/NPC object mới.
// - Không reset roster.
// - Contract đi theo player.
// ============================================================

import {
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

function getRoster(team) {

  if (!Array.isArray(team?.players)) {

      team.players = [];

  }

  return team.players;

}


function getRosterSize(team) {

  return getRoster(team).length;

}


function hasRosterSpace(team) {

  return (
      getRosterSize(team) <
      MAX_BLA_ROSTER
  );

}


function findPlayer(team, playerId) {

  return getRoster(team).find(
      player =>
          player.id === playerId
  );

}


function removePlayer(team, playerId) {

  const roster =
      getRoster(team);


  const index =
      roster.findIndex(
          player =>
              player.id === playerId
      );


  if (index === -1) {

      return null;

  }


  return roster.splice(
      index,
      1
  )[0];

}


// ============================================================
// PLAYER VALUE
// ============================================================
//
// Chỉ dùng để AI/Manager đánh giá trade.
// Không thay đổi player OVR.
// ============================================================

export function getTradeValue(
  player
) {

  if (!player) {

      return 0;

  }


  const ovr =
      Number(
          player.ovr ??
          player.overall ??
          player.stats?.ovr ??
          0
      );


  const age =
      Number(
          player.age ??
          player.creation?.age ??
          20
      );


  let value = ovr;


  // Prime/young players có giá trị cao hơn.
  if (age <= 22) {

      value += 5;

  } else if (age >= 30) {

      value -= 4;

  }


  // Contract còn dài giúp trade value ổn định hơn.
  const remainingYears =
      Number(
          player.contract
              ?.remainingYears ??
          player.contract
              ?.years ??
          0
      );


  if (remainingYears >= 3) {

      value += 2;

  }


  return Math.max(
      0,
      Math.round(value)
  );

}


// ============================================================
// CREATE TRADE OFFER
// ============================================================

export function createTradeOffer(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  if (
      !fromTeam ||
      !toTeam ||
      !sendingPlayer ||
      !receivingPlayer
  ) {

      return {

          success: false,

          message:
              "Invalid trade data"

      };

  }


  return {

      fromTeamId:
          fromTeam.teamId,

      toTeamId:
          toTeam.teamId,

      sendingPlayerId:
          sendingPlayer.id,

      receivingPlayerId:
          receivingPlayer.id,

      sendingValue:
          getTradeValue(
              sendingPlayer
          ),

      receivingValue:
          getTradeValue(
              receivingPlayer
          ),

      status:
          "PENDING"

  };

}


// ============================================================
// VALIDATE TRADE
// ============================================================
//
// Một trade 1-for-1 đơn giản.
// Contract không bị tạo lại.
// ============================================================

export function validateTrade(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  if (
      !fromTeam ||
      !toTeam ||
      !sendingPlayer ||
      !receivingPlayer
  ) {

      return {

          valid: false,

          message:
              "Missing trade data"

      };

  }


  if (
      fromTeam.teamId ===
      toTeam.teamId
  ) {

      return {

          valid: false,

          message:
              "Cannot trade within the same team"

      };

  }


  const sourcePlayer =
      findPlayer(
          fromTeam,
          sendingPlayer.id
      );


  const targetPlayer =
      findPlayer(
          toTeam,
          receivingPlayer.id
      );


  if (!sourcePlayer) {

      return {

          valid: false,

          message:
              "Sending player is not on source roster"

      };

  }


  if (!targetPlayer) {

      return {

          valid: false,

          message:
              "Receiving player is not on target roster"

      };

  }


  // 1-for-1 trade không làm roster size đổi.
  // Vì vậy target team không cần có empty slot.
  //
  // Vẫn kiểm tra roster hợp lệ để tránh dữ liệu
  // đã vượt giới hạn trước trade.
  if (
      getRosterSize(fromTeam) >
      MAX_BLA_ROSTER
  ) {

      return {

          valid: false,

          message:
              "Source roster already exceeds BLA limit"

      };

  }


  if (
      getRosterSize(toTeam) >
      MAX_BLA_ROSTER
  ) {

      return {

          valid: false,

          message:
              "Target roster already exceeds BLA limit"

      };

  }


  return {

      valid: true,

      sourcePlayer,

      targetPlayer

  };

}


// ============================================================
// EXECUTE 1-FOR-1 TRADE
// ============================================================

export function executeTrade(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  const validation =
      validateTrade(

          fromTeam,
          toTeam,
          sendingPlayer,
          receivingPlayer

      );


  if (!validation.valid) {

      return {

          success: false,

          message:
              validation.message

      };

  }


  const sourcePlayer =
      validation.sourcePlayer;


  const targetPlayer =
      validation.targetPlayer;


  // Remove both first.
  removePlayer(
      fromTeam,
      sourcePlayer.id
  );


  removePlayer(
      toTeam,
      targetPlayer.id
  );


  // Add to opposite rosters.
  getRoster(fromTeam).push(
      targetPlayer
  );


  getRoster(toTeam).push(
      sourcePlayer
  );


  // Update ownership.
  sourcePlayer.teamId =
      toTeam.teamId;


  targetPlayer.teamId =
      fromTeam.teamId;


  // Keep league.
  sourcePlayer.league =
      "BLA";


  targetPlayer.league =
      "BLA";


  // Player-specific development data.
  if (
      isPlayer(sourcePlayer)
  ) {

      if (!sourcePlayer.development) {

          sourcePlayer.development = {};

      }


      sourcePlayer.development.team =
          toTeam.teamId;

      sourcePlayer.development.league =
          "BLA";

  }


  if (
      isPlayer(targetPlayer)
  ) {

      if (!targetPlayer.development) {

          targetPlayer.development = {};

      }


      targetPlayer.development.team =
          fromTeam.teamId;

      targetPlayer.development.league =
          "BLA";

  }


  return {

      success: true,

      fromTeamId:
          fromTeam.teamId,

      toTeamId:
          toTeam.teamId,

      sendingPlayer:
          sourcePlayer,

      receivingPlayer:
          targetPlayer

  };

}


// ============================================================
// PLAYER TRADE REQUEST
// ============================================================
//
// Player/Manager UI có thể gọi function này.
// ============================================================

export function requestPlayerTrade(
  fromTeam,
  toTeam,
  player,
  targetPlayer
) {

  if (
      !isPlayer(player)
  ) {

      return {

          success: false,

          message:
              "This function is for Player trade requests"

      };

  }


  const offer =
      createTradeOffer(

          fromTeam,
          toTeam,
          player,
          targetPlayer

      );


  return {

      success: true,

      type:
          "PLAYER",

      offer

  };

}


// ============================================================
// NPC TRADE EVALUATION
// ============================================================
//
// NPC/team AI không cần negotiation sâu.
//
// So sánh:
// - OVR/trade value
// - team need
// - salary
//
// Không dùng random quá nhiều.
// ============================================================

export function evaluateNPCTrade(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  const validation =
      validateTrade(

          fromTeam,
          toTeam,
          sendingPlayer,
          receivingPlayer

      );


  if (!validation.valid) {

      return {

          accepted: false,

          message:
              validation.message

      };

  }


  const sendingValue =
      getTradeValue(
          sendingPlayer
      );


  const receivingValue =
      getTradeValue(
          receivingPlayer
      );


  const difference =
      sendingValue -
      receivingValue;


  // Team receiving sendingPlayer
  // muốn giá trị nhận được ít nhất
  // không thấp hơn quá nhiều.
  const accepted =
      difference >= -5;


  return {

      accepted,

      sendingValue,

      receivingValue,

      difference

  };

}


// ============================================================
// NPC AUTO TRADE
// ============================================================

export function autoTradeNPC(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  if (
      !fromTeam ||
      !toTeam ||
      !sendingPlayer ||
      !receivingPlayer
  ) {

      return {

          success: false,

          message:
              "Invalid NPC trade"

      };

  }


  const npcTrade =
      evaluateNPCTrade(

          fromTeam,
          toTeam,
          sendingPlayer,
          receivingPlayer

      );


  if (
      !npcTrade.accepted
  ) {

      return {

          success: false,

          accepted: false,

          message:
              "NPC team rejected trade",

          evaluation:
              npcTrade

      };

  }


  const result =
      executeTrade(

          fromTeam,
          toTeam,
          sendingPlayer,
          receivingPlayer

      );


  return {

      ...result,

      accepted: true,

      evaluation:
          npcTrade

  };

}


// ============================================================
// PLAYER ACCEPT TRADE
// ============================================================

export function acceptPlayerTrade(
  offer,
  teams
) {

  if (
      !offer ||
      !Array.isArray(teams)
  ) {

      return {

          success: false,

          message:
              "Invalid trade offer"

      };

  }


  const fromTeam =
      teams.find(
          team =>
              team.teamId ===
              offer.fromTeamId
      );


  const toTeam =
      teams.find(
          team =>
              team.teamId ===
              offer.toTeamId
      );


  if (
      !fromTeam ||
      !toTeam
  ) {

      return {

          success: false,

          message:
              "Trade teams not found"

      };

  }


  const sendingPlayer =
      findPlayer(
          fromTeam,
          offer.sendingPlayerId
      );


  const receivingPlayer =
      findPlayer(
          toTeam,
          offer.receivingPlayerId
      );


  if (
      !sendingPlayer ||
      !receivingPlayer
  ) {

      return {

          success: false,

          message:
              "Trade players not found"

      };

  }


  return executeTrade(

      fromTeam,

      toTeam,

      sendingPlayer,

      receivingPlayer

  );

}


// ============================================================
// COUNTER TRADE
// ============================================================
//
// Player/Manager có thể đổi target player.
// Không tự thực hiện trade.
// ============================================================

export function counterTrade(
  fromTeam,
  toTeam,
  sendingPlayer,
  newReceivingPlayer
) {

  if (
      !fromTeam ||
      !toTeam ||
      !sendingPlayer ||
      !newReceivingPlayer
  ) {

      return {

          success: false,

          message:
              "Invalid counter trade"

      };

  }


  const offer =
      createTradeOffer(

          fromTeam,
          toTeam,
          sendingPlayer,
          newReceivingPlayer

      );


  return {

      success: true,

      status:
          "COUNTER",

      offer

  };

}


// ============================================================
// TRADE PACKAGE
// ============================================================
//
// Chuẩn bị cho Manager Mode sau này.
// Hiện tại vẫn đơn giản.
//
// Có thể gửi nhiều player,
// nhưng chỉ thực hiện nếu roster sau trade
// không vượt 13.
// ============================================================

export function createTradePackage(
  fromTeam,
  toTeam,
  sendingPlayers = [],
  receivingPlayers = []
) {

  if (
      !Array.isArray(sendingPlayers) ||
      !Array.isArray(receivingPlayers)
  ) {

      return {

          success: false,

          message:
              "Invalid trade package"

      };

  }


  const sourceRosterAfter =
      getRosterSize(fromTeam) -
      sendingPlayers.length +
      receivingPlayers.length;


  const targetRosterAfter =
      getRosterSize(toTeam) -
      receivingPlayers.length +
      sendingPlayers.length;


  if (
      sourceRosterAfter >
      MAX_BLA_ROSTER
  ) {

      return {

          success: false,

          message:
              "Source roster would exceed 13"

      };

  }


  if (
      targetRosterAfter >
      MAX_BLA_ROSTER
  ) {

      return {

          success: false,

          message:
              "Target roster would exceed 13"

      };

  }


  return {

      success: true,

      fromTeamId:
          fromTeam.teamId,

      toTeamId:
          toTeam.teamId,

      sendingPlayers:
          sendingPlayers.map(
              player =>
                  player.id
          ),

      receivingPlayers:
          receivingPlayers.map(
              player =>
                  player.id
          ),

      sendingValue:
          sendingPlayers.reduce(
              (
                  total,
                  player
              ) =>
                  total +
                  getTradeValue(player),
              0
          ),

      receivingValue:
          receivingPlayers.reduce(
              (
                  total,
                  player
              ) =>
                  total +
                  getTradeValue(player),
              0
          ),

      status:
          "PENDING"

  };

}


// ============================================================
// GET TEAM TRADE VALUE
// ============================================================

export function getTeamTradeValue(
  team
) {

  return getRoster(team)
      .reduce(
          (
              total,
              player
          ) =>
              total +
              getTradeValue(player),
          0
      );

}


// ============================================================
// CHECK TRADE ELIGIBILITY
// ============================================================

export function canTradePlayer(
  player
) {

  if (!player) {

      return {

          allowed: false,

          message:
              "Invalid player"

      };

  }


  if (
      player.contract?.status ===
      "TERMINATED"
  ) {

      return {

          allowed: false,

          message:
              "Contract is terminated"

      };

  }


  if (
      player.league !==
      "BLA"
  ) {

      return {

          allowed: false,

          message:
              "Player is not in BLA"

      };

  }


  return {

      allowed: true

  };

}


// ============================================================
// TRADE SUMMARY
// ============================================================

export function getTradeSummary(
  fromTeam,
  toTeam,
  sendingPlayer,
  receivingPlayer
) {

  return {

      fromTeam: {

          id:
              fromTeam?.teamId,

          rosterSize:
              getRosterSize(fromTeam)

      },

      toTeam: {

          id:
              toTeam?.teamId,

          rosterSize:
              getRosterSize(toTeam)

      },

      sendingPlayer: {

          id:
              sendingPlayer?.id,

          name:
              sendingPlayer?.name,

          value:
              getTradeValue(
                  sendingPlayer
              ),

          contract:
              getContractStatus(
                  sendingPlayer
              )

      },

      receivingPlayer: {

          id:
              receivingPlayer?.id,

          name:
              receivingPlayer?.name,

          value:
              getTradeValue(
                  receivingPlayer
              ),

          contract:
              getContractStatus(
                  receivingPlayer
              )

      }

  };

}