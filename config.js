/**
 * @exports ownerID
 * @exports token
 * @exports datadir
 * @exports status
 * @exports enableModels
 * @exports preLoad
 */
module.exports = {
	ownerID: "150693679500099584", //discord ID of the Bot's Owner.
	token:
		process.env.NODE_ENV === "production" //turnary operator for token selection
			? "NTc2MzM3ODI2MTU3NjkwODkx.XrG6rw.jpDd6tg8AOMBGQFENMlRTN4JXr8" //bot's  Production Token (true)
			: "NjQ4OTU5OTU5NDg4Mzk3MzMy.Xd11Kw.dHib7KEW6nczwGqMs3GUAWmNb3g", //dev token (false)
	datadir: "./data", //data storage location for the ENMAP-SQLite backend.
	status: "@ me for help – version {{version}} - now on {{guilds}} guilds!",//status message of the bot.
	enableModels: true, //global toggle for enabling the ML Models
	preLoad: true, //preload data - can reduce performance at bootup but increases elsewhere.
};
