exports.run = (client, message, args, basedir) => {
	const { ownerID } = require(`${basedir}\\Config.json`);
	if (message.author.id != ownerID){
		return;
	}
	if(!args || args.length < 1){
		return message.reply("Must provide a command name to reload.");
	} else if(args && args.length >= 1){
		delete require.cache[require.resolve(`./${args[0]}.js`)];
		return message.reply(`The command ${args[0]} has been reloaded`);
	}
  
};