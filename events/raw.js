module.exports = async (client, pkt) => {
    /** 
     * raw event - this is called on every single websocket event fo the bot - this is useful for messages that are no longer in cache, such as messages used for reactions for roles, etc.
     */
    //use for tracking reactions
    /*switch (pkt.t) {
        case "MESSAGE_CREATE":
            break

        case "MESSAGE_REACTION_ADD":
            break

    }*/
    console.log(pkt)
    if (pkt.t == "MESSAGE_DELETE") {
        var data = client.guilds.get(pkt.d.guild_id).channels.get(pkt.d.channel_id).messages.get(pkt.d.id)
        console.log(data)
    }


}