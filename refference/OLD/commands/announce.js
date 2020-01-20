exports.run = (client, message, args, basedir) => {
	try{
		let admins = [];
		client.guilds.forEach(guild => {
			(client.guilds.get(guild.id)).members.forEach(member => {
				if (guild.member(member).hasPermission("ADMINISTRATOR")){
					admins.push(member.id);
				}
			});
		});
		console.log(admins.includes(message.author.id));
		if(!(admins.includes(message.author.id))) return;
		client.guilds.forEach(guild => {
			var logs = (guild.channels.find(channel => channel.name == `${args[args.length - 1]}` && (channel.type == "text")));
			if (!(logs === null)){
				var formattedcode = String(args.slice(0,[args.length - 1]));
				logs.sendCode("diff", `-${formattedcode.replace(new RegExp(",","g")," ")}`);
			}
		});
	}catch(e){
		console.log(e);
	}
};