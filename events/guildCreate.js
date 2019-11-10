module.exports = (client, guild) => {
	client.dStats.increment("GuildJoin");
	client.log("Log",`Client has joined guild ${guild.name}!`);
	client.DB.ensure(guild.id,client.defaultConfig); //configure the database to include an entry for the new guild
	client.DB.set(guild.id,guild.ownerID,"config.serverOwnerID") //sets the ownerID in the database to that of the guild. this assigns them level 3 permissions.
	//filter roles/users with administrative permissions and add them to the DB
};
