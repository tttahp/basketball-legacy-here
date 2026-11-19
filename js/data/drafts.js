export const drafts = {

  current: {
      year: 2026,

      eligibleLeague: "SCHOOL",

      rounds: 2,

      totalPicks: 60,

      lotteryTeams: [],

      draftOrder: [],

      draftedPlayers: [],

      undraftedPlayers: [],

      status: "PENDING" // PENDING | LOTTERY | DRAFT | FINISHED
  },

  history: []

};



export function getCurrentDraft() {
  return drafts.current;
}


export function finishDraft(result) {

  drafts.history.push({

      year: drafts.current.year,

      lotteryTeams: [...drafts.current.lotteryTeams],

      draftOrder: [...drafts.current.draftOrder],

      draftedPlayers: [...drafts.current.draftedPlayers],

      undraftedPlayers: [...drafts.current.undraftedPlayers]

  });


  drafts.current = {

      year: drafts.current.year + 1,

      eligibleLeague: "SCHOOL",

      rounds: 2,

      totalPicks: 60,

      lotteryTeams: [],

      draftOrder: [],

      draftedPlayers: [],

      undraftedPlayers: [],

      status: "PENDING"

  };

}