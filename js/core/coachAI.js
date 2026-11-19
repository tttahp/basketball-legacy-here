// ========================================
// coachAI.js
// PART 1
// Coach AI
// ========================================

export const OFFENSIVE_PLAN = {

  BALANCED: "Balanced",

  PAINT_ATTACK: "Paint Attack",

  THREE_POINT: "Three Point",

  MOVE_BALL: "Move Ball Around",

  FEED_STAR: "Feed The Star",

  GUARD_FOCUS: "Guard Focus",

  FORWARD_FOCUS: "Forward Focus",

  CENTER_FOCUS: "Center Focus"

};



export const DEFENSIVE_PLAN = {

  BALANCED: "Balanced",

  PROTECT_PAINT: "Protect Paint",

  PERIMETER: "Perimeter Defense",

  DOUBLE_TEAM: "Double Team",

  NO_HELP: "No Help"

};



export const ROTATION_PLAN = {

  BALANCED: "Balanced",

  KEEP_STARTER: "Keep Starter",

  ROOKIE_WORK: "Rookie Work",

  BENCH_WORK: "Bench Work",

  FATIGUE: "Fatigue Based"

};



export const ENDGAME_PLAN = {

  BALANCED: "Balanced",

  BEST_PLAYER: "Best Player",

  DEFENSE: "Defense Lineup",

  OFFENSE: "Offense Lineup",

  STAR_ISO: "Star Isolation"

};



export function createCoachAI() {

  return {

      offensivePlan:

          OFFENSIVE_PLAN.BALANCED,



      defensivePlan:

          DEFENSIVE_PLAN.BALANCED,



      rotationPlan:

          ROTATION_PLAN.BALANCED,



      endGamePlan:

          ENDGAME_PLAN.BALANCED

  };

}

// ========================================
// coachAI.js
// PART 2
// Coach Decision
// ========================================


// ========================================
// OFFENSIVE DECISION
// ========================================

export function getOffensiveDecision(

  coach

) {

  switch (

      coach.offensivePlan

  ) {

      case OFFENSIVE_PLAN.PAINT_ATTACK:

          return {

              drive: 45,

              post: 30,

              mid: 15,

              three: 10

          };



      case OFFENSIVE_PLAN.THREE_POINT:

          return {

              drive: 10,

              post: 5,

              mid: 20,

              three: 65

          };



      case OFFENSIVE_PLAN.MOVE_BALL:

          return {

              pass: 70,

              shoot: 30

          };



      case OFFENSIVE_PLAN.FEED_STAR:

          return {

              starTouch: 70,

              teamTouch: 30

          };



      case OFFENSIVE_PLAN.GUARD_FOCUS:

          return {

              guardTouch: 65,

              forwardTouch: 20,

              centerTouch: 15

          };



      case OFFENSIVE_PLAN.FORWARD_FOCUS:

          return {

              guardTouch: 20,

              forwardTouch: 65,

              centerTouch: 15

          };



      case OFFENSIVE_PLAN.CENTER_FOCUS:

          return {

              guardTouch: 15,

              forwardTouch: 20,

              centerTouch: 65

          };



      default:

          return {

              drive: 30,

              post: 15,

              mid: 25,

              three: 30

          };

  }

}



// ========================================
// DEFENSIVE DECISION
// ========================================

export function getDefensiveDecision(

  coach

) {

  switch (

      coach.defensivePlan

  ) {

      case DEFENSIVE_PLAN.PROTECT_PAINT:

          return {

              paint: 70,

              perimeter: 30

          };



      case DEFENSIVE_PLAN.PERIMETER:

          return {

              paint: 30,

              perimeter: 70

          };



      case DEFENSIVE_PLAN.DOUBLE_TEAM:

          return {

              doubleTeam: true

          };



      case DEFENSIVE_PLAN.NO_HELP:

          return {

              helpDefense: false

          };



      default:

          return {

              paint: 50,

              perimeter: 50

          };

  }

}



// ========================================
// ROTATION DECISION
// ========================================

export function getRotationDecision(

  coach

) {

  switch (

      coach.rotationPlan

  ) {

      case ROTATION_PLAN.KEEP_STARTER:

          return {

              subOutStamina: 5

          };



      case ROTATION_PLAN.BENCH_WORK:

          return {

              subOutStamina: 50

          };



      case ROTATION_PLAN.ROOKIE_WORK:

          return {

              subOutStamina: 40,

              rookiePriority: true

          };



      case ROTATION_PLAN.FATIGUE:

          return {

              subOutStamina: 65

          };



      default:

          return {

              subOutStamina: 40

          };

  }

}



// ========================================
// END GAME DECISION
// ========================================

export function getEndGameDecision(

  coach

) {

  switch (

      coach.endGamePlan

  ) {

      case ENDGAME_PLAN.BEST_PLAYER:

          return {

              feedStar: true

          };



      case ENDGAME_PLAN.DEFENSE:

          return {

              defenseLineup: true

          };



      case ENDGAME_PLAN.OFFENSE:

          return {

              offenseLineup: true

          };



      case ENDGAME_PLAN.STAR_ISO:

          return {

              isolation: true

          };



      default:

          return {

              balanced: true

          };

  }

}

// ========================================
// coachAI.js
// PART 3
// Runtime Coach AI
// ========================================



// ========================================
// UPDATE COACH AI
// ========================================

export function updateCoachAI(team, gameState) {

  const coach = team.coach;



  if (

      coach.rotationPlan ===

      ROTATION_PLAN.ROOKIE_WORK

  ) {

      if (

          gameState.isBlowout ||

          gameState.quarter <= 2

      ) {

          gameState.rookiePriority = true;

      }

  }



  if (

      coach.rotationPlan ===

      ROTATION_PLAN.KEEP_STARTER

  ) {

      if (

          gameState.quarter >= 4 &&

          !gameState.isBlowout

      ) {

          gameState.forceStarter = true;

      }

  }



  if (

      coach.endGamePlan ===

      ENDGAME_PLAN.BEST_PLAYER

  ) {

      if (

          gameState.clutch

      ) {

          coach.offensivePlan =

              OFFENSIVE_PLAN.FEED_STAR;

      }

  }



  if (

      coach.endGamePlan ===

      ENDGAME_PLAN.STAR_ISO

  ) {

      if (

          gameState.clutch

      ) {

          gameState.starIsolation = true;

      }

  }



  if (

      coach.endGamePlan ===

      ENDGAME_PLAN.DEFENSE

  ) {

      if (

          gameState.clutch

      ) {

          coach.defensivePlan =

              DEFENSIVE_PLAN.PROTECT_PAINT;

      }

  }



  if (

      coach.endGamePlan ===

      ENDGAME_PLAN.OFFENSE

  ) {

      if (

          gameState.clutch

      ) {

          coach.offensivePlan =

              OFFENSIVE_PLAN.THREE_POINT;

      }

  }

}



// ========================================
// CHECK CLUTCH
// ========================================

export function checkClutch(gameState) {

  gameState.clutch =

      gameState.quarter >= 4 &&

      gameState.timeRemaining <= 300 &&

      Math.abs(

          gameState.homeScore -

          gameState.awayScore

      ) <= 7;

}



// ========================================
// CHECK BLOWOUT
// ========================================

export function checkBlowout(gameState) {

  gameState.isBlowout =

      Math.abs(

          gameState.homeScore -

          gameState.awayScore

      ) >= 20;

}



// ========================================
// CREATE GAME STATE
// ========================================

export function createGameState() {

  return {

      quarter: 1,

      timeRemaining: 720,

      homeScore: 0,

      awayScore: 0,

      clutch: false,

      isBlowout: false,

      rookiePriority: false,

      forceStarter: false,

      starIsolation: false

  };

}