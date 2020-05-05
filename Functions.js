/**
 * contains functions that are bound to the client object at startup. DO NOT EDIT (pls)
 * @exports init - initialises the bot
 * @exports validateGuild - validates a guild's data
 * @exports log - custom logging handler 
 * @exports canExecute - checks if a command can be executed by a user or not
 * @exports loadCommand - used to load a command file from disk
 * @exports schedule - used to schedule tasks
 * @exports reloadCommand - used to reload a command back into memory
 * @exports evalClean - used to clean the output of Eval
 * @exports getRandomInt - used to generate random integers
 */


module.exports = (client) => {
	//alias for fs
	const fs = client.fs
	//contains timers for guild scheduler instances
	client.timeouts = new Map();
	//sets the base directory to the process' current working directory.
	client.basedir = process.cwd();

	/**
	 * Initialisation routine for the client, after the client has been authenticated and connected to discord, 
	 * as well as after the ENMAP database is ready. handles the initialisation of everything needed for proper function.
	 */
	client.init = (client) => {
		//statement to make the owner aware the bot is in debug mode.
		if (client.debug) { client.log("BOT IS IN DEBUG MODE", "WARN") }
		//logging statement to see what user is being logged into.
		client.log(`client logging in as ${client.user.tag}`, "INFO")
		if (client.guilds.size == 0) {
			//aborts if the bot is not part of any guilds
			throw new Error("No Guilds Detected! Please check your token. aborting Init.");
		}
		if (!client.user.bot) {
			//aborts if it detects it has been given a user's token instead of a bot's token.
			throw new Error("Warning: Using Bots on a user account is (for the most part) forbidden by Discord ToS. Please Verify your token!");
		}
		//if preloading is enabled, iterate over every channel and load messages into bot message cache.
		if (client.config.preLoad) {
			client.channels.forEach(channel => {
				//categories are classed as channels and are thus ignored.
				if (channel.type === "text") {
					channel.fetchMessages({ limit: 100 }).then(c => { return })
				}
			});
		}
		//status - small message that shows up under the profile of the bot. customisable in config.js.
		//replace placeholders with specified content
		var game = client.config.status.replace("{{guilds}}", client.guilds.size).replace("{{version}}", client.version);
		client.user.setPresence({ game: { name: game, type: "PLAYING" }, status: "active" });
		//load the files for the events
		const eventFiles = fs.readdirSync("./events/");
		client.log(`Loading ${eventFiles.length} events from ${client.basedir}/events/`);
		eventFiles.forEach(eventFile => {
			//skip anything that's not a .js file
			if (!eventFile.endsWith(".js")) return;
			//strip the file extension
			const eventName = eventFile.split(".")[0];
			client.log(`attempting to load event ${eventName}`)
			//load it from disk
			const eventObj = require(`./events/${eventFile}`);
			//bind it - on eventName, eventName(client, ...other args) as everything needs client
			//this means that the event will always be called with client as the first arguement.
			client.on(eventName, eventObj.bind(null, client));
			//if the event has a default config, load it if it's not already present
			if (eventObj.defaultConfig) {
				client.guilds.forEach(guild => {
					//if the value for the config exists, return the existing value, else write the given value.
					client.DB.ensure(guild.id, eventObj.defaultConfig, `modules.${eventName}`)
				})
			}
			//log that the loading was successful.
			client.log(`Bound ${eventName} to Client Sucessfully!`);
			//delete the file from the resolve cache as we no longer need it.
			delete require.cache[require.resolve(`./events/${eventFile}`)];
		});
		//iterates over each guild that the bot has access to and ensures they are present in the database
		client.guilds.forEach(guild => {
			client.validateGuild(client, guild);
		});
		//cleans the cache from any lingering operations that may have been interrupted.
		fs.readdir("./cache/", (err, files) => {
			if (err) throw err;
			client.log(`Deleting ${files.length} files from cache...`)
			//message to alert the operator/bot owner that a unexpected shutdown probably occurred.
			if (files.length > 1) {
				client.log("Cache Remnants detected - this should only occur if an unexpected shutdown was invoked!", "WARN")
			}
			for (const file of files) {
				//delete all the remenant files
				fs.unlink(("./cache/" + file), err => {
					if (err) throw err;
				})
			}
		})
		//ends the initialisation timer as the bot is fully operational by this point.
		console.timeEnd("init");
		//
		client.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for ${client.users.size} users.`, "INFO");
		try {
			//sends a "I'm alive!" message to the owner so they know when the bot is back online.
			(client.users.get(client.config.ownerID))
				.send(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for ${client.users.size} users.`);
		} catch (err) {
			client.log("I'm not in the guild with the owner - unable to send bootup notification!", "INFO")
		}
	}

	/**validates a Guilds's configuration properties and database 'Presence'. called at startup and when a new guild is created.
	 * @param {object} client
	 * @param {object} guild
	 */
	client.validateGuild = (client, guild) => {
		//ensures each server exists within the DB.
		var guildData = client.DB.ensure(guild.id, client.defaultConfig);
		//uses the defaultConfig as the basic framework if the guild really doesn't exist
		//quick and easy way of finding roles with common names and assigning them automagically.
		guild.roles.forEach(role => {
			client.log(`Testing role with name ${role.name} for Admin/Mod/Muted availability.`);
			if (["Admin", "Administrator"].includes(role.name)) { client.DB.push(guild.id, role.id, "adminRoles"); }
			if (["Mod", "Moderator"].includes(role.name)) { client.DB.push(guild.id, role.id, "modRoles"); }
			if (["Muted", "Mute"].includes(role.name)) { client.DB.set(guild.id, role.id, "mutedRole"); }
		});
		client.DB.set(guild.id, {}, "commandsTable")
		//ensures entry for the guild in trecent (used for antispam - stands for TalkedRecent, as in "Who has talked (sent messages) recently?")
		client.trecent.ensure(guild.id, {})
		//ensures entry for the guild for command cooldowns - used to ratelimit command execution.
		client.cooldown.ensure(guild.id, {})
		//ensures each server has all it's users initialised correctly - each user is given an object with just a property for XP (for now)
		guild.members.forEach(member => {
			//this object is extended/pruned as required by various submodules, eg demerits.
			client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
		});
		//evict all those recently loaded keys from memory cache.
		client.DB.evict(client.DB.keyArray())
		//logs completion of validation.
		client.log(`Sucessfully Verified/initialised Guild ${guild.name} to DB`);
		//finds and automatically sets the ownerID for the server -> automatic admin
		client.DB.set(guild.id, guild.owner.user.id, "serverOwnerID");
		//load commands with default config into guild config (if it doesn't exist)
		const commandFiles = fs.readdirSync("./commands/");
		client.log(`Loading ${commandFiles.length} events from ${client.basedir}/commands/`);
		commandFiles.forEach(command => {
			//ignore all non-.js files
			if (!command.endsWith(".js")) return;
			//strip file extention
			var command = command.split(".")[0];
			//run another function to fully load the command
			client.loadCommand(command, guild.id);
		});
		//check module permission requirements to determine the permissions required by the bot. starts with a basic set:
		let reqPermissions = ["SEND_MESSAGES", "READ_MESSAGES", "VIEW_CHANNEL"]
		//iterates over every module, checking the permissions declared as required.
		Object.keys(guildData.modules).forEach(key => {
			let Module = guildData.modules[key]
			if (!Module.requiredPermissions) return;
			Module.requiredPermissions.forEach(perm => {
				//append missing perms to the array.
				if (!reqPermissions.includes(perm)) { reqPermissions.push(perm) }
			})
		});
		//log requested permissisons
		client.log(`Requested permissions for server ${guild.name} : ${reqPermissions.toString()}`)
		//find the permissions that the client is missing.
		let missingPerms = reqPermissions.filter(perm => !(guild.members.get(client.user.id).permissions.toArray()).includes(perm))
		//override if the user has administrative permissions
		if ((guild.members.get(client.user.id).permissions.toArray()).includes("ADMINISTRATOR")) { missingPerms = [] }
		//if there are any missing perms...
		if (missingPerms.length >= 1) {
			//notify the bot owner as well as guild admins to the missing permissions.
			client.log(`bot is missing permisions : ${missingPerms.toString()} in guild ${guild.name}`, "ERROR")
			//send a message to the guild to request the missing permissions.
			guild.channels.get(guildData.modActionChan) || guild.channels.filter(chan => chan.type === "text").values().next().value
				.send(`I am missing permissions : ${missingPerms.toString()}!`)
		}
		//check attachments, and remove those that have expired.
		let attachments = client.DB.get(guild.id, "persistence.attachments")
		client.log(`Verifying Persistence data for guild ${guild.name}`)
		//for every attachment...
		Object.keys(attachments).forEach(key => {
			//if the attachment has expired
			if (attachments[key].expiry < new Date()) {
				//delete the attachment
				client.DB.delete(guild.id, `persistence.attachments.${key}`)
			}
		})
		//check any persistent messages for expiary
		let messages = client.DB.get(guild.id, "persistence.messages")
		//for every message...
		Object.keys(messages).forEach(key => {
			//get the 'key' of the message  - guildID:channelID:messageID
			let messageKey = messages[key].key
			client.guilds.get(guild.id).channels.get(messageKey.split(":")[0].toString()).fetchMessage(messageKey.split(":").toString()[1]).catch(err => {
				//error only if the message is no longer reachable - eg deleted - therefore remove from DB.
				client.DB.remove(guild.id, `persistence.messages.${key}`)
			})
		})
		//manually trigger the scheduler every 300 seconds to check this guild
		setInterval(() => { client.emit("scheduler", guild.id) }, 300000, client, guild)
		// start the scheduler for this guild
		client.emit("scheduler", guild.id)
	};

	/**
	 * custom logging system - uses optional tags as well as stack tracing to determine caller locations for ease of access.
	 * 4 'levels' - untagged - ignored if not in debug mode
	 * INFO - information, always displayed
	 * WARN - warning, always displayed
	 * ERROR - Error - something has gone wrong. always displayed.
	 * helpful as it allows the owner to differentiate types of information easily.
	 */
	client.log = (message, type) => {
		//using stacktrace to locate caller code/function. useful for determining exactly where information came from.
		let caller = ((new Error).stack).split(" at ")[2].trim().replace(client.basedir, ".")
		//message - comprised of the type and stringified message, as well as the caller.
		//each type/flag gets different 'treatment'
		if (!type) type = "DEBUG"
		//formats the message with some addition info.
		let msg = `[${type}] ${(JSON.stringify(message)).replace(/"/g, "")}〘${caller}〙`
		switch (type) {
			case "ERROR":
				console.error(msg);
				break;
			case "WARN":
				console.warn(msg);
				break;
			case "INFO":
				console.log(msg)
				break;
			case "DEBUG":
				if (!client.debug) break
				console.log(msg)
				break
			default:
				console.log(`Invalid logging type! ${msg}`)
		}
	}

	/**
	 * given a command name as well as context (eg guild/channel) from the message object, determines
	 * whether or not the given user can execute the command they are requesting to execute.
	 */
	client.canExecute = (client, message, cmdName) => { //check if a user can execute a command or not
		//gets the current guilds configuration from the message via the non-standard settings attribute - added in message.js
		let cmdCfg = message.settings.commands[cmdName]
		//checks lots of conditions to determine if the user can execute a command - reports what 'stage' they fail at, if any.
		//if the command doesn't exist, fail with error 'nonexistant'
		if (!cmdName) {
			return "nonexistant"
		}
		//if the user is the owner, pass.
		if (message.author.id === client.config.ownerID) {
			return "passed"
		}
		//if the command is disabled on a guild-wide basis, fail with 'disabled'
		else if (!cmdCfg.enabled) {
			return "disabled"
		}
		//if the user is in the guild's blacklist for the command, fail with 'blacklist'
		else if (Object.keys(client.DB.ensure(message.guild.id, [], `blacklist.${cmdName}`)).includes(message.member.id)) {
			return "blacklist"
		}
		//if the user isn't the owner and doesn;t have the correct permissions required by the command - fail with 'perms'
		else if (cmdCfg.permReq.includes("BOT_OWNER") || !message.member.permissions.has(cmdCfg.permReq, true)) {
			return "perms"
		}
		//if the array allowedChannels has 1+ entries, and it doesn't include the current channel, fail with 'channel'
		else if (!((cmdCfg.allowedChannels.length === 0) ? true : (!cmdCfg.allowedChannels.includes(message.channel.id)))) {
			return "channel"
		}
		//if the user is in the commands cooldown period, fail with 'cooldown'
		else if (client.cooldown.get(message.guild.id, cmdName).filter(u => u === message.member.id).length) {
			return "cooldown"
		} else {
			//if they didn't fail any checks, pass.
			return "passed"
		}
	}
	/**
	 * loads a specified command to a specified guild. if no guild is specified, loads the command for all guilds.
	 * @param {string} command - the name of the command (true, no aliases)
	 * @param {string} guildid - optional. ID of the guild to load the command for.
	 */
	client.loadCommand = (command, guildid) => {
		if (!guildid) {
			//if no guildid is specified, loads the command for all guilds.
			//useful for initialisation of the bot, and for reloading (as these are bot-wide)
			client.guilds.forEach(guild => { client.loadCommand(command, guild.id); });
		}
		//try:catch for any errors.
		try {
			//loads contents of 'command'.js from disk
			var cmdObj = require(`${client.basedir}/commands/${command}.js`);
			//ensures each guild has the configuration data required for the command command.
			client.DB.ensure(guildid, cmdObj.defaultConfig, `commands.${command}`);
			//ensures command's presence in client.cooldown
			client.cooldown.ensure(guildid, [], command)
			//ensures that the aliases for the command are present.
			//for every alias...
			client.DB.get(guildid).commands[command].aliases.forEach(alias => {
				//ensure the alias maps to 'command' in commandsTable
				client.DB.ensure(guildid, command, `commandsTable.${alias}`)
				//log the sucessful binding of each alias.
				client.log(`bound alias ${alias} to command ${command} in guild ${client.guilds.get(guildid).name}`);
			});
		} catch (err) {
			//catch and log any errors
			client.log(`Failed to load command ${command}! : ${err}`, "ERROR")
		}
	};
	/**
	 * wrapper for scheduling events (actions) for a specified guild using the scheduler.
	 * @param {string} guildID - ID of the guild the action belongs to.
	 * @param {object} action - object containg data to be scheduled for execution.
	 */
	client.schedule = async (guildID, action) => {
		//add the action object to the database under persistence.time
		client.DB.push(guildID, action, "persistence.time")
		//invoke scheduler to update the timeout
		client.emit("scheduler", guildID)
	}
	/**
	 * command that resets the in-memory copy of a command with that now on disk. very useful for rapid development.
	 */
	client.reloadCommand = (commandName) => {
		try {
			//deletes the cached version of the command, forcing the next execution to re-load the file into memory.
			delete require.cache[require.resolve(`./commands/${commandName}.js`)];
			//load the command back into memory from disk.
			client.loadCommand(commandName);
		} catch (err) {
			//catch and log any errors
			client.log(`Error in reloading command ${commandName} - \n${err}`, "ERROR");
		}
	};


	//BELOW ARE FROM ANOTHER SOURCE - DO NOT ASSESS
	/**
	 * cleans the content from the eval command to remove potentially dangerous information - eg the token of the bot. general sanitisation.
	 * @param {object} client
	 * @param {any} text - any due to the result from eval potentially being anything.
	 */
	client.evalClean = async (client, text) => {
		//checks if the evaled code is that of a promise, if so, awaits for the promise to resolve before continuing.
		if (text && text.constructor.name == "Promise")
			text = await text;
		if (typeof evaled !== "string")
			//inspects the content so we don't just get [object Object] or the full object via stringify. 
			//this provides a single layer of informantion, eg test:{a:{"b"}} => test:{a:{object}}.
			text = require("util").inspect(text, { depth: 0 });
		//replaces the token with "[BOT_TOKEN]"
		text = text.replace(/@/g, "@").replace(/`/g, "`").replace(client.config.token, "[BOT_TOKEN]");
		return text;
	}; //full disclosure: this code was copied off Etiket2 (another discord bot) as it is undoubtedly the best way to do this.


	/** 
	  * returns a random integer between two numbers (max exclusive, min inclusive.)
	  * @param {int} minimum
	  * @param {int} maximum
	  */
	client.getRandomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		//The maximum is exclusive and the minimum is inclusive
		return Math.floor(Math.random() * (max - min)) + min;
	};
	//everything between the other DO NOT ASSESS notice and this one is from, well, another source and shouldn't be assessed.
	//base object used as a schema for every guilds database entry.
	//used as a template for development as well as for initialising guilds. contains some populated defaults, but mostly just structure.
	client.defaultConfig = {
		prefix: "$",
		adminRoles: [],
		modRoles: [],
		serverOwnerID: 0,
		mutedRole: 0,
		welcomeMsg: "Welcome {{user}} to {{guildName}}!",
		welcomeChan: 0,
		blockedChannels: [],
		modActionChan: 0,
		modReportingChan: 0,
		auditLogChan: 0,
		modules: {},
		commands: {},
		users: {},
		persistence: {
			messages: {},
			attachments: {},
			time: [],
		},
		blacklist: {}
	};

};