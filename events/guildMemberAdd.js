/**
 * triggered when a user joins (or re-joins) a guild. in the case of a rejoin, 
 * the bot will reload a saved user state (roles and nickname) before they left the guild.
 * @param {object} client
 * @param {object} member - member object for the user that just joined the guild.
 */
module.exports = async (client, member) => {
	//gets config
	let modConfig = client.DB.get(member.guild.id, `modules.guildMemberAdd`)
	//alias for guild
	let guild = member.guild;
	//logs memeber join
	client.log(`new member with Name ${member.displayName} has joined ${guild.name}`, "INFO");
	//initialisies user to DB
	let data = client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
	//if a backup of a user state exists, restore the user.
	if (data.savedState) {
		//get state
		let state = data.savedState
		//set nickname to nickname in state data
		member.setNickname(state.nick)
		//set roles to array of role ID's in state data.
		member.addRoles(state.roles)
		//action object - for notification of action to moderators/admins.
		client.emit("modActions", {
			memberID: member.id,
			guildID: member.guild.id,
			type: "report",
			title: "State restore of re-joining User",
			executor: client.user,
			request: `User ${member} has re-joined the server, and has had their roles and nickname restored.`,
			trigger: {
				type: "automatic",
			}
		})
	}
	//if the welcome message is enabled
	if (modConfig.enabled) {
		//send it (with some parsing) to the specified Welcome channel
		client.guilds.get(guild.id).channels.get(modConfig.welcomeChannel).send((modConfig.welcomeMessage)
			.replace("{{user}}", member).replace("{{guildName}}", guild.name))
	}
};
module.exports.defaultConfig = {
	enabled: false,
	welcomeChannel: 0,
	welcomeMessage: "welcome {{user}} to {{guildName}}!"
}