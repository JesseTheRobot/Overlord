const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");

const readImage = path => {
	const imageBuffer = fs.readFileSync(path);
	const tfimage = tf.node.decodeImage(imageBuffer, undefined, undefined, false);
	return tfimage;
}

load("file://./model/").then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			var image = readImage(`./cache/${img}`)
			model.classify(image, 1).then(predictions => {
				console.log(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`);
			});
		});
	});
});



