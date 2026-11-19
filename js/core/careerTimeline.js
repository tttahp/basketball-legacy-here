export const careerTimeline = {

  startYear: 2023,
  currentYear: 2023,

  playerAge: 16,

  stage: "SCHOOL",


  leagues: {

      SCHOOL: {
          unlocked: true,
          playable: true
      },

      DLEAGUE: {
          unlocked: true,
          playable: false
      },

      BLA: {
          unlocked: true,
          playable: false
      }

  }

};


export function advanceSeason() {

  careerTimeline.currentYear++;
  careerTimeline.playerAge++;

  updateCareerStage();

}


function updateCareerStage() {

  const age = careerTimeline.playerAge;
  const year = careerTimeline.currentYear;


  // 2023-2024 School
  if(year <= 2024){

      careerTimeline.stage = "SCHOOL";

      careerTimeline.leagues.SCHOOL.playable = true;

      careerTimeline.leagues.DLEAGUE.playable = false;

      careerTimeline.leagues.BLA.playable = false;

  }


  // 2025 D-League
  else if(year === 2025){

      careerTimeline.stage = "DLEAGUE";

      careerTimeline.leagues.SCHOOL.playable = false;

      careerTimeline.leagues.DLEAGUE.playable = true;

      careerTimeline.leagues.BLA.playable = false;

  }


  // 2026 BLA
  else if(year >= 2026){

      careerTimeline.stage = "BLA";

      careerTimeline.leagues.DLEAGUE.playable = true;

      careerTimeline.leagues.BLA.playable = true;

  }

}