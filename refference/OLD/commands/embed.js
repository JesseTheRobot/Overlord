
exports.run = (client, message, args, basedir) => {
	const Discord = require("discord.js");
	message.channel.send({embed: {
		color: 3447003,
		author: {
			name: client.user.username,
			icon_url: client.user.avatarURL
		},
		title: "This is an embed",
		url: "http://google.com",
		description: "This is a test embed to showcase what they look like and what they can do.",
		fields: [{
			name: "Fields",
			value: "They can have different fields with small headlines."
		},
		{
			name: "Masked links",
			value: "You can put [masked links](http://google.com) inside of rich embeds."
		},
		{
			name: "Markdown",
			value: "You can put all the *usual* **__Markdown__** inside of them."
		}
		],
		timestamp: new Date(),
		footer: {
			icon_url: client.user.avatarURL,
			text: "© Example"
		}
	}
	});
	const embed = new Discord.RichEmbed()
		.setTitle("This is your title, it can hold 256 characters")
		.setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png")
	/*
   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
   */
		.setColor(0x00AE86)
		.setDescription("This is the main body of text, it can hold 2048 characters.")
		.setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
		.setImage("http://i.imgur.com/yVpymuV.png")
		.setThumbnail("http://i.imgur.com/p2qNFag.png")
	/*
   * Takes a Date object, defaults to current date.
   */
		.setTimestamp()
		.setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
		.addField("This is a field title, it can hold 256 characters",
			"This is a field value, it can hold 1024 characters.")
	/*
   * Inline fields may not display as inline if the thumbnail and/or image is too big.
   */
		.addField("Inline Field", "They can also be inline.", true)
	/*
   * Blank field, useful to create some space.
   */
		.addBlankField(true)
		.addField("Inline Field 3", "You can have a maximum of 25 fields.", true);
 
	message.channel.send({embed});
};

  