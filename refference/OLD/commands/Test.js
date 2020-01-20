exports.run = async (client, message, args, basedir) => {
	const log = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"});
	

	console.log(log);
};