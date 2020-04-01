exports.run = (client, message, args) => {
	if (message.author.id === client.config.ownerID) {
		message.react("✅")
		client.emit("gracefulShutdown")
	} else {
		message.react("🚫")
	}

};
exports.defaultConfig = {
	aliases: ["restart", "reboot"],
	guildOnly: true,
	enabled: true,
	permReq: [],
	cooldown: 1000,
	allowedChannels: [],
};