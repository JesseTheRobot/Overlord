exports.run = async (client, message, args, basedir) => {
	let config = require(`${basedir}\\Config.json`);
	var clr = require(`${basedir}\\Colour.js`).colour();
	try{
		const fs = require("fs");
		const directory = `${basedir}\\datastore`;
		console.log(message.content);
		console.log(args);
		if (message.content.slice(2,3) != "i "){
			args = [`${message.content.substring(1)}`];
		}
		args[0]=args.toString().split(" ")[0];
		console.log(args);
		fs.readdir(directory, (err, files) => {
			if (err) throw err;
			for (const file of files) {
				if (file.slice(0,-4).toLowerCase() == (args[0]).toLowerCase()){
					try{
						message.channel.send("",{
							file: `${directory}/${file}`
						});
						console.log(`${directory}/${file}`);
						return;
					}catch(err){
						console.log(err);
					}
				}
			}
			message.channel.send({embed:{
				color: clr,
				title: "System error",
				fields: [{
					name:`Ding Dong the Command ${args[0]} Does not exist~`,
					value:`for help, use the ${config.prefix}help command.`
				}],
				timestamp: new Date(),
			}});
		});
	}catch(e){
		console.log(e);
	}
};