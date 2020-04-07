exports.run = (client, message, args) => {
	const Discord = require("discord.js");
	const cembed = new Discord.RichEmbed()
		.setTitle(`${client.user.username}'s List of commands`)
		.setAuthor(`${client.user.username}`, `${client.user.displayAvatarURL}`)
		.setColor("#1a1aff")
	let clist = []
	if (!args[1]) {
		Object.entries(message.settings.commands).forEach(cmd => {
			if (client.canExecute(client, message, cmd[0]) === "passed") {
				clist.push(`${cmd[0]} aliases: ${cmd[1].aliases.filter(alias => alias != cmd[0]).join(", ") || "none"} `)
			}
		})
		cembed.addField("List of Available Commands:", clist)
			.setFooter("Use the help command followed by the command you want more information on.")
		message.author.send({ embed: cembed });

	} else {
		if (client.canExecute(client, message, args[1]) === "passed") {
			let cmd = message.settings.commands[args[1]]
			cembed.setTitle(args[1])
				.setDescription(`\`\`\`\naliases: ${cmd.aliases}\ninfo: ${cmd.info || "No info"}\nusage: ${cmd.useage || "no usage information"}\n\`\`\``)
			message.author.send({ embed: cembed });
			return
		}
	}
}
exports.defaultConfig = {
	aliases: ["help", "commands"],
	info: "lists the commands the user is able to execute in the current server",
	enabled: true,
	permReq: [],
	cooldown: 10000,
	allowedChannels: [],
};