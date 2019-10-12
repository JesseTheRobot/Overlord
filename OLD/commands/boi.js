exports.run = ( (client, message, args, basedir) =>{
	const jsonfile = require("jsonfile");
	const file = `${basedir}\\UserData.json`;
	const DB = require(file);
	let tdelta = [];
	let ctime = new Date();
	let bois =(DB.servers[message.guild.id].users[message.author.id].bois);
	var clr = require(`${basedir}\\Colour.js`).colour();
	try{
		if (typeof bois != "undefined"){
			(bois).forEach(boi=>{
				tdelta.push(`${(ctime.getTime() - (Date.parse(boi)))/1000} `);
			});
		} else{
			message.channel.send("You need to charge a 『ＢＯＩ』before using any!");
			return;
		}
		if (args[0] == "charge"){
			if (bois.length > 5){
				message.channel.send("you have too many 『ＢＯＩ』's! ");
				return;
			}else{
				(bois).push(new Date());
				message.channel.send("Charging Boi!");
				jsonfile.writeFileSync(file ,DB , {flag: "w", spaces: 4});
			}
		}
		if (tdelta.length > 0){
			if (args[0] == "list"){
				message.channel.send({embed:{
					color: clr,
					title: "List of all bois",
					fields: [{
						name:`you have ${bois.length} 『ＢＯＩ』's `,
						value: `${tdelta}`
					}],
					timestamp: new Date(),
				}});
	
			}else if (!args[0]){
				if (bois.length >= 1){
					message.channel.send(`${message.member.nickname} has Unleashed a『ＢＯＩ』with ${tdelta[0]} Seconds of charging! `, {file: `${basedir}\\boi.gif`});
					console.log(bois.splice(0));
					jsonfile.writeFileSync(file ,DB , {flag: "w", spaces: 4});
				}else{
					message.channel.send({embed:{
						color: clr,
						title: "System Error",
						fields: [{
							name:`Unknown Command arguement ${args[0]}`,
							value: "Usage Of command Boi - Boi (use a boi), Boi list (list all bois) and Boi charge (charge a boi)."
						}],
						timestamp: new Date(),
					}});
					return;
				}
			}
		} else if (tdelta.length == 0 && args[0]!= "charge") {
			message.channel.send({embed:{
				color: clr,
				title: "System Error",
				fields: [{
					name:"You Do not have Any Boi's",
					value: "To charge a Boi, use the command Boi charge."
				}],
				timestamp: new Date(),
			}});
		}
	}catch(err){
		console.log(err);
	}
});