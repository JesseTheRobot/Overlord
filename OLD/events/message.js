exports.run =  (client, message) => {
	const fs =require("fs");
	const basedir = process.cwd();
	console.dir(client); //just for debug to see what client is looking like when the message is received
	if (fs.existsSync(`${basedir}\\SHUTDOWN.txt`)){ //checks if the bot is currently undergoing a shutdown. if so, interdicts all further processing.
		console.log("command execution failed - system currently shutting down.");
		message.channel.send({embed:{
			color: 3447003,
			title: "System Message",
			fields: [{
				name: "Please try again later",
				value: "the System is currently undergoing a shutdown - please try again later."
			}],
			timestamp: new Date(),
		}});
		return;
	}
	if (message.author.bot || message.channel.type !== "text") return;
	message.content = message.cleanContent;
	if (message.isMentioned(client.user.id)){
		message.author.send(`Hi there! ${message.author.displayName},My prefix is ${client.getGuildSettings(message.guild.id).config.prefix || "/"}.`); //sends user the Command Prefix for the guild, or the default prefix if anything "wonky" happens
	}
	let prefix = client.getPrefix(message.guild.id);
	if (!prefix) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	client.log("Log",`user ${message.author.displayName} has used command ${command} with args ${args} at time ${new Date()}`,"MessageEvent");
	const permLvl = client.getMsgPerm(message); //returns permission integer for the author of the message.
	console.log(client.commands); //debug check of the commands collection tied to client
	const[blacklisted,throttled] = client.validateCooldown(message);
	if (!blacklisted){
		switch ( throttled){
		case "throttled":
			return "User throttled";
		}
	}
};

