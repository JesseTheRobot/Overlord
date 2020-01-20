exports.run = ((client, message, basedir) =>{
	const Discord = require("discord.js");
	const directory = `${basedir}\\datastore\\deleted\\`;
	const fs = require("fs");
	const path = require("path");
	var attach;
	//var att;
	function getattach(){
		console.log("got to execution");
		fs.readdirSync(`${basedir}\\deleted\\`,(err, items) => {
			items.forEach(item =>{
				var tes = (item.split(path.extname(item)))[0] ;
				console.log(tes);
				if(tes==message.id){
					return ((new Discord.Attachment(`${basedir}\\deleted\\${item}`,item.split(".")[0])).replace(/\\/g,"/"));
				}
			});
		});

	}

	async function WebHook(client,user,message,logs) {
		try{
			const date = new Date().toString();
			await logs.fetchWebhooks()
				.then(wbs =>{
					let avatar = message.author.avatarURL.substring(0, message.author.avatarURL.length-4);
					if (wbs.size < 1){
						var wb = logs.createWebhook("message delete");
					}else{
						var wb = wbs.first();
					} 
					console.log(message.author);
					console.log(message.id);
					let eun = message.guild.member(message.author).displayName+" (Deleted)";
					if(eun.length >32){
						eun = "Deleted";
					}
					attach = getattach();
					console.log(attach);
					wb.send(`Message by user ${eun} deleted by user ${user} at time ${(date.split("G"))[0]} in channel ${message.channel} [Jump to Channel](<${message.url}>) with contents:\n`+message.content, { username: message.guild.member(message.author).displayName , avatarURL: avatar, embeds: message.embeds, file: attach, split: {maxLength:2000},})
						.catch((e) => {
							console.log(e || "Unknown Error");
						});
					//fs.unlinkSync(att); 
				});
		}catch(e){
			console.log(e);
		}
	}

	async function getentry(client, message, basedir){
		if (message.author.bot) return;
		//message.channel.fetchMessage(message.id);
		console.log("messageDelete Function invoked.");
		const logs = message.guild.channels.find(channel => channel.name == "audit-log");
		const entry = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"}).then(audit => audit.entries.first());
		const member = await message.guild.fetchMember (message.author);
		// message.guild.fetchMember (message.author)
		// 	.then( async (member) => {
		let user = "";
		if (entry != undefined
			&&(entry.extra.channel.id === message.channel.id)
			&& (entry.target.id === message.author.id)
			&& (entry.createdTimestamp > (Date.now() - 5000))
			&& (entry.extra.count >= 1)) {
			user = entry.executor.username;
		} else { 
			user = member.user.username;
		}
		console.log(user);
		//if (message.member.id == "150693679500099584"){ //350692254588993559
		//	message.channel.send(`${message.member.user.username} deleted a message at time ${new Date()} with contents: ${message}`);
		//}
	
		WebHook(client,user,message,logs);

		//	logs.send(`A message by ${member.user.username} was deleted in ${message.channel.name} by ${user} at time ${new Date()} contents are as follows:\n ${message}`,{
		//		file: `${directory}/${message.id}.${(Attachments[0].url.split("/").slice(-1)).slice(-3)}`,
		//		split: {maxLength:2000}}
		//	); 

	}	
	try{
		getentry(client,message,basedir);
	}catch(e){
		console.log(e);
	}
});