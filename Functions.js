/** contains functions that are bound to the client object at startup. DO NOT EDIT (pls) */
const fs = require("fs");
/**
 * @exports init 
 * @exports validateGuild
 * @exports log
 * @exports loadCommand
 * @exports evalClean
 * @exports checkThrottle
 * @exports dStats **LEGACY - Temp ** 
 * @exports getRandomInt
 */
module.exports = (client) => {
	client.timeouts = new Map();
	client.basedir = process.cwd();
	/** initalisation routine for the client,
	 *  it ensures all database data needed is present, sets the RPC status.
	 *  called after the D.JS client emits 'ready' */
	client.init = (client) => {
		client.log(`client logging in as ${client.user.tag}`, "INFO")
		client.DB.deleteAll();//Temp !!!ENSURE THIS IS REMOVED!!!

		if (client.guilds.size == 0) {
			throw new Error("No Guilds Detected! Please check your token. aborting Init.");
		}
		if (!client.user.bot) {
			throw new Error("Warning: Using Bots on a user account is (for the most part) forbidden by Discord ToS. Please Verify your token!");
		}
		if (client.config.preLoad) {  //if preloading is enabled, iterate over every channel and load messages into bot message cache.
			client.channels.forEach(channel => {
				if (channel.type === "category)") {
					channel.children.forEach(child => {
						child.fetchMessages({ limit: 100 }).then(c => { return })
					})
				} else if (channel.type === "text") {
					channel.fetchMessages({ limit: 100 }).then(c => { return })
				}
			});
		}
		var game = client.config.status.replace("{{guilds}}", client.guilds.size).replace("{{version}}", client.version);
		client.user.setPresence({ game: { name: game, type: "PLAYING" }, status: "active" });
		const eventFiles = fs.readdirSync("./events/");
		client.log(`Loading ${eventFiles.length} events from ${client.basedir}/events/`);
		eventFiles.forEach(eventFile => {
			if (!eventFile.endsWith(".js")) return;
			const eventName = eventFile.split(".")[0];
			client.log(`attempting to load event ${eventName}`)
			const eventObj = require(`./events/${eventFile}`);
			client.on(eventName, eventObj.bind(null, client));
			if (eventObj.defaultConfig) {
				client.guilds.forEach(guild => {
					client.DB.ensure(guild.id, eventObj.defaultConfig, `modules.${eventFile.split(".")[0]}`)
				})
			}
			client.log(`Bound ${eventName} to Client Sucessfully!`);
			delete require.cache[require.resolve(`./events/${eventFile}`)];

		});
		client.guilds.forEach(guild => {//iterates over each guild that the bot has access to and ensures they are present in the database
			client.validateGuild(client, guild);
		});
		fs.readdir("./cache/", (err, files) => {
			if (err) throw err;
			client.log(`Deleting ${files.length} files from cache...`)
			for (const file of files) {
				fs.unlink(("./cache/" + file), err => {
					if (err) throw err;
				})
			}
		})
		console.timeEnd("init");
		client.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`, "INFO");
		try {
			(client.users.get(client.config.ownerID)).send(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
		} catch (err) {
			client.log("I'm not in the guild with the owner - unable to send bootup notification!", "INFO")
		}
	}
	// validates a Guilds's configuration properties and database 'Presence'. called at startup and when a new guild is created
	client.validateGuild = (client, guild) => { //validates the DB entry for a guild
		client.DB.set(guild.id, "693427599015411712", "modActionChannel")
		client.DB.set(guild.id, "693427576965824582", "auditLogChannel")
		client.DB.set(guild.id, "693427641604374598", "modReportingChannel")

		var adminRdict = ["Admin", "Administrator"]; //Temp
		var modRdict = ["Mod", "Moderator"]; //Temp
		var mutedRdict = ["Muted", "Mute"]; //Temp
		guild.roles.forEach(role => { //figure out a better way of doing this! (dynamic eval?)
			client.log(`Testing role with name ${role.name} for Admin/Mod/Muted availability.`);
			if (adminRdict.includes(role.name)) { client.DB.push(guild.id, role.id, "adminRoles"); }
			if (modRdict.includes(role.name)) { client.DB.push(guild.id, role.id, "modRoles"); }
			if (mutedRdict.includes(role.name)) { client.DB.set(guild.id, role.id, "mutedRole"); }
		});
		client.trecent.ensure(guild.id, {})
		client.cooldown.ensure(guild.id, {})
		client.DB.ensure(guild.id, client.defaultConfig);//ensures each server exists within the DB.(in the odd chance the guildCreate event fails/doesn't trigger correctly)
		guild.members.forEach(member => { //ensures each server has all it's users initialised correctly
			client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
		});
		client.log(`Sucessfully Verified/initialised Guild ${guild.name} to DB`);
		client.DB.set(guild.id, guild.owner.user.id, "serverOwnerID");

		//load commands w/ config into guild config
		const commandFiles = fs.readdirSync("./commands/");
		client.log(`Loading ${commandFiles.length} events from ${client.basedir}/commands/`);
		commandFiles.forEach(command => {
			if (!command.endsWith(".js")) return;
			var command = command.split(".")[0]; // eslint-disable-line no-redeclare 
			client.loadCommand(command, guild.id);
		});
		//check module permission requirements to determine the permissions required by the bot.
		var guildData = client.DB.get(guild.id)
		let reqPermissions = ["SEND_MESSAGES", "READ_MESSAGES", "MANAGE_MESSAGES", "VIEW_CHANNEL", "MANAGE_GUILD"]
		Object.keys(guildData.modules).forEach(key => {
			let Module = guildData.modules[key]
			if (!Module.requiredPermissions) return;
			Module.requiredPermissions.forEach(perm => {
				if (!reqPermissions.includes(perm)) { reqPermissions.push(perm) }
			})
		});
		client.log(`Requested permissions for server ${guild.name} : ${reqPermissions.toString()}`)
		let missingPerms = reqPermissions.filter(perm => !(guild.members.get(client.user.id).permissions.toArray()).includes(perm))
		if ((guild.members.get(client.user.id).permissions.toArray()).includes("ADMINISTRATOR")) { missingPerms = [] }
		if (missingPerms.length >= 1) {
			client.log(`bot is missing permisions : ${missingPerms.toString()} in guild ${guild.name}`, "ERROR")
			guild.channels.get(guildData.modActionChannel).send(`I am missing permisions : ${missingPerms.toString()}!`)
		}
		let attachments = client.DB.get(guild.id, "persistence.attachments")
		client.log(`Verifying Persistence data for guild ${guild.name}`)
		Object.keys(attachments).forEach(key => {
			let entry = attachments[key]
			if (entry.expiry < new Date()) {
				client.DB.delete(guild.id, `persistence.attachments.${key}`)
			}
		})
		let messages = client.DB.get(guild.id, "persistence.messages")
		Object.keys(messages).forEach(key => {
			let messageKey = messages[key].key
			client.guilds.get(guild.id).channels.get(messageKey.split(":")[0].toString()).fetchMessage(messageKey.split(":").toString()[1]).catch(err => {
				client.DB.remove(guild.id, `persistence.messages.${key}`)
			})
		})
		client.emit("scheduler", guild.id)
	};
	client.log = (message, type) => {
		//info, warn, debug
		let caller = ((new Error).stack).split(" at ")[2].trim().replace(client.basedir, ".")
		let msg = `[${type}] ${(JSON.stringify(message)).replace(/\"/g, "")}「${caller}」`
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
			default:
				if (!client.debug) break
				console.log(msg)
		}
	};
	client.canExecute = (client, message, cmdName) => { //check if a user can execute a command or not
		let cmdCfg = message.settings.commands[cmdName]
		if (message.author.id === client.config.ownerID) {
			return "passed"
		}
		if (!cmdName) { //had to use a set of ifs to evaluate and also report on what area the denial occured for user feedback.
			return "nonexistant"
		}
		else if (!cmdCfg.enabled) { //check the command is enabled (guild-wide)
			return "disabled"
		}
		else if (cmdCfg.permReq.includes("BOT_OWNER") || !message.member.permissions.has(cmdCfg.permReq, true)) {
			return "perms"
		}
		else if (!((cmdCfg.allowedChannels.length === 0) ? true : (cmdCfg.allowedChannels.includes(message.channel.id)))) {
			return "channel"
		}
		else if (client.cooldown.get(message.guild.id, cmdName).filter(u => u === message.member.id).length) {
			return "cooldown"
		}
		else if (Object.keys(client.DB.ensure(message.guild.id, [], `blacklist.${cmdName}`)).includes(message.member.id)) {
			return "blacklist"
		} else {
			return "passed"
		}
	}

	client.loadCommand = (command, guildid) => { //loads either a specified command for a guild or loads a command for *all* guilds. 
		if (!guildid) {
			client.guilds.forEach(guild => { client.loadCommand(command, guild.id); }); //if no guildid is specified, loads the command for all guilds.
		}
		try {
			var cmdObj = require(`${process.cwd()}/commands/${command}.js`);
			client.DB.ensure(guildid, cmdObj.defaultConfig, `commands.${command}`); //ensures each guild has the configuration data required for each command.
			client.cooldown.ensure(guildid, [], command)
			client.DB.get(guildid).commands[command].aliases.forEach(alias => {
				client.DB.ensure(guildid, command, `commandsTable.${alias}`)
				client.log(`bound alias ${alias} to command ${command} in guild ${client.guilds.get(guildid).name}`);
			});
		} catch (err) {
			client.log(`Failed to load command ${command}! : ${err}`, "ERROR")
		}
	};
	client.schedule = async (guildID, action) => {
		client.DB.push(guildID, action, "persistence.time")
		client.emit("scheduler", guildID)
	}
	client.reloadCommand = (commandName) => {
		try {
			delete require.cache[require.resolve(`${client.basedir} / ${commandName}.js`)]; //deletes the cached version of the comand, forcing the next execution to re-load the file into memory.
			client.loadCommand(commandName); //reload the command fully just to be sure.
		} catch (err) {
			client.log(`Error in reloading command ${commandName} - \n${err}`, "ERROR");
		}
	};


	//BELOW IS FROM ANOTHER SOURCE - DO NOT ASSESS
	client.evalClean = async (client, text) => { //cleans output of the eval command, to prevent the token and other chars from causing issues.
		if (text && text.constructor.name == "Promise") //checks if the evaled code is that of a promise, if so, awaits for the code to execute and for the promise to be reoslve before continuing execution.
			text = await text;
		if (typeof evaled !== "string")
			text = require("util").inspect(text, { depth: 0 });
		text = text.replace(/@/g, "@").replace(/`/g, "`").replace(require("./config.js").token, "[BOT_TOKEN]");
		return text;
	}; //full disclosure: this code was copied off Etiket2 (another discord bot) as it is undoubtedly the best way to do this.


	/** returns a random integer between two numbers (max exclusive, min inclusive.)
	  * @param {int} minimum
	  * @param {int} maximum
	  */
	client.getRandomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	};

	client.defaultConfig = { //used as a template for development
		commands: {},
		prefix: "$",
		mutedRole: 0,
		welcomeMsg: "Welcome {{user}} to {{guildName}}!",
		welcomeChan: 0,
		modRoles: [],
		adminRoles: [],
		serverOwnerID: 0,
		blockedChannels: [],
		modActionChannel: 0,
		modReportingChannel: 0,
		auditLogChannel: 0,
		modules: {},
		persistence: {
			messages: {},
			attachments: {},
			time: [],
		},
		blacklist: {},
		users: {},
	};

};