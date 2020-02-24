/** contains functions that are bound to the client object at startup. DO NOT EDIT (pls) */
const fs = require("fs");
const basedir = process.cwd();
/**
 * @exports init 
 * @exports validateGuild
 * @exports log
 * @exports loadCommand
 * @exports reloadCommand
 * @exports getGuildSettings
 * @exports writeSettings
 * @exports getStatus
 * @exports checkBlacklist
 * @exports getLevel
 * @exports evalClean
 * @exports checkThrottle
 * @exports dStats **LEGACY - Temp ** 
 * @exports getRandomInt
 */
module.exports = (client) => {
	client.trecent = new Object;
	client.cooldown = new Set();
	client.timeouts = new Map()
	/** initalisation routine for the client,
	 *  it ensures all database data needed is present, sets the RPC status.
	 *  called after the D.JS client emits 'ready' */
	client.init = (client) => {

		client.DB.deleteAll();//Temp !!!ENSURE THIS IS REMOVED!!!
		client.channels.forEach(channel => {
			if (channel.type == "category)") {
				channel.children.forEach(child => {
					child.fetchMessages({ limit: 100 }).then(c => { return })
				})
			} else if (channel.type == "text") {
				channel.fetchMessages({ limit: 100 }).then(c => { return })
			}
		});
		if (client.guilds.size == 0) {
			throw new Error("No Guilds Detected! Please check your token. aborting Init.");
		}
		if (!client.user.bot) {
			throw new Error("Warning: Using Bots on a user account is (for the most part) forbidden by Discord Tos. Please Verify your token!");
		}
		var game = client.config.status.replace("{{guilds}}", client.guilds.size).replace("{{version}}", client.version);
		client.user.setPresence({ game: { name: game, type: "PLAYING" }, status: "active" });
		const eventFiles = fs.readdirSync("./events/");
		client.log(`Loading ${eventFiles.length} events from ${basedir}/events/`);
		eventFiles.forEach(eventFile => {
			if (!eventFile.endsWith(".js")) return;
			const eventName = eventFile.split(".")[0];
			client.log(`attempting to load event ${eventName}`)
			const eventObj = require(`./events/${eventFile}`);
			client.on(eventName, eventObj.bind(null, client));
			client.log(`Bound ${eventName} to Client Sucessfully!`);
			delete require.cache[require.resolve(`./events/${eventFile}`)];
		});
		client.guilds.forEach(guild => {//iterates over each guild that the bot has access to and ensures they are present in the database
			client.validateGuild(client, guild);
		});
		console.timeEnd("init");
		console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
		(client.users.get(client.config.ownerID)).send(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
	}
	/**
	 * validates a Guilds's configuration properties and database 'Presence'. called at startup and when a new guild is created
	 * @param  client 
	 * @param  guild 
	 */
	client.validateGuild = (client, guild) => { //validates the DB entry for a guild
		var adminRdict = ["Admin", "Administrator"]; //Temp
		var modRdict = ["Mod", "Moderator"]; //Temp
		var mutedRdict = ["Muted", "Mute"]; //Temp
		let reqPermissions = ["SEND_MESSAGE", "READ_MESSAGES", "MANAGE_MESSAGES", "VIEW_CHANNEL"]
		client.commands.ensure(guild.id, new Object);
		client.trecent[guild.id] = new Set();
		client.DB.ensure(guild.id, client.defaultConfig);//ensures each server exists within the DB.(in the odd chance the guildCreate event fails/doesn't trigger correctly)
		guild.members.forEach(member => { //ensures each server has all it's users initialised correctly
			client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
		});
		client.log(`Sucessfully Verified/initialised Guild ${guild.name} to DB`, "INFO");
		client.DB.set(guild.id, guild.owner.user.id, "serverOwnerID");
		guild.roles.forEach(role => { //figure out a better way of doing this! (dynamic eval?)
			client.log(`Testing role with name ${role.name} for Admin/Mod/Muted availability.`, "INFO");
			if (adminRdict.includes(role.name)) { client.DB.push(guild.id, role.id, "adminRoles"); }
			if (modRdict.includes(role.name)) { client.DB.push(guild.id, role.id, "modRoles"); }
			if (mutedRdict.includes(role.name)) { client.DB.set(guild.id, role.id, "mutedRole"); }
		});
		const commandFiles = fs.readdirSync("./commands/");
		client.log(`Loading ${commandFiles.length} events from ${basedir}/commands/`, "INFO");
		commandFiles.forEach(command => {
			if (!command.endsWith(".js")) return;
			var command = command.split(".")[0]; // eslint-disable-line no-redeclare 
			client.loadCommand(command, guild.id);
		});
		//check module permission requirements
		var guildData = client.DB.get(guild.id)
		Object.keys(guildData.modules).forEach(key => {
			console.log(key)
			let
				Module = guildData.modules[key]
			if (!Module.defaultConfig) return;
			Module.defaultConfig.requiredPermissions.forEach(perm => {
				if (!reqPermissions.has(perm)) { reqPermissions.push(perm) }
			})
		})
		guildData.persistence.messages.forEach(message => {
			client.guilds.get(guild.id).channels.get(message.split(":")[0].toString()).fetchMessage(message.split(":").toString()[1]).catch(err => {
				guildData.persistence.messages.remove(message)
			})
		})
		client.emit("scheduler")
	};
	client.log = (message, type) => {
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
	};

	client.loadCommand = (command, guildid) => { //loads either a specified command for a guild or loads a command for *all* guilds. 
		if (!guildid) {
			client.guilds.forEach(guild => { client.loadCommand(command, guild.id); }); //if no guildid is specified, loads the command for all guilds.
		}
		try {
			var cmdObj = require(`${process.cwd()}/commands/${command}.js`);
			client.DB.ensure(guildid, cmdObj.defaultConfig, `commands.${command}`); //ensures each guild has the configuration data required for each command.
			var cmdAliases = [];
			client.DB.get(guildid).commands[command].aliases.forEach(alias => {
				cmdAliases.push(alias);
				client.log(`bound alias ${alias} to command ${command} in guild ${client.guilds.get(guildid).name}`, "INFO");
			});
			client.commands.ensure(guildid, cmdAliases, command);
		} catch (err) {
			client.log(`Failed to load command ${command}! : ${err}`, "ERROR")
		}
	};

	client.raiseModError = (message, guildID) => {
		var config = client.getGuildSettings(guildID)
		if (config.modReportingChannel) {
			client.getChannel(config.modReportingChannel).then(channel => {
				channel.send(message)
			})
		}

	}

	client.reloadCommand = (commandName) => {
		try {
			delete require.cache[require.resolve(`${basedir}/${commandName}.js`)]; //deletes the cached version of the comand, forcing the next execution to re-load the file into memory.
			client.loadCommand(commandName); //reload the command fully just to be sure.
		} catch (err) {
			client.log(`Error in reloading command ${commandName} - \n${err}`, "ERROR");
		}
	};

	client.writeSettings = (guildID, settings) => {
		client.DB.set(guildID, settings); //"messy" write, TODO: change to element specific write rather than rewriting the *entire* DB
	};
	client.attHandler = async (client, message) => {
		//move the code from the message handler into here, use the performant caching to go faaassstt
	};

	client.evalClean = async (client, text) => { //cleans output of the eval command, to prevent the token and other chars from causing issues.
		if (text && text.constructor.name == "Promise") //checks if the evaled code is that of a promise, if so, awaits for the code to execute and for the promise to be reoslve before continuing execution.
			text = await text;
		if (typeof evaled !== "string")
			text = require("util").inspect(text, { depth: 0 });
		text = text.replace(/@/g, "@").replace(/`/g, "`").replace(require("./config.js").token, "[BOT_TOKEN]");
		return text;
	}; //full disclosure: this code was copied off Etiket2 (another discord bot) as it is undoubtedly the best way to do this.

	client.checkThrottle = (client, message) => {
		if (!message.guild) { return false; } //false, not throttled. true, throttled.
		let mobj = `{${message.guild.id}:${message.author.id}}`;
		var user = client.DB.get(message.guild.id, `users.${message.author.id}`);
		var trecent = client.trecent[`${message.guild.id}`];
		var interval = message.settings.modules.autoMod.interval;
		var mutecap = message.settings.modules.autoMod.mutecap;
		setTimeout(() => { trecent.splice(trecent[trecent.indexOf(mobj)], 1); }, interval);
		if ((trecent.filter(value => value == mobj)).length >= mutecap) { //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
			trecent = trecent.filter(value => value != mobj); //wipes array after a strike has been added.
			if (!user.strikes) {
				user.strikes = [];
			}
			user.strikes.push(new Date());
			message.channel.send(`${message.author} has had a strike added!`);
			//penalise the user!
		} else {
			trecent.push(mobj);
		}
	};

	client.checkPermissions = (client, message, command) => {

	}

	/** returns a random integer between two numbers (max exclusive, min inclusive.)
	  * @param {int} minimum
	  * @param {int} maximum
	  */
	client.getRandomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	};

	client.defaultConfig = { //default config for all servers, applied at guild 'creation' or at runtime if something's gone horribly wrong. mainly used as a template for development.
		commands: {
			"help": {
				aliases: ["commands"],
				guildOnly: true,
				enabled: true,
				permLevel: 1,
				cooldown: 1000,
				allowedChannels: [],
			},
		},
		prefix: "$",
		mutedRole: 0,
		welcomeMsg: "Welcome {{user}} to {{guild.name}}!",
		welcomeChan: 0,
		modRoles: [],
		adminRoles: [],
		serverOwnerID: 0,
		blockedChannels: [],
		modActionChannel: 0,
		modReportingChannel: 0,
		auditLogChannel: 0,
		modules: {
			autoMod: {
				enabled: true,
				bannedWords: [],
				excludedRoles: [],
				percentCapsLimit: 0,
				floodPercentLimit: 0,
				decay: 30000,
				antiSpam: {
					enabled: true,
					interval: 2000,
					count: 2,
					penalty: 1,
				},
				penalties: {
					repeatOffenceMultiplier: 2,
					repeatOffenceTimeout: 10000
				},
				punishments: {
					5: "mute",
					10: "tempBan",
					15: "ban",
				},
				antiMention: {
					enabled: true,
					protectedIDs: [],
					penalty: 5,
				}
			},


		},

		persistence: {
			messages: [], //channelid:messageid
			time: [],
		},
		blacklist: [],
		users: {},
	};

};