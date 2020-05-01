/**
 * Triggered every time a guild is joined by the bot.
 * @param {object} client
 * @param {object} guild - the guildObject for the guild that has just been joined.
 */
module.exports = (client, guild) => {
	//log that a guild has been joined.
	client.log(`Client has joined guild ${guild.name}!`, "INFO");
	//invokes a check for the Bot's DB to initialise the guild in the database for instant usage.
	client.validateGuild(guild)
};