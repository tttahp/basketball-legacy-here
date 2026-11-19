import { blaRoster } from "./roster/bla.js";
import { dleagueRoster } from "./roster/dleague.js";
import { schoolRoster } from "./roster/school.js";


export const rosters = {

    BLA: blaRoster,

    DLEAGUE: dleagueRoster,

    SCHOOL: schoolRoster

};



export function getRoster(leagueId) {

    return rosters[leagueId] || [];

}



export function getTeamRoster(leagueId, teamId) {

    const leagueRoster = rosters[leagueId];


    if (!leagueRoster) return [];


    const team = leagueRoster.find(
        team => team.teamId === teamId
    );


    return team?.players || [];

}