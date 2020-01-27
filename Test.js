const Discord = require("discord.js");
const client = new Discord.Client();
const enmap = require("enmap");

client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true,
	ensureProps: true
});


var testModule = async (client) => {
	require("./Functions.js")(client);
	const eventName = "message";
	const eventFile = "message.js";
	const eventObj = require(`./events/${eventFile}`);
	client.on(eventName, eventObj.bind(null, client));
	client.log("Log", `Bound ${eventName} to Client Sucessfully!`, "EventBind");
	delete require.cache[require.resolve(`./events/${eventFile}`)];
};


client.login(require("./config.js").token);
client.on("ready", () => {
	//client.DB.defer.then(client.init(client));
	testModule(client);
});

