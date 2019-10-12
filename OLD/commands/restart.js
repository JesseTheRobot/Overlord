exports.run = (client, message, args, basedir) => {
	const fs = require("fs");
	const {ownerID} = require(`${basedir}/NCBot/config.json`);
	try{
		//checks if the author is the owner, or is a server administrator in the current server.
		if (! message.member.hasPermission("ADMINISTRATOR") || message.author.id != ownerID) return;
		client.users.get(ownerID).send(`restarting NCBot -invoked by ${message.author} with reasons ${args}`);
		message.react("👍");
		fs.writeFile(`${basedir}\\SHUTDOWN.txt`, "SHUTDOWN",{ flag: "w" }, function(err){
			if (err) console.log(err);
			console.log("Successfully Written Shutdown File.");
		});
		client.user.setPresence({
			game: { 
				name: "SHUTTING DOWN",
				type: "PLAYING"
			},
			status: "dnd"
		});
		setTimeout(function() {
			require("child_process").exec("cmd /c start \"\" cmd /c stage1.bat", function(){});
		}, 3000);
	}catch(e){
		console.log(e);
	}
};