const config = {
	ownerID: "150693679500099584", //discord ID of the Bot's Owner.
	protectedKeys: ["serverOwnerID", "config", "autoMod", "antiSpam"], //list of reserved settings keys that are immutable to command-base changes
	token:
		process.env.NODE_ENV === "production"
			? "NTc2MzM3ODI2MTU3NjkwODkx.XNVCkg.Yyt4uTJi2FOYeaYPE6iOmIurrwI" //bot's  Production Token
			: "NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g",
	datadir: "./data", //data storage location for the ENMAP-SQLite backend
};

module.exports = config;