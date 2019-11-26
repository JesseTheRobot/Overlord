const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
//to future me: check if the ImageByteArray can be done through get-image-data or not. if it can, use it!!

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
			model.classify(image).then(predictions => {
				console.log(JSON.stringify(predictions));
			});
		});
	});
});



