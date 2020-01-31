module.exports = (client, member) => {
	let guild = member.guild;
	client.dStats.incriment(`${guild.id}.memberAdd`);
	client.log("Log", `new member with Name ${member.displayName} has joined ${guild.name}`, "memberAdd");
	client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
};