const tf =require("@tensorflow/tfjs-node");
const load=require("nsfwjs").load;

const fs = require("fs");
const jpeg = require("jpeg-js");


const NUMBER_OF_CHANNELS = 3;


const readImage = (path) => {
	const buf = fs.readFileSync(path);
	const pixels = jpeg.decode(buf, true);
	return pixels;
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
	const outShape = [image.height, image.width, numChannels] ;
	const input = tf.tensor3d(values, outShape, "int32");

	return input;
};



load("file://./model/").then(model=>{
	fs.readdir("./data",(err, images) =>{
		if (err) console.log(err);
		images.forEach(img =>{
			if(img.split(".")[1] == "jpg"){
				let pimg = readImage(`./data/${img}`);
				let input = imageToInput(pimg, NUMBER_OF_CHANNELS);
				model.classify(input).then(predictions=>{
					console.log(img);
					console.log(JSON.stringify(predictions));
				});
			}
		});
        
	});
});