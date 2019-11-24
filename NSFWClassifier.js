const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const jpeg = require("jpeg-js");
const NUMBER_OF_CHANNELS = 3;





let imageGet = require("get-image-data");
//to future me: check if the ImageByteArray can be done through get-image-data or not. if it can, use it!!



const loadLocalImage = async (filename) => {
	console.log(filename);
	imageGet(filename, (err, info) => {
		if (err) console.log(err);
		const image = tf.fromPixels(info.data);
		console.log(image, "127");
		return (image);
	});
};


const imageByteArray = (image, numChannels) => {
	const pixels = image.data;
	const numPixels = image.width * image.height;
	const values = new Int32Array(numPixels * numChannels);

	for (let i = 0; i < numPixels; i++) {
		for (let channel = 0; channel < numChannels; ++channel) {
			values[i * numChannels + channel] = pixels[i * 4 + channel];
		}
	}
	return values;
};

const imageToInput = (image, numChannels) => {
	const values = imageByteArray(image, numChannels);
	const outShape = [image.height, image.width, numChannels];
	const input = tf.tensor3d(values, outShape, "int32");
	return input;
};

load("file://./model/").then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			console.log(loadLocalImage == )
		})

/*load("file://./model/").then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			loadLocalImage(`./cache/${img}`).then(pimg => {
				let input = imageToInput(pimg, NUMBER_OF_CHANNELS);
				model.classify(pimg).then(predictions => {
					console.log(img);
					console.log(JSON.stringify(predictions));
				});

			});

		});

	});
});*/