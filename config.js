const config = {
	ownerID: "150693679500099584", //discord ID of the Bot's Owner.
	ReservedKeys: ["serverOwnerID","config","autoMod","antiSpam"], //list of reserved settings keys
	token: "NTc2MzM3ODI2MTU3NjkwODkx.XNVCkg.Yyt4uTJi2FOYeaYPE6iOmIurrwI", //bot's Token
  
	permissionLevels: [
		{
			level: 1,
			name: "User",
			check: () => true //always returns true for Obvious reasons
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
			check: (message) => config.ownerID === message.author.id
		}
	],
	datadir: "./data",
	


};
  
module.exports = config;