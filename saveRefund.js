var refund = {
	date:"2018.03.27" ,
	amount: 5000,
	id: 1
}

var requestURLLoans = 'https://africorp.github.io/appreunion/json/pretsOrg.json';
var requestLoans = new XMLHttpRequest();

requestLoans.open('GET', requestURLLoans);
requestLoans.responseType = 'json';
requestLoans.send();

requestLoans.onload = function() {
	var loans = requestLoans.response;
	modifyInvestments(findInvestorsAndModifyAmount(loans));
}

function findInvestorsAndModifyTheirAmount (listLoans) {
	var loan = listLoans.filter(x => loan.id === refund.id)[0]
	var result = loan.listOfInvestor.map(function(investor) {
		var percent = investor.amount/loan.montant
		var investorModified = {
			id: investor.id,
			amount: percent*refund.amount
		}
		return investorModified;
	})
	return result;
}

function modifyInvestments(listOfInvestorsWithModifiedAmounts) {
	var requestURLInvestments = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
	var requestInvestments = new XMLHttpRequest();

	requestInvestments.open('GET', requestURLInvestments);
	requestInvestments.responseType = 'json';
	requestInvestments.send();

	requestInvestments.onload = function() {
		var investments = requestInvestments.response;
		
		for(let item of listOfInvestorsWithModifiedAmounts) {
			investments = investments.map(function(investment) {
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
		
		console.log(investments);
	}
}