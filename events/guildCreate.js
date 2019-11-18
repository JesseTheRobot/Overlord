module.exports = (client, guild) => {
	client.dStats.increment("GuildJoin");
	client.log("Log", `Client has joined guild ${guild.name}!`);
	client.validateGuild(guild) //invokes a check for the Bot's DB to initialise the guild in the database for (potentially) instant usage
};