exports.run = async (client, message, reason, basedir) => {
	return;
	try{
		const file = (`${basedir}\\UserData.json`);
		const jsonfile = require("jsonfile");
		console.log(message.channel.type);
		if (message.channel.type == "dm") return;
		jsonfile.readFile(file, function (err, DB) {
			if (err) console.log(err);
			console.log(`${message.author.id} has been ''muted'' with reason ${reason}`);
			if (!message.guild.roles.find(role => role.name == ("muted" || "Muted" || DB.servers[message.guild.id].config.muted))){
				message.guild.members.forEach(member =>{
					if (message.guild.member(member).hasPermission("ADMINISTRATOR")){
						member.send(`${client.user.username} has no configured mute role. use the command config in the server ${message.guild.name} to configure the muted role! channel!`);
					}
				});
			}
						
			// /CREATE_INSTANT_INVITE: false,
			//KICK_MEMBERS: false,
			//BAN_MEMBERS: false,
			//ADMINISTRATOR: false,
			//MANAGE_CHANNELS: false,
			//MANAGE_GUILD: false,
			//ADD_REACTIONS: false,
			//READ_MESSAGES: true,
			// SEND_MESSAGES: false,
			//SEND_TTS_MESSAGES: false,
			// MANAGE_MESSAGES: false,
			// EMBED_LINKS: false,
			// ATTACH_FILES: false,
			// READ_MESSAGE_HISTORY: true,
			// MENTION_EVERYONE: false,
			// EXTERNAL_EMOJIS: false,
			// CONNECT: true,
			// SPEAK: false,
			// MUTE_MEMBERS: false,
			//  DEAFEN_MEMBERS: false,
			/// MOVE_MEMBERS: false,
			// USE_VAD: false,
			// CHANGE_NICKNAME: false,
			// MANAGE_NICKNAMES: false,
			// MANAGE_ROLES_OR_PERMISSIONS: false,
			// MANAGE_WEBHOOKS: false,
			// MANAGE_EMOJIS: false
			//});
			//}
			let roleid = (message.guild.roles.find(role => role.name == ("muted"||"Muted")));
			console.log(roleid);
			message.guild.members.get(message.author).addRole(roleid);
		});
	}catch(e){
		console.log(e);
	}
};