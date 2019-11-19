exports.run = (client, oldSvr, newSvr) => {
	client.log("Log", client.diff(oldSvr, newSvr), "guildUpdate")
};