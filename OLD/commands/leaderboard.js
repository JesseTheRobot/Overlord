//const jsonfile = require("jsonfile");
exports.run = async (client, message, args, basedir) => {
	const Discord = require("discord.js");
	let jsonfile = require("jsonfile");
	let rank =[];
	function json2array(json){
		var result = [];
		var keys = Object.keys(json);
		keys.forEach(function(key){
			result.push(json[key]);
		});
		return result;
	}
	try{
		// prevents usage in DMs
		if (message.channel.type == "dm"){
			message.reply("This command Cannot be used in DMs!");
			return;
		}
		var uarr ={};
		jsonfile.readFile(`${basedir}\\UserData.json`, function (err, DB) {
			if (err) console.error(err);
			Object.keys(DB.servers[message.guild.id].users).forEach(function(key) { //use flag _array to get an array of the object(s).
				uarr[key]=DB.servers[message.guild.id].users[key].xp;
			});
			var mxp = Object.values(uarr);
			var muid =Object.keys(uarr);
			uarr= json2array(uarr);
			uarr.sort((a,b) => (b > a) ? 1 : ((a > b) ? -1 : 0)); //sort array in order of XP values
			let i=0;
			message.guild.members.forEach( () =>{
				let un = (message.guild.members.get(muid[mxp.indexOf(uarr[i])])); 
				console.log(`XP value queried is ${mxp[mxp.indexOf(uarr[i])]}`);
				if (typeof un !=="undefined"){
					message.guild.members.get(muid[mxp.indexOf(uarr[i],)]);
					rank.push(`Rank ${i+1} - ${un} \n`);
				}else{
					rank.push(`Rank ${i+1} - Unknown User \n`);
				}
				muid.splice(mxp.indexOf(uarr[i]),1); //make each user and their xp value 'unique' by removing from array - prevents co-inciding duplicates.
				mxp.splice(mxp.indexOf(uarr[i]),1);
				i += 1;
			});
			const embed = new Discord.RichEmbed() //rich embed as it allows for more characters in each field.
				.setTitle(`${message.guild.name}'s XP Leaderboard`)
				.setAuthor(`${message.guild.name}`, `${message.guild.iconURL}`)
				.setColor(require(`${basedir}\\Colour.js`).colour())
				.setDescription((rank.toString()).replace(/,/g, ""))
				.setThumbnail(`${message.guild.iconURL}`)
				.setTimestamp();
			message.channel.send({embed});
		});
	}catch(e){
		console.log(e);
	}

};
