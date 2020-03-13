module.exports = async (client, message) => {
    let config = message.settings
    let modConfig = config.autoMod
    let antiSpam = async (client, message) => {
        let member = message.member
        let trecent = client.trecent.get(message.guild.id)
        if (Array.from(member.roles).filter(role => config.excludedRoles.includes(role)).size >= 1) { return } //exclude those who have configured 'protected' roles
        trecent.ensure(message.guild.id, [], message.channel.id)
        setTimeout(() => { trecent.remove(message.guild.id, message.channel.id, member.id) }, modConfig.interval)
        setTimeout(() => { client.log(trecent) }, 5000)
        if ((trecent.get(message.guild.id, message.channel.id).filter((user) => user === member.id)).length >= modConfig.count) {
            client.log("exceeded")
        }
        //wipes array after a strike has been added.
        if (!user.strikes) {
            user.strikes = [];
        }
        user.strikes.push(new Date());
        message.channel.send(`${message.author} has had a strike added!`);
        //penalise the user!
    } else {
        trecent.push(mobj);
}
    }
let antiMention = (client, message) => {
    if (message.mentions.array.filter(mentionedID => modConfig.antiMention.has(mentionedID)).length >= 1) {
        //penalise the user!
    }
}

}
module.exports.defaultConfig = {
    enabled: true,
    bannedWords: [],
    excludedRoles: [],
    percentCapsLimit: 0,
    floodPercentLimit: 0,
    decay: 30000,
    antiSpam: {
        enabled: true,
        interval: 2000,
        count: 2,
        penalty: 1,
    },
    penalties: {
        repeatOffenceMultiplier: 2,
        repeatOffenceTimeout: 10000
    },
    punishments: {
        5: "mute",
        10: "tempBan",
        15: "ban",
    },
    requiredPermissions: ["MANAGE_MESSAGES"]

}

