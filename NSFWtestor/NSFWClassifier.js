const tf = require("@tensorflow/tfjs-node");
const load = require("nsfwjs").load;
const fs = require("fs");

const nsfwClasses = {
	0: 'Drawing',
	1: 'Hentai',
	2: 'Neutral',
	3: 'Porn',
	4: 'Sexy'
};

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function (resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
var __generator = (this && this.__generator) || function (thisArg, body) {
	var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
	function verb(n) { return function (v) { return step([n, v]); }; }
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (_) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0: case 1: t = op; break;
				case 4: _.label++; return { value: op[1], done: false };
				case 5: _.label++; y = op[1]; op = [0]; continue;
				case 7: op = _.ops.pop(); _.trys.pop(); continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
					if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
					if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
					if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
					if (t[2]) _.ops.pop();
					_.trys.pop(); continue;
			}
			op = body.call(thisArg, _);
		} catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
		if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	}
};



var resolvePredictions = async (logits) => {
	return __awaiter(this, void 0, void 0, function () {
		var values, valuesAndIndices, i, topkValues, topkIndices, i, topClassesAndProbs, i;
		var topK = 5;
		return __generator(this, function (_a) {
			switch (_a.label) {
				case 0: return [4, logits.data()];
				case 1:
					values = _a.sent();
					valuesAndIndices = [];
					for (i = 0; i < values.length; i++) {
						valuesAndIndices.push({ value: values[i], index: i });
					}
					valuesAndIndices.sort(function (a, b) {
						return b.value - a.value;
					});
					topkValues = new Float32Array(topK);
					topkIndices = new Int32Array(topK);
					for (i = 0; i < topK; i++) {
						topkValues[i] = valuesAndIndices[i].value;
						topkIndices[i] = valuesAndIndices[i].index;
					}
					topClassesAndProbs = [];
					for (i = 0; i < topkIndices.length; i++) {
						topClassesAndProbs.push({
							className: nsfwClasses[topkIndices[i]],
							probability: topkValues[i]
						});
					}
					return [2, topClassesAndProbs];
			}
		});
	});

}

var classifier = async (client, img) => {
	try {
		return new Promise(resolve => {
			let size = 299
			const imageBuffer = fs.readFileSync(`./cache/${img}`);
			const image = tf.node.decodeImage(imageBuffer, 3, undefined, false);
			var normalized = image
				.toFloat()
				.div(tf.scalar(255));
			var resized = normalized;
			if (image.shape[0] !== size || image.shape[1] !== size) {
				var alignCorners = true;
				resized = tf.image.resizeBilinear(normalized, [size, size], alignCorners);
			}
			var batched = resized.reshape([1, size, size, 3]);
			let predictions = client.model.predict(batched)
			resolve(resolvePredictions(predictions))
		})
	} catch (err) {
		console.error(err)
	}

}

load("file://./model/", { size: 299 }).then(model => {
	fs.readdir("./cache", (err, images) => {
		if (err) console.log(err);
		images.forEach(img => {
			var image = readImage(`./cache/${img}`);
			classifier(image).then(predictions => {
				console.log(JSON.stringify(predictions));
				console.log(`${img}: ${predictions[0].className} with probability ${predictions[0].probability}`);
			}).catch(err);
		});
	});
});
