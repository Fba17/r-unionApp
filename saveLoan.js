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
      date: new Date(currentDate),
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
  var guiInput = {
    prêteur: "Boris" ,
    date:"2018.03.24" ,
    montant: 1000
  }
  var datePret = new Date(guiInput.date);
  var montantPret = guiInput.montant;
  var gpr = 0
  var consideredGrp = listGrpInvestment.filter(x => x.date <= datePret)
  while(montantPret > 0 && consideredGrp[gpr]) {
    var actGrpe = consideredGrp[gpr]
    var montantGrpe = actGrpe.montant;
    if(montantGrpe >= montantPret)
    {
      montantPret = 0;
      montantGrpe = montantGrpe - montantPret
    }
    else{
    	montantPret = montantPret - montantGrpe  
    }
  }
  console.log(new Date(guiInput.date))
  console.log(listGrpInvestment)
  console.log(listInvestisseurPerDate)
}
