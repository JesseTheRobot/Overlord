module.exports = async (client, message) => {
    let config = message.settings
    let modConfig = config.modules.autoMod
    let ASconfig = modConfig.antiSpam
    let member = message.member
    let trecent = client.trecent
    if (Array.from(member.roles).filter(role => modConfig.excludedRoles.includes(role)).size >= 1) { return } //exclude those who have 'protected' roles, eg admin.
    if (message.author.id === config.ownerID) { return }
    let action = {} //prepare action object
    let antiSpam = (client, message) => {
        if (!ASconfig.enabled) return
        trecent.ensure(message.guild.id, [], message.channel.id) //ensure entry in DB exists
        trecent.push(message.guild.id, member.id, message.channel.id, true)
        setTimeout(() => { trecent.remove(message.guild.id, member.id, message.channel.id) }, ASconfig.interval)
        let userCooldown = trecent.get(message.guild.id, message.channel.id)
        if ((userCooldown.filter((user) => user === member.id)).length >= ASconfig.count) {
            trecent.set(message.guild.id, userCooldown.filter((user) => user != member.id), message.channel.id) //wipe for user after first set of spam.
            action = {
                memberID: message.author.id,
                guildID: message.guild.id,
                type: "action",
                autoRemove: ASconfig.autoRemove,
                title: "Message spam Violation",
                src: `Spam limit broken by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "Automatic",
                    data: `Spam Limit Broken by ${message.author}`
                },
                request: `Removal of content (last ${ASconfig.count} messages)`,
                requestedAction: {
                    type: "bulkDelete",
                    target: `${message.guild.id}.${message.channel.id}.${message.author.id}`,
                    count: ASconfig.count
                },
                penalty: ASconfig.penalty
            }
            client.emit("modActions", action)
        } else {
            //add XP, using the antispam delay as a restriction/timeout. will be it's own module eventually.
            client.DB.math(message.guild.id, "+", client.getRandomInt(1, 3), `users.${message.author.id}.xp`)
        }
    }

    let charFlood = (client, message) => {
        // checks the %age of a message being the same character, has a cutoff for smaller messages as these are hard to disciriminate properly. 
        if (!modConfig.heuristics.charFlood.enabled) return
        if (chars.filter(char => (char[1] / message.content.length) * 100 >= modConfig.heuristics.charFlood.percentLimit).length != 0) {
            //if char% exceeds or equals configured limit, take action.
            action = {
                memberID: message.author.id,
                guildID: message.guild.id,
                type: "action",
                autoRemove: ASconfig.autoRemove,
                title: "Message Flood Violation",
                src: `Flood % limit broken by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "Automatic",
                    data: `Flood Limit Broken by ${message.author}`
                },
                request: `Removal of content`,
                requestedAction: {
                    type: "delete",
                    target: `${message.guild.id}.${message.channel.id}.${message.id}`,
                },
                penalty: ASconfig.penalty
            }
            client.emit("modActions", action) //pass action to modActions for processing.
        }
    }

    let caps = (client, message) => {
        //checks the message contents for characters that are in upper case (caps) and determines the message %age that is comprised of capitals
        if (!modConfig.heuristics.caps.enabled) return
        if (((chars.filter(char => char[0] === char[0].toUpperCase()).length) / message.content.length) * 100 >= modConfig.heuristics.caps.percentLimit) {
            //if caps% exceeds or equals configured limit, take action.
            action = {
                memberID: message.author.id,
                guildID: message.guild.id,
                type: "action",
                autoRemove: ASconfig.autoRemove,
                title: "Message Caps Flood Violation",
                src: `Caps % limit broken by user ${message.author} in channel ${message.channel} : [Jump to message](${message.url})`,
                trigger: {
                    type: "Automatic",
                    data: `Caps % limit Broken by ${message.author}`
                },
                request: `Removal of content`,
                requestedAction: {
                    type: "delete",
                    target: `${message.guild.id}.${message.channel.id}.${message.id}`,
                },
                penalty: ASconfig.penalty
            }
            client.emit("modActions", action) //pass action to modActions for processing.
        }
    }

    antiSpam(client, message)
    if (modConfig.heuristics.ignoreBelowLength >= message.content.length) return
    let chars = new Map();
    [...message.content].forEach(char => { //iterates over every character as a spread array.
        if ([".", "{", "}", "[", "]", "-", "/", "\\", "(", ")", "*", "+", "?", "^", "$", "|"].includes(char)) char = "\\" + char //escape .'s for the RegEx
        chars.set(char, (((message.content).match(new RegExp(char, "g")) || []).length)) //determines how many instances of a character exists in a given message.
    })
    chars = Array.from(chars.entries()) //convert to an array of entries : [...,[char, count],...]
    caps(client, message)
    charFlood(client, message)
}


module.exports.defaultConfig = {
    enabled: true,
    bannedWords: [],
    bannedURLs: [],
    excludedRoles: [],
    punishments: {
        mute: {
            start: 5,
            end: 0
        },
        tempBan: {
            start: 10,
            end: 5
        },
        ban: {
            start: 15,
            end: 0
        }
    },
    decay: 3,
    heuristics: {
        ignoreBelowLength: 20,
        charFlood: {
            enabled: true,
            percentLimit: 40,
        },
        caps: {
            enabled: true,
            percentLimit: 40,
        }
    },
    antiSpam: {
        enabled: true,
        interval: 3000,
        count: 5,
        penalty: 1,
        autoRemove: true
    },
    requiredPermissions: ["MANAGE_MESSAGES"]
}


