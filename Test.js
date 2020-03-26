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
let eventObj = require("./events/scheduler.js")
client.on("scheduler", eventObj.bind(null, client))


client.login(require("./config.js").token);
client.commands = new enmap();
client.on("ready", () => {
	client.DB.defer.then(() => {
		console.log("I am work yes")
		client.DB.deleteAll()
		client.DB.ensure("636959316405911564", {}, "persistence.attachments")
		client.DB.setProp("636959316405911562", { attachments: ["a", "b"], expiry: (new Date()).setDate((new Date()).getDate() + 14) }, `persistence.attachments.696969696`)
	})
});

client.on("message", message => {
	if (!message.guild || message.author.bot) return
	let action = {
		title: "Suspected NSFW Content",
		src: `Posted by user <@150693679500099584> in channel <#636959316405911564> : [Jump to message](https://discordapp.com/channels/636959316405911562/636959316405911564/691617498252050475)`,
		trigger: {
			type: "NSFWDetector",
			data: "NSFW content breakdown: \na:% \nb:%, \nc:%, \nd:%",
		},
		request: "Removal of offending content",
		action: {},
	}
	let embed = new Discord.RichEmbed()
		.setAuthor(client.user.username, client.user.avatarURL)
		.setTimestamp(new Date())
		.setURL(message.url)
		.setTitle(`Moderator Action requested: ${action.title}`)
		.setDescription(`source: ${action.src}`)
		.addField("Trigger type", action.trigger.type)
		.addField("Trigger description:", action.trigger.data)
		.addField("Reccomended Action Pending Approval:", action.request)
		.setFooter("react with ✅ to perform the reccomended action. react with a number to assign demerits.")
	//action title: desc: infringing item in question, other dets, reaction based  - scollector
	message.guild.channels.get(message.channel.id).send({ embed: embed }).then(msg => {
		msg.react("✅").then(() => {
			msg.awaitReactions((reaction, user) => { return reaction.emoji.name === "✅" && !user.bot }, { max: 1 })
				.then(collected => {
					console.log(Array.from(collected.get("✅").users)[1][1].id)
				})
		})
	})
})



