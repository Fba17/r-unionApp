function calculateInterest() {
	//load Json file contaning the Investments 
	var requestURLInvestmentOrg = 'https://africorp.github.io/appreunion/json/investissementsOrg.json';
	var requestInvestmentOrg = new XMLHttpRequest();
	requestInvestmentOrg.open('GET', requestURLInvestmentOrg);
	requestInvestmentOrg.responseType = 'json';
	requestInvestmentOrg.send();

	requestInvestmentOrg.onload = function(){
		//transform loaded json to JS object
		var listInvestmentsOrg = requestInvestmentOrg.response;
		calculInterest(listInvestmentsOrg);
	}
	//TODO pack the XMLHttpRequest process to a specific Method
	function calculInterest(listInvestmentsOrg) {
		var requestURLInvestmentMut = 'https://africorp.github.io/appreunion/json/investmentMutable.json';
		var requestInvestmentMut = new XMLHttpRequest();
		requestInvestmentMut.open('GET', requestURLInvestmentMut);
		requestInvestmentMut.responseType = 'json';
		requestInvestmentMut.send();
		requestInvestmentMut.onload = function() {
		   var listInvestmentsMut = requestInvestmentMut.response;
		   var setOfInvestor = [...new Set( listInvestmentsOrg.map(x => x.investisseur))]
		   const reducer = (accumulator, currentValue) => accumulator + currentValue.montant ; 
		   var listInterest = [];
			for(let investor of setOfInvestor) {
				montantTotalInvesti = listInvestmentsOrg.filter(x => x.investisseur === investor).reduce(reducer, 0)
				montantTotalgenere = listInvestmentsMut.filter(x => x.investisseur === investor).reduce(reducer, 0)
				//TODO verify the calculation of interetGenere. should not be negative 
				listInterest.push({
					nom: investor,
					montantInvesti: montantTotalInvesti,
					montantTotal: montantTotalgenere,
					interetGenere: montantTotalgenere - montantTotalInvesti
				})
			}
			console.log(listInterest);
		}
	}
}