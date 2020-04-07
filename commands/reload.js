exports.run = (client, message, args) => {
	client.loadCommand(args[1], message.guild.id)
};
exports.defaultConfig = {
	aliases: ["reload"],
	enabled: true,
	permReq: [],
	cooldown: 1000,
	allowedChannels: [],
};