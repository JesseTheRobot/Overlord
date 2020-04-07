module.exports = {
	ownerID: "150693679500099584", //discord ID of the Bot's Owner.
	token:
		process.env.NODE_ENV === "production"
			? "NTc2MzM3ODI2MTU3NjkwODkx.XNVCkg.Yyt4uTJi2FOYeaYPE6iOmIurrwI" //bot's  Production Token
			: "NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g",
	datadir: "./data", //data storage location for the ENMAP-SQLite backend
	status: "Overlord Production version {{version}} - now on {{guilds}} guilds!",
	enableModels: true,
	preLoad: true,
};
