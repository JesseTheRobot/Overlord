exports.colour = function(){
	var rrggbb = (Math.random().toString(16).slice(2, 8));
	return(parseInt((rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2)), 16));
};