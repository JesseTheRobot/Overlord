module.exports = (client, guild) => {
	client.dStats.increment("GuildJoin");
	client.log("Log", `Client has joined guild ${guild.name}!`);
	client.validateGuild(guild)
};