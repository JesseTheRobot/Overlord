module.exports = (client, guild) => {
	client.log(`Client has joined guild ${guild.name}!`, "INFO");
	client.validateGuild(guild) //invokes a check for the Bot's DB to initialise the guild in the database for (potentially) instant usage
};