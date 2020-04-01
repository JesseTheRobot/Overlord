exports.run = (client, message, args) => {
	switch (args[0]) {
		case "ping":
			message.channel.send("Pong!")
			break
		case "pong":
			message.channel.send("Ping?")
			break
		default:
			message.channel.send("What?" + [...args])
			break
	}
}
exports.defaultConfig = {
	aliases: ["ping", "pong", "test"],
	enabled: true,
	permReq: [],
	cooldown: 10000,
	allowedChannels: [],
};