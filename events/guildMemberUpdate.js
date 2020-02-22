module.exports = (client, oldMem, newMem) => {
	client.log(`member update: ${client.diff(oldMem, newMem)}`, "INFO")
};