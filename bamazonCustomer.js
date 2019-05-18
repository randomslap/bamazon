var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",

	port: 3307,

	user: "root",

	password: "root",
	database: "bamazon",
});

var items = [];
var products = [];
var prices = [];
var quantities = [];

connection.connect(function(err) {
	if (err) throw err;
	itemsInStock();
});

function itemsInStock() {
	var query =
		"SELECT item_id, product_name, price, stock_quantity FROM products";
	connection.query(query, function(err, res) {
		if (err) throw err;
		for (var i = 0; i < res.length; i++) {
			items.push(res[i].item_id);
			products.push(res[i].product_name);
			prices.push(res[i].price);
			quantities.push(res[i].stock_quantity);
			console.log("Item ID: " + res[i].item_id);
			console.log("Product Name: " + res[i].product_name);
			console.log("Price: " + res[i].price);
			console.log("Quantity: " + res[i].stock_quantity);
			console.log("\n");
		}
		interaction();
	});
}

function interaction() {
	inquirer
		.prompt([
			{
				name: "id",
				type: "number",
				message: "Enter an item ID: ",
			},
			{
				name: "quantity",
				type: "number",
				message: "How many would you like to buy?",
			},
		])
		.then(function(ans) {
			for (var i = 0; i < items.length; i++) {
				if (ans.id === items[i]) {
					console.log("You are buying: " + products[i]);
					if (ans.quantity <= quantities[i]) {
						purchase(ans, i);
					} else {
						console.log("Insufficient quanitiy!");
					}
				}
			}
			connection.end();
		});
}

function purchase(answer, i) {
	connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				stock_quantity: quantities[i] - answer.quantity,
			},
			{
				item_id: answer.id,
			},
		],
        function (err) {
            if (err) throw err;
            var total = prices[i] * answer.quantity
            console.log("You bought the item(s)");
            console.log("Total cost: " + total.toFixed(2));
        }
	);
}

