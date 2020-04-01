exports.run = (client, message, args) => {
	//set|get|restore module|command path.to.key [value]
	data = client.DB.get("message.guild.id")

	switch (args[1]) {
		case "set":


		case "get":


		case "restore":

	}

}

	/* cmd keyMap:
	aliases: array:string
	enabled: bool
	permReq: array:permissions
	cooldown: int
	allowedChannels: array:ids
	*/


};
exports.defaultConfig = {
	aliases: ["config"],
	enabled: true,
	permReq: ["ADMINISTRATOR"],
	cooldown: 1000,
	allowedChannels: [],
	exmaple: "set|get|restore module|command   "
};

/*function objIterate(object, stackStr) {
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

	}*/