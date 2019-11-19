module.exports = async (client, message) => {
	if (message.author.bot || !message.channel.type == "text") return; //ignores all messages from other bots or from non-text channels, EG custom 'news' channels in some servers, or storefront pages, etc.
	message.content = message.cleanContent; //built in method for cleaning message input (eg converting user mentions into a string to prevent issues when returning message content )

	client.dStats.increment("overlord.messages"); 

	/*check if the message has the command prefix
	check if the command exists
	check if the command requires a guild or not
	check the level of the user executing the command
	check command context (cooldowns,allowed channel etc)
	*/
	//check command
	
	if (client.isShuttingDown == true) { //checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
		console.log("command execution failed - system currently shutting down.");
		message.react("🚫").then(() => { message.react("⏳"); });
	}

	var prefix = client.getGuildSettings(message.guild).config.prefix; //sets the prefix for the current guild
	if (message.guild && !message.member) await message.guild.members.fetch(message.author); //fetches the member into cache if they're offline.

	let level = client.getLevel(client,message);
	client.log("log",`User ${message.author.name} has permission level: 4`,"getLevel");

	const BotMentionRegEx = new RegExp(`^<@!?${client.user.id}>( |)$`);
	if (message.isMentioned(client.user.id) && message.content.match(BotMentionRegEx) && message.guild) { //checks if the bot, and *only* the bot, is mentioned, as well as a guild is present.
		return message.author.send(`Hi there! ${message.author}, My prefix in guild ${message.guild.name} is ${prefix || "$"}.`); //sends (DM's) the user the Command Prefix for the guild, or the default prefix if anything "wonky" happens.
	}

	//states ["ok/allowed":"✔️","Wait":"⏳","Block":"🚫"]

	//message.level = client.getLevel(client,message);
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	//client.getStatus(client,message,command);
	try {
		var cmdfile = require(`${process.cwd()}\\commands\\${command}.js`);
		cmdfile.run(client, message, args);
	} catch (err) {
		console.log(err);
	}
	client.log("Log", `user ${message.author.displayName || message.author.username} has used command ${command} with args ${args} at time ${new Date()}`, "MessageEvent");
	//const permLvl = client.getMsgPerm(message); //returns permission integer for the author of the message.
	console.log(client.commands); //debug check of the commands collection tied to client
};