function createManager(retiredPlayer) {

  return {

      id: "manager_" + Date.now(),

      name: retiredPlayer.name,

      formerPlayerId: retiredPlayer.id,


      // Thành tích khi còn là cầu thủ
      legacy: {

          championships: retiredPlayer.career.championships,

          mvp: retiredPlayer.career.mvp,

          allStar: retiredPlayer.career.allStar,

          awards: retiredPlayer.career.awards

      },


      // Giai đoạn manager
      managerCareer: {

          seasons: 0,

          team: null,

          trophies: 0,

          reputation: calculateReputation(retiredPlayer),

          money: calculateStartingMoney(retiredPlayer)

      },


      relationships: {

          owners: [],

          players: [],

          leagueOffice: 0

      }

  };

}


function calculateReputation(player) {

  let reputation = 0;


  reputation += player.career.championships * 10;

  reputation += player.career.mvp * 15;

  reputation += player.career.allStar * 5;


  return reputation;

}


function calculateStartingMoney(player) {

  return player.business?.money || 0;

}


export default createManager;