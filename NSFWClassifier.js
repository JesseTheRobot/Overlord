const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const jpeg = require("jpeg-js");
const NUMBER_OF_CHANNELS = 3;
const { Image, createCanvas } = require("canvas");
const canvas = createCanvas(800, 600);
const ctx = canvas.getContext("2d");




async function loadLocalImage(filename) {
	try {
		var img = new Image();
		img.onload = () => ctx.drawImage(img, 0, 0);
		img.onerror = err => { throw err; };
		img.src = filename;
		return tf.fromPixels(canvas);
	} catch (err) {
		console.log(err);
	}
}


const getImage = async (filename) => {
	try {
		this.image = await loadLocalImage(filename);
	} catch (error) {
		console.log("error loading image", error);
	}
	return this.image;
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
			getImage(img).then(pimg => {
				let input = imageToInput(pimg, NUMBER_OF_CHANNELS);
				model.classify(input).then(predictions => {
					console.log(img);
					console.log(JSON.stringify(predictions));
				});

			});

		});

	});
});