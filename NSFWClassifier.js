const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");
const imageGet = require("get-image-data");
const { Image, createCanvas } = require("canvas");
//to future me: check if the ImageByteArray can be done through get-image-data or not. if it can, use it!!

const loadLocalImage = async (path) => {
	image(path, function (err, info) {
		if (err) console.log(err)
		info.data = Uint8Array.from(info.data)
		return (tf.node.decodeImage(info.data, undefined, undefined, false))
	});

};

load("file://./model/").then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			loadLocalImage(`./cache/${img}`).then(pimg => {
				model.classify(pimg).then(predictions => {
					console.log(JSON.stringify(predictions));
				});
			});
		});
	});
});


