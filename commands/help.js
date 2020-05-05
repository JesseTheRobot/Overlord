/**
 * small command to list the commands the user can execute, as well as any configured aliases, with the option to return more information once the command name is specified.
 * @param {object} client
 * @param {object} 
 */
exports.run = (client, message, args) => {
	const Discord = require("discord.js");
	const cembed = new Discord.RichEmbed() //creates a new embed instance
		.setTitle(`${client.user.username}'s List of commands`)
		.setAuthor(`${client.user.username}`, `${client.user.displayAvatarURL}`) //adding elements
		.setColor("#1a1aff") //this is a dark blue-ish colour
	let clist = [] //list of commands in array format
	if (!args[1]) {
		Object.entries(message.settings.commands).forEach(cmd => {
			if (client.canExecute(client, message, cmd[0]) === "passed") {
				//check if the user can run the command - no point telling them if they can't use it!
				clist.push(`\`\`\`\n${cmd[0]}: aliases: ${cmd[1].aliases.filter(alias => alias != cmd[0]).join(", ") || "none"}  ${cmd[1].info ? "Info: " + cmd[1].info : ""}\n\`\`\``)
			}
		})
		cembed.addField("List of Available Commands:", clist)
			.setFooter("Use the help command followed by the command you want more information on.") //prompt the user as to additional functionality.
		message.author.send({ embed: cembed });

	} else {
		if (client.canExecute(client, message, args[1]) === "passed") { //another check as this is a different usecase
			let cmd = message.settings.commands[args[1]]
			cembed.setTitle(args[1]) //shows usage information as well as any info, both are optional.
				.setDescription(`\`\`\`\naliases: ${cmd.aliases}\ninfo: ${cmd.info || "No info"}\nusage: ${cmd.usage.replace("$", message.settings.prefix) || "no usage information"}\n\`\`\``)
			message.author.send({ embed: cembed });
			return
		}
	}
}
exports.defaultConfig = {
	aliases: ["help", "commands"],
	info: "lists the commands the user is able to execute in the current server",
	usage: "$help <command name/alias>",
	enabled: true,
	permReq: [],
	cooldown: 10000,
	allowedChannels: [],
};