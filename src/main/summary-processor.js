scraper = require('node.io'),
cache = require('memory-cache');

exports.process = function (pageNumber, cb) {
		    var SUMMARY_CACHE = (pageNumber == "0") ? "homepage" : pageNumber, 
		    		output = cache.get(SUMMARY_CACHE),
		    		pageUrl = (pageNumber == "0") ? "http://www.dzone.com/links/index.html?sort=energy" : 
		    						"http://www.dzone.com/links/index.html?sort=energy&type=html&p=" + pageNumber;
		    		
			
		    // Serve from cache if possible
		    if (output) {
		    	console.log("Serving summary from cache. (Page: " + SUMMARY_CACHE + ")");
		    	cb(output);
		  		
		    } else {    
		    	// Scrape new
		    	console.log("Scraping new summary. (Page: " + SUMMARY_CACHE + ")");
		    	scraper.scrape(function() {
		    	this.getHtml(pageUrl, function(err, $) {        
					var titles = [], links = [], upvotes = [], downvotes = [], 
							commentlinks = [], tags = [], comments = [];
					output = [];
					// Select all titles and links on the page
					$('div.details h3 a').each(function(story) {            
						titles.push(story.text);				
					});  
					
					// Select all story links on the page
					$('a[rel="bookmark"]').each(function(link) {  			
						links.push(link.attribs.href);
					});  
					
					// Select comments links
					$('div.details p.fineprint a.comment').each(function(commentlink) {  			
						commentlinks.push("http://www.dzone.com" + commentlink.attribs.href);
					});  
					
					// Select all up-votes
					$('.upcount').each(function(upvote) {            
						upvotes.push(upvote.text);
					});  
					
					// Select all down-votes
					$('.downcount').each(function(downvote) {            
						downvotes.push(downvote.text);
					});  
					
					// Select Tags
					$('.fineprint.stats').each(function(fineprint){
						var storyTags = [], tagComponents = fineprint.children.splice(4, fineprint.children.length);	
						for(var x=0; x<tagComponents.length; x++) {
							if (tagComponents[x].type == "tag") {
								storyTags.push(tagComponents[x].children[0].data);
							}
						}
						tags.push(storyTags);
					});
					
					// Select number of comments
					$('div.details p.fineprint a.comment').each(function(commentStat){
						comments.push(commentStat.text);
					});
					
					for (var i = 0, len = upvotes.length; i < len; i++) {					
							// Check the data is ok
							this.assert(upvotes[i]).isInt();
							// Output = [score] title
							var story = {};
							story.title = titles[i];
							story.link = links[i];
							story.commentlink = commentlinks[i];
							story.upvotes = upvotes[i];
							story.downvotes = downvotes[i];
							story.tags = tags[i];
							story.activity = comments[i];
							
							output.push(story);
					}
					
					// Store in cache. Expire every 10 minutes.
					cache.put(SUMMARY_CACHE, output, 1000 * 60 * 10);
			
					cb(output);
					});
		  		}); 
		    }  
			
		};


