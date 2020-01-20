exports.run = (client, message, args, basedir) => {
	const { ownerID } = require(`${basedir}\\Config.json`);
	var formattedstr = String(args.slice(0,[args.length - 1]));
	if (message.author.id != ownerID) return;
	try{
		client.guilds.forEach(guild => {
			guild.members.forEach(member =>{
				if(!member.user.bot){
					member.send(`${formattedstr.replace(new RegExp(",","g")," ")}`);
				}
			});
		});
	}catch(e){
		console.log(e);
	}
};