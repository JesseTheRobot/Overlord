const config = {
	ownerID: "150693679500099584", //discord ID of the Bot's Owner.
	protectedKeys: ["serverOwnerID", "config", "autoMod", "antiSpam"], //list of reserved settings keys that are immutable to command-base changes
	token: "NTc2MzM3ODI2MTU3NjkwODkx.XNVCkg.Yyt4uTJi2FOYeaYPE6iOmIurrwI", //bot's Token
	datadir: "./data", //data storage location for the ENMAP-SQLite backend

	permissionLevels: [
		{
			level: 1,
			name: "User",
			check: (client, message) => true //always returns true as this is the base permission level.
		},
		{
			level: 2,
			name: "Moderator",
			guild: true,
			check: (client, message) => message.member.roles.some(role => client.getGuildSettings(message.guild.id).config.modRoles.includes(role.id)) //checks if the message's author has a role configured as a Moderation role 
		},
		{
			level: 3,
			name: "Admin",
			guild: true,
			check: (client, message) => message.member.roles.some(role => client.getGuildSettings(message.guild.id).config.adminRoles.includes(role.id)) || message.author.id === message.guild.owner.user.id || message.member.roles.some(role => role.hasPermission("ADMINISTRATOR"))
		},
		{
			level: 4,
			name: "Bot Owner",
			check: (client, message) => config.ownerID === message.author.id
		}
	],
};

module.exports = config;