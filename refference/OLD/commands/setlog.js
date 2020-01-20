exports.run = (client, message , args, basedir) =>{
	let svrconfig = require(`${basedir}/NCBot/UserData.json`);
	const jsonfile = require("jsonfile");
	let newLog = "";
	if (message.channel.type == "dm") return;
	if (! message.member.hasPermission("ADMINISTRATOR")) return;
	console.log(args);
	function getLog(args){
		if (args[0] ==""){
			newLog = message.channel.id;
		}else{
			newLog = (message.guild.channels.find(channel => channel.name == `${args[args.length - 1]}` && (channel.type == "text")));
		}
		return newLog;
	}
	message.channel.send("New logging channel for the server set!");
	console.log(getLog(args));
	svrconfig[`${message.guild.id}`].logs = getLog(args);
	console.log(`logging channel for server ${message.channel.guild.name} has been changed.`);
};