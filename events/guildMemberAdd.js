module.exports = async (client, member) => {
	let modConfig = client.DB.get(member.guild.id, `modules.guildMemberAdd`)
	let guild = member.guild;
	client.log(`new member with Name ${member.displayName} has joined ${guild.name}`, "INFO");
	let data = client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
	if (data.savedState) { //if a backup of a user state exists, restore the user.
		let state = client.DB.get(member.guild.id, `users.${member.id}.savedState`)
		member.setNickname(state.nick)
		member.addRoles(state.roles)
		client.emit("modActions", {
			memberID: member.id,
			guildID: member.guild.id,
			type: "report",
			title: "State restore of re-joining User",
			executor: client.user,
			request: `User ${member.displayName} has rejoined the server, and has had their roles and nickname restored.`,
			trigger: {
				type: "automatic",
			}
		})
	}
	if (modConfig.enabled) {
		client.guilds.get(guild.id).channels.get(modConfig.welcomeChannel).send((modConfig.welcomeMessage)
			.replace("{{user}}", member).replace("{{guildName}}", guild.name))
	}
};
module.exports.defaultConfig = {
	enabled: false,
	welcomeChannel: 0,
	welcomeMessage: "welcome {{user}} to {{guildName}}!"
}