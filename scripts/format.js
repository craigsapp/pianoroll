//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Thu Oct 22 19:29:11 PDT 2015
// Last Modified: Thu Oct 22 19:29:13 PDT 2015
// Filename:      scripts/format.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Display /formats pages.
//


//////////////////////////////
//
// displayFormatContent --
//

function displayFormatContent() {
	var content = document.querySelector('#content');
	if (!content) {
		return;
	}

   var request = new XMLHttpRequest();
   request.open('GET', 'info.txt');
   request.addEventListener('load', function() {
      if (request.status == 200) {
         try {
				var aton = new ATON();
				aton.setOnlyChildRoot();
            var parsed = aton.parse(request.responseText);
				content.innerHTML = getContent(parsed);
				setupZoom(parsed);
         } catch(err) {
            console.log('Error parsing search results: %s', err);
            console.log('ATON data:', request.responseText);
         }
      } else {
         console.log('Error retrieving search result:', queryUrl);
         console.log('Returned data',request.responseText);
      }
   });
   request.send();
}



//////////////////////////////
//
// getContent --
//

function getContent(info) {
	var output = '<h1>' + document.title + '</h1>';
	output += renderContent(info);
	return output;
}



//////////////////////////////
//
// setupZoom --
//

function setupZoom(info) {
	var number;
	if (Array.isArray(info.SAMPLE)) {
		for (var i=0; i<info.SAMPLE.length; i++) {
			number = info.SAMPLE[i].NUMBER;
			(function(number) {
   			$('#zoom' + info.SAMPLE[i].NUMBER).slider()
      			.on('slide', function(ev){
         			var gt = document.querySelector('#sample-scan-' + number);
         			gt.style['background-size'] = ev.value + 'px';
						var overlay = document.querySelector('#overlay' + number);
						overlay.style['width'] = ev.value + 'px';
      			});
			})(number);
		}
	} else {
		number = info.SAMPLE.NUMBER;
		(function(number) {
   		$('#zoom' + info.SAMPLE.NUMBER).slider()
      			.on('slide', function(ev){
         		var gt = document.querySelector('#sample-scan-' + number);
         		gt.style['background-size'] = ev.value + 'px';
					var overlay = document.querySelector('#overlay' + number);
					overlay.style['width'] = ev.value + 'px';
      		});
		})(number);
	}
}



