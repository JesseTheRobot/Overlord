exports.run = (client, message, args) => {
	function objIterate(object, stackStr) {
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				if (typeof object[property] == "object") {
					objIterate(object[property], `${stackStr}.${property}`);
				} else {
					console.log(`${stackStr}.${property}`);
				}
			}
		}
	}
	try { //key/path based iteration for the help command
		//var keys = new Map(Object.entries(client.getGuildSettings(message.guild).config)).keys();
		//var keys = Object.entries(client.getGuildSettings(message.guild).config);
		var config = client.getGuildSettings(message.guild).config;
		console.log(objIterate(config));

	} catch (err) { console.log(err); }

};
exports.defaultConfig = {
	aliases: ["help", "commands"],
	guildOnly: true,
	enabled: true,
	permReq: [],
	cooldown: 1000,
	allowedChannels: [],
};