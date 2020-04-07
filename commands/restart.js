exports.run = (client, message, args) => {
	message.react("✅")
	client.emit("gracefulShutdown", "Manual")
};
exports.defaultConfig = {
	aliases: ["restart", "reboot"],
	enabled: true,
	permReq: ["BOT_OWNER"],
	cooldown: 1000,
	allowedChannels: [],
};