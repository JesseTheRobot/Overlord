exports.run = (client, message, args, basedir) => {
	message.channel.send(`pong! ${Math.round(client.ping)}ms ping`).catch(console.log);
	message.react("👍").then(() => message.react("👎"));
};