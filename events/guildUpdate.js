module.exports = (client, oldSvr, newSvr) => {
	client.log(`Guild has been updated: ${client.diff(oldSvr, newSvr)}`);
};