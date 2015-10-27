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
var SEARCHNUM = 1;



//////////////////////////////
//
// displayEntries --
//

function displayEntries(entries, counter) {
	var element = document.querySelector('#content');
	if (!element) {
		return;
	}
	DISPLAY = entries;
	if (counter && (counter != SEARCHNUM)) {
		return;
	}

	var output = '';
	output += '<style>';
	output += '	table.pr-table { width: 100%; display: table !important;}';
	output += '	table.pr-table tr { width: 100%; }';
	output += '	table.pr-table { margin: 0; }';
	output += '	table.pr-table td { padding: 2px 4px; }';
	output += '	table.pr-table td:nth-child(2) { width:40%; text-align: left; }';
	output += '	table.pr-table td:nth-child(3) { padding:0; }';
	output += '	table.pr-table th:nth-child(3) { padding:0; }';
	output += '	table.pr-table td { font-size: 11pt; }';
	output += '	table.pr-table tr:nth-child(odd) { background-color: #fdfbf6; }';
	output += '</style>';
	output += '<table class="pr-table">';
	output += '<tr>';
	output += '<th style="cursor:pointer;" onclick="sortByCallnum();">call#</th>';
	output += '<th style="cursor:pointer;" onclick="sortByTitle();">title</th>';
	output += '<th></th>';
	output += '<th style="cursor:pointer;" onclick="sortByComposer();">composer</th>';
	output += '<th style="cursor:pointer;" onclick="sortByPerformer();">performer</th>';
	output += '</tr>';
	var splitperf;
	var longperf;

	var perfcontent;
	var compcontent;
	for (var i=0; i<entries.length; i++) {
		perfcontent = getPerformerContent(entries[i]);
		compcontent = getComposerContent(entries[i]);
		output += '<tr>';
		output += '<td>' + '<a href="https://searchworks.stanford.edu/view/';
		output += entries[i].SEARCHWORKS	+ '" target="_new">';
		output += entries[i].CALLNUM;
		output += '</a>';
		output += '</td>';
		output += '<td>' + entries[i].TITLE		+ '</td>';
		output += '<td>';
		if (entries[i].YOUTUBE) {
			output += '<span class="youtube"><a href="https://www.youtube.com/watch?v=';
			output += entries[i].YOUTUBE;
			output += '" target="_new"><img style="min-width:20px;" src="/images/youtube-thumbnail.png"></a></span>';
		}
		output += '</td>';
		output += '<td>' + compcontent			+ '</td>';
		output += '<td>' + perfcontent 		 	+ '</td>';
		output += '</tr>';
	}
	output += '</table>';

	element.innerHTML = output;
	setCount(entries.length);

   // These are needed because filling qtips are slow
	// for > 2000 qtips, so only fill them in 1 second after
	// searching, and the calling code will cancel them
	// if someone types a new search before the two seconds
	// is over.
	setTimeout(qtipPerformer, 2000, counter);
	setTimeout(qtipComposer, 2000, counter);
}



//////////////////////////////
//
// qtipPerformer --
// 

function qtipComposer(counter) {
	if (!counter || (counter == SEARCHNUM)) {
		$('span.composer').qtip(
			{
				show: { delay: 0 },
				position: {
					my: 'top left',
					at: 'bottom right'
				},
				style: { classes: 'qtip-youtube' }
			}
		);
	}
}



//////////////////////////////
//
// qtipPerformer --
// 

function qtipPerformer(counter) {
	if (!counter || (counter == SEARCHNUM)) {
		$('span.performer').qtip(
			{
				show: { delay: 0 },
				position: {
					my: 'top right',
					at: 'bottom left'
				},
				style: { classes: 'qtip-youtube' }
			}
		);
	}
}



//////////////////////////////
//
// getPerformerContent --
//

function getPerformerContent(entry) {
	if (entry.PERFORMER_CONTENT) {
		return entry.PERFORMER_CONTENT;
	}
	var output = "";
	if (Array.isArray(entry.PERFORMER)) {
		for (var i=0; i<entry.PERFORMER.length; i++) {
			output += getPerformerMarkup(entry.PERFORMER[i]);
			if (i < entry.PERFORMER.length-1) {
				output += ', ';
			}
		}
	} else {
		output += getPerformerMarkup(entry.PERFORMER);
	}

	entry.PERFORMER_CONTENT = output;
	return output;
}



//////////////////////////////
//
// getComposerContent --
//

function getComposerContent(entry) {
	if (entry.COMPOSER_CONTENT) {
		return entry.COMPOSER_CONTENT;
	}
	var output = "";
	if (Array.isArray(entry.COMPOSER)) {
		for (var i=0; i<entry.COMPOSER.length; i++) {
			output += getComposerMarkup(entry.COMPOSER[i]);
			if (i < entry.COMPOSER.length-1) {
				output += ', ';
			}
		}
	} else {
		output += getComposerMarkup(entry.COMPOSER);
	}

	entry.COMPOSER_CONTENT = output;
	return output;
}



///////////////////////////////
//
// getPerformerMarkup --
//

function getPerformerMarkup (entry) {
	var dates     = "";
	var person    = "";
	var lastname  = "";
	var firstname = "";
	if (entry.match(/::/)) {
		var two = entry.split(/\s*::\s*/);
		person = two[0];
		dates = two[1];
	} else {
		person = entry;
	}
	lastname = person;
	firstname = "";
	if (person.match(/, /)) {
		two = person.split(/\s*,\s*/);
		lastname = two[0];
		firstname = two[1];
	}
	var output = '';
	output += '<span class="performer" title="' + firstname + ' ' + lastname;
	if (dates) {
		output += ' (' + dates.replace(/-/g, '&ndash;')  + ')';
	}
	output += '">';
	output += lastname.replace(/\s/g, '&nbsp;');
	output += '</span>';
	return output;
}



///////////////////////////////
//
// getComposerMarkup --
//

function getComposerMarkup (entry) {
	var dates     = "";
	var person    = "";
	var lastname  = "";
	var firstname = "";
	if (entry.match(/::/)) {
		var two = entry.split(/\s*::\s*/);
		person = two[0];
		dates = two[1];
	} else {
		person = entry;
	}
	lastname = person;
	firstname = "";
	if (person.match(/, /)) {
		two = person.split(/\s*,\s*/);
		lastname = two[0];
		firstname = two[1];
	}
	var output = '';
	output += '<span class="composer" title="' + firstname + ' ' + lastname;
	if (dates) {
		output += ' (' + dates.replace(/-/g, '&ndash;')  + ')';
	}
	output += '">';
	output += lastname.replace(/\s/g, '&nbsp;');
	output += '</span>';
	return output;
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
					var counter = ++SEARCHNUM;
					displayEntries(ENTRIES, counter);
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
		if (!entries[i].PERFORMER) {
			entries[i].PERFORMER = "";
		}
		if (!entries[i].COMPOSER) {
			entries[i].COMPOSER = "";
		}
		if (!entries[i].TITLE) {
			entries[i].TITLE = "";
		}
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
	var currSearch = ++SEARCHNUM;
	var element = document.querySelector('#search-text');
	if (element) {
		element.innerHTML = '';
	}

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
		if (currSearch == SEARCHNUM) {
			displayEntries(matches, currSearch);
		}
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
		var counter = ++SEARCHNUM;
		displayEntries(ENTRIES, counter);
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
	var counter = ++SEARCHNUM;
	displayEntries(ENTRIES, counter);
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
	var counter = ++SEARCHNUM;
	displayEntries(ENTRIES, counter);
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
	var counter = ++SEARCHNUM;
	displayEntries(ENTRIES, counter);
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
	var counter = ++SEARCHNUM;
	displayEntries(ENTRIES, counter);
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



