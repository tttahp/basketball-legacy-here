const historyTemplate = {

  training: 0,

  matches: 0,

  wins: 0,

  losses: 0,

  championships: 0,

  trainingDays: 0,

  restDays: 0,

  partyDays: 0,

  dateDays: 0,

  mediaEvents: 0,

  charityEvents: 0,

  injuries: 0,

  seriousInjuries: 0

};


function createHistory() {

  return structuredClone(historyTemplate);

}


export default createHistory;