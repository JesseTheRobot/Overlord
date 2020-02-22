const Discord = require("discord.js");
const client = new Discord.Client();
const enmap = require("enmap");
//const Sentry = require('@sentry/node');
//Sentry.init({ dsn: 'https://e7d4763a70c04344aabd5cee0eafba31@sentry.io/2410177' })
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: true,
	polling: true,
	ensureProps: true
});
//require("./Functions.js")(client);
//delete require.cache[require.resolve(`./Functions.js`)];

/*var init = async (client) => {

	const eventName = "message";
	const eventFile = "message.js";
	const eventObj = require(`./events/${eventFile}`);
	client.on(eventName, eventObj.bind(null, client));
	client.log(`Bound ${eventName} to Client Sucessfully!`, "INFO");
	delete require.cache[require.resolve(`./events/${eventFile}`)];
};*/
eventObj = require("./events/scheduler.js")
client.on("scheduler", eventObj.bind(null, client))
client.emit("scheduler", 100011101011101)

client.login(require("./config.js").token);
client.on("ready", () => {
	//client.DB.defer.then(client.init(client));
	//client.DB.defer.then(init(client))
	//
	guildID = "150083544593344833"
	console.log("ready!")
	client.DB.set("150083544593344833", "https://somesite.com/attachment", `15000.attachment`)
	console.log(new Date())
	client.DB.set(guildID, [], "persistence.time")
	client.DB.push(guildID, { end: 44545694945454, action: "add" }, "persistence.time")
	client.DB.push(guildID, { end: 33545694945444, action: "add" }, "persistence.time")
	client.DB.push(guildID, { end: 44444000, action: "add" }, "persistence.time")
	const now = new Date();
	data = client.DB.get(guildID, "persistence.time")
	client.debug = false

	client.timeouts = new Set()
	log("warn", "WARN")
	log("error", "ERROR")
	log("info", "INFO")
	check(guildID)

	async function check(guildID) {

		// clears previous check refresher
		const now = new Date();
		data = client.DB.get(guildID, "persistence.time")
		const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
		data.filter(action => action.end <= now).forEach(action => {
			//actionProcessor(client, guildID, action)
		})
		client.DB.set(guildID, data.filter(action => action.end >= now), "persistence.time")

		if (closest === Infinity) return;
		const timeTo = closest - now;

		// will only wait a max of 2**31 - 1 because setTimeout breaks after that
		//timeouts.set(guildID, setTimeout(check, Math.min(timeTo, 2 ** 31 - 1)))
	};

});
var log = (message, type) => {
	//info, warn, debug
	let caller = ((new Error).stack).split("at")[2].trim().replace(process.cwd(), ".")
	if (!type) type = "INFO";
	if (client.debug) {
		console.log(`[${type}] ${JSON.stringify(message)} ${caller}`);
	} else if (((!client.debug) && (type === "WARN" || type === "ERROR"))) {
		console.log(`[${type}] ${JSON.stringify(message)} ${caller}`)
	}


};
/*client.on("message", message => {
	if (message.author.bot) return
	console.log(message)
	message.content = message.cleanContent
	let embed = new Discord.RichEmbed()
		.setAuthor(message.guild.members.get(client.user.id).displayName, client.user.avatarURL)
		.setTitle("{{ACTION}}")
		.setDescription("test")
	message.channel.send(embed)
})*/
