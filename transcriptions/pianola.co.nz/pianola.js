//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Oct 25 03:04:14 PDT 2015
// Last Modified: Mon Nov  2 12:04:53 PST 2015
// Filename:      pianola.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Searching display of Pianola.co.nz collection records.
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
var ROWS = [];
var ROWINDEX = 0;
var MAXCYCLE = 1000;
var TABLE = null;
var SEARCHNUM = 1;


//////////////////////////////
//
// displayRows --
//

function displayRows() {
	if (!TABLE) {
		return;
	}
	var counter = 0;
	while (ROWINDEX < ROWS.length) {
		TABLE.appendChild(ROWS[ROWINDEX++]);
		if (++counter > MAXCYCLE) {
			return;
		}
	}
	// document.body.style.cursor = 'auto';
}



//////////////////////////////
//
// addHeaderRow -- Add a header row to a table body.
//

function addHeaderRow(parent) {
	var tr = document.createElement('TR');
	var output = '';
	output += '<th style="cursor:pointer;" onclick="sortByCatalog();">catalog</th>';
	output += '<th style="cursor:pointer;" onclick="sortByDate();">date</th>';
	output += '<th style="cursor:pointer;" onclick="sortByTitle();">title</th>';
	output += '<th style="cursor:pointer;" onclick="sortByComposer();">composer</th>';
	output += '<th style="cursor:pointer;" onclick="sortByPerformer();">performer</th>';
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

	TABLE = tbody;
	ROWS = [];
	ROWINDEX = 0;
	// document.body.style.cursor = 'wait';

	return tbody;
}



//////////////////////////////
//
// displayAllEntries --
//

function displayAllEntries(entries, counter) {
	DISPLAY = entries;
	var parent = prepareNewTable();
	var mcount = 0;
	for (var i=0; i<entries.length; i++) {
		displayEntry(parent, entries[i]);
		mcount++;
		if (counter != SEARCHNUM) {
			return;
		}
	}
	setCount(mcount);
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

	var xbrand;
	if (entry.XBRAND) {
		xbrand = entry.XBRAND;
	} else {
		xbrand = entry.BRAND
				.replace(/Hand[ -]+Played/, '<span class="abbr" title="Hand Played">HP</span>')
				.replace('Word Roll', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('With Words', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('With Song Words', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('Melody Roll', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace(/Song[ -]Roll/, '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('Popular Roll', '<span class="abbr" title="PopularZRoll">PR</span>')
				.replace('Singing Roll', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('Singing Record', '<span class="abbr" title="WordZRoll">WR</span>')
				.replace('88 Note', '88-note')
				.replace('Eighty-Eight Note', '88-note')
				.replace('Recording', '')
				.replace('Record', '')
				.replace('Music Roll', '')
				.replace('Reproducing', '')
				.replace('Guaranteed', '')
				.replace(/Player Roll\b/, '')
				.replace(/\bRoll\b/, '')
				.replace(/WordZRoll/, 'Word Roll')
				;
	}

	var output = '';

	/// Manufacturer ########################################################
	output += '<td>';
	output += xbrand;
	output += ' ';
	output += entry.NUMBER;
	output += '</td>';

	/// Date ###############################################################
	output += '<td>';
	output += entry.RDATE;
	output += '</td>';

	/// Title ##############################################################
	output += '<td>' + titlecontent		+ '</td>';

	/// Composer ###########################################################
	output += '<td>' + compcontent			+ '</td>';

	/// Performer ##########################################################
	output += '<td>' + perfcontent 		 	+ '</td>';

	tr.innerHTML = output;
	// parent.appendChild(tr);
	ROWS.push(tr);
}



//////////////////////////////
//
// getPerformerContent --
//

function getPerformerContent(entry) {
	return entry.PIANIST;
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
	if (entry.SCAN.match(/Gr[ae]yscale-1/i)) {
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
	if (!entry.MIDIFILE) {
		return entry.TITLE;
	}
	var prefix = "http://www.pianola.co.nz/public/midi/";
	var output = "";
	var mf = entry.MIDIFILE;
	mf = mf.replace(/\(/g, "%28")
	       .replace(/\)/g, "%29")
	       .replace(/ /g, "%20")
	       .replace(/"/g, "%22")
	       .replace(/'/g, "%27")
	       .replace(/&/g, "%26")
	       .replace(/!/g, "%21")
	       .replace(/#/g, "%23");
	output += '<a href="' + prefix + mf + '">';
	output += entry.TITLE;
	output += '</a>';
	return output;
}



//////////////////////////////
//
// setCount --
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
// initializePage --
//

function initializePage() {
	addSearchFields(ENTRIES);
	var myhash = location.hash;
	myhash = myhash.replace(/^#/, "")
	               .replace(/%20/g, " ")
	               .replace(/_/g, " ");
	if (myhash) {
		var search = document.querySelector('#search-text');
		search.value = myhash;
		doSearch();
	} else {
		var counter = ++SEARCHNUM;
		displayAllEntries(ENTRIES, counter);
	}
}



//////////////////////////////
//
// loadIndex --
//

function loadIndex(file) {
	if (localStorage.pianola) {
		ENTRIES = JSON.parse(localStorage.pianola);
		initializePage();
		return;
	}
   var request = new XMLHttpRequest();
   request.open('GET', file);
   request.addEventListener('load', function() {
      if (request.status == 200) {
         try {
				var aton = new ATON();
				aton.setOnlyChildRoot();
            ENTRIES = aton.parse(request.responseText);
				localStorage.pianola = JSON.stringify(ENTRIES);
				initializePage();
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
	setTimeout(doRealSearch, 400, counter);
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

	if (event) {
		if (event.keyCode == EnterKey) {
			suppressEnter(event);
			return;
		}
		if (event.metaKey) {
			return;
		}
	}

	var element = prepareNewTable();

	var search = document.querySelector('#search-text');
	var searchstring = search.value;

	if (searchstring.match(/^\s*$/)) {
		clearSearch();
	} else {
   	var matches = getEntryMatches(searchstring, element);
		setCount(matches);
	}
}



//////////////////////////////
//
// clearSearch -- Clear the search query and the search results.
//

function clearSearch() {
	setCount(ENTRIES.length);
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
		return;
	}
}




/////////////////////////////
//
// getEntryMatches -- Return a list of the entries which 
//     match to the given query string. 
//

function getEntryMatches(searchstring, parent) {
	var counter = 0;
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
			counter++;
			displayEntry(parent, entries[j]);
		}
	}
	return counter;
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
	var A = a.DATE.replace(/[^0-9]/g, '');
	var B = b.DATE.replace(/[^0-9]/g, '');;

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
	var A = a.SCAN;
	var B = b.SCAN;

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
	var A = a.SCANNER.replace(/^.* /, '');
	var B = b.SCANNER.replace(/^.* /, '');
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
	a = parseInt(a.CATALOG);
	b = parseInt(b.CATALOG);
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



