module.exports = async (client, message, basedir) => {
	if (message.author.bot) return;
	const entry = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE" }).then(audit => audit.entries.first());
	const member = await message.guild.fetchMember(message.author);
	let executor = "";
	if (entry != undefined
		&& (entry.extra.channel.id === message.channel.id)
		&& (entry.target.id === message.author.id)
		&& (entry.createdTimestamp > (Date.now() - 5000))
		&& (entry.extra.count >= 1)) {
		user = entry.executor.username;
	} else {
		user = member.user.username;
	}
	let attachments = client.DB.get(message.id, `${message.guild.id}.persistence.attachments`)
	if (attachments) {


	}

}
