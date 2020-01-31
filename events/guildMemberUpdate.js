module.exports = (client, oldMem, newMem) => {
	client.log("Log", `member update: ${client.diff(oldMem, newMem)}`)
};