// PACKAGES
var express = require("express");
var eBay = require('ebay-node-api');

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

	// makes the api call to search for item
	ebay.findItemsByKeywords(query).then((data) => {
		var getObject = data[0].searchResult[0].item[0]; // item[#] <= the # is what number item to pick from ebay
		console.log(data[0].searchResult[0].item[0].sellingStatus);

		data[0].searchResult[0].item.forEach(function(item) {
			var getPrice = item.sellingStatus[0].currentPrice[0].__value__;
			
			// adds every item being added to the total price before dividing to find average
			totalPrice += Number(getPrice);
			itemAmount += 1;
		});

		// finds average price
		avgPrice = totalPrice/itemAmount;

		console.log("searching for: " + query);		
		console.log("average price: " + avgPrice);
		console.log("amount of items: " + itemAmount);
		return next();
	}, (error) => {
		console.log(error);
	});


}



app.listen(3000, function() {
	console.log("Server is running...");
});







