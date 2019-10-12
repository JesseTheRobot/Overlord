exports.run = (client, message, args, basedir) => {
	const { ownerID } = require(`${basedir}\\Config.json`);
	if (message.author.id != ownerID) return;
	message.channel.send(args[0]);
	return;
	try{
		client.guilds.forEach(guild => {
			guild.members.forEach(member =>{
				if (member.displayName == args[args.length-1]){
					console.log(`message sent to user ${member.displayName}:${member.id}`);
					var formattedcode = String(args.slice(0,[args.length - 1]));
					member.send(`${formattedcode.replace(new RegExp(",","g")," ")}`);
				}
			});
		});
	}catch(e){
		console.log(e);
	}
};