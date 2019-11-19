exports.run = (client, oldMem, newMem) => {
	let guild = member.guild
	console.log(client.diff(oldMem, newMem))
	//re-eval roles or something idk aaaaaaaa
	client.dStats.incriment(`${guild.id}.memberAdd`)
	client.log("Log", `new member with ID ${member.id} has joined ${guild.name}`, "memberAdd")
	client.DB.ensure(guild.id, { xp: 0 }, `users.${member.id}`);
};