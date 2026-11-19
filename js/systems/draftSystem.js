// ============================================================
// DRAFT SYSTEM
// ------------------------------------------------------------
// Xử lý Draft NPC của BLA.
//
// Draft flow:
//
// 60 NPC prospects
//       ↓
// Draft Order
//       ↓
// 30 BLA teams
//       ↓
// mỗi team có thể có nhiều pick
//       ↓
// NPC được draft
//       ↓
// draftedPlayers
//
// NPC không được draft
//       ↓
// undraftedPlayers
//       ↓
// Free Agent / D-League xử lý sau
//
// Player người chơi KHÔNG dùng hệ này.
// ============================================================

import {
  drafts,
  getCurrentDraft,
  finishDraft as finishDraftData
} from "../data/drafts.js";

import {
  addFreeAgent
} from "../data/freeAgents.js";


// ============================================================
// CONSTANTS
// ============================================================

const DRAFT_START_YEAR = 2026;

const DRAFT_POOL_SIZE = 60;

const DRAFT_ROUNDS = 2;


// ============================================================
// START DRAFT
// ============================================================

export function startDraft(
  year = DRAFT_START_YEAR,
  prospects = []
) {

  if (year < DRAFT_START_YEAR) {

      return {
          success: false,
          message: "Draft has not started yet"
      };

  }


  const draft = getCurrentDraft();


  draft.year = year;

  draft.eligibleLeague = "BLA";

  draft.rounds = DRAFT_ROUNDS;

  draft.totalPicks = DRAFT_POOL_SIZE;

  draft.lotteryTeams = [];

  draft.draftOrder = [];

  draft.draftedPlayers = [];

  draft.undraftedPlayers = [];

  draft.status = "PENDING";


  // Chỉ lấy tối đa 60 prospects.
  draft.prospects =
      prospects
          .slice(0, DRAFT_POOL_SIZE);


  return {
      success: true,

      message:
          `BLA Draft ${year} started`,

      prospects:
          draft.prospects

  };

}


// ============================================================
// SET DRAFT ORDER
// ============================================================
//
// draftOrder là danh sách team theo thứ tự pick.
//
// Ví dụ:
//
// [
//   "BLA_01",
//   "BLA_02",
//   "BLA_03"
// ]
//
// Nếu có 30 team thì thứ tự này có thể được lặp
// cho round 2 bởi hệ thống bên ngoài.
// ============================================================

export function setDraftOrder(
  draftOrder = []
) {

  const draft =
      getCurrentDraft();


  draft.draftOrder =
      [...draftOrder];


  draft.status = "DRAFT";


  return {
      success: true,

      draftOrder:
          draft.draftOrder

  };

}


// ============================================================
// SET LOTTERY TEAMS
// ============================================================

export function setLotteryTeams(
  teams = []
) {

  const draft =
      getCurrentDraft();


  draft.lotteryTeams =
      [...teams];


  draft.status = "LOTTERY";


  return {
      success: true,

      lotteryTeams:
          draft.lotteryTeams

  };

}


// ============================================================
// CHECK NPC DRAFT ELIGIBILITY
// ============================================================
//
// NPC draft class đã được tạo riêng.
// Vì vậy không dùng:
// player.development.league
//
// Chỉ cần kiểm tra NPC hợp lệ.
// ============================================================

export function checkDraftEligibility(
  npc
) {

  if (!npc) {
      return false;
  }


  if (!npc.id) {
      return false;
  }


  if (!npc.position) {
      return false;
  }


  if (
      typeof npc.overall !== "number"
  ) {

      return false;

  }


  if (
      npc.overall < 0
  ) {

      return false;

  }


  return true;

}


// ============================================================
// GET AVAILABLE PROSPECTS
// ============================================================

export function getAvailableProspects() {

  const draft =
      getCurrentDraft();


  const draftedIds =
      new Set(
          draft.draftedPlayers.map(
              player => player.id
          )
      );


  return (
      draft.prospects || []
  ).filter(
      player =>
          !draftedIds.has(player.id)
  );

}


// ============================================================
// GET PROSPECT
// ============================================================

export function getProspect(
  playerId
) {

  const draft =
      getCurrentDraft();


  return (
      draft.prospects || []
  ).find(
      player =>
          player.id === playerId
  );

}


// ============================================================
// DRAFT NPC
// ============================================================
//
// Team phải truyền vào:
//
// {
//   teamId: "BLA_01",
//   players: []
// }
//
// Không ép position.
// Không ép OVR.
// Không ép đủ 5 position.
//
// AI team sau này tự quyết định chọn ai.
// ============================================================

export function draftPlayer(
  team,
  npc
) {

  if (!team || !npc) {

      return {
          success: false,
          type: "INVALID",
          message: "Invalid team or prospect"
      };

  }


  if (
      !checkDraftEligibility(npc)
  ) {

      return {
          success: false,
          type: "INVALID",
          message: "NPC is not draft eligible"
      };

  }


  const draft =
      getCurrentDraft();


  if (
      draft.status !== "DRAFT"
  ) {

      return {
          success: false,
          type: "INVALID",
          message: "Draft is not currently active"
      };

  }


  const available =
      getAvailableProspects();


  const prospect =
      available.find(
          player =>
              player.id === npc.id
      );


  if (!prospect) {

      return {
          success: false,
          type: "ALREADY_DRAFTED",
          message: "Prospect is no longer available"
      };

  }


  // ----------------------------------------
  // Team ID
  // ----------------------------------------

  const teamId =
      team.teamId ||
      team.id;


  if (!teamId) {

      return {
          success: false,
          type: "INVALID",
          message: "Team has no ID"
      };

  }


  // ----------------------------------------
  // Update NPC
  // ----------------------------------------

  prospect.teamId =
      teamId;

  prospect.league =
      "BLA";

  prospect.draftYear =
      draft.year;

  prospect.draftTeam =
      teamId;


  // ----------------------------------------
  // Add to team roster
  // ----------------------------------------

  if (
      Array.isArray(team.players)
  ) {

      team.players.push(
          prospect
      );

  }


  // ----------------------------------------
  // Save draft result
  // ----------------------------------------

  draft.draftedPlayers.push({

      player:
          prospect,

      playerId:
          prospect.id,

      teamId,

      year:
          draft.year,

      pick:
          draft.draftedPlayers.length + 1

  });


  return {

      success: true,

      type: "DRAFTED",

      message:
          "NPC drafted to BLA",

      player:
          prospect,

      teamId,

      pick:
          draft.draftedPlayers.length

  };

}


// ============================================================
// MARK NPC AS UNDRAFTED
// ============================================================
//
// Chạy khi draft kết thúc.
// Không tự biến NPC thành Free Agent ở giữa draft.
// ============================================================

export function processUndraftedPlayers() {

  const draft =
      getCurrentDraft();


  const draftedIds =
      new Set(
          draft.draftedPlayers.map(
              pick =>
                  pick.playerId
          )
      );


  const undrafted =
      (
          draft.prospects || []
      ).filter(
          npc =>
              !draftedIds.has(
                  npc.id
              )
      );


  draft.undraftedPlayers =
      [...undrafted];


  return undrafted;

}


// ============================================================
// SEND UNDRAFTED TO FREE AGENCY
// ============================================================
//
// Đây là bước cuối draft.
// Không ép tất cả phải vào Free Agent nếu sau này
// D-League system muốn xử lý trước.
//
// Hiện tại dùng Free Agent storage đơn giản.
// ============================================================

export function moveUndraftedToFreeAgency() {

  const draft =
      getCurrentDraft();


  const undrafted =
      processUndraftedPlayers();


  for (
      const npc of undrafted
  ) {

      npc.league =
          "FREE_AGENT";

      npc.teamId =
          null;

      addFreeAgent(npc);

  }


  return {

      success: true,

      players:
          undrafted

  };

}


// ============================================================
// FINISH DRAFT
// ============================================================

export function finishDraft() {

  const draft =
      getCurrentDraft();


  if (
      draft.status === "FINISHED"
  ) {

      return {
          success: false,
          message: "Draft already finished"
      };

  }


  // Tính undrafted trước.
  processUndraftedPlayers();


  draft.status =
      "FINISHED";


  const result = {

      year:
          draft.year,

      draftOrder:
          [...draft.draftOrder],

      draftedPlayers:
          [...draft.draftedPlayers],

      undraftedPlayers:
          [...draft.undraftedPlayers]

  };


  // Lưu history và tạo state draft kế tiếp.
  finishDraftData(result);


  return {

      success: true,

      result

  };

}


// ============================================================
// GET DRAFT STATUS
// ============================================================

export function getDraftStatus() {

  return getCurrentDraft().status;

}


// ============================================================
// GET DRAFTED PLAYERS
// ============================================================

export function getDraftedPlayers() {

  return [
      ...getCurrentDraft()
          .draftedPlayers
  ];

}


// ============================================================
// GET UNDRAFTED PLAYERS
// ============================================================

export function getUndraftedPlayers() {

  return [
      ...getCurrentDraft()
          .undraftedPlayers
  ];

}


// ============================================================
// GET DRAFT POOL
// ============================================================

export function getDraftPool() {

  return [
      ...(getCurrentDraft()
          .prospects || [])
  ];

}