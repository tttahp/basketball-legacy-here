const moraleTemplate = {
  value: 50,

  mood: "Neutral",

  influences: {
      playingTime: 0,
      teamPerformance: 0,
      personalPerformance: 0,
      coachRelationship: 0,
      teammateRelationship: 0,
      family: 0,
      fanSupport: 0
  }
};

function createMorale() {
  const morale = structuredClone(moraleTemplate);

  return morale;
}

export default createMorale;