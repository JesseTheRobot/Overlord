module.exports = async (client, message) => {
    let config = message.settings
    let modConfig = config.modules.autoMod
    let ASconfig = modConfig.antiSpam
    let member = message.member
    let trecent = client.trecent
    if (Array.from(member.roles).filter(role => ASconfig.excludedRoles.includes(role)).size >= 1) { return } //exclude those who have configured 'protected' roles

    let antiSpam = (client, message) => {
        if (!ASconfig.enabled) return
        trecent.ensure(message.guild.id, [], message.channel.id)
        setTimeout(() => { trecent.remove(message.guild.id, member.id, message.channel.id) }, ASconfig.interval)
        if ((trecent.get(message.guild.id, message.channel.id).filter((user) => user === member.id)).length >= ASconfig.count) {
            client.log("exceeded Antispam")
        }
    }

    let msgHeuristics = (client, message) => {
        if (!modConfig.msgHeuristicsEnabled) return
        if (message.content.length >= modConfig.ignoreBelowLength) return
        let chars = [];
        [...message.content].forEach(char => {
            chars.push({ char: char, count: (((message.content).match(new RegExp(char, "g")) || []).length) })
        })
        if (chars.filter(char => (char.count / message.content.length) * 100 >= modConfig.floodPercentLimit).length != 0) {
            client.log("exceeded Flood")
        }
        if (chars.filter(char => char.char === char.char.toUpperCase()).length >= modConfig.percentCapsLimit) {
            client.log("exceeded caps % limit")
        }
    }

}


module.exports.defaultConfig = {
    enabled: true,
    bannedWords: [],
    bannedURLs: [],
    excludedRoles: [],
    percentCapsLimit: 0,
    floodPercentLimit: 0,
    ignoreBelowLength: 40,
    demeritDecay: 30000,
    msgHeuristicsEnabled: true,
    antiSpam: {
        enabled: true,
        interval: 2000,
        count: 2,
        penalty: 1,
    },
    punishments: {
        5: "mute",
        10: "tempBan",
        15: "ban",
    },
    requiredPermissions: ["MANAGE_MESSAGES"]

}


