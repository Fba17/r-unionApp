var requestURL = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';var requestURL = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  var lisInvestment = request.response;
  var listGrpInvestment = [];
  const reducer = (accumulator, currentValue) => accumulator + currentValue.montant ; 
  var distinctDates = [...new Set( lisInvestment.map(x => x.date))]
  var listInvestisseurPerDate = [];
  var grpId = 0;
  for(let currentDate of distinctDates) {
    grpId = grpId + 1
    listGrpInvestment.push({
      id: grpId,
      date: currentDate,
      montant: lisInvestment.filter(x => x.date === currentDate).reduce(reducer, 0)
    })
    listInvestisseurPerDate.push({
      id: grpId,
      investisseurs: lisInvestment.filter(x => x.date === currentDate).map(x => 
       {
        var membre = {};
        membre["investisseur"] = x.investisseur;
        membre["montant"] = x.montant;
        return membre;
       })
    })
  }
  console.log(listGrpInvestment)
  console.log(listInvestisseurPerDate[0].investisseurs[0].investisseur)
}
