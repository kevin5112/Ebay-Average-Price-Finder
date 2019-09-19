// PACKAGES
var express = require("express");
var eBay = require("ebay-node-api");
var stats = require("stats-analysis");

// DECLARATIONS
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");

// creating new instance of eBay
var ebay = new eBay({
	clientID: 'KevinChe-AverageP-PRD-db44724d8-fe1c684a'
	// limit is 100
});

// GLOBAL VARS
var totalPrice = 0.00;
var avgPrice = 0.00;
var itemAmount = 0;



// RESTFUL
app.get("/", function(req, res) {
	res.render("index");
});

app.get("/search", function(req, res) {
	res.render("search");
});



app.get("/results", findEbayItem, function(req, res) {
	// findEbayItem(req, res);
	var query = req.query.search;

	// loading icon while waiting for data to load
	while(query === undefined)
	{
		res.render("loading");
	}
		// render results page passing in searchObject, average price, and the item
		res.render("results", {avgPrice: avgPrice, item: query});
});


function findEbayItem(req, res, next) {
	totalPrice = 0.00;
	itemAmount = 0;
	var query = req.query.search;
	var listOfPrices = [];

	// makes the api call to search for item
	ebay.findItemsByKeywords(query).then((data) => {
		// if item does not exist, return 0
		if( data[0].searchResult[0]['@count'] <= 0) {
			avgPrice = 0;
			return next();
		}
		var getObject = data[0].searchResult[0].item[0]; // item[#] <= the # is what number item to pick from ebay
		console.log(data[0].searchResult[0].item[0].sellingStatus);

		data[0].searchResult[0].item.forEach(function(item) {
			var getPrice = item.sellingStatus[0].currentPrice[0].__value__;
			listOfPrices.push(getPrice);

		});		

		// print out prices before filtering out outliers
		for(var i = 0; i < listOfPrices.length; ++i)
		{
			console.log(i + " " + listOfPrices[i]);
		}

		// get the array of index of outliers
		var outliersIndexArr = stats.indexOfOutliers(listOfPrices, stats.outlierMethod.MAD);

		// print out index of outliers
		console.log("outliers at index: " + outliersIndexArr);	
		console.log("removing " + outliersIndexArr.length + " outliers");
		listOfPrices = stats.filterOutliers(listOfPrices, stats.outlierMethod.MAD)

		// print after filtering out outliers
		for(var i = 0; i < listOfPrices.length; ++i)
		{
			console.log(i + " " + listOfPrices[i]);
		}

		totalPrice = 0.00;
		// finds average price
		listOfPrices.forEach(function(price) {
			// adds every item being added to the total price before dividing to find average
			totalPrice += parseFloat(price);
			itemAmount += 1;
		});
		avgPrice = totalPrice/itemAmount;

		console.log("searching for: " + query);		
		console.log("average price: " + avgPrice);
		console.log("amount of items: " + itemAmount);
		return next();
	}, (error) => {
		console.log(error);
	});


}

var port = 3000;

app.listen(port, function() {
	console.log("Server is running on port " + port + "...");
});







