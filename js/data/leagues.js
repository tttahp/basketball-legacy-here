import blaTeams from "./blaTeams.js";
import dleagueTeams from "./dleagueTeams.js";
import schoolTeams from "./schoolTeams.js";

export const leagues = {

    BLA: {
        id: "BLA",
        name: "Basketball Legacy Association",
        level: "Professional",

        teams: blaTeams,

        season: {
            games: 82,
            conferences: 2,
            playoffTeams: 16
        },

        rules: {
            salaryCap: true,
            trading: true,
            freeAgency: true,
            draft: true
        }
    },


    DLEAGUE: {
        id: "DLEAGUE",
        name: "Development League",
        level: "Minor Professional",

        teams: dleagueTeams,

        season: {
            games: 60,
            playoffTeams: 8
        },

        rules: {
            playerDevelopment: true,
            promotion: true
        }
    },


    SCHOOL: {
        id: "SCHOOL",
        name: "Academy Basketball Legacy",

        teams: schoolTeams,

        season: {
            games: 30,
            tournament: true
        },

        rules: {
            draftEligible: true,
            recruiting: true
        }
    }

};


export function getLeague(leagueId) {
    return leagues[leagueId];
}


export function getLeagueTeams(leagueId) {
    return leagues[leagueId]?.teams || [];
}