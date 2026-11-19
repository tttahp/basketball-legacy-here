const dnaTemplate = {
  playStyle: "",

  strengths: [],

  weaknesses: [],

  tendencies: {
      scoring: 0,
      passing: 0,
      defense: 0,
      rebounding: 0,
      shooting: 0,
      driving: 0
  },

  growth: {
      early: 0,
      prime: 0,
      late: 0
  }
};


function createDNA() {
  const dna = structuredClone(dnaTemplate);

  return dna;
}


export default createDNA;