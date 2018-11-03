var listOfLoans = []
var listInvestmentsMutable = []

var listOfLoansGUI = []
var listOfInvestmens = []
var listOfRefunds = []
var loanURL = 'https://africorp.github.io/appreunion/json/loans.json';
var investmentURL = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
var refundURL = 'https://africorp.github.io/appreunion/json/refunds.json';
var loanRequest = new XMLHttpRequest();
loanRequest.open('GET', loanURL);
loanRequest.responseType = 'json';
loanRequest.send();
loanRequest.onload = function() {
	listOfLoansGUI = loanRequest.response
	var refundRequest = new XMLHttpRequest();
	refundRequest.open('GET', refundURL);
	refundRequest.responseType = 'json';
	refundRequest.send(); 
	refundRequest.onload = function() {
		listOfRefunds = refundRequest.response
		// concat listOfLoansGUI und listOfRefunds
		var listOfLoanAndRefund = listOfLoansGUI.concat(listOfRefunds)
		listOfLoanAndRefund.sort(function(a, b){
			if (new Date(a.date) > new Date(b.date)) {
			return 1;
			}
			if (new Date(a.date) < new Date(b.date)) {
			return -1;
			}
			return 0;
		})
		var investRequest = new XMLHttpRequest();
		investRequest.open('GET', investmentURL);
		investRequest.responseType = 'json';
		investRequest.send(); 
		investRequest.onload = function() {
			listInvestmentsOriginal = investRequest.response
			// loop the concatresult
			for(let elt of listOfLoanAndRefund){
				if(elt.type === "P"){
					createLoanAndUpdateInvestment(elt, listInvestmentsOriginal)
				}
				else{
                    var result = findInvestorsAndModifyTheirAmount(listOfLoans, elt)
					modifylistInvestmentsMutable(result, listInvestmentsMutable)
				}
			}
			calculInterest(listInvestmentsOriginal , listInvestmentsMutable)
		}
	}
}

function createGroupeInvestment(listInvestmentsOriginal) {
	var listGrpInvestment = [];
	const reducer = (accumulator, currentValue) => accumulator + currentValue.montant ; 
	var distinctDates = [...new Set( listInvestmentsOriginal.map(x => x.date))]
	var grpId = 0;
	for(let currentDate of distinctDates) {
		grpId = grpId + 1
		var montantGrp = listInvestmentsOriginal.filter(x => x.date === currentDate).reduce(reducer, 0)
		listGrpInvestment.push({
			id: grpId,
			date: new Date(currentDate),
			montant: montantGrp
		})
	}
	return listGrpInvestment
}

function matchInvestorToGroupe(listInvestmentsOriginal) {
	var distinctDates = [...new Set( listInvestmentsOriginal.map(x => x.date))]
	var listGrpeInvestorPerDate = [];
	const reducer = (accumulator, currentValue) => accumulator + currentValue.montant ; 
	var grpId = 0;
	for(let currentDate of distinctDates) {
		grpId = grpId + 1
		var montantGrp = listInvestmentsOriginal.filter(x => x.date === currentDate).reduce(reducer, 0)
		listGrpeInvestorPerDate.push({
			id: grpId,
			investisseurs: listInvestmentsOriginal.filter(x => x.date === currentDate).map(x => 
			{
			var membre = {};
			membre["idInvestisseur"] = x.id;
			membre["montant"] = x.montant;
			membre["percent"] = x.montant/montantGrp
			return membre;
			})
		})
	}
	return listGrpeInvestorPerDate;
}

function createLoanAndUpdateInvestment(loan, listInvestmentsOriginal) {
	var listGrpInvestment = createGroupeInvestment(listInvestmentsOriginal)
	var listGrpeInvestorPerDate = matchInvestorToGroupe(listInvestmentsOriginal) 
	var datePret = new Date(loan.date);
	var montantPret = loan.montant;
	var gpr = 0
	var consideredGrp = listGrpInvestment.filter(x => x.date <= datePret)
	var listGrpeInvestor = []
	var montantPretVar = montantPret 

	while(montantPretVar > 0 && consideredGrp[gpr]) {
		var actGrpe = consideredGrp[gpr]
		var montantGrpe = actGrpe.montant;
		if(montantGrpe >= montantPretVar)
		{
		  var percentage = montantPretVar / montantPret;
		  listGrpeInvestor.push({
			id:actGrpe.id,
			montantEmprunte:montantPretVar, 
			percentage: percentage
		  })
		  montantPretVar = 0;
		}
		else{
			var percentage = montantGrpe / montantPret;
			listGrpeInvestor.push({
			  id:actGrpe.id,
			  montantEmprunte: montantGrpe, 
			  percentage: percentage
			})
			montantPretVar = montantPretVar - montantGrpe;
		}
		gpr = gpr +1;
	}

	var loanInvestors = []
	// change les investissement.
	//var listOfInvestor = pretObj.listOfInvestor
	for (let investor of listGrpeInvestor){
	var investors = listGrpeInvestorPerDate.filter(x => x.id === investor.id )
	var ivestisseurObj = investors.map(y => y.investisseurs.map(x => {
	   var membreWithPercent = {}
	   membreWithPercent["idInvest"] = x.idInvestisseur;
	   membreWithPercent["percent"] = x.percent;
	 return membreWithPercent;
	}))[0]
	var ivestisseurIds = ivestisseurObj.map(y => y.idInvest)
	listInvestmentsMutable = listInvestmentsOriginal.map(function(invest){
	 var result= {}
	 if(ivestisseurIds.includes(invest.id)){
	   var percentAretirer = ivestisseurObj.filter(y => y.idInvest === invest.id)[0].percent
	   result["id"] = invest.id;
	   result["investisseur"] = invest.investisseur;
	   result["date"] = invest.date;
	   result["montant"] = invest.montant - investor.montantEmprunte*percentAretirer ;
	   loanInvestors.push({
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
	var pretObj = {
		id:loan.id,
		name: loan.name,
		date:loan.date,
		montant:loan.montant,
		type: "intern",
		ouvert: true,
		listOfInvestor:loanInvestors
	}
	listOfLoans.push(pretObj)
}

function findInvestorsAndModifyTheirAmount(listLoans, refund) {
var loan = listLoans.filter(x => x.id === refund.id)[0]
var result = loan.listOfInvestor.map(function(investor) {
	var percent = investor.amount/loan.montant
	var investorModified = {
		id: investor.investorId,
		amount: percent*refund.montant
	}
	return investorModified;
})
return result;
}

function modifylistInvestmentsMutable(listOfInvestorsWithModifiedAmounts, listInvestmentsMutable) {
for(let item of listOfInvestorsWithModifiedAmounts) {
	listInvestmentsMutable = listInvestmentsMutable.map(function(investment) {
		if(investment.id === item.id) {
			return {
				id: investment.id,
				investisseur: investment.investisseur,
				date: investment.date,
				montant: investment.montant + item.amount
			}
		}
		else
			return investment
	})
}
}

function calculInterest(listInvestmentsOriginal , listInvestmentsMutable) {
	var setOfInvestor = [...new Set( listInvestmentsOriginal.map(x => x.investisseur))]
	const reducer = (accumulator, currentValue) => accumulator + currentValue.montant ; 
	var listInterest = [];
	for(let investor of setOfInvestor) {
		montantTotalInvesti = listInvestmentsOriginal.filter(x => x.investisseur === investor).reduce(reducer, 0) 
		montantTotalgenere = listInvestmentsMutable.filter(x => x.investisseur === investor).reduce(reducer, 0)
		listInterest.push({
			nom: investor,
			montantInvesti: montantTotalInvesti,
			montantTotal: montantTotalgenere,
			interetGenere: montantTotalgenere - montantTotalInvesti
		})
	}
	console.log(listInterest);
}