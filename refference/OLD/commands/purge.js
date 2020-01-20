exports.run = (client, message, args, basedir) => {
	const fs = require("fs");
	const path = require("path");
	const config = require(`${basedir}/NCBot/config.json`);
	if(message.author.id !== config.ownerID) return;
	const directory = (`${basedir}/NCBot/datastore/`);
	fs.truncate("/main.log", 0, function(){console.log("done");});
	fs.readdir(directory, (err, files) => {
		const count = files.length;
		if (err) throw err;
		for (const file of files) {
			fs.unlink(path.join(directory, file), err => {
				if (err) throw err;
			});
		}
		message.reply(`The command Purge has been executed sucessfully with ${count} files removed.`);
	});
};