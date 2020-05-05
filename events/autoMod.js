/**
 * runs optional heuristics on messages, such as antispam, charFlood, and CapsFlood.
 * @param {object} client
 * @param {object} message
 */
module.exports = async (client, message) => {
    //declare some aliases for commonly use pieces of data.
    let config = message.settings
    let modConfig = config.modules.autoMod
    let ASconfig = modConfig.antiSpam
    let member = message.member
    let trecent = client.trecent
    //if the user has one of the 'excluded' roles, ignore them.
    if (Array.from(member.roles).filter(role => modConfig.excludedRoles.includes(role)).size >= 1) { return }
    //if the user is the bot's owner, ignore them.
    if (message.author.id === config.ownerID) { return }
    //prepare action object with common data.
    let action = {
        memberID: message.author.id,
        guildID: message.guild.id,
        type: "action",
        autoRemove: false,
        //autoRemove: ASconfig.autoRemove,
        penalty: ASconfig.penalty
    }
    /**
     * runs antispam heurisitics on a given message object.
     * @param {object} client 
     * @param {object} message 
     */
    let antiSpam = (client, message) => {
        //check state - if not enabled, do nothing.
        if (!ASconfig.enabled) return
        //ensure entry in DB exists for the specified channel. if it exists, return the current val. if not, set to provided val ([])
        let userCooldown = trecent.ensure(message.guild.id, [], message.channel.id)
        //push the member ID to the relevant subObject array to indicate who has been sending messages where.
        //true is used to allow for duplicate pieces of data in the array.
        trecent.push(message.guild.id, member.id, message.channel.id, true)
        //after ASconfig.interval Milliseconds, remove a instance of member.id from the trecent array for this channel.
        setTimeout(() => { trecent.remove(message.guild.id, member.id, message.channel.id) }, ASconfig.interval)
        //if the number of instances of member.id for this channel exceeds the threshold, the user is classified as 'spamming.'
        if ((userCooldown.filter((user) => user === member.id)).length >= ASconfig.count) {
            //remove all other instances of member.id from trecent
            trecent.set(message.guild.id, userCooldown.filter((user) => user != member.id), message.channel.id)
            //populate action object
            Action = {
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
            }
            client.emit("modActions", { ...action, ...Action })
        } else {
            //add XP, using the antispam delay as a restriction/timeout. will be it's own module eventually.
            client.DB.math(message.guild.id, "+", client.getRandomInt(1, 3), `users.${message.author.id}.xp`)
        }
    }
    /**
     *  checks the %age of a message's contents being the same character vs a configured threshold
     * @param {object} client 
     * @param {object} message 
     */
    let charFlood = (client, message) => {
        //check if enabled - if not, do nothing
        if (!modConfig.heuristics.charFlood.enabled) return
        //if the perctange of the message being one character is above the threshold, take action
        if (chars.filter(char => (char[1] / message.content.length) * 100 >= modConfig.heuristics.charFlood.percentLimit).length != 0) {
            //flesh out the action object with properties
            Action = {
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
            }
            client.emit("modActions", { ...action, ...Action }) //pass action to modActions for processing.
        }
    }
    /**
     * checks the message contents for characters that are in upper case (caps) and determines the message %age that is comprised of capitals
     * @param {object} client 
     * @param {object} message 
     */
    let caps = (client, message) => {
        //check if enabled - if not, do nothing.
        if (!modConfig.heuristics.caps.enabled) return
        //if the total percentage of the message as caps is greater than the threshold, take action.
        if (((chars.filter(char => char[0] === char[0].toUpperCase()).length) / message.content.length) * 100 >= modConfig.heuristics.caps.percentLimit) {
            //if caps% exceeds or equals configured limit, take action.
            Action = {
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
            }
            client.emit("modActions", { ...action, ...Action }) //pass action to modActions for processing.
        }
    }

    antiSpam(client, message)
    //if below the ignore threshold, ignore (as smaller messages are much more likely to be a false +ve.)
    if (modConfig.heuristics.ignoreBelowLength >= message.content.length) return
    //below is used to check how many instances of a character exist in a string.
    let chars = new Map();
    //iterates over every character as a spread string array (spreads the string into individual characters, then makes each char it's own entry in the array)
    [...message.content].forEach(char => {
        //escape control chars for the RegEx to prevent them from messing anythng up
        if ([".", "{", "}", "[", "]", "-", "/", "\\", "(", ")", "*", "+", "?", "^", "$", "|"].includes(char)) char = "\\" + char
        //sets the value of 'char' to however many chars there are, or simply none.
        chars.set(char, (((message.content).match(new RegExp(char, "g")) || []).length))
    })
    //convert to an array of entries : [...,[char, count],...].
    chars = Array.from(chars.entries())
    //execute heuristics (caps)
    caps(client, message)
    //execute heuristics (chars)
    charFlood(client, message)
}

//default configuration - allows for editing of thresholds and punishments
module.exports.defaultConfig = {
    enabled: true,
    bannedWords: [], //stump
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
            end: -1 //-1 = infinite duration
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


