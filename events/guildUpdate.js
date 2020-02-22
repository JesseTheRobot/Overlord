module.exports = (client, oldSvr, newSvr) => {
	client.log(`${client.diff(oldSvr, newSvr)}`, "INFO");
};