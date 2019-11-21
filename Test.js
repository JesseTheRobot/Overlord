const Discord = require("discord.js");
const client = new Discord.Client();
const enmap = require("enmap");
//const { StatsD } = require("hot-shots");
//client.dStats = new StatsD("localhost", 8125);
const nsfwjs = require("nsfwjs");
const fs = require("fs");
let img = fs.readFileSync("./data/test.jpg");
nsfwjs.load().then(function(model) {
	model.classify(img).then(function(predictions) {
		console.log("Predictions: ", predictions);
	});
});
/*
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true,
	ensureProps: true
});
client.commands = new enmap();

require("./Functions.js")(client);



client.login(require("./config.js").token);
client.on("ready", () => {
	client.DB.defer.then(client.init(client));
});
*/
