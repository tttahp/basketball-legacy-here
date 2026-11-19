// data/matchEventData/common/scoringEvents.js

// ============================================================
// COMMON SCORING EVENTS
// ============================================================
//
// These events are available to multiple positions.
// Position-specific situations belong in positions/*Events.js.
//
// Each event:
// - Has exactly 2 choices.
// - Each choice has its own base probability.
// - Each outcome contains its own result text.
// - Effects are applied by matchEventSystem.js.
//
// "rd" outcomes use:
//     random: { min, max }
//
// The match event system will resolve those ranges.
// ============================================================


export const COMMON_SCORING_EVENTS = [

  // ========================================================
  // 01. OPEN TEAMMATE ON THE WING
  // ========================================================

  {

      id: "common_scoring_open_teammate_wing",

      type: "SCORING",

      importance: "NORMAL",

      text:
          "Your teammate is standing completely open on the wing. You will:",

      choices: [

          {

              id: "pass_to_teammate",

              text:
                  "Pass to him",

              chance: 0.70,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              random: {
                                  min: 3,
                                  max: 3
                              }
                          },

                          {
                              stat: "assist",

                              amount: 1
                          }

                      ],

                      texts: [

                          "A clean pass leads to an effortless three-pointer.",
                          "Perfect delivery. Easy three."

                      ]

                  },

                  {

                      id: "miss",

                      result: "MISS",

                      effects: [

                          {
                              stat: "teamFGA",

                              amount: 1
                          }

                      ],

                      texts: [

                          "A beautiful shot... but it goes in and out.",
                          "So close. The ball kisses the rim and comes back out."

                      ]

                  }

              ]

          },


          {

              id: "self_finish",

              text:
                  "Take the shot yourself",

              chance: 0.30,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {
                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "A smooth bank shot drops for two.",
                          "Bank shot. Nothing but two points."

                      ]

                  },

                  {

                      id: "miss",

                      result: "MISS",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }

                      ],

                      texts: [

                          "You brick the shot. Your teammate is not happy about that decision.",
                          "You miss the shot, and your teammate lets you hear about it."

                      ]

                  }

              ]

          }

      ]

  },


  // ========================================================
  // 02. OPEN PASS FROM TEAMMATE
  // ========================================================

  {

      id: "common_scoring_open_pass",

      type: "SCORING",

      importance: "NORMAL",

      text:
          "Your teammate sends you a clean pass with plenty of space to attack.",

      choices: [

          {

              id: "attack_paint",

              text:
                  "Attack the rim",

              chance: 0.70,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "Two easy points at the rim.",
                          "You get all the way to the basket and finish easily.",

                      ]

                  },

                  {

                      id: "miss",

                      result: "MISS",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }
                      ],

                      texts: [

                          "The defender blocks your shot.",
                          "Rejected! The defender gets a clean block."

                      ]

                  }

              ]

          },


          {

              id: "attack_midrange",

              text:
                  "Mid-range shot",

              chance: 0.30,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "The mid-range jumper is good.",
                          "Smooth mid-range finish for two."

                      ]

                  },

                  {

                      id: "miss",

                      result: "MISS",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }

                      ],

                      texts: [

                          "You miss it!",
                          "That one comes up short.",

                      ]

                  }

              ]

          }

      ]

  },


  // ========================================================
  // 03. SHORT CLOCK — 3 SECONDS
  // ========================================================

  {

      id: "common_scoring_short_clock_3_seconds",

      type: "SCORING",

      importance: "HIGH",

      text:
          "Only 3 seconds remain on the clock. You have to decide quickly.",

      choices: [

          {

              id: "pass_teammate",

              text:
                  "Pass to your teammate",

              chance: 0.70,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              random: {
                                  min: 2,
                                  max: 3
                              }
                          },

                          {

                              stat: "assist",

                              amount: 1
                          }

                      ],

                      texts: [

                          "A perfect catch-and-shot from your teammate.",
                          "Great pass. Your teammate gets the last-second shot away."

                      ]

                  },

                  {

                      id: "miss",

                      result: "TURNOVER",

                      effects: [

                          {
                              stat: "turnover",

                              amount: 1
                          }
                      ],

                      texts: [

                          "Wrong address. The pass flies out of bounds.",
                          "You throw it away with almost no time left."

                      ]

                  }

              ]

          },


          {

              id: "self_create",

              text:
                  "Create your own shot",

              chance: 0.30,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "You handle the pressure beautifully and finish for two.",
                          "You shake off the defender and score before the clock expires."

                      ]

                  },

                  {

                      id: "miss",

                      result: "TURNOVER",

                      effects: [

                          {
                              stat: "turnover",

                              amount: 1
                          }
                      ],

                      texts: [

                          "The dribble goes nowhere and you lose the ball.",
                          "You try to create something, but the defender shuts you down."

                      ]

                  }

              ]

          }

      ]

  },


  // ========================================================
  // 04. FAST BREAK
  // ========================================================

  {

      id: "common_scoring_fast_break",

      type: "SCORING",

      importance: "HIGH",

      text:
          "You are running into an open fast break, but a defender is charging straight toward you.",

      choices: [

          {

              id: "quick_finish",

              text:
                  "Finish quickly",

              chance: 0.70,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "You finish the fast break with a successful dunk.",
                          "You beat the defender and throw it down.",

                      ]

                  },

                  {

                      id: "miss",

                      result: "BLOCK_OUT_OF_BOUNDS",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }
                      ],

                      texts: [

                          "The defender gets there in time and blocks your shot out of bounds for your team.",
                          "The defender catches up and swats the ball out of bounds.",

                      ]

                  }

              ]

          },


          {

              id: "draw_foul",

              text:
                  "Draw the foul",

              chance: 0.30,

              outcomes: [

                  {

                      id: "and_one",

                      result: "AND_ONE",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          },

                          {

                              stat: "playerFoulShots",

                              amount: 1
                          }

                      ],

                      texts: [

                          "Contact! You finish through the foul and earn an and-one.",
                          "You absorb the contact, score, and earn a free throw."

                      ]

                  },

                  {

                      id: "foul_two_shots",

                      result: "FOUL_TWO_SHOTS",

                      effects: [

                          {
                              stat: "playerFoulShots",

                              amount: 2
                          }
                      ],

                      texts: [

                          "The defender fouls you before the shot. Two free throws.",
                          "You draw the contact and head to the line for two.",

                      ]

                  }

              ]

          }

      ]

  },


  // ========================================================
  // 05. OPEN WING — 2 OR 3
  // ========================================================

  {

      id: "common_scoring_open_wing_choice",

      type: "SCORING",

      importance: "NORMAL",

      text:
          "You spot an open wing on the other side of the court, make your move into space, and have a decision to make.",

      choices: [

          {

              id: "take_two",

              text:
                  "Take the two",

              chance: 0.70,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 2
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "The mid-range shot falls for an easy two.",
                          "You knock down the mid-range jumper for two.",

                      ]

                  },

                  {

                      id: "miss",

                      result: "MISS_OUT_OF_BOUNDS",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }
                      ],

                      texts: [

                          "You miss and the ball goes out of bounds.",
                          "You can't find the range. The ball flies out."

                      ]

                  }

              ]

          },


          {

              id: "take_three",

              text:
                  "Take the three",

              chance: 0.30,

              outcomes: [

                  {

                      id: "success",

                      result: "SUCCESS",

                      effects: [

                          {
                              stat: "teamPoints",

                              amount: 3
                          },

                          {

                              stat: "playerFGM",

                              amount: 1
                          },

                          {

                              stat: "player3PM",

                              amount: 1
                          }

                      ],

                      texts: [

                          "Wide-open three. Nothing but net.",
                          "You rise up for the open three and knock it down.",

                      ]

                  },

                  {

                      id: "miss",

                      result: "AIRBALL",

                      effects: [

                          {
                              stat: "playerFGA",

                              amount: 1
                          }
                      ],

                      texts: [

                          "Airball.",
                          "That one doesn't even reach the rim."

                      ]

                  }

              ]

          }

      ]

  }

];


export default COMMON_SCORING_EVENTS;