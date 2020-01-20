exports.run = (client, message, args) => {
	function objIterate(object, stackStr) {
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				if (typeof object[property] == "object") {
					objIterate(object[property], `${stackStr}.${property}`);
				} else {
					console.log(`${stackStr}.${property}`);
					console.log(object.property.prototype.name);
				}
			}
		}
	}
	var keys = client.getGuildSettings(message.guild).config.keys(); //pulls in context guild's configuration keys.
	const protectedKeys = require(`${process.cwd}\\config.js`).protectedKeys;//["serverOwnerID","config","autoMod","antiSpam"];
	objIterate(keys, "config");
	const configOptions = { //key:state/action system. 

	};
	const getKeyType = (client, message, args) => {
		var reqKey = args[1]
		if (!client.getGuildSettings(message.guild).config.keys().has(reqKey)) {
			return; //invalid key
		}

	}
	var defaultConfig = { //default config for all servers, applied at guild 'creation' or at runtime if something's gone horribly wrong. mainly used as a template for development rn.
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
		config: {
			prefix: "$",
			mutedRole: 0,
			welcomeMsg: "Welcome {{user}} to {{guild.name}}!",
			welcomeChan: 0,
			modRoles: [],
			adminRoles: [],
			serverOwnerID: 0,
			allowedChannels: [],
			autoMod: {
				bannedWords: [],
				excludedRoles: [],
				percentCaps: 0,
				floodPercentLimit: 0,
				decay: 30000,
				antiSpam: {
					interval: 2000,
					count: 2,
				},
				penalties: {
					spam: 1,
					bannedWord: 2,
					repeatOffenceMultiplier: 0.1,
					repeatOffenceTimeout: 10000 //in ms
				},
				punishments: {
					5: "mute",
					10: "tempBan",
					15: "ban",
				}
			},
		},
		persistence: {
			messages: {},
			users: {},
		},
		blacklist: {},
		users: {},
	};
};
exports.defaultConfig = {
	aliases: ["config"],
	guildOnly: true,
	enabled: true,
	permLevel: 1,
	cooldown: 1000,
	allowedChannels: [],
};