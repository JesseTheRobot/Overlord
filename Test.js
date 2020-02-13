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
	client.log("Log", `Bound ${eventName} to Client Sucessfully!`, "EventBind");
	delete require.cache[require.resolve(`./events/${eventFile}`)];
};*/


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
	var actions = data.filter(action => action.end <= now)
	const closest = Math.min(...data.filter(action => action.end >= now).map(action => action.end));
	let schTimeout = null
	schTimeout = setTimeout(myfun, 5000)
	let sch = require("./events/scheduler.js")
	sch().then(
		sch())

});
var myfun = () => {
	return true
}
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
