module.exports = (client, member) => {
	let guild = member.guild;
	client.log(`new member with Name ${member.displayName} has joined ${guild.name}`, "INFO");
	client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
	let guildData = client.DB.get(guild.id)
	client.guilds.get(guild.id).channels.get(guildData.welcomeChan).send((guildData.welcomeMsg).replace("{{user}}", member).replace("{{guildName}}", guild.name))
};