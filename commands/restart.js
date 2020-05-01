/**
 * command that signals to the Bot to shutdown. 
 * @param {object} client
 * @param {object} message
 * @param {object} args
 */
exports.run = (client, message, args) => {
	message.react("✅") //reacts to the message as feedback.
	//invokes a restart with the provided reason(s)
	client.emit("gracefulShutdown", `Manual - ${args[1]}`)
};
exports.defaultConfig = {
	aliases: ["restart", "reboot"],
	info: "Reboots the Bot",
	usage: "$restart <reason for restart",
	enabled: true,
	permReq: ["BOT_OWNER"],
	cooldown: 1000,
	allowedChannels: [],
};