module.exports = (client, member) => {
    client.log(`member ${member.displayname} has left guild ${member.guild.name}`, "INFO")

}