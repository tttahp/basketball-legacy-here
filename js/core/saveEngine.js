const gameSaveTemplate = {
  account: {
      id: "",
      username: "",
      prime: false,
      careerSlots: 1
  },

  careers: [],

  settings: {
      language: "EN",
      notifications: true
  }
};


function createSave() {
  const save = structuredClone(gameSaveTemplate);

  return save;
}


export default createSave;