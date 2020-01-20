exports.run = async (client, message, args, basedir) =>{
	var qmsg;
	async function WebHook(client,user,message,chan) { //function Webhook declared - takes args Client - Discord.js client. user -n/a, message - Message to be sent. chan - channelresolvable object (channel where the message will be sent)
		try{
			//const date = new Date().toString();
			await chan.fetchWebhooks()
				.then(wbs =>{
					console.log(wbs);
					if (wbs.size < 1){
						var wb = chan.createWebhook("SUDOOOOOKU"); //webhook init :)
					}else{
						var wb = wbs.first();
					} 
					wb.send(message || "", { username: user.displayName || user.username , avatarURL: user.avatarURL.substring(0, user.avatarURL.length-9) , embeds: message.embeds,split: {maxLength:2000},})
						.catch((e) => {
							console.log(e);
							message.channel.send("something went wrong!");
						});
				});
		}catch(e){
			console.log(e);
		}
	}
	async function getargs(client,message,args)  { 
		var user;
		console.log(args);
		//try{
		let logs =message.guild.channels.find(channel => qchann.includes(channel.name));
		if (!logs){
			message.channel.send("there is no quotes channel on this server :(");
		}
		//let args =message.content.trim();
		if (!isNaN(parseInt(args[0]))) { //check if it's messageID.
			message.channel.fetchMessage(args[0]).then(msg =>{
				console.log(msg);
				qmsg = msg;
				user=msg.author;
			})
				.catch(console.error);
		}else{
			if (message.mentions.users.size != 0 && typeof message.mentions.users.first().lastMessageID != undefined){
				qmsg = message.mentions.users.first().lastMessage;
				user = message.mentions.users.first();
			}else{
				user.username = args[0];
				user.avatarURL = message.attachments.first().url || client.user.avatarURL;
				qmsg = args.shift();
			}
		}
		console.log(qmsg);
		console.log(user);
		return({client,user,qmsg,logs});
		//}catch(err){
		//	console.error(err);
		//}
	}
	let qchann = ["Quotes","quotes"];
	if (!message.guild.me.permissions.has("MANAGE_CHANNELS")) {
		message.channel.send("This bot uses webhooks. I need at least Manage Channels permission in order to work with them.");
		return;
	}
	try{
		//let sGuild = client.guilds.find(guild => guild.name === (args.split("server: ")[1].split(" channel:")[0])); //extracts wanted info from the command string
		//let logs = sGuild.channels.find(channel => channel.name == (args.split("channel: ")[1]));
		//let tuser = sGuild.members.get((args.split("userid: ")[1].split(" server:")[0]));
		//let Message = args.split("$Sudo ")[1].split(" userid:")[0];
		getargs(client,message,args,).then( pb =>{
			var {client,user,qmsg,logs} = pb;
			console.log({client,user,qmsg,logs});
			WebHook(client,user,qmsg,logs);
		});
	}catch(e){
		console.log(e);
	}
};