// ========================================
// substitutionEngine.js
// PART 1
// ========================================

import {

  ROTATION_PLAN

} from "./coachAI.js";



// ========================================
// SHOULD SUBSTITUTE
// ========================================

export function shouldSubstitute(

  player,

  team

) {

  if (

      !player.onCourt ||

      player.foulOut ||

      player.injured

  ) {

      return false;

  }



  const plan =

      team.coach.rotationPlan;



  switch (plan) {

      case ROTATION_PLAN.KEEP_STARTER:

          return player.stamina <= 5;



      case ROTATION_PLAN.BENCH_WORK:

          return player.stamina <= 50;



      case ROTATION_PLAN.ROOKIE_WORK:

          return player.stamina <= 40;



      case ROTATION_PLAN.FATIGUE:

          return player.stamina <= 65;



      default:

          return player.stamina <= 40;

  }

}



// ========================================
// FIND SUBSTITUTE
// ========================================

export function findSubstitute(

  player,

  team,

  gameState

) {

  const bench = team.players.filter(

      p =>

          !p.onCourt &&

          !p.foulOut &&

          !p.injured

  );



  const samePosition = bench.filter(

      p =>

          p.player.creation.position ===

          player.player.creation.position

  );



  if (

      gameState.rookiePriority

  ) {

      const rookie = samePosition.find(

          p => p.player.isRookie

      );



      if (rookie) {

          return rookie;

      }

  }



  if (

      samePosition.length > 0

  ) {

      return samePosition.sort(

          (a, b) =>

              b.overall - a.overall

      )[0];

  }



  if (

      bench.length > 0

  ) {

      return bench.sort(

          (a, b) =>

              b.overall - a.overall

      )[0];

  }



  return null;

}

// ========================================
// substitutionEngine.js
// PART 2
// ========================================

import {

  shouldSubstitute,

  findSubstitute

} from "./substitutionEngine.js";



// ========================================
// SUBSTITUTION
// ========================================

export function substitution(

  team,

  gameState

) {

  const onCourt = team.players.filter(

      p => p.onCourt

  );



  for (const player of onCourt) {

      if (

          !shouldSubstitute(

              player,

              team

          )

      ) {

          continue;

      }



      const sub = findSubstitute(

          player,

          team,

          gameState

      );



      if (!sub) {

          continue;

      }



      player.onCourt = false;

      sub.onCourt = true;

  }

}



// ========================================
// FORCED SUBSTITUTION
// ========================================

export function forceSubstitution(

  player,

  team,

  gameState

) {

  const sub = findSubstitute(

      player,

      team,

      gameState

  );



  if (!sub) {

      return;

  }



  player.onCourt = false;

  sub.onCourt = true;

}



// ========================================
// CHECK FOUL OUT
// ========================================

export function checkFoulOut(

  player,

  team,

  gameState

) {

  if (

      !player.foulOut

  ) {

      return;

  }



  forceSubstitution(

      player,

      team,

      gameState

  );

}



// ========================================
// CHECK INJURY
// ========================================

export function checkInjury(

  player,

  team,

  gameState

) {

  if (

      !player.injured

  ) {

      return;

  }



  forceSubstitution(

      player,

      team,

      gameState

  );

}



// ========================================
// CHECK ALL PLAYERS
// ========================================

export function updateSubstitution(

  team,

  gameState

) {

  for (

      const player of team.players

  ) {

      checkFoulOut(

          player,

          team,

          gameState

      );



      checkInjury(

          player,

          team,

          gameState

      );

  }



  substitution(

      team,

      gameState

  );

}

// ========================================
// substitutionEngine.js
// PART 3
// Lineup Manager
// ========================================



// ========================================
// UPDATE LINEUP
// ========================================

export function updateLineup(team) {

    let onCourt = team.players.filter(

        p => p.onCourt &&

        !p.injured &&

        !p.foulOut

    );



    if (onCourt.length > 5) {

        const remove =

            onCourt

                .sort(

                    (a, b) =>

                        a.stamina -

                        b.stamina

                )

                .slice(0, onCourt.length - 5);



        remove.forEach(player => {

            player.onCourt = false;

        });

    }



    onCourt = team.players.filter(

        p => p.onCourt &&

        !p.injured &&

        !p.foulOut

    );



    if (onCourt.length < 5) {

        const bench =

            team.players.filter(

                p =>

                    !p.onCourt &&

                    !p.injured &&

                    !p.foulOut

            )

            .sort(

                (a, b) =>

                    b.overall -

                    a.overall

            );



        while (

            onCourt.length < 5 &&

            bench.length > 0

        ) {

            const player =

                bench.shift();



            player.onCourt = true;

            onCourt.push(player);

        }

    }

}



// ========================================
// CHECK LINEUP
// ========================================

export function validateLineup(team) {

    updateLineup(team);

}



// ========================================
// AUTO LINEUP
// ========================================

export function autoLineup(team) {

    team.players.forEach(

        p => p.onCourt = false

    );



    const best =

        [...team.players]

        .sort(

            (a, b) =>

                b.overall -

                a.overall

        )

        .slice(0, 5);



    best.forEach(

        p => p.onCourt = true

    );



    validateLineup(team);

}