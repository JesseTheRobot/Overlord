exports.run = async (client, message, basedir ,user, DB) =>{
	console.log("antispam online.");
	try{
		let logchan = DB.servers[message.guild.id].logs;
		let lchann = ["ln","bot-spam","log","audit-log"];
		if (!logchan){
			logchan = message.guild.channels.find(channel => lchann.includes(channel.name));
			//logchan.send("LOG CHANNEL");
			logchan.send({embed:{
				color: 3447003,
				title: "Strikes added",
				fields: [{
					name: `Strike added to ${message.author}`,
					value: `1 Strike has been added. ${message.author} has a total of ${user.strikes.length}`
				}],
				timestamp: new Date(),
			}});
			message.guild.members.forEach(member =>{
				if (message.guild.member(member).hasPermission("ADMINISTRATOR")){
					member.send(`${client.user.username} has no configured log channel. use the command config in the server ${message.guild.name} to configure the logs channel!`)
						.catch(console.log);
				}
			});
		}
	}catch(err){
		console.error(err);
	}
};
// 	const jsonfile = require("jsonfile");
// 	const file = (`${basedir}\\UserData.json`);
// 	let DB = require(`${file}`);
// 	delete require.cache[require.resolve(`${file}`)];
// 	let lchann = ["ln","bot-spam","log","audit-log"];
// 	if(!trecent){
// 		let trecent =[];
// 	}
// 	let interval = 3000; //interval in which the mutecap can be hit.
// 	let mutecap = 4; //number of messages to tolerate in interval ms 
// 	try{
// 		let mobj = `{${message.guild.id}:${message.author.id}}`;
// 		var user = DB.servers[message.guild.id].users[message.author.id];
// 		let logchan = DB.servers[message.guild.id].config.logs;
// 		setTimeout(() => {trecent.splice(trecent[trecent.indexOf(mobj)],1);}, interval);
// 		console.log(trecent);
// 		console.log(mobj);
// 		if ((trecent.filter(value => value == mobj)).length >= mutecap){ //filter all messages sent (within array) and if <mutecap> or more are keyed to the user and guildid, penalise the user. 
// 			trecent =trecent.filter(value => value != mobj); //wipes array after a strike has been added.
// 			if (!user.strikes){
// 				user.strikes = [];
// 			}
// 			user.strikes.push(new Date());
// 			jsonfile.writeFile(file, DB, { flag: "w", spaces: 4 });
// 			if (!logchan){
// 				logchan = message.guild.channels.find(channel => lchann.includes(channel.name));
// 				logchan.send("LOG CHANNEL");
// 				logchan.send({embed:{
// 					color: 3447003,
// 					title: "Strikes added",
// 					fields: [{
// 						name: "strike!!",
// 						value: "[PH]"
// 					}],
// 					timestamp: new Date(),
// 				}});
// 				message.guild.members.forEach(member =>{
// 					if (message.guild.member(member).hasPermission("ADMINISTRATOR")){
// 						member.send(`${client.user.username} has no configured log channel. use the command config in the server ${message.guild.name} to configure the logs channel!`)
// 							.catch(console.log);
// 					}
// 				});
// 			}else{
// 				trecent.push(mobj);
// 			}
// 		}
// 		//console.log("vars below");
// 		//console.log(mobj);
// 		//console.log(trecent);
// 		//console.log(trecent.filter(value => value == mobj));
// 		//console.log(user);
// 		return(trecent);
// 		//var epoch = Date.parse(user.strikes[0]);
// 		//var diff = Math.abs(new Date() - epoch);
// 		//var minutes = Math.floor((diff/1000)/60);
// 		//console.log(`minutes muted: ${minutes}`);
// 		//let mute = require(`${basedir}\\events\\mute.js`);
// 		//mute.run(client, message, "test", basedir);
		
// 	}catch(e){
// 		console.log(e);
// 	}
// };