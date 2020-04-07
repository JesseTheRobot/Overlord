module.exports = async (client, message) => {
	if (message.author.bot || !message.channel.type == "text") return; //ignores all messages from other bots or from non-text channels, EG custom 'news' channels in some servers, or storefront pages, etc.
	if (client.isShuttingDown) { //checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
		message.react("🚫").then(() => { message.react("⏳"); });
		return;
	}
	message.uncleanContent = message.content //let certain functiosn still have access to the 'unclean' input
	message.content = message.cleanContent; //built in method for cleaning message input (eg converting user mentions into a string to prevent issues when returning message content)
	if (message.guild) { //guild-only as the technical complexity required vs usefulness was not worth it for me.
		message.settings = client.DB.get(message.guild.id)
		if (!message.member) await message.guild.members.fetch(message.author); //fetches the member into cache if they're offline.
		//binds the guild's settings and the level of the user to the message object, for ease-of-access for later operations (eg commands)

		let BotMentionRegEx = new RegExp(`^<?@!?${client.user.id}>?$`); //used to check that the message contains *only* the mention of the bot
		if (message.isMentioned(client.user.id) && message.uncleanContent.match(BotMentionRegEx)) { //checks if the bot, and *only* the bot, is mentioned, as well as a guild is present.
			message.author.send(`Hi there,${message.member.displayName}, My prefix in guild ${message.guild.name} is ${message.settings.prefix || "$"}.`); return //sends (DM's) the user the Command Prefix for the guild, or the default prefix if anything "wonky" happens.
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
			let cmdName = client.DB.get(message.guild.id, `commandsTable.${args[0].toLowerCase()}`) //resolve 'true' name from a command alias.
			let cmdCfg = message.settings.commandsTable[cmdName]
			let state = client.canExecute(client, message, cmdName)
			let discord = require("discord.js")
			let embed = new discord.RichEmbed()
				.setAuthor(client.user.username, client.user.avatarURL)
				.setTimestamp(new Date())
				.setTitle("if you are seeing this, something has gone wrong. please inform the bot owner.")
				.setDescription(`If you think this is a mistake, please contact an Administrator.`)
				.setColor("#FF0000")
			message.awaitReactions((reaction, user) => { return reaction.emoji.name === "❓" && user.id === message.author.id }, { max: 1, time: 40000 })
				//restrictions are indicated by reactions - the ❓ reaction can be used to make the bot send the user the 'key' as to what each reaction means.
				.then(collected => {
					if (collected.size) {
						message.author.send({ embed: embed })
					}
				})
			switch (state) {
				case "nonexistant":
					embed.setTitle(`Command/Command Alias ${args[0]} Does not exist.`)
						.setDescription(`Please use the \`\`\`\n${message.settings.prefix}Help\n\`\`\` Command to see all Available Commands.`)
					break
				case "disabled":
					embed.setTitle(`Command ${args[0]} has been disabled for guild ${message.guild}.`)
					break
				case "perms":
					embed.setTitle(`You do not have the required permissions to exectue command '${args[0]}' in Server ${message.guild}`)
					break
				case "channel":
					embed.setTitle(`Command '${args[0]}' has been disabled in channel ${message.channel} in Server ${message.guild}`)
					break
				case "cooldown":
					embed.setTitle(`Woah There! Please slow down with the usage of Command '${args[0]}' in Server ${message.guild}`)
					break
				case "blacklist":
					embed.setTitle(`Oh Dear. Looks like you've been blacklisted from using command '${args[0]}' in Server ${message.guild}`)
					break
				case "passed":
					if (!message.member.permissions.has("ADMINISTRATOR")) {
						client.cooldown.push(message.guild.id, message.member.id, cmdName, true)
						setTimeout(() => { client.cooldown.remove(message.guild.id, message.member.id, cmdName); client.log("cleared Cooldown!") }, cmdCfg.cooldown)
					}
					client.log(`User ${message.author} executed command ${cmdName} with arguements ${args.join(", ")} in  ${message.guild}:${message.channel}`, "INFO")
					let cmdObj = require(`${client.basedir}\\commands\\${cmdName}.js`)
					try {
						cmdObj.run(client, message, args)
					} catch (err) {
						client.log(err, "ERROR")
						embed.setTitle(`Oh Dear. It seems that an error occurred whilst trying to execute this command.`)
							.setDescription(`If this continues to occur, please notify ${client.users.get(client.config.ownerID)}`)
						message.react("❌").then(() => { message.react("❓") })
					}
					break
			}
			if (state != "passed") {
				message.react("🚫").then(() => { message.react("❓") })
				return
			}
		}
	} else {
		if (message.author.id === client.config.ownerID) { //Owner universal restriction escape - as they control the bot anyway - useful for debugging.
			let args = (message.content.slice(message.settings.prefix.length).trim().split(/ +/g))
			let cmdObj = require(`${client.basedir}\\commands\\${args[0]}.js`)
			try {
				cmdObj.run(client, message, args)
			} catch (err) {
				client.log(err, "ERROR")
			}
			return
		} else {
			client.log(`Message with contents ${message.content} sent to the Bot Via DM's by user ${message.author}`, "INFO")
		}
	}
}