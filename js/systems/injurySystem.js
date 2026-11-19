const injuryTemplate = {
  active: false,

  type: "",

  severity: "",

  duration: 0,

  recovery: {
      progress: 0,
      treatment: ""
  }
};


function createInjury() {
  const injury = structuredClone(injuryTemplate);

  return injury;
}


export default createInjury;