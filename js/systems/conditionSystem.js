const conditionTemplate = {
  current: "Healthy",

  effects: {
      stamina: 0,
      morale: 0,
      performance: 0
  },

  duration: 0,

  source: ""
};


function createCondition() {
  const condition = structuredClone(conditionTemplate);

  return condition;
}


export default createCondition;