//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Oct 25 03:04:14 PDT 2015
// Last Modified: Sun Oct 25 03:04:17 PDT 2015
// Filename:      condon.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Searching display of Condon collection records.
//

// event keyCodes.  See: http://www.javascripter.net/faq/keycodes.htm
var BackspaceKey =   8;
var DeleteKey    =  46;
var EnterKey     =  13;
var BKey         =  98;
var CKey         =  99;
var HKey         = 104;
var IKey         = 105;
var OKey         = 111;
var PKey         = 112;
var TKey         = 116;
var XKey         = 120;
var EscKey       =  27;

var ENTRIES = [];

//////////////////////////////
//
// displayEntries --
//

function displayEntries(entries, element) {
	if (!element) {
		element = document.querySelector('#content');
	}
	if (!element) {
		return;
	}
	DISPLAY = entries;

	var output = '';
	output += '<style>';
	output += '	table.pr-table { width: 100%; display: table !important;}';
	output += '	table.pr-table tr { width: 100%; }';
	output += '	table.pr-table { margin: 0; }';
	output += '	table.pr-table td { padding: 2px 4px; }';
	output += '	table.pr-table td:nth-child(2) { text-align: left; }';
	output += '	table.pr-table td { font-size: 11pt; }';
	output += '	table.pr-table tr:nth-child(odd) { background-color: #fdfbf6; }';
	output += '</style>';
	output += '<table class="pr-table">';
	output += '<tr>';
	output += '<th style="cursor:pointer;" onclick="sortByCallnum();">call#</th>';
	output += '<th style="cursor:pointer;" onclick="sortByTitle();">title</th>';
	output += '<th style="cursor:pointer;" onclick="sortByComposer();">composer</th>';
	output += '<th style="cursor:pointer;" onclick="sortByPerformer();">performer</th>';
	output += '</tr>';

	var shortperf;
	for (var i=0; i<entries.length; i++) {
		shortperf = entries[i].PERFORMER.replace(/,.*/, "");
		output += '<tr>';
		output += '<td>' + '<a href="https://searchworks.stanford.edu/view/';
		output += entries[i].SEARCHWORKS	+ '" target="_new">';
		output += entries[i].CALLNUM;
		output += '</a>';
		output += '</td>';
		output += '<td>' + entries[i].TITLE			+ '</td>';
		output += '<td>' + entries[i].COMPOSER		+ '</td>';
		output += '<td><span title="' + entries[i].PERFORMER + '">';
		output += shortperf  + '</span></td>';
		output += '</tr>';
	}
	output += '</table>';

	element.innerHTML = output;
	setCount(entries.length);
}


//////////////////////////////
//
// setCounter --
//

function setCount(count, element) {
	if (!element) { 
		element = document.querySelector("#counter");
	}
	if (!element) {
		return;
	}
	var output = "" + count;
	if (count == 1) {
		output += " entry";
	} else {
		output += " entries";
	}
	element.innerHTML = output;
}


//////////////////////////////
//
// loadIndex --
//

function loadIndex(file) {
   var request = new XMLHttpRequest();
   request.open('GET', file);
   request.addEventListener('load', function() {
      if (request.status == 200) {
         try {
				var aton = new ATON();
				aton.setOnlyChildRoot();
            ENTRIES = aton.parse(request.responseText);
				addSearchFields(ENTRIES);
				var myhash = location.hash;
				myhash = myhash.replace(/^#/, "");
				myhash = myhash.replace(/%20/g, " ");
				if (myhash) {
					var search = document.querySelector('#search-text');
					search.value = myhash;
					doSearch();
				} else {
					displayEntries(ENTRIES);
				}
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



/////////////////////////////
//
// addSearchFields --
//

function addSearchFields(entries) {
	for (var i=0; i<entries.length; i++) {
		entries[i].search = JSON.stringify(entries[i]);
	}
}



//////////////////////////////
//
// doSearch -- Perform a search on the link entries and 
//   update the list of links with the search results.
//
// #search-text   = ID of search query field.
//

function doSearch(event) {
	if (event) {
		if (event.keyCode == EnterKey) {
			suppressEnter(event);
			return;
		}
		if (event.metaKey) {
			return;
		}
	}

	var search = document.querySelector('#search-text');
	var searchstring = search.value;

	if (searchstring.match(/^\s*$/)) {
		clearSearch();
	} else {
   	var matches = getEntryMatches(searchstring);
		displayEntries(matches);
	}
}



//////////////////////////////
//
// clearSearch -- Clear the search query and the search results.
//

function clearSearch() {
	var element = document.querySelector('#search-text');
	if (element) {
		element.value = '';
		displayEntries(ENTRIES);
	}
}




//////////////////////////////
//
// suppressEnter -- Prevent the enter key from doing anything in the
//     search query field.
//

function suppressEnter(event) {
	if (event.keyCode == EnterKey) {
		event.stopPropagation();
		event.preventDefault();
		return;
	}
}




/////////////////////////////
//
// getEntryMatches -- Return a list of the entries which 
//     match to the given query string. 
//

function getEntryMatches(searchstring) {
	var output = [];
	searchstring = searchstring.replace(/^\s+/, '');
	searchstring = searchstring.replace(/\s+$/, '');
	searchstring = searchstring.replace(/\s+/g, ' ');
	searchstring = searchstring.replace(/ not /g, ' -');
	searchstring = searchstring.replace(/ or /g, ' |');
	var queries = searchstring.split(' ');
	
	var links = ENTRIES;
	var result = false;
	var results = [];
	var re = [];
	var k;
	var xquery;
   for (k=0; k<queries.length; k++) {
		xquery = queries[k];
		xquery = xquery.replace(/^\|/, '').replace(/^-/, '');
		re[k] = new RegExp(xquery, 'i');
	}
	var i;
	var j;
	var k;
	var m;
	for (j=0; j<links.length; j++) {
		results = [];
		for (k=0; k<queries.length; k++) {
			// full entry search
			if (links[j].search.match(re[k])) {
				results.push(true);
			} else {
				results.push(false);
			}
			if (queries[k].match(/^\|?-/)) {
				results[k] = !results[k];
			}
		}
		// Do AND search: all words must match,
		// but also keeping track of OR states.
		var result = results[0];
		for (k=0; k<results.length; k++) {
			if ((k+1 < results.length) && queries[k+1].match(/^\|/)) {
				var oresult = results[k];
				for (m=k+1; m<results.length; m++) {
					if (queries[m].match(/^\|/)) {
						oresult |= results[m];
					} else {
						break;
					}
				}
				k += m - 1;
				result = result || oresult;
				continue;
			}
			result = result && results[k];
		}
		if (result) {
			output.push(links[j]);
		}
	}
	return output;
}



//////////////////////////////
//
// sortByPerformer --
//

function sortByPerformer() {
	ENTRIES.sort(performerCompare);
	displayEntries(ENTRIES)
}


//////////////////////////////
//
// performerCompare
//

function performerCompare(a, b) {
	var A = a.PERFORMER;
	var B = b.PERFORMER;
	if (A.length == 0) {
		return +1;
	}
	if (A < B) {
		return -1;
	} else if (A > B) {
		return +1;
	} else {
		return callnumCompare(a, b);
	}
}



//////////////////////////////
//
// sortByCallnum --
//

function sortByCallnum() {
	ENTRIES.sort(callnumCompare);
	displayEntries(ENTRIES)
}



//////////////////////////////
//
// callnumCompare --
//

function callnumCompare(a, b) {
	a = parseInt(a.CALLNUM);
	b = parseInt(b.CALLNUM);
	if (a < b) {
		return -1;
	} else if (a > b) {
		return +1;
	} else {
		return 0;
	}
}



//////////////////////////////
//
// sortByTitle --
//

function sortByTitle() {
	ENTRIES.sort(titleCompare);
	displayEntries(ENTRIES)
}



//////////////////////////////
//
// titleCompare --
//

function titleCompare(a, b) {
	a = a.TITLE;
	b = b.TITLE;
	if (a < b) {
		return -1;
	} else if (a > b) {
		return +1;
	} else {
		return 0;
	}
}



//////////////////////////////
//
// sortByComposer --
//

function sortByComposer() {
	ENTRIES.sort(composerCompare);
	displayEntries(ENTRIES)
}



//////////////////////////////
//
// composerCompare --
//

function composerCompare(a, b) {
	a = a.COMPOSER;
	b = b.COMPOSER;
	if (a.length == 0) {
		return +1;
	}
	if (a < b) {
		return -1;
	} else if (a > b) {
		return +1;
	} else {
		return 0;
	}
}







