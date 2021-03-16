/**Dependancy Import and initialisation */
console.time("init");
const Discord = require("discord.js");
const enmap = require("enmap");
//autoRecconect: client will automatically reconnect to the WS if connection is lost
//messageCacheMaxSize: the maximum number of messages that the bot should keep in cache before indescriminantly discarding.
//messageCacheLifetime: the number of ms that a message should be kept in the cache before being swept.
//messageSweepInterval: number of ms between sweeps of the message cache.
//discord client - main way that the bot interfaces with discord. extended with some custom attributes later on.
//configured to keep 20k messages max, with a max lifetime of a day, with messages swept every 50 seconds
let client = new Discord.Client(
	{ autoReconnect: true, messageCacheMaxSize: 20000, messageCacheLifetime: 86400000, messageSweepInterval: 50000, partials: ['MESSAGE', 'REACTION'] });
//load configuration settings from the config file - bind to config to make it 'global'
client.config = require("./config.js");
//flag used to signify to other events to halt any processing. only changed when the gracefulShutdown event is emitted.
client.isShuttingDown = false
client.fs = require("fs");
//used to determine changes between two instances of an object
client.diff = require("deep-object-diff").detailedDiff;
//used to upload files to transfer.sh
client.transfer = require("transfer-sh");
//used to download files from discord
client.download = require("download-file");
client.version = "1.0.3.07042020"; //release.major.minor.date
/*debug flag set if the bot is not run with the enviroment variable "production". 
if this is not set, the bot ignores all non-tagged logging.*/
client.debug = (process.env.NODE_ENV === "production" ? false : true)
//console bootup starting message
console.log(`!== Overlord v${client.version} Intialisation starting. current date/time is ${new Date()} ==! `);

/**
 * This function Loads the neural net models for Both the NSFWClassifier as well as the ToxicityClassifier.
 * @param {object} client 
 */
let modelLoad = async (client) => {
	//checks that the models aren't disabled in the main bot config.
	if (!client.config.enableModels) return;
	client.tf = require("@tensorflow/tfjs-node");
	//flag to tell TF that this is a production app. nets some major performance improvements.
	client.tf.enableProdMode()
	var toxicity = require("@tensorflow-models/toxicity");
	//loads the NSFWModel via NSFWjs Using local model files.
	client.NSFWModel = await require("nsfwjs").load("file://./models/NSFW/", { size: 299 });
	//creates a new instance of the ToxicityClassifier
	client.toxicModel = new toxicity.ToxicityClassifier;
	//overwrite default LoadModel method due to *hard coded* reliance on web-based model files.
	// I didn't like this reliance so I made it use local files instead.
	client.toxicModel.loadModel = () => {
		return require("@tensorflow/tfjs-converter").loadGraphModel("file://./models/toxic/model.json");
	};
	//wait for the models to load.
	await client.toxicModel.load();
	client.log("Models loaded!");
}
//triggers the loading of the NeuralNet Models. for some reason a self-invoking anonymous function refused to work.
modelLoad(client)
/** assigns the client Object a New enmap instance ("DB") - */
client.DB = new enmap({
	//identifier - shows that this ENMAP is persistent
	name: "DB",
	//automatically fetch DB keys when required
	autoFetch: true,
	//do not fetch all data from the DB into the memory cache at startup
	fetchAll: false,
	//ensure will do so for properties of an object, rather than just the top level structure.
	ensureProps: true,
	//the directory where the data for this persistent ENMAP will be stored.
	dataDir: client.config.datadir
});
//two non-persistent ENMAP instances - same functionality as client.DB, just transient.
//stands for talked recent - "who talked recently?" - per-guild with per-channel subObjects.
//eg: 54546834767588:{33750293334875:[]} - guildID:channelID:array
client.trecent = new enmap()
//used for tracking cooldowns for commands - per-guild and per-channel subObjects.
client.cooldown = new enmap()

/** Bind the exportable functions from Functions.js to the client object as methods. */
require("./Functions.js")(client);

/**main part of the debug system to monitor any/all changes to the ENMAP Database */
client.DB.changed((Key, Old, New) => {
	//custom logging for recording database changes.
	client.log(`${Key} - ${JSON.stringify(client.diff(Old, New))}`);
})

/** used to gracefully shutdown the bot, ensuring all current operations are completed successfully and inhibiting new operations from occuring
 * used an operation 'locking' variable  (client.isShuttingDown) that if true prevents any new commands from being executed. 
 * also uses setImmediate to wait for any I/O operations to prevent things such as DB corruption etc.
 */
client.on("gracefulShutdown", (reason) => {
	//log aknowledging the request
	client.log(`Successfully Received Shutdown Request - Reason: ${reason} - Bot Process commencing shutdown.`, "WARN");
	//'global' flag 
	client.isShuttingDown = true
	//after 5.5 seconds, and after all I/O activity has finished, quit the application.
	setTimeout(() => { setImmediate(() => { process.exit(0); }); }, 5500);
})

/**
 * every 120 seconds, clears out the loaded database keys to help reduce the memory footprint of the bot.
 */
setInterval(() => { client.DB.evict(client.DB.keyArray()); }, 120000);

/** PM2 SIGINT and Message handling for invoking a graceful shutdown through PM2 on both UNIX and windows systems */
process
	//unix SIGINT graceful PM2 app shutdown.
	.on("SIGINT", () => {
		//triggers a graceful shutdown
		client.emit("gracefulShutdown", "PM2")
	})
	//Windows "message" graceful PM2 app shutdown. 
	.on("message", (msg) => {
		if (msg === "shutdown") {
			client.emit("gracefulShutdown", "PM2")
		}
	})
	.on("uncaughtException", (err) => {
		/** process error catching with custom stacktrace formatting for ease of reading */
		console.dir(err.stack.replace(new RegExp(`${__dirname} / `, "g"), "./"));
		client.emit("gracefulShutdown", "Exception")
	});

/** catches and logs any Discord.js Client errors */
client
	.on("error", error => { client.log(error, "ERROR"); })
	/** if the client disconnects, report the disconnection */
	.on("disconnect", (event) => {
		client.log("Client disconnected! restarting...\n" + event, "ERROR")
		/**this event signifies that the connection to discord cannot be re-established and will no longer be re-attempted. 
		so we restart the bot process to (hopefully) fix this
		 (note: requires PM2 to restart the process).*/
		client.emit("gracefulShutdown", "Disconnect");
	});

/** authenticates the bot to the discord backend through useage of a Token via Discord.js. 
 * waits for the Database to load into memory, then starts the initialisation. */
//client.login(client.config.token);
client.login("NTc2MzM3ODI2MTU3NjkwODkx.XvtZag.Hj89HABX72f3-oljhEyTHYhHY-U")
//emited when the client is fully prepared and authenticated with Discord.
client.on("ready", () => {
	//waits for DB to load fully before initialising (otherwise will try to write to a non-existant database.)
	//this is why I do not use the ready event to start the initialisation directly.
	client.DB.defer.then(
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