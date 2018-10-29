var requestURL = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
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
        membre["idInvestisseur"] = x.id;
        membre["montant"] = x.montant;
        return membre;
       })
    })
  }
  
  var guiInput = {
    prêteur: "Boris" ,
    date:"2018.03.27" ,
    montant: 5000,
    id: 1
  }
  var datePret = new Date(guiInput.date);
  var montantPret = guiInput.montant;
  var gpr = 0
  var consideredGrp = listGrpInvestment.filter(x => x.date <= datePret)
  var listLoanInvestor = []
  var montantPretVar = montantPret 

  while(montantPretVar > 0 && consideredGrp[gpr]) {
    var actGrpe = consideredGrp[gpr]
    var montantGrpe = actGrpe.montant;
    if(montantGrpe >= montantPretVar)
    {
      var percentage = montantPretVar / montantPret;
      listLoanInvestor.push({
        id:actGrpe.id,
        montantEmprunte:montantPretVar, 
        percentage: percentage
      })
      montantPretVar = 0;
      montantGrpe = montantGrpe - montantPretVar;
    }
    else{
        var percentage = montantGrpe / montantPret;
        listLoanInvestor.push({
          id:actGrpe.id,
          montantEmprunte: montantGrpe, 
          percentage: percentage
        })
    	montantPretVar = montantPretVar - montantGrpe;
        montantGrpe = 0;
    }
    gpr = gpr +1;
  }
  var pretObj = {
    id:guiInput.id,
    date:guiInput.date,
    montant:guiInput.montant,
    listOfInvestor:listLoanInvestor
  }
  console.log(lisInvestment)
  console.log(listInvestisseurPerDate)
  console.log(pretObj)
  // change les investissement.
  
  var listOfInvestor = pretObj.listOfInvestor
  var mutedInvestorsList = []
  for (let investor of listOfInvestor){
   var investors = listInvestisseurPerDate.filter(x => x.id == investor.id )
   var investisseurLoan = investors.investisseurs
   var ivestisseurIds = investisseurLoan.map(x => x.idInvestisseur)
   var montantAretirer = investor.montantEmprunte / investisseurLoan.length
    for (let invest of lisInvestment){
      if (ivestisseurIds.includes(invest.id)){
        mutedInvestorsList.push({
          id:invest.id,
          investisseur: invest.investisseur,
          date: invest.date,
          montant: invest.montant - montantAretirer 
        })
      }
      else{
        mutedInvestorsList.push(invest)
      }
    }
  }
    
}
