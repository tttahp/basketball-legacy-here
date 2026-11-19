// data/mediaData/career/careerEntryInterview.js

// ============================================================
// CAREER ENTRY INTERVIEW
// ============================================================
//
// Trigger:
// - Appears once after the player has been enrolled for 1 month.
// - If the player refuses the first invitation, another invitation
//   appears exactly 1 month later.
// - If the player refuses the second invitation, the chain ends
//   permanently.
//
// Template variables:
// {{player.name}}  -> Player name
// {{school.name}}  -> Current school name
// {{outlet}}       -> Randomized media outlet
//
// This file contains DATA ONLY.
// Interview logic belongs to mediaSystem.js.
// ============================================================

export const CAREER_ENTRY_INTERVIEW = {

  id: "career_entry_interview",

  type: "INTERVIEW",

  stage: "CAREER",

  subtype: "CAREER_ENTRY",

  onceOnly: true,

  trigger: {

      monthsAfterCareerStart: 1

  },


  // ========================================================
  // OPENING
  // ========================================================

  opening: {

      message:
          "Hello {{player.name}}, after one month at {{school.name}}, would you like to take a short interview with us?",

      choices: [

          {

              id: "very_willing",

              text:
                  "I'd be more than happy to.",

              startInterview: true,

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

              id: "okay",

              text:
                  "Sure, why not.",

              startInterview: true,

              effects: [

                  {
                      path:
                          "fans",

                      amount:
                          100
                  }

              ]

          },


          {

              id: "not_convenient",

              text:
                  "Sorry, this isn't a good time.",

              startInterview: false,

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
                          -50
                  }

              ],

              followUp: {

                  delayMonths: 1,

                  message:
                      "We have another opportunity to talk with you. Would you like to take the interview this time?",

                  choices: [

                      {

                          id: "accept_delayed",

                          text:
                              "Alright, I'll do it this time.",

                          startInterview: true

                      },


                      {

                          id: "refuse_delayed",

                          text:
                              "Sorry, I still can't do it.",

                          startInterview: false,

                          effects: [

                              {
                                  path:
                                      "relationships.coachTrust",

                                  amount:
                                      -3
                              },

                              {
                                  path:
                                      "morale",

                                  amount:
                                      -2
                              },

                              {
                                  path:
                                      "fans",

                                  amount:
                                      -100
                              }

                          ],

                          endInterviewChain: true

                      }

                  ]

              }

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
              "How have you been feeling after your first month at the school?",

          answers: [

              {

                  id: "q1_positive",

                  text:
                      "Everything has been going really well.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q1_adapting",

                  text:
                      "I'm still trying to study and improve every day.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q1_negative",

                  text:
                      "It isn't really like what I expected.",

                  category:
                      "NEGATIVE"

              }

          ]

      },


      {

          id: "q2",

          text:
              "Have you faced any difficulties during training?",

          answers: [

              {

                  id: "q2_positive",

                  text:
                      "It was difficult at first time, but I kept pushing through every challenge.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q2_negative",

                  text:
                      "I argue with my teammates pretty much.",

                  category:
                      "NEGATIVE"

              },

              {

                  id: "q2_silly",

                  text:
                      "Someone told me \"Sports is about never trying to give up.\"",

                  category:
                      "SILLY"

              }

          ]

      },


      {

          id: "q3",

          text:
              "Does your family support and encourage you in this decision?",

          answers: [

              {

                  id: "q3_silly_1",

                  text:
                      "They must, otherwise they wouldn't have sent me here. 🥴",

                  category:
                      "SILLY"

              },

              {

                  id: "q3_positive",

                  text:
                      "My family is the strongest support system behind the path I've chosen. ❤️",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q3_silly_2",

                  text:
                      "Dad is the yellow candle, Mom is the green candle, and I'm the pink candle... 🙄",

                  category:
                      "SILLY"

              }

          ]

      },


      {

          id: "q4",

          text:
              "Are you happy with your current environment?",

          answers: [

              {

                  id: "q4_positive",

                  text:
                      "I'm very happy here.",

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

                  id: "q4_normal",

                  text:
                      "I feel pretty normal about it.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q4_negative",

                  text:
                      "It's honestly terrible.",

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

          id: "q5",

          text:
              "What are you looking forward to in the near future?",

          answers: [

              {

                  id: "q5_training",

                  text:
                      "I'll keep working hard and improving my skills.",

                  category:
                      "POSITIVE"

              },

              {

                  id: "q5_money",

                  text:
                      "I want to make a lot of money.",

                  category:
                      "NEGATIVE",

                  effects: [

                      {

                          path:
                              "wallet.balance",

                          amount:
                              50

                      }

                  ]

              },

              {

                  id: "q5_silly",

                  text:
                      "\"Kim Jong Un is my best friend.\" Donald Trump said. 🙄",

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
          "Thank you very much for taking the time to answer this short interview with {{outlet}}. We really appreciate it, and we hope to see you soon again in the future interviews!",


      // ====================================================
      // FINAL OUTCOMES
      // ====================================================

      outcomes: {

          POSITIVE: {

              effects: [

                  {
                      path:
                          "wallet.balance",

                      amount:
                          100
                  },

                  {
                      path:
                          "fans",

                      amount:
                          100
                  },

                  {
                      path:
                          "relationships.coachTrust",

                      amount:
                          1
                  }

              ]

          },


          NEGATIVE: {

              effects: [

                  {
                      path:
                          "wallet.balance",

                      amount:
                          100
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
                          100
                  }

              ]

          }

      }

  }

};


export default CAREER_ENTRY_INTERVIEW;