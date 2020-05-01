module.exports = {
	// Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/ - very helpful resource!
	apps: [{
		name: "Overlord",
		script: "./Overlord.js",
		instances: 1,
		autorestart: true,
		watch: false,
		env: {
			NODE_ENV: "production"
		},
		max_memory_restart: "2G",
		combine_logs: true,
		log: ".\\main.log",
		log_date_format: "YYYY-MM-DD HH:mm:ss"
	}],
};
