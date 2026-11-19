import playerTemplate from "../data/player.js";

export function createUser(data = {}) {
  return {
    ...playerTemplate,

    id: "USER_" + Date.now(),

    creation: {
      ...playerTemplate.creation,
      ...data.creation
    },

    attributes: {
      ...playerTemplate.attributes,
      ...data.attributes
    },

    badges: [],

    age: 16,

    development: {
      school: "",
      team: "",
      coachTrust: 0
    },

    career: {
      draftPick: null,
      seasons: 0,
      awards: [],
      championships: 0
    }
  };
}