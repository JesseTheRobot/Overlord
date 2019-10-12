exports.run = (client, message, args, basedir) => {
	console.log("a");
	let cfgo = ["logchannel","automod: [state (on/off)] [",];
	let desc =["set the channel for the bot to log to. (pass this the full name of the channel)","whether automod should be enabled or disabled. (boolean, true or false)"];
	const file = (`${basedir}\\UserData.json`);
	delete require.cache[require.resolve(`${file}`)];
	let DB = require(`${file}`);
	try{
		let admins = [];
		client.guilds.forEach(guild => {
			(client.guilds.get(guild.id)).members.forEach(member => {
				if (guild.member(member).hasPermission("ADMINISTRATOR")){
					admins.push(member.id);
				}
			});
		});
		console.log(admins.includes(message.author.id));
		if(!(admins.includes(message.author.id))) return;
		if (!cfgo.includes(args[0])){
			message.channel.send(`Invalid configuration option ${args[0]}. valid options are:\n${cfgo.map((element) => { return `${element} - ${desc[cfgo.indexOf(element)]}\n`; }).join().replace(/,/g, "")}`);
		}
		if (args[0] == "logchannel"){
			let guild = message.guild;
			DB.servers[message.guild.id].logs = (guild.channels.find(channel => channel.name == `${args[args.length]}` && (channel.type == "text")));
			guild.channels.get(DB.servers[message.guild.id].logs).send("Logs channel successfully initalised!");
		}
	}catch(e){
		console.log(e);
	}
};