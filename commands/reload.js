/**
 * extremely basic command that reloads the command into memory after a change has occurred on disk
 * @param {object} client
 * @param {object} message
 * @param {object} args 
 */
exports.run = (client, message, args) => {
	//reloads the provided command
	client.reloadCommand(args[1], message.guild.id)
};
exports.defaultConfig = {
	aliases: ["reload"],
	info: "Reloads a command with the on-disk version.",
	usage: "$reload <commandName>",
	enabled: true,
	permReq: [],
	cooldown: 1000,
	allowedChannels: [],
};