function randomStat(min, max) {
  return Math.floor(
      Math.random() * (max - min + 1)
  ) + min;
}

function clamp(value, min, max) {
  return Math.max(
      min,
      Math.min(value, max)
  );
}

const POSITION_PROFILE = {

  PG: {
      speed: [53, 61],
      strength: [42, 52],
      stamina: [58, 65],

      shoot: [54, 63],
      threePoint: [52, 65],
      pass: [57, 63],
      rebound: [40, 50],
      defense: [47, 60],
      dunk: [35, 53],
      handle: [58, 65]
  },

  SG: {
      speed: [56, 65],
      strength: [42, 54],
      stamina: [56, 65],

      shoot: [59, 65],
      threePoint: [57, 67],
      pass: [45, 58],
      rebound: [40, 52],
      defense: [47, 60],
      dunk: [43, 57],
      handle: [55, 62]
  },

  SF: {
      speed: [51, 60],
      strength: [49, 61],
      stamina: [57, 67],

      shoot: [51, 61],
      threePoint: [47, 59],
      pass: [45, 57],
      rebound: [50, 59],
      defense: [52, 60],
      dunk: [49, 60],
      handle: [44, 57]
  },

  PF: {
      speed: [45, 57],
      strength: [57, 65],
      stamina: [57, 67],

      shoot: [47, 57],
      threePoint: [41, 56],
      pass: [41, 53],
      rebound: [55, 62],
      defense: [56, 64],
      dunk: [53, 65],
      handle: [36, 52]
  },

  C: {
      speed: [36, 54],
      strength: [59, 67],
      stamina: [58, 69],

      shoot: [45, 60],
      threePoint: [38, 58],
      pass: [40, 56],
      rebound: [59, 66],
      defense: [59, 67],
      dunk: [53, 65],
      handle: [30, 50]
  }

};


function generateAttributes(position, playStyle) {

  const profile =
      POSITION_PROFILE[position];

  if (!profile) {

      return null;

  }


  const stats = {};


  // ========================================
  // POSITION BASED RANDOM
  // ========================================

  for (const stat of Object.keys(profile)) {

      const [min, max] =
          profile[stat];

      stats[stat] =
          randomStat(min, max);

  }


  // ========================================
  // PLAYSTYLE
  // ========================================

  if (playStyle === "Shooter") {

      stats.shoot +=
          randomStat(1, 3);

      stats.threePoint +=
          randomStat(1, 3);

  }


  if (playStyle === "Slasher") {

      stats.dunk +=
          randomStat(1, 3);

      stats.speed +=
          randomStat(1, 3);

  }


  if (playStyle === "Playmaker") {

      stats.pass +=
          randomStat(1, 3);

      stats.handle +=
          randomStat(1, 3);

  }


  if (playStyle === "Defender") {

      stats.defense +=
          randomStat(1, 3);

  }


  if (playStyle === "Rebounder") {

      stats.rebound +=
          randomStat(1, 3);

  }


  // ========================================
  // FINAL LIMIT
  // ========================================

  Object.keys(stats).forEach(stat => {

      stats[stat] =
          clamp(
              stats[stat],
              30,
              70
          );

  });


  return stats;

}


function createPlayer(data) {

  return {

      id:
          "player_" +
          Date.now(),

      name:
          data.name,

      creation: {

          country:
              data.nationality,

          position:
              data.position,

          height:
              data.height,

          bodyType:
              data.bodyType,

          dominantHand:
              data.hand

      },

      overall:
          60,

      attributes:
          generateAttributes(
              data.position,
              data.playStyle
          ),

      status: {

          morale: {
              value: 60,
              state: "Normal"
          },

          condition:
              "Healthy",

          detail:
              null

      },

      role:
          "Prospect/Bench Warmer",

      playStyle:
          data.playStyle,

      /*stamina:
          100,*/

      nickname:
          null,

      badges:
          [],

      injuries:
          [],

      career: {

          team:
              null,

          seasons:
              0,

          gamesPlayed:
              0,

          championship:
              0,

          allStar:
              0,

          mvp:
              0,

          awards:
              []

      }

  };

}


export default createPlayer;