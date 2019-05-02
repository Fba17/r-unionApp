function saveLoan(name, date, amount) {
	var guiInput = {
		name,
		date,
		montant: amount,
		id: (name.concat(date.replace(/(\.)/g, ''))).replace(/\s/g, '')
	}
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
	  var listGrpeInvestorPerDate = [];
	  var grpId = 0;
	  for(let currentDate of distinctDates) {
		grpId = grpId + 1
		var montantGrp = lisInvestment.filter(x => x.date === currentDate).reduce(reducer, 0)
		listGrpInvestment.push({
		  id: grpId,
		  date: new Date(currentDate),
		  montant: montantGrp
		})
	   listGrpeInvestorPerDate.push({
		  id: grpId,
		  investisseurs: lisInvestment.filter(x => x.date === currentDate).map(x => 
		   {
			var membre = {};
			membre["idInvestisseur"] = x.id;
			membre["montant"] = x.montant;
			membre["percent"] = x.montant/montantGrp
			return membre;
		   })
		})
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

	  var loanInvestor = []
	 // change les investissement.
	  console.log(lisInvestment)
	  //var listOfInvestor = pretObj.listOfInvestor
	  for (let investor of listLoanInvestor){
	   var investors = listGrpeInvestorPerDate.filter(x => x.id === investor.id )
	   var ivestisseurObj = investors.map(y => y.investisseurs.map(x => {
		   var membreWithPercent = {}
		   membreWithPercent["idInvest"] = x.idInvestisseur;
		   membreWithPercent["percent"] = x.percent;
		 return membreWithPercent;
	   }))[0]
	   var ivestisseurIds = ivestisseurObj.map(y => y.idInvest)
	   lisInvestment = lisInvestment.map(function(invest){
		 var result= {}
		 if(ivestisseurIds.includes(invest.id)){
		   var percentAretirer = ivestisseurObj.filter(y => y.idInvest === invest.id)[0].percent
		   result["id"] = invest.id;
		   result["investisseur"] = invest.investisseur;
		   result["date"] = invest.date;
		   result["montant"] = invest.montant - investor.montantEmprunte*percentAretirer ;
		   loanInvestor.push({
			 investorId: invest.id,
			 amount: investor.montantEmprunte*percentAretirer
		   })
		 }
		 else{
		   result = invest
		 }
		 return result;
		 })
	  }
	  console.log(JSON.stringify(lisInvestment))
		var pretObj = {
		id:guiInput.id,
		name: guiInput.name,
		date:guiInput.date,
		montant:guiInput.montant,
		type: "intern",
		ouvert: true,
		listOfInvestor:loanInvestor
	  }
	   console.log(JSON.stringify(pretObj))
	}
}