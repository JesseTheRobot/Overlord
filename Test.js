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
require("./Functions.js")(client);
delete require.cache[require.resolve(`./Functions.js`)];

var init = async (client) => {

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
	client.DB.defer.then(init(client))
	//
	client.DB.set("150083544593344833", "https://somesite.com/attachment", `15000.attachment`)
});
client
	.on("message", message => {
		console.log(message)
		message.content = message.cleanContent
	})
	.on("messageDelete", message => {
		//stuff

	})
	.on("messageUpdate", oldMsg, newMsg => {
		//stuff
	})
