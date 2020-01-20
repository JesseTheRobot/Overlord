exports.run = (client, message, args, basedir) => {
	let Colour = require(`${basedir}\\Colour.js`);
	var clr = Colour.colour();
	message.channel.send({embed:{
		color: clr,
		title: "Error 404 CHARLIE HAS THE BIG GAY",
		fields: [{
			name:"your Haiku Could not be found",
			value: "Try again Later."
		}],
		timestamp: new Date(),
	}});
};