exports.run = (client, message, args, basedir) => {
	let Colour = require(`${basedir}\\Colour.js`);
	var clr = Colour.colour();
	try{
		var today = new Date();
		var epoch = new Date("January 01, 2019 14:00:00");
		var diff = Math.abs(today - epoch);
		var minutes = Math.floor((diff/1000)/60);
		console.log(clr);
		message.channel.send({embed:{
			color: clr,
			title: "Time since 01/01/2019 14:00",
			fields: [{
				name:"The past is far behind us, the future doesn't exist.",
				value: `${minutes} Minutes.`
			}],
			timestamp: new Date(),
		}});
	}catch(e){
		console.log(e);
	}
};
