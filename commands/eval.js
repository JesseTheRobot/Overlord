exports.run = async (client, message, args) => {
	const code = args.join(" ");
	try {
		var evaled = eval(code);
		const clean = await client.evalClean(client, evaled);
		message.channel.send(`\`\`\`js\n${clean}\n\`\`\``); //send evaluated code as a code block.
	} catch (err) {
		message.channel.send(`\`\` \`\`\`js\n${await client.evalClean(client, err)}\n\`\`\``);
	}
};

exports.defaultConfig = {
	aliases: ["eval"],
	guildOnly: true,
	enabled: true,
	permReq: ["BOT_OWNER"],
	cooldown: 1000,
	allowedChannels: [],
};