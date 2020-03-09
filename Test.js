const Discord = require("discord.js");
const client = new Discord.Client();
const enmap = require("enmap");
client.diff = require("deep-object-diff").detailedDiff;
//const Sentry = require('@sentry/node');
//Sentry.init({ dsn: 'https://e7d4763a70c04344aabd5cee0eafba31@sentry.io/2410177' })
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true,
	ensureProps: true
});
client.debug = true
client.config = require("./config.js")
console.time("init");
client.timeouts = new Map()
client.DB.changed((Key, Old, New) => {
	client.log(Key)
	client.log(client.diff(Old, New))
	if (client.setData) {
		throw new Error()
	}
	/**optional debug system to monitor any/all changes to the ENMAP Database */
	//client.log(`${Key} - ${JSON.stringify(client.diff(Old, New))}`);
	/*switch (Key) {
		case ""
	}*/
})



require("./Functions.js")(client);
delete require.cache[require.resolve(`./Functions.js`)];

/*var init = async (client) => {

	const eventName = "message";
	const eventFile = "message.js";
	const eventObj = require(`./events/${eventFile}`);
	client.on(eventName, eventObj.bind(null, client));
	client.log(`Bound ${eventName} to Client Sucessfully!`, "INFO");
	delete require.cache[require.resolve(`./events/${eventFile}`)];
};*/
let eventObj = require("./events/scheduler.js")
client.on("scheduler", eventObj.bind(null, client))


client.login(require("./config.js").token);
client.commands = new enmap();
client.on("ready", () => {
	//client.DB.defer.then(client.init(client));

	let guildID = "636959316405911562"
	client.log((new Date().getTime() + 7000))
	var action = { end: 69, type: "reminder", message: "ayy lmao", memberID: "150693679500099584" }
	client.DB.push(guildID, action, "persistence.time")
	client.setData = true
	/*client.emit("scheduler", "636959316405911562")
	data = client.DB.get(guildID, "persistence.time")
	client.log(data)*/








});



