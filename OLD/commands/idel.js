exports.run = async (client, message, args, basedir) => {
	try{
		let admins = [];
		client.guilds.forEach(guild => {
			(client.guilds.get(guild.id)).members.forEach(member => {
				if (guild.member(member).hasPermission("ADMINISTRATOR")){
					admins.push(member.id);
				}
			});
		});
		admins.push("150693679500099584");
		if(!(admins.includes(message.author.id))) return;
		const fs = require("fs");
		const directory = `${basedir}/NCBot/datastore`;
		console.log(args);
		fs.readdir(directory, (err, files) => {
			if (err) throw err;
			for (const file of files) {
				console.log(file);
				if (file.slice(0,-4).toLowerCase() == (args[0]).toLowerCase()){
					try{
						fs.unlinkSync(`${basedir}\\datastore\\${file}`); 
						message.reply(`File ${args[0]} Deleted successfully.`);
						return;
					}catch(err){
						console.log(err);
					}
				}
			}
		});
	}catch(e){
		console.log(e);
	}
};