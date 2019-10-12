//const jsonfile = require("jsonfile");
exports.run = (client, message, args, basedir) => {
	let Colour = require(`${basedir}\\Colour.js`);
	let jsonfile = require("jsonfile");
	//function htc(rrggbb) {
	//	var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
	//	return parseInt(bbggrr, 16);
	//}
	function json2array(json){
		var result = [];
		var keys = Object.keys(json);
		keys.forEach(function(key){
			result.push(json[key]);
		});
		console.log(Object.values(json));
		console.log(Object.keys(json));
		return result;
	}
	try{
		// prevents usage in DMs
		console.log(message.channel.type);
		if (message.channel.type == "dm"){
			message.reply("This command Cannot be used in DMs!");
			return;
		}
		// id defaults to message.author, otherwise first mentioned use
		const member = message.mentions.members.first() || message.member;
		//sets baseline constants
		let lvl = 0;
		let req =0;
		var xpreq;
		var uarr ={};
		jsonfile.readFile(`${basedir}\\UserData.json`, function (err, DB) {
			if (err) console.error(err);
			var xp = (DB.servers[message.guild.id].users[member.id].xp); //xp of the current user
			Object.keys(DB.servers[message.guild.id].users).forEach(function(key) { //use flag _array to get an array of the object(s).
				uarr[key]=DB.servers[message.guild.id].users[key].xp;
			});
			var mxp = Object.values(uarr);
			var muid =Object.keys(uarr);
			uarr= json2array(uarr);
			uarr.sort((a,b) => (b > a) ? 1 : ((a > b) ? -1 : 0));
			while (true){
				let rank =uarr.indexOf(mxp[muid.indexOf(member.id)])+1;
				xpreq = (5 * (lvl ** 2) + 50 * lvl + 100) + req; //carries over the XP requirements for previous levels, allows for slight exponential XP requirements.
				if ((xpreq) < (xp)){ //checks if the amount of XP required for the next level has been exceeded by the user. if not, returns one level below;
					lvl++;
					req = xpreq; //incriments and carries over variables.
				}else{
					//lvl = lvl -1;
					//message.channel.send(`User ${member.displayName} is at Level ${lvl} with ${((xp)-((5 * ((lvl) ** 2) + 50 * (lvl) + 100)))} XP extra. has total XP amount ${xp}`);
					message.channel.send({embed:{
						color: Colour.colour(),
						author: {
							name: member.displayName,
							icon_url: member.avatarURL
						},
						title: `Current XP/ Level of user ${member.displayName}`,
						fields: [{
							name:"Rank",
							value: `Server Rank ${rank}\nLevel ${lvl} with ${(xpreq-((xp)-((5 * ((lvl) ** 2) + 50 * (lvl) + 100))))} XP 'overflow'.`
						},
						{
							name:" Raw XP amount",
							value: `current XP: ${xp} XP needed for next level: ${xpreq}`
						}],
						timestamp: new Date(),
						footer: {
							icon_url: client.user.avatarURL,
						}
					}});
					return;
				}
			}
		});
	}catch(e){
		console.error(e);
	}

};
