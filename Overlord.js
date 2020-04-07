﻿/**Dependancy Import and initialisation */
console.time("init");
const Discord = require("discord.js");
const enmap = require("enmap");
let client = new Discord.Client({ autoReconnect: true, messageCacheMaxSize: 20000, messageCacheLifetime: 86400000, messageSweepInterval: 100, disabledEvents: [""] });
client.config = require("./config.js");
client.isShuttingDown = false //flag used to signify to other events to halt any processing.
client.fs = require("fs");
client.diff = require("deep-object-diff").detailedDiff;
client.transfer = require("transfer-sh");
client.download = require("download-file");
client.version = "1.0.3.07042020"; //release.major.minor.date
client.debug = (process.env.NODE_ENV === "production" ? false : true) //debug flag set if the bot is not run with the enviroment variable "production". if this is not set, the bot ignores all non-tagged logging.
console.log(`!== Overlord v${client.version} Intialisation starting. current date/time is ${new Date()} ==! `);


let modelLoad = async (client) => {//loads Models into memory asyncronously
	if (!client.config.enableModels) return;
	client.tf = require("@tensorflow/tfjs-node");
	var toxicity = require("@tensorflow-models/toxicity");
	client.NSFWModel = await require("nsfwjs").load("file://./models/NSFW/", { size: 299 }); //eslint-disable-line
	client.toxicModel = new toxicity.ToxicityClassifier; //eslint-disable-line
	client.toxicModel.loadModel = () => { //overwrite default LoadModel method due to *hard coded* reliance on web-based model files. I didn't like this so I made it use local files instead.
		return require("@tensorflow/tfjs-converter").loadGraphModel("file://./models/toxic/model.json");
	};
	await client.toxicModel.load();
	client.log("Models loaded!");
}
modelLoad(client)
/** assigns the client Object a New enmap instance ("DB") - */
client.DB = new enmap({
	name: "DB",
	autoFetch: true,
	fetchAll: false,
	ensureProps: true,
	dataDir: client.config.datadir
});
client.trecent = new enmap()
client.cooldown = new enmap()

/**main part of the debug system to monitor any/all changes to the ENMAP Database */
client.DB.changed((Key, Old, New) => {
	client.log(`${Key} - ${JSON.stringify(client.diff(Old, New))}`);
})

/** Bind the exportable functions from Functions.js to the client object as methods. */
require("./Functions.js")(client);

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' variable  (client.isShuttingDown) that if true prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
client.on("gracefulShutdown", (reason) => {
	client.log(`Successfully Received Shutdown Request - Reason: ${reason} - Bot Process commencing shutdown.`, "WARN");
	client.isShuttingDown = true
	setTimeout(() => { setImmediate(() => { process.exit(0); }); }, 5500); //after 5.5 seconds, and after all I/O activity has finished, quit the application.
})

/**
 * every 120 seconds, clears out the loaded database keys to help reduce the memory footprint of the bot.
 */
setInterval(() => { client.DB.evict(client.DB.keyArray()); }, 120000);

/** PM2 SIGINT and Message handling for invoking a graceful shutdown through PM2 on both UNIX and windows systems */
process
	.on("SIGINT", () => {//unix SIGINT graceful PM2 app shutdown.
		client.emit("gracefulShutdown", "PM2")
	})
	.on("message", (msg) => {//Windows "message" graceful PM2 app shutdown. 
		if (msg === "shutdown") {
			client.emit("gracefulShutdown", "PM2")
		}
	})
	.on("uncaughtException", (err) => {
		console.dir(err.stack.replace(new RegExp(`${__dirname} / `, "g"), "./")); /** process error catching with custom stacktrace formatting for ease of reading */
		client.emit("gracefulShutdown", "Exception")
	});

/** catches and logs any Discord.js Client errors */
client
	.on("error", error => { client.log(error, "ERROR"); })
	/** if the client disconnects, report the disconnection */
	.on("disconnect", (event) => {
		client.log("Client disconnected! restarting...\n" + event, "ERROR")
		client.emit("gracefulShutdown", "Disconnect"); /**this event signifies that the connection to discord cannot be re-established and will no longer be re-attempted. so we restart the bot process to (hopefully) fix this (note: requires PM2 to restart the process).*/
	});

/** authenticates the bot to the discord backend through useage of a Token via Discord.js. waits for the Database to load into memory, then starts the initialisation. */
client.login(client.config.token);
client.on("ready", () => { //emited when the client is fully prepared and authenticated with Discord.
	client.DB.defer.then( //waits for DB to load fully before initialising (otherwise will try to write to a non-existant database.)
		client.init(client)
	);
});
/*
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣴⣿⣿⠿⣫⣥⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⠄⠄⠄⠾⢿⢟⣵⣾⣿⡿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⣰⡿⣀⣤⣴⣾⣿⡇⠙⠛⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⣠⣾⣿⣿⣿⣿⣿⣿⣿⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⣴⣿⣿⠿⠛⠉⢩⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⣀⣀⡀⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠈⠛⠉⠄⠄⠄⠄⢸⣿⣿⡇⠄⠄⠄⠄⠄⠄⢀⣼⡿⣫⣾⠆⠄⠄⠄
 * ⠄⠄⠄⠄⢀⣶⣶⣶⣶⣶⣶⣿⣿⣿⠇⠄⠄⠄⣠⣎⣠⣴⣶⠎⠛⠁⠄⠄⠄⠄
 * ⠄⠄⠄⠄⣾⣿⣿⣿⣿⠿⠿⠟⠛⠋⠄⠄⢀⣼⣿⠿⠛⣿⡟⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠛⠉⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠘⠉⠄⠄⢸⣿⡇⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣼⣿⣿⣿⡿⠿⠃⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠋⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣀⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣴⣿⣿⠿⣫⣥⣄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⢀⠄⠄⠄⠾⢿⢟⣵⣾⣿⡿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⣰⡿⣀⣤⣴⣾⣿⡇⠙⠛⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⣠⣾⣿⣿⣿⣿⣿⣿⣿⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⣴⣿⣿⠿⠛⠉⢩⣿⣿⡇⠄⠄⠄⠄⠄⠄⠄⠄⣀⣀⡀⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠈⠛⠉⠄⠄⠄⠄⢸⣿⣿⡇⠄⠄⠄⠄⠄⠄⢀⣼⡿⣫⣾⠆⠄⠄⠄
 * ⠄⠄⠄⠄⢀⣶⣶⣶⣶⣶⣶⣿⣿⣿⠇⠄⠄⠄⣠⣎⣠⣴⣶⠎⠛⠁⠄⠄⠄⠄
 * ⠄⠄⠄⠄⣾⣿⣿⣿⣿⠿⠿⠟⠛⠋⠄⠄⢀⣼⣿⠿⠛⣿⡟⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠛⠉⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠘⠉⠄⠄⢸⣿⡇⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⣼⣿⣿⣿⡿⠿⠃⠄⠄⠄⠄⠄⠄⠄
 * ⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠋⠉⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄
 */