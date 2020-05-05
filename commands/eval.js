/**
 * small command only usable by the bot owner to debug code whilst an instance is running using eval.
 * @param {object} client
 * @param {object} message
 */
exports.run = async (client, message, args) => {
	const code = args.slice(1).join(" "); //removes the commandname from args, and then executes the following statements/code.
	try {
		var evaled = eval(code); //evaluate (run) the code - VERY DANGEROUS!!
		const clean = await client.evalClean(client, evaled); //small function to ensure that the output doesn't contain valuable info, primarily the bot's token.
		message.channel.send(`\`\`\`js\n${clean}\n\`\`\``); //send evaluated code as a code block.
	} catch (err) {
		//send any errors to the channel.
		message.channel.send(`\`\` \`\`\`js\n${await client.evalClean(client, err)}\n\`\`\``);
	}
};

exports.defaultConfig = {
	aliases: ["eval"],
	info: "used to execute arbitrary code - BE VERY VERY CAREFUL",
	usage: "$eval <valid JS code>",
	enabled: true,
	permReq: ["BOT_OWNER"],
	cooldown: 1000,
	allowedChannels: [],
};