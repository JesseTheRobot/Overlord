
module.exports = async (client, message) => {
	if (message.author.bot || !message.channel.type == "text") return; //ignores all messages from other bots or from non-text channels, EG custom 'news' channels in some servers, or storefront pages, etc.
	if (client.isShuttingDown) { //checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
		message.react("🚫").then(() => { message.react("⏳"); });
		return;
	}
	message.content = message.cleanContent; //built in method for cleaning message input (eg converting user mentions into a string to prevent issues when returning message content)
	if (message.guild) {
		console.log(message.mentions.roles.array()) //guild-only as the technical complexity required vs usefulness was not worth it for me.
		message.settings = client.DB.get(message.guild.id)
		if (!message.member) await message.guild.members.fetch(message.author); //fetches the member into cache if they're offline.
		//binds the guild's settings and the level of the user to the message object, for ease-of-access for later operations (eg commands)

		const BotMentionRegEx = new RegExp(`^<@!?${client.user.id}>( |)$`);
		if (message.isMentioned(client.user.id) && message.content.match(BotMentionRegEx)) { //checks if the bot, and *only* the bot, is mentioned, as well as a guild is present.
			return message.author.send(`Hi there! ${message.member.displayName}, My prefix in guild ${message.guild.name} is ${message.settings.prefix || "$"}.`); //sends (DM's) the user the Command Prefix for the guild, or the default prefix if anything "wonky" happens.
		}
		message.URLs = [...message.content.matchAll(/(?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?/gim)] //SRC for regex: regexguru.com/2008/11/detecting-urls-in-a-block-of-text/
		//message heuristics
		client.emit("attachmentRecorder", message)
		client.emit("toxicClassifier", message)
		client.emit("autoMod", message)

		/** Command Processing 
		 * 
		*/
		if (message.content.startsWith(message.settings.prefix)) {
			let args = (message.content.slice(message.settings.prefix.length).trim().split(/ +/g))
			let cmdName = client.commands.get(message.guild.id, args[0].toLowerCase()) //resolve 'true' name from a command alias.
			let discord = require("discord.js")
			let embed = new discord.RichEmbed()
				.setAuthor(client.user.username, client.user.avatarURL)
				.setTimestamp(new Date())
				.setTitle("if you are seeing this, something has gone wrong. please inform the bot owner.")
				.setDescription(`If you think this is a mistake, please contact an Administrator.`)
				.setColor("#FF0000")
			message.awaitReactions((reaction, user) => { return reaction.emoji.name === "❓" && user.id === message.author.id }, { max: 1, time: 20000 })
				//restrictions are indicated by reactions - the ❓ reaction can be used to make the bot send the user the 'key' as to what each reaction means.
				.then(collected => {
					message.author.send({ embed: embed })
				})

			if (!cmdName) { //had to use a set of ifs to evaluate and also report on what area the denial occured for user feedback.
				embed
					.setTitle(`Command/Command Alias ${args[0]} Does not exist.`)
					.setDescription(`Please use the \`\`\`\n${message.settings.prefix}Help\n\`\`\` Command to see all Available Commands.`)
				return
			}
			let cmdCfg = client.DB.get(message.guild.id, `commands.${cmdName}`)
			if (!cmdCfg.enabled) { //check the command is enabled (guild-wide)
				embed
					.setTitle(`Command ${args[0]} has been disabled for guild ${message.guild}.`)
					.setDescription(`If you think this command should be enabled, please contact an Administrator.`)
				message.react("🚫").then(() => { message.react("❓") })

				return
			}
			if (!message.member.permissions.has(cmdCfg.permReq, true)) {
				//check the user has the required permissions. if they have admin, always allow.
				embed
					.setTitle(`You do not have the required permissions to exectue command '${args[0]}' in Server ${message.guild}`)
				message.react("🚫").then(() => { message.react("❓") })
				return
			}
			if (!((cmdCfg.allowedChannels.length === 0) ? true : (cmdCfg.allowedChannels.includes(message.channel.id)))) {
				//check that if entries within allowedChannels exist, that the current channel is in that array of entries.
				embed
					.setTitle(`Command '${args[0]}' has been disabled in channel ${message.channel} in Server ${message.guild}`)
				message.react("🚫").then(() => { message.react("❓") })
				return

			}
			if (client.cooldown.get(message.guild.id, cmdName).filter(u => u === message.member.id).length) {
				//check that the command is not in it's cooldown period for the user (guild-wide).
				embed
					.setTitle(`Woah There! Please slow down with the usage of Command '${args[0]}' in Server ${message.guild}`)
				message.react("🚫").then(() => { message.react("❓") })
				return
			}
			if (Object.keys(client.DB.ensure(message.guild.id, [], `blacklist.${cmdName}`)).includes(message.member.id)) {
				//check that the user is not in the blacklist for the command (guild-wide)
				embed
					.setTitle(`Oh Dear. Looks like you've been blacklisted from using command '${args[0]}' in Server ${message.guild}`)
				message.react("🚫").then(() => { message.react("❓") })
				return
			}
			client.log("conditions passed!")

			if (!message.member.permissions.has("ADMINISTRATOR")) {
				client.cooldown.push(message.guild.id, message.member.id, cmdName, true)
				setTimeout(() => { client.cooldown.remove(message.guild.id, message.member.id, cmdName); console.log("cleared Cooldown!") }, cmdCfg.cooldown)
			}
			let cmdObj = require(`${client.basedir}\\commands\\${cmdName}.js`)
			cmdObj.run(client, message, args)
			client.log(client.cooldown)
		}
	} else {
		if (message.author.id === client.config.ownerID) { //Owner universal restriction escape - as they control the bot anyway - useful for debugging.
			//run command
			return
		}
	}
}


/*if (
				(cmdCfg.enabled) &&
				((cmdCfg.allowedChannels.length === 0) ? true : (cmdCfg.allowedChannels.includes(message.channel.id))) &&
				(message.member.permissions.has(cmdCfg.permReq, true)) &&
				(!client.cooldown.get(message.guild.id, cmdName).filter(u => u === message.member.id).length) &&
				(!Object.keys(client.DB.ensure(message.guild.id, [], `blacklist.${cmdName}`)).includes(message.member.id))
			) {
				client.log("conditions passed!")
				require(`${client.basedir}\\commands\\${cmdName}.js`)
				client.log()
			} */
