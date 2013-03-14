var app = require('express').createServer(), 
summary_processor = require('./summary-processor');

app.get('/', function(req, res) {
	summary_processor.process("0", function (scrapeoutput) {
		res.header("Content-Type", "Application/JSON");
		res.send(JSON.stringify(scrapeoutput));
	});
});

app.get('/page/:pageNumber', function(req, res) {
	var pageNumber = req.params.pageNumber ? req.params.pageNumber : "0";
	
	if (parseInt(pageNumber)  > 8) {
		res.header("Content-Type", "Application/JSON");
		res.send(JSON.stringify({error: 'NO_MORE_CONTENT'}));
	} else {
		summary_processor.process(pageNumber, function (scrapeoutput) {
			res.header("Content-Type", "Application/JSON");
			res.send(JSON.stringify(scrapeoutput));
		});
	}
});

app.listen(9090);
