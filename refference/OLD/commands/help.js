exports.run = (client, message, args, basedir) => {
	const fs = require("fs");
	var imglist;
	const Discord = require("discord.js");
	const directory = (`${basedir}\\datastore\\`);
	try{
		fs.readdir(`${basedir}\\commands\\`, (err, items) => {
			let clist = items.map((element) => { return `${element.slice(0, -3)}\n`; }).join().replace(/,/g, "");
			const cembed = new Discord.RichEmbed()
				.setTitle(`${client.user.username}'s List of commands`)
				.setAuthor(`${client.user.username}`, `${client.user.displayAvatarURL}`)
				.setColor(require(`${basedir}\\Colour.js`).colour())
				.setDescription(`The commands are:\n${clist}`)
				.setThumbnail(`${message.author.avatarURL}`)
				.setTimestamp();
			message.author.send({embed: cembed});
		});
		fs.readdir(directory, (err, files) => {
			if (err) console.log(err);
			//try{
			let ilist = files.map((element) => { return `${element.slice(0, -4)}\n`; }).join().replace(/,/g, "");
			console.log(ilist);
			const iembed = new Discord.RichEmbed()
				.setTitle(`${client.user.username}'s List of Images`)
				.setAuthor(`${client.user.username}`, `${client.user.displayAvatarURL}`)
				.setColor(require(`${basedir}\\Colour.js`).colour())
				.setDescription(`The image commands are:\n${ilist}`)
				.setThumbnail(`${message.author.avatarURL}`)
				.setTimestamp();
			message.author.send({embed: iembed});
		});
		console.log(imglist);
	}catch(e){
		console.log(e);
	}
};