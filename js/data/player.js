const playerTemplate = {
  id: "",

  careerMode: "", // FREE | PRIME
  gender: "MEN",

  creation: {
      firstName: "",
      lastName: "",
      country: "",
      avatar: "",

      height: 0,
      bodyType: "",

      position: "",

      dominantHand: "",

      nickname: ""
  },

  age: 16,

  overall: 60,

  overallHistory: {
    highest: 60,
    lowest: 60
  },

  attributes: {
      speed: 0,
      strength: 0,
      stamina: 0,

      shoot: 0,
      threePoint: 0,
      pass: 0,
      rebound: 0,
      defense: 0,
      dunk: 0,
      handle: 0
  },

  attributeXP: {
      speed: 0,
      strength: 0,
      stamina: 0,

      shoot: 0,
      threePoint: 0,
      pass: 0,
      rebound: 0,
      defense: 0,
      dunk: 0,
      handle: 0
  },

  badges: [],

  role: "Prospect/Bench Warmer",

  status: {
      morale: {
          value: 60,
          state: "Normal"
      },

      condition: "Healthy",

      detail: "",

      injury: null
  },

  potential: {
      scoutRating: "",

      hiddenGrowth: 0,

      hiddenTalent: {
          speed: 100,
          strength: 100,
          stamina: 100,

          shoot: 100,
          threePoint: 100,
          pass: 100,
          rebound: 100,
          defense: 100,
          dunk: 100,
          handle: 100
      }
  },

  development: {
      school: "",
      team: "",

      coachTrust: 0,

      developmentScore: 50,

      peakAge: 0,
      declineAge: 0,
      retireAge: 0,

      maxOverall: 0
  },

  history: {},

  career: {
      draftPick: null,
      seasons: 0,

      awards: [],

      championship: 0,

      peakOverall: 0,
      peakAge: null
  }
};

export default playerTemplate;