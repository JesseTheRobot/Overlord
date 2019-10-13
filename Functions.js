/** contains functiosn that are bound to the client object at startup. DO NOT EDIT (pls) */
const fs = require("fs");
const basedir = process.cwd();
const version = "0.1.9"; //release.major.minor
/**
 * @exports init 
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
 * @exports dStats **LEGACY** 
 * @exports getRandomInt
 */
module.exports = (client) => {
	client.trecent = new Object;
	client.cooldown = new Set();
	client.counters = [];
	client.dStats = new Object();
	var adminRdict = ["Admin","Administrator"]; //Temp
	var modRdict =["Mod","Moderator"]; //Temp
	var mutedRdict =["Muted","Mute"]; //Temp
	/** initalisation routine for the client, it ensures all database data needed is present, sets the RPC status. called afte the DJS client emits 'ready' */
	client.init = (client) =>{
		client.dStats.increment("overlord.init");
		client.DB.deleteAll();// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!REMOVE THIS IN PRODUCTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		console.time("init");
		/** removes the operation locking file to allow the bot to accept incoming commands */
		fs.unlink(`${basedir}\\SHUTDOWN.txt`, err => {
			if (err) client.log("Log","Shutdown operation locking file does not exist - expected.","LFensureRem");
		});
		// iterates over each guild that the bot has access to (all the guilds it's invited to) 
		client.guilds.forEach(guild=>{
			client.commands.ensure(guild.id,new Object);
			client.trecent[`${guild.id}`] = new Set();
			client.DB.ensure(guild.id,client.defaultConfig);//ensures each server exists within the DB.(in the odd chance the guildCreate event fails/doesn't trigger correctly)
			guild.members.forEach(member =>{ //ensures each server has all it's users initialised correctly :D
				client.DB.ensure(guild.id,{xp: 0,},`users.${member.id}`);
			});
			client.log("Log",`Sucessfully Verified/initialised Guild ${guild.name} to DB`);
			client.DB.set(guild.id,guild.owner.user.id,"config.serverOwnerID");
			guild.roles.forEach(role =>{ //figure out a better way of doing this! (dynamic eval?)
				client.log("Log",`Testing role with name ${role.name} for Admin/Mod/Muted availability.`,"InitPermRoles");
				if (adminRdict.includes(role.name)){client.DB.push(guild.id,role.id,"config.adminRoles");}
				if (modRdict.includes(role.name)){client.DB.push(guild.id,role.id,"config.modRoles");}
				if (mutedRdict.includes(role.name)){client.DB.set(guild.id,role.id,"config.mutedRole");}
			});
		});
		console.log(`!== Overlord v ${version} Intialisation starting. current date/time is ${new Date()} ==! `);
		client.user.setPresence({
			game: { 
				name: `@ me for Prefix! | (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧🛠💜🦄Being Built!🦄💜🛠✧ﾟ･: *ヽ(◕ヮ◕ヽ) (v${version}) now on ${client.guilds.size} servers!`,
				type: "PLAYING"
			},
			status: "active"
		});

		const eventFiles = fs.readdirSync("./events/");
		client.log("log", `Loading ${eventFiles.length} events from ${process.cwd()}/events/`,"EventInit");
		eventFiles.forEach(eventFile => {
			if (!eventFile.endsWith(".js")) return;
			const eventName = eventFile.split(".")[0];
			const eventObj = require(`./events/${eventFile}`);
			client.on(eventName, eventObj.bind(null, client));
			client.log("Log",`Bound ${eventName} to Client Sucessfully!`,"EventBind");
		});

		const commandFiles = fs.readdirSync("./commands/");
		client.log("Log",`Loading ${commandFiles.length} events from ${process.cwd()}/commands/`,"CommandInit");
		commandFiles.forEach(command =>{
			if (!command.endsWith(".js")) return;
			var command = command.split(".")[0]; // eslint-disable-line no-redeclare 
			client.guilds.forEach(guild =>{//iterates over per-guild command aliases and adds them to the commands collection
				client.loadCommand(command, guild.id);
			});
		});
		console.timeEnd("init");
		console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
		var ownerID = (require("./config.js")).ownerID;
		(client.users.get(ownerID)).send(`Overlord Start up completed! current server time is ${new Date()} - Now Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
	};

	client.log =(type,message,title) =>{
		if (!title){
			try{
				title = `『Function: ${client.log.caller.name}』`;
			}catch(err){
				title = "";
			}
		}
		if (!type) type = "Log";
		console.log(`[${type}] ${title} ${JSON.stringify(message)}`);
	};

	client.loadCommand = (command,guildid) =>{ //loads either a specified command for a guild or loads a command for *all* guilds. 
		client.log("Log",`Loading ${command} from ${process.cwd()}/commands/`,"CommandInit");
		try{
			var cmdObj = require(`${process.cwd()}/commands/${command}.js`);
			return cmdObj;
		}catch(err){
			client.log("Error",`Error in loading command ${command} from ${process.cwd()}/commands/ - \n${err}`);
			return "failed";
		}
		function loadCmd (command,guildid){
			client.DB.ensure(guildid,cmdObj.defaultConfig,`commands.${command}`); //ensures each guild has the configuration data required for each command.
			var cmdAliases = [];
			client.DB.get(guildid).commands[command].aliases.forEach(alias =>{
				cmdAliases.push(alias);
				client.log("Log",`bound alias ${alias} to command ${command} in guild ${client.guilds.get(guildid).name}`,"CommandBind");
			});
			client.commands.ensure(guildid,cmdAliases,command);
			if(!guildid){ client.guilds.forEach(guild =>{loadCmd(command,guild.id);});
			}else{loadCmd(command,guildid);}}

	};
	
	client.reloadCommand = (commandName) =>{
		try{
			delete require.cache[require.resolve(`${basedir}/${commandName}.js`)]; //deletes the cached version of the comand, forcing the next execution to re-load the file into memory.
			client.loadCommand(commandName); //reload the command fully just to be sure.
		}catch(err){
			client.log("Error",`Error in reloading command ${commandName} - \n${err}`);
		}
	};

	client.getGuildSettings =(guild) =>{
		try{
			var gcfg =client.DB.get(guild.id);
		}catch(err){
			var gcfg = client.defaultConfig; //eslint-disable-line no-redeclare 
		}
		return (gcfg);
	};

	client.writeSettings =(guildID,settings) =>{
		client.DB.set(guildID,settings); //"messy" write, TODO: change to element specific write rather than rewriting the *entire* DB
	};

	client.getStatus = (client,message,command) =>{ //validate any restrictions for the user using a command/sending a message.
		//restriction types: Invalid channel (strict/superStrict mode), blacklisted, rate limited, incorrect level, muted role,
		//.... bl, ic, rl, muted,level
		command = command.toLowerCase();
		var cmdObj; //checks if the command sent is actually valid or not.
		var guildCommands = client.commands.get(message.guild.id);
		for (var cmdarr in guildCommands ) {
			if (guildCommands.hasOwnProperty(cmdarr)) { 
				console.log(cmdarr);
				if (!client.commands.includes(command)){ //checks if the command has been loaded into the client. if not, tries to load it. if it fails, the command does not exist.
					var cmdLoader = client.loadCommand(command,message.guild.id);
					if( cmdLoader== "failed"){ //"failed" is only returned if, well, the command cannot be loaded in the guild for any reason.
					//attempt load of a custom command here 
						message.channel.send({embed:{
							title: "Command Error",
							fields: [{
								name:` the Command ${command} Does not exist`,
								value:`for help, use the ${client.getGuildSettings(message.guild).config.prefix}help command.`
							}],
							timestamp: new Date(),
						}});
					}else{
						cmdObj = cmdLoader;
					}
				}
			}
		}

		
		//check command's required permLevel.	
		

		//stage 1: check for blacklist.
		
	};
	client.checkBlacklist = (client,message) =>{
		
	};
		
	client.getLevel = (client,message) =>{//gets the permission integer for the user: 1, base user. 2, moderator, 3 Server admin. 4 bot owner
		const config = require(`${basedir}\\config.js`);
		let permlvl = 0;
		const permLvls = config.permissionLevels;
		while (permLvls.length) {
			const currentLevel = permLvls.shift(); //shifts the array, removing the first value.
			if (message.guild && currentLevel.guild) continue;
			if (currentLevel.check(client, message)) {
				permlvl = currentLevel.level;
				break;
			}
		}
		return permlvl;
	};

	client.evalClean = async (client, text) => { //cleans output of the eval command, to prevent the token and other chars from causing issues.
		if (text && text.constructor.name == "Promise") //checks if the evaled code is that of a promise, if so, awaits for the code to execute and for the promise to be reoslve before continuing execution.
			text = await text;
		if (typeof evaled !== "string")
			text = require("util").inspect(text, {depth: 0});
		text = text.replace(/@/g, "@").replace(/`/g, "`").replace(require("./config.js").token, "[BOT_TOKEN]");
		return text;
	}; //full disclosure: this code was copied off Etiket2 (another discord bot) as it is undoubtedly the best way to do this.

	client.checkThrottle = (client,message) =>{
		if(!message.guild){return false;} //false, not throttled. true, throttled.
		let mobj = `{${message.guild.id}:${message.author.id}}`;
		var user = client.DB.get(message.guild.id,`users.${message.author.id}`);
		var trecent = client.trecent[`${message.guild.id}`];
		var gcfg = client.getGuildSettings(message.guild.id);
		var interval = gcfg.config.autoMod.interval;
		var mutecap = gcfg.config.autoMod.mutecap;
		setTimeout(() => {trecent.splice(trecent[trecent.indexOf(mobj)],1);}, interval);
		if ((trecent.filter(value => value == mobj)).length >= mutecap){ //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
			trecent =trecent.filter(value => value != mobj); //wipes array after a strike has been added.
			if (!user.strikes){
				user.strikes = [];
			}
			user.strikes.push(new Date());
			message.channel.send(`${message.author} has had a strike added!`);
			//penalise the user!
		}else{
			trecent.push(mobj);
		}
		

		}
	};

	client.dStats.increment =(counter) =>{ //"fake"DStats Implimentation 
		client.counters.push(counter);
	};	
	/** returns a random integer between two numbers (max exclusive, min inclusive.)
 	* @param {int} minimum
 	* @param {int} maximum
 	*/
	client.getRandomInt =(min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	};

	/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
	* used an operation 'locking' file (SHUTDOWN.txt) that if present prevents any new commands from being executed. 
 	* also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 	*/
	client.gracefulShutdown = () =>{
		fs.writeFile(`${basedir}\\SHUTDOWN.txt`, "SHUTDOWN",{ flag: "w" }, function(err){
			if (err) console.log(err);
			console.log("Successfully Written Shutdown File.");
		});
		setImmediate(() => {// goodnight, sweet prince.
			process.exit(0);
		});

	};

	process
		.on("SIGINT", function() { //unix SIGINT graceful PM2 app shutdown.
			client.gracefulShutdown();
		})
		.on("message", (msg) => {//Windows "message" graceful PM2 app shutdown. 
			if (msg == "shutdown") {
				client.gracefulShutdown();
			}
		});

	client.defaultConfig ={ //default config for all servers, applied at guild 'creation' or at runtime if something's gone horribly wrong. mainly used as a template for development rn.
		commands:{
			"help":{ 
				aliases: ["commands"],
				guildOnly: true,
				enabled: true, 
				permLevel: 1, 
				cooldown: 1000, 
				allowedChannels: [],
			},
		},
		config:{
			prefix: "$",
			mutedRole: 0, 
			welcomeMsg: "Welcome {{user}} to {{guild.name}}!", 
			welcomeChan: 0, 
			modRoles: [], 
			adminRoles: [], 
			serverOwnerID: 0,
			allowedChannels: [],
			
			autoMod:{
				bannedWords: [], 
				excludedRoles: [],
				percentCaps: 0,
				floodPercentLimit: 0, 
				decay: 30000, 
				antiSpam:{
					interval: 2000, 
					count: 2, 
				},
				penalties:{ 
					spam: 1,
					bannedWord: 2,
					repeatOffenceMultiplier: 0.1,
					repeatOffenceTimeout: 10000 
				},
				punishments:{  
					5:"mute",  
					10:"tempBan",
					15:"ban",
				}
			},
		},
		persistence:{
			messages:{},
		},
		blacklist:[],
		users:{},
	};

};