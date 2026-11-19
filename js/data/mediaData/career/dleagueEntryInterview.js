// data/mediaData/career/dleagueEntryInterview.js

// ============================================================
// D-LEAGUE ENTRY INTERVIEW
// ============================================================
//
// Trigger:
// - Appears once when the player enters D-League.
// - No loop.
// - No delay.
//
// Template variables:
// {{player.name}} -> Player name
// {{team.name}}   -> Current team name
// {{outlet}}      -> Random media outlet
//
// Category:
// POSITIVE / NEGATIVE / SILLY
//
// The media system is responsible for:
// - Replacing template variables.
// - Tracking selected answer categories.
// - Calculating the final interview outcome.
// ============================================================

export const DLEAGUE_ENTRY_INTERVIEW = {

  id: "dleague_entry_interview",

  type: "INTERVIEW",

  stage: "CAREER",

  subtype: "DLEAGUE_ENTRY",

  onceOnly: true,


  // ========================================================
  // OPENING
  // ========================================================

  opening: {

      message:
          "Hello {{player.name}}, you've already taken the next step in your career, haven't you? We'd like to invite you to take a short interview. Would you be willing to join us?",

      choices: [

          {
              id: "always_ready",

              text:
                  "I'm always ready.",

              startInterview: true,

              category:
                  "POSITIVE"

          },

          {
              id: "hehehe",

              text:
                  "Hehehe.",

              startInterview: true,

              category:
                  "SILLY"

          },

          {
              id: "no_time",

              text:
                  "I don't have time. Leave me alone.",

              startInterview: false,

              effects: [

                  {
                      path:
                          "energy",

                      amount:
                          10

                  },

                  {
                      path:
                          "fans",

                      amount:
                          -250

                  }

              ],

              endInterviewChain: true

          }

      ]

  },


  // ========================================================
  // QUESTIONS
  // ========================================================

  questions: [

      {

          id: "q1",

          text:
              "With the choice you've made so far, are you satisfied with your decision?",

          answers: [

              {

                  id: "q1_team",

                  text:
                      "I completely trust {{team.name}}.",

                  category:
                      "POSITIVE",

                  effects: [

                      {
                          path:
                              "relationships.coachTrust",

                          amount:
                              1

                      }

                  ]

              },

              {

                  id: "q1_adapt",

                  text:
                      "I'll continue adapting to every decision I've made.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q1_drunk",

                  text:
                      "I was drunk that day and just picked randomly.",

                  category:
                      "NEGATIVE",

                  effects: [

                      {

                          path:
                              "relationships.coachTrust",

                          amount:
                              -1

                      }

                  ]

              }

          ]

      },


      {

          id: "q2",

          text:
              "Your training in School phase is over. How did it help you?",

          answers: [

              {

                  id: "q2_face",

                  text:
                      "What's that on your face?",

                  category:
                      "SILLY"

              },

              {

                  id: "q2_nothing",

                  text:
                      "It didn't help me at all!",

                  category:
                      "NEGATIVE"

              },

              {

                  id: "q2_better",

                  text:
                      "I feel like I've become a much better player.",

                  category:
                      "POSITIVE"

              }

          ]

      },


      {

          id: "q3",

          text:
              "Has your family moved closer to the city where you play?",

          answers: [

              {

                  id: "q3_wait",

                  text:
                      "No. They're waiting until next year to see where I get drafted.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q3_rich",

                  text:
                      "Of course. My family is rich!",

                  category:
                      "SILLY"

              },

              {

                  id: "q3_private",

                  text:
                      "That's none of your business.",

                  category:
                      "NEGATIVE"

              }

          ]

      },


      {

          id: "q4",

          text:
              "So how will you prepare for next year's draft? Are you confident you'll be the #1 pick?",

          answers: [

              {

                  id: "q4_prepare",

                  text:
                      "I'll prepare as hard as I can and do everything possible to be picked as high as possible.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q4_number_one",

                  text:
                      "What? #1 pick? That's easy. I've got this!",

                  category:
                      "SILLY"

              },

              {

                  id: "q4_future",

                  text:
                      "My friend, you ask too many questions. Go to the future and see for yourself.",

                  category:
                      "SILLY"

              }

          ]

      },


      {

          id: "q5",

          text:
              "Finally, do you have anything you'd like to say to your family, your club, or the fans watching you?",

          answers: [

              {

                  id: "q5_thank_you",

                  text:
                      "Thank you for all your support. I'll keep working hard so I won't let you down. Love you all! ❤️",

                  category:
                      "POSITIVE",

                  effects: [

                      {

                          path:
                              "fans",

                          amount:
                              150

                      }

                  ]

              },

              {

                  id: "q5_leave_me",

                  text:
                      "Leave me alone. 💔",

                  category:
                      "NEGATIVE",

                  effects: [

                      {

                          path:
                              "fans",

                          amount:
                              -200

                      }

                  ]

              },

              {

                  id: "q5_noise",

                  text:
                      "Eu oe uh oa oh eu ue,...",

                  category:
                      "SILLY"

              }

          ]

      }

  ],


  // ========================================================
  // ENDING
  // ========================================================

  ending: {

      outlets: [

          "EXPN",
          "BLA.com",
          "BLA TV",
          "The Athlentic",
          "Skey Sports"

      ],

      message:
          "Thank you very much for joining us today. We wish you a successful new season as you prepare for the upcoming draft!",


      // ====================================================
      // FINAL OUTCOMES
      // ====================================================

      outcomes: {

          POSITIVE: {

              effects: [

                  {
                      path:
                          "relationships.coachTrust",

                      amount:
                          1

                  },

                  {
                      path:
                          "fans",

                      amount:
                          300

                  },

                  {
                      path:
                          "energy",

                      amount:
                          10

                  }

              ]

          },


          NEGATIVE: {

              effects: [

                  {
                      path:
                          "relationships.coachTrust",

                      amount:
                          -1

                  },

                  {
                      path:
                          "fans",

                      amount:
                          -300

                  },

                  {
                      path:
                          "morale",

                      amount:
                          -1

                  }

              ]

          },


          SILLY: {

              effects: [

                  {
                      path:
                          "wallet.balance",

                      amount:
                          1000

                  }

              ]

          }

      }

  }

};


export default DLEAGUE_ENTRY_INTERVIEW;