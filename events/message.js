/**
 * primary event - triggered whenever any channel in any guild the bot can 'see' gets sent a new message.
 * almost all the processing in the bot is based off data from this event - it is the main event, so to speak.
 * @param {object} client
 * @param {object} message - Object of the message that has been sent by a user.
 */
module.exports = async (client, message) => {
	//partials are uncached data that can then be resolved into 'full' data structures.
	//not currently used due to lower project version (v11 vs V12). once I update this will become very useful.
	if (message.partial) {
		await message.fetch().catch(err => {
			client.log(err, "ERROR")
			return
		})
	}
	//ignores all messages from other bots or from non-text channels, EG custom 'news' channels in some servers, or storefront pages, etc.
	if (message.author.bot || !message.channel.type == "text") return;
	//checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
	if (client.isShuttingDown) {
		//reactions as a form of feedback to the user. these indicate 'stop' and 'wait' for the shutdown.
		message.react("🚫").then(() => { message.react("⏳"); });
		return;
	}
	//guild-only due to increased technical complexity to account for non-guild scope'd interactions.
	if (message.guild) {
		//binds the guild's settings and the level of the user to the message object, for ease-of-access for later operations (eg commands)
		message.settings = client.DB.get(message.guild.id)
		//fetches the member into cache if they're offline. important to do this as this can be used by functions later on.
		if (!message.member) await message.guild.members.fetch(message.author);
		//used to check that the message contains *only* the mention of the bot, and nothing else.
		let BotMentionRegEx = new RegExp(`^<?@!?${client.user.id}>?$`);
		//checks if the bot, and *only* the bot, is mentioned.
		if (message.isMentioned(client.user.id) && message.content.match(BotMentionRegEx)) {
			//sends (DM's) the user the Command Prefix for the guild, or the default prefix if anything out of scope happens.
			message.author.send(`Hi there, ${message.member.displayName}, My prefix in guild ${message.guild.name} is ${message.settings.prefix || "$"}.\n for help, use the command: ${message.settings.prefix || "$"}help `);
			return
		}
		//built in method for cleaning message input (eg converting user mentions into a string to prevent issues when returning message content)
		message.content = message.cleanContent;
		//emit events for message heuristics
		client.emit("attachmentRecorder", message)
		client.emit("toxicClassifier", message)
		client.emit("autoMod", message)
		//command processing
		//checks the message starts with the prefix.
		if (message.content.startsWith(message.settings.prefix)) {
			//splits the messages content into an array (space delimited)
			let args = (message.content.slice(message.settings.prefix.length).trim().split(/ +/g))
			//resolve 'true' command name from an alias.
			let cmdName = client.DB.get(message.guild.id, `commandsTable.${args[0].toLowerCase()}`)
			//resolves the commands config using the 'true' name
			let cmdCfg = message.settings.commandsTable[cmdName]
			//checks that the user can execute the command (see Functions.js). stores resultant state as state
			let state = client.canExecute(client, message, cmdName)
			//imports discord.js to construct embeds
			let Discord = require("Discord.js")
			//creates a new embed instance
			let embed = new Discord.RichEmbed()
				.setAuthor(client.user.username, client.user.avatarURL)
				.setTimestamp(new Date())
				//default content that should always be replaced. if not, it's very clear something is not functioning correctly.
				.setTitle("if you are seeing this, something has gone wrong. please inform the bot owner.")
				.setDescription(`If you think this is a mistake, please contact an Administrator.`)
				.setColor("#FF0000") //red
			message.awaitReactions((reaction, user) => { return reaction.emoji.name === "❓" && user.id === message.author.id }, { max: 1, time: 10000 })
				//restrictions are indicated by reactions - the ❓ reaction can be used to make the bot send the user the 'key' as to what each reaction means.
				//this code waits for a reaction, checks the reaction 'name' and react-er before sending the embed to the user.
				//this is the best way I found to provide the user with non-intrusive feedback for commands, etc.
				.then(collected => {
					//can proceed even if no reactions occur in the time frame. added a check to ensure one is added.
					if (collected.size) {
						message.author.send({ embed: embed })
					}
					//remove the reactions from the message - reduces visual clutter
					message.clearReactions()
				})
			//switch:case for modifying the reporting embed's contents according to what the failure is.
			switch (state) {
				//if the command doesn't exist
				case "nonexistant":
					embed.setTitle(`Command/Command Alias ${args[0]} Does not exist.`)
						.setDescription(`Please use the \`\`\`\n${message.settings.prefix}Help\n\`\`\` Command to see all Available Commands.`)
					break
				//if the command is disabled (guild-wide)
				case "disabled":
					embed.setTitle(`Command ${args[0]} has been disabled for guild ${message.guild}.`)
					break
				//if the user lacks the perms required
				case "perms":
					embed.setTitle(`You do not have the required permissions to execute command '${args[0]}' in Server ${message.guild}`)
					break
				//if the channel is not in the allowed array
				case "channel":
					embed.setTitle(`Command '${args[0]}' has been disabled in channel ${message.channel} in Server ${message.guild}`)
					break
				//if the user is still in the command's cooldown period
				case "cooldown":
					embed.setTitle(`Woah There! Please slow down with the usage of Command '${args[0]}' in Server ${message.guild}`)
					break
				//if the user is in the blacklist for this command - guild-wide ban of specific command usage
				case "blacklist":
					embed.setTitle(`Oh Dear. Looks like you've been blacklisted from using command '${args[0]}' in Server ${message.guild}`)
					break
				//if the user passes all the checks...
				case "passed":
					//if the user is not an admin, add them to the command's cooldown.
					if (!message.member.permissions.has("ADMINISTRATOR") && cmdName) {
						client.cooldown.push(message.guild.id, message.member.id, cmdName, true)
						//after a set time, remove them from the cooldown, allowing them to use the command again.
						setTimeout(() => { client.cooldown.remove(message.guild.id, message.member.id, cmdName); }, cmdCfg.cooldown)
					}
					//log the fact that a command has been executed.
					client.log(`User ${message.author} executed command ${cmdName} with arguements ${args.join(", ")} in  ${message.guild}:${message.channel}`, "INFO")
					//load the command from disk as an object
					let cmdObj = require(`${client.basedir}\\commands\\${cmdName}.js`)
					try {
						//run the command - passing args and the message invoking the command.
						cmdObj.run(client, message, args)
					} catch (err) {
						//on an error, log it, then provide 'feedback' to the user
						embed.setTitle(`Oh Dear. It seems that an error occurred whilst trying to execute this command.`)
							.setDescription(`If this continues to occur, please notify ${client.users.get(client.config.ownerID)}`)
						//react to the message to allow the user to aquire feedback - optional but clear enough.
						message.react("❌").then(() => { message.react("❓") })
						client.log(`Error with command ${cmdName}`, "ERROR")
						console.log(err)
					}
					break
			}
			//this is the trigger that allows for the embed to be sent to the user.
			if (state != "passed") {
				message.react("🚫").then(() => { message.react("❓") })
				return
			}
		}
	} else {
		//Owner universal restriction escape - as they control the bot anyway - useful for debugging.
		//treat everything they send as a command.
		if (message.author.id === client.config.ownerID) {
			let args = (message.content.trim().split(/ +/g)) //split args into an array
			let cmdObj = require(`${client.basedir}\\commands\\${args[0]}.js`)
			try {
				cmdObj.run(client, message, args) //run the command
			} catch (err) {
				console.log(err)
			}
			return
		} else { //log any messages sent to the bot Via DM's.
			client.log(`Message with contents ${message.content} sent to the Bot Via DM's by user ${message.author}`, "INFO")
		}
	}
}