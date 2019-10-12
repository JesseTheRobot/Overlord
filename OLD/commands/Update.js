exports.run = (client, message, args, basedir) => {
	const {ownerID} = require(`${basedir}/NCBot/config.json`);
	const fs = require("fs");
	try{
		//checks if the author is the owner, or is a server administrator in the current server.
		if (message.author.id != ownerID) return;
		client.users.get(ownerID).send("Updating NCBot!");
		fs.writeFile(`${basedir}\\SHUTDOWN.txt`, "SHUTDOWN",{ flag: "w" }, function(err){ //writes the shutdown.txt to disable any new DB activity.
			if (err) console.log(err);
			console.log("Successfully Written Shutdown File.");
		});
		setTimeout(function() {
			require("child_process").exec("cmd /c start \"\" cmd /c Update.bat", function(){});
		}, 3000);
	}catch(e){
		console.log(e);
	}
};
