exports.run = async (client, message, basedir) =>{
	async function WebHook(client,user,message,chan) { //function Webhook declared - takes args Client - Discord.js client. user -n/a, message - Message to be sent. chan - channelresolvable object (channel where the message will be sent)
		try{
			const date = new Date().toString();
			await chan.fetchWebhooks()
				.then(wbs =>{
					console.log(wbs);
					if (wbs.size < 1){
						var wb = chan.createWebhook("SUDOOOOOKU"); //webhook init :)
					}else{
						var wb = wbs.first();
					} 
					wb.send(message || "", { username: user.displayName , avatarURL: user.user.avatarURL.substring(0, user.user.avatarURL.length-9) , embeds: message.embeds,split: {maxLength:2000},})
						.catch((e) => {
							console.log(e || "Unknown Error");
						});
				});
		}catch(e){
			console.log(e);
		}
	}
	try{
		if (message.author.id != "150693679500099584"){ //checks if the user is me.
			message.channel.send({embed:{
				color: require(`${basedir}\\Colour.js`).colour(),
				title: "System Error",
				fields: [{
					name: "Unauthorised User",
					value: "You are not authorised to use this command. Nice try tho." //errors if someone else attempts to use the command
				}],
				timestamp: new Date(),
			}});
			return;
		}
		console.log("SUDO INTIALISED.");
		let args =message.content.trim();
		let sGuild = client.guilds.find(guild => guild.name === (args.split("server: ")[1].split(" channel:")[0])); //extracts wanted info from the command string
		let logs = sGuild.channels.find(channel => channel.name == (args.split("channel: ")[1]));
		let tuser = sGuild.members.get((args.split("userid: ")[1].split(" server:")[0]));
		let Message = args.split("$Sudo ")[1].split(" userid:")[0];
		WebHook(client,tuser,Message,logs,);
	}catch(e){
		console.log(e);
	}
};