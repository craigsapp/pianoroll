//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Oct 25 03:04:14 PDT 2015
// Last Modified: Tue Oct 27 16:37:14 PDT 2015
// Filename:      iammp.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Searching display of IAMMP collection records.
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
// addHeaderRow -- Add a header row to a table body.
//

function addHeaderRow(parent) {
console.log("ADDING HEADER ROW");
	var tr = document.createElement('TR');
	var output = '';
	output += '<th style="cursor:pointer;" onclick="sortByCatalog();">catalog</th>';
	output += '<th style="cursor:pointer;" onclick="sortByDate();">date</th>';
	output += '<th style="cursor:pointer;" onclick="sortByTitle();">title</th>';
	output += '<th style="cursor:pointer;" onclick="sortByComposer();">composer</th>';
	output += '<th style="cursor:pointer;" onclick="sortByPerformer();">performer</th>';
	output += '<th style="cursor:pointer;" onclick="sortByTranscriber();">transcriber</th>';
	output += '<th style="cursor:pointer;" onclick="sortByCis();">CIS</th>';
	tr.innerHTML = output;
	parent.appendChild(tr);
}



//////////////////////////////
//
// prepareNewTable -- Clear out an old table and put in a new one to get
//     ready to fill.
//

function prepareNewTable() {
	var element = document.querySelector('#content');
	if (!element) {
		return;
	}
	element.innerHTML = '';
	var table = document.createElement('TABLE');
	table.className = 'pr-table';
	element.appendChild(table);
	var tbody = document.createElement('TBODY');
	table.appendChild(tbody);
	addHeaderRow(tbody);
	return tbody;
}



//////////////////////////////
//
// displayAllEntries --
//

function displayAllEntries(entries, counter) {
	DISPLAY = entries;
	var parent = prepareNewTable();
	for (var i=0; i<entries.length; i++) {
		displayEntry(parent, entries[i]);
		if (counter != SEARCHNUM) {
			return;
		}
	}
}



//////////////////////////////
//
// displayEntry -- Display a new entry in the search results table.
//

function displayEntry(parent, entry) {
	var tr = document.createElement('TR');

	var splitperf;
	var longperf;
	var perfcontent;
	var compcontent;
	var titlecontent;
	var ciscontent;
	var transcontent;

	perfcontent  = getPerformerContent(entry);
	compcontent  = getComposerContent(entry);
	titlecontent = getTitleContent(entry);
	ciscontent   = getCisContent(entry);
	transcontent = getTranscriberContent(entry);

	var output = '';

	/// Manufacturer #############################################################
	output += '<td>';
	output += entry.LABEL;
	output += ' ';
	output += entry.ROLL_CATALOG;
	output += '</td>';

	/// Date #####################################################################
	output += '<td>';
	output += entry.ROLL_DATE;
	output += '</td>';

	/// Title ####################################################################
	output += '<td>' + titlecontent		+ '</td>';

	/// Composer #################################################################
	output += '<td>' + compcontent			+ '</td>';

	/// Performer ################################################################
	output += '<td>' + perfcontent 		 	+ '</td>';

	/// Transcriber ##############################################################
	output += '<td>' + transcontent 		 	+ '</td>';

	/// CIS ######################################################################
	output += '<td>' + ciscontent 		 	+ '</td>';

	tr.innerHTML = output;
	parent.appendChild(tr);
}



//////////////////////////////
//
// getPerformerContent --
//

function getPerformerContent(entry) {
	return entry.PERFORMER;
}



//////////////////////////////
//
// getComposerContent --
//

function getComposerContent(entry) {
	return entry.COMPOSER;
}



//////////////////////////////
//
// getTranscriberContent --
//

function getTranscriberContent(entry) {
	return entry.SCANNER.replace(/^.* /, "");
}



//////////////////////////////
//
// getCisContent --
//

function getCisContent(entry) {
	if (entry.SCAN_AVAILABLE.match(/Gr[ae]yscale-1/i)) {
		return "Y";
	} else {
		return "";
	}
}



//////////////////////////////
//
// getTitleContent --
//

function getTitleContent(entry) {
	if (!entry.MIDI_FILE) {
		return entry.TITLE;
	}
	var output = "";
	var mf = entry.MIDI_FILE;
	mf = mf.replace(/\(/g, "%28")
	       .replace(/\)/g, "%29")
	       .replace(/ /g, "%20")
	       .replace(/"/g, "%22")
	       .replace(/'/g, "%27")
	       .replace(/&/g, "%26")
	       .replace(/!/g, "%21")
	       .replace(/#/g, "%23");
	output += '<a href="' + mf + '">';
	output += entry.TITLE;
	output += '</a>';
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
					displayAllEntries(ENTRIES, counter);
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
	var counter = ++SEARCHNUM;
	setTimeout(doRealSearch, 1000, counter);
}


//////////////////////////////
//
// doRealSearch -- The search of 11,000 items takes a couple of seconds, so
//    avoid searching while someone is typing in more text for the search.
//

function doRealSearch(counter) {
	if (counter != SEARCHNUM) {
		return;
	}

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
		setCount(matches);
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
		displayAllEntries(ENTRIES, counter);
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
		doRealSearch(++SEARCHNUM);
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
	
	var entries = ENTRIES;
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
	for (j=0; j<entries.length; j++) {
		results = [];
		for (k=0; k<queries.length; k++) {
			// full entry search
			if (entries[j].search.match(re[k])) {
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
			output.push(entries[j]);
			displayEntry(rtable, entries[j]);
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
	displayAllEntries(ENTRIES, counter);
}



//////////////////////////////
//
// sortByDate --
//

function sortByDate() {
	ENTRIES.sort(dateCompare);
	var counter = ++SEARCHNUM;
	displayAllEntries(ENTRIES, counter);
}



//////////////////////////////
//
// sortByTranscriber --
//

function sortByTranscriber() {
	ENTRIES.sort(transcriberCompare);
	var counter = ++SEARCHNUM;
	displayAllEntries(ENTRIES, counter);
}



//////////////////////////////
//
// sortByCis --
//

function sortByCis() {
	ENTRIES.sort(cisCompare);
	var counter = ++SEARCHNUM;
	displayAllEntries(ENTRIES, counter);
}


//////////////////////////////
//
// performerCompare --
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
		return catalogCompare(a, b);
	}
}



//////////////////////////////
//
// dateCompare --
//

function dateCompare(a, b) {
	var A = a.ROLL_DATE.replace(/[^0-9]/g, '');
	var B = b.ROLL_DATE.replace(/[^0-9]/g, '');;

	if (A.length == 0) {
		return +1;
	}
	if (A < B) {
		return -1;
	} else if (A > B) {
		return +1;
	} else {
		return catalogCompare(a, b);
	}
}



//////////////////////////////
//
// cisCompare --
//

function cisCompare(a, b) {
	var A = a.SCAN_AVAILABLE;
	var B = b.SCAN_AVAILABLE;

	if (A.match(/Gr[ae]yscale-1/)) {
		A = "Y";
	} else {
		A = "";
	}

	if (B.match(/Gr[ae]yscale-1/)) {
		B = "Y";
	} else {
		B = "";
	}

	if (A.length == 0) {
		return +1;
	}
	if (A < B) {
		return -1;
	} else if (A > B) {
		return +1;
	} else {
		return catalogCompare(a, b);
	}
}


//////////////////////////////
//
// transcriberCompare --
//

function transcriberCompare(a, b) {
	var A = a.TRANSCRIBER.replace(/^.* /, '');
	var B = b.TRANSCRIBER.replace(/^.* /, '');
	if (A.length == 0) {
		return +1;
	}
	if (A < B) {
		return -1;
	} else if (A > B) {
		return +1;
	} else {
		return catalogCompare(a, b);
	}
}



//////////////////////////////
//
// sortByCatalog --
//

function sortByCatalog() {
	ENTRIES.sort(catalogCompare);
	var counter = ++SEARCHNUM;
	displayAllEntries(ENTRIES, counter);
}



//////////////////////////////
//
// catalogCompare --
//

function catalogCompare(a, b) {
	a = parseInt(a.ROLL_CATALOG);
	b = parseInt(b.ROLL_CATALOG);
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
	displayAllEntries(ENTRIES, counter);
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
	displayAllEntries(ENTRIES, counter);
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



