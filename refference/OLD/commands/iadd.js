exports.run = (client, message, args, basedir) => {
	var duplicate = false;
	const fs = require("fs");
	const path = require("path");
	const directory = `${basedir}/NCBot/datastore`;
	var iter = 0;
	let options = {};
	const download = require("image-downloader");
	var Attachment = (message.attachments).array();
	function ImgDownload (options){
		console.log("working...");
		download.image(options)
			.then(({ filename, image }) => {
				console.log("File saved to", filename);
				console.log((filename.split("/").slice(-1)).slice(0,-3));
				message.reply(`command added. use ${(filename.split("/").slice(-1)).slice(0,-3)} to invoke it!`);

			});
	} 
	try{
		console.log(args[0].slice(0,4));
		if (Attachment.length < 1 && (args[0].slice(0,4) == "http" || args[0].slice(0,3) == "www")){
			message.channel.send("URL identified. processing...");
			args[1] =(args[1]).toLowerCase();
			options = {
				url: `${args[0]}`,
				dest: `${directory}/${args[1]}.${args[0].slice(-3)}`
			};
		} else{
			message.channel.send("no URL detected. reading from attachments.");
			Attachment.forEach(function(attachment) {
				console.log(attachment.url);
				args[0] = (args[0]).toLowerCase();
				options = {
					url: `${attachment.url}`,
					dest: `${directory}/${args[0]}.${(attachment.url).slice(-3)}`
				};
			});
		}
		iter = 0;
		console.log("got the file processing.");
		const files = fs.readdirSync(directory);
		files.forEach(file => {
			if ((file.slice(0,-4) == args[0])||(file.slice(0,-4)==args[1])){
				message.reply("That command name is already in use. please select another.");
				console.log(`${message.author.username} attempted to create a new command whose name is already in use.`);
				console.log((file.slice(0,-4) != args[0])||(file.slice(0,-4)!=args[1]));
				duplicate = true;

			}else{
				iter += 1;
			}
		// }else if (((file.slice(0,-4) != args[0])||(file.slice(0,-4)!=args[1]))&&(iter==0)&&(duplicate != true)) {
		//	console.log(options);
		//	iter = iter +1
		//	ImgDownload(options)
		//}
		});
		if(duplicate == false){
			ImgDownload(options);
		}	 	
	}catch(e){
		console.log(e);
	}
};