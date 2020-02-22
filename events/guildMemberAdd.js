module.exports = (client, member) => {
	let guild = member.guild;
	client.log(`new member with Name ${member.displayName} has joined ${guild.name}`, "INFO");
	client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
};