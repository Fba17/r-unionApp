function saveRefund(loanId, date, amount) {
	var refund = {
		date,
		amount,
		id: loanId
	}
	var requestURLLoans = 'https://africorp.github.io/appreunion/json/pretsOrg.json';
	var requestLoans = new XMLHttpRequest();
	requestLoans.open('GET', requestURLLoans);
	requestLoans.responseType = 'json';
	requestLoans.send();

	requestLoans.onload = function() {
		var loans = requestLoans.response;
		modifyInvestments(findInvestorsAndModifyTheirAmount(loans));
	}

	function findInvestorsAndModifyTheirAmount(listLoans) {
		var loan = listLoans.filter(x => x.id === refund.id)[0]
		var result = loan.listOfInvestor.map(function(investor) {
			var percent = investor.amount/loan.montant
			var investorModified = {
				id: investor.investorId,
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
		   console.log(investments)
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
}