module.exports = (client, member) => {
    client.log("Log", `member ${member.displayname} has left guild ${member.guild.name}`)

}