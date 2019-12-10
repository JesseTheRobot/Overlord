const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");

const readImage = (path) => {
	const imageBuffer = fs.readFileSync(path);
	const tfimage = tf.node.decodeImage(imageBuffer, 3, undefined, false);
	return tfimage;
};


load("file://./model/", { size: 299 }).then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			var image = readImage(`./cache/${img}`);
			model.classify(image, 3).then(predictions => {
				console.log(JSON.stringify(predictions));
				console.log(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`);
			}).catch(err);
		});
	});
});
