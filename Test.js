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
client.debug = true
client.config = require("./config.js")
console.time("init");
client.timeouts = new Map()
console.log((new Error).stack.toString())
var stk = (new Error).stack
console.log(stk.split(" at ")[2])



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
	client.DB.defer.then(client.init(client));
	//client.DB.defer.then(init(client))
	console.log(client.commands)







});

var log = (message, type) => {
	//info, warn, debug
	let caller = ((new Error).stack).split("at")[2].trim().replace(process.cwd(), ".")
	if (!type) type = "INFO";
	switch (type) {
		case "ERROR":
			console.error(`[${type}] ${JSON.stringify(message)} ${caller}`);
			break;
		case "WARN":
			console.warn(`[${type}] ${JSON.stringify(message)} ${caller}`);
			break;
		default:
			if (!client.debug) break
			console.log(`[${type}] ${JSON.stringify(message)} ${caller}`)
	}
}

