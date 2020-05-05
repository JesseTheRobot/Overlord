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
client.trecent = new enmap()
client.debug = true
client.config = require("./config.js")
client.timeouts = new Map()
client.trecent = new enmap()
client.cooldown = new enmap()



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

function inRange(x, min, max) {
	return ((x - min) * (x - max) < 0);
}

client.login(require("./config.js").token);
client.on("ready", () => {
	client.DB.defer.then(() => {
		client.DB.deleteAll()
	})
});

client.on("message", message => {
	if (!message.guild || message.author.bot) return
	let decay = 3
	let data = client.DB.ensure("636959316405911562", { count: 30, TS: new Date() - 36000000 }, `users.646452404316798978.demerits`)
	let intervals = Math.max(Math.floor((new Date() - data.TS) / (3600000 * decay)), 0)
	if (intervals) {
		let afterDecay = data.count - intervals
		Object.entries(client.DB.get("636959316405911562", "modules.autoMod.punishments")).forEach(pt => {
			//pt[1].end = Math.max(pt[1].end, 1)
			if (inRange(data.count, pt[1].end, pt[1].start) && !inRange(afterDecay, pt[1].end, pt[1].start)) { //if it was originally in range, but is no longer in range, undo the action.
				console.log("remove punishment")
			} else if (!inRange(data.count, pt[1].end, pt[1].start) && inRange(afterDecay, pt[1].end, pt[1].start)) {
				console.log("Apply Punishment")
			}
		})
	}
})



