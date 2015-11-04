//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Wed Oct 21 09:28:12 PDT 2015
// Last Modified: Wed Oct 21 09:28:22 PDT 2015
// Filename:      slink.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// Description:   Searchable hyper-links class.
//
// Example entry:
//
// @BEGIN: LINK
// @TITLE:          Title for the link entry
// @URL:            URL for the link entry
// @DESCRIPTION:    Short description for the entry
// @CREATION-DATE:  Date added to the list
// @EDIT-DATE:      Date last changed
// @CATEGORY:       category
// @SUBCATEGORY:    sub-category
// @SUBSUBCATEGORY: sub-sub-category
// @CATEGORY2:      secondary category
// @SUBCATEGORY2:   secondary sub-category
// @END:   LINK
//	
//

'use strict';

// Event keyCodes.  See: http://www.javascripter.net/faq/keycodes.htm
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



//////////////////////////////
//
// SLINK constructor -- The slink object is used to manage
//   list of categorized links.
// 

function SLINK() {
	this.flatList = [];
	this.categoryList = {};
	this.entryTemplate = "";

	this.defaultEntryTemplate =									  '\n' +
		'{{#each this}}													\n' +
		'	<details class="link-entry" open>						\n' +
		'		<summary class="link-entry">							\n' +
		'			{{{TITLE}}}												\n' +
		'		</summary>													\n' +
		'		{{#if URL}}{{{url URL}}}{{/if}}						\n' +
		'		{{#if URL2}}{{{url URL2}}}{{/if}}					\n' +
		'		{{#if URL3}}{{{url URL3}}}{{/if}}					\n' +
		'		{{#if URL4}}{{{url URL4}}}{{/if}}					\n' +
		'		{{#if URL5}}{{{url URL5}}}{{/if}}					\n' +
		'		{{#if URL6}}{{{url URL6}}}{{/if}}					\n' +
		'		{{#if URL7}}{{{url URL7}}}{{/if}}					\n' +
		'		{{#if URL8}}{{{url URL8}}}{{/if}}					\n' +
		'		{{#if URL9}}{{{url URL9}}}{{/if}}					\n' +
		'		<p>{{{DESCRIPTION}}}</p>								\n' +
		'	</details>														\n' +
		'{{/each}}															\n';

	return this;
}





//////////////////////////////
//
// SLINK.addLinkEntry -- Add a link to the list (both flat and
//    by category.
//

SLINK.prototype.addLinkEntry = function (entry) {

   if (Array.isArray(entry)) {
		for (var i=0; i<entry.length; i++) {
			this.addLinkEntry(entry[i]);
		}
		return;
	}

	if (!entry) {
		return;
	}


	this.flatList.push(entry);


	if (entry.CATEGORY) {
		if (this.categoryList[entry.CATEGORY]) {
			this.categoryList[entry.CATEGORY].push(entry);
		} else {
			this.categoryList[entry.CATEGORY] = [];
			this.categoryList[entry.CATEGORY].push(entry);
		}
	}

	if (entry.category2) {
		if (this.categoryList[entry.CATEGORY2]) {
			this.categoryList[entry.CATEGORY2].push(entry);
		} else {
			this.categoryList[entry.CATEGORY2] = [];
			this.categoryList[entry.CATEGORY2].push(entry);
		}
	}

	if (entry.category3) {
		if (this.categoryList[entry.CATEGORY3]) {
			this.categoryList[entry.CATEGORY3].push(entry);
		} else {
			this.categoryList[entry.CATEGORY3] = [];
			this.categoryList[entry.CATEGORY3].push(entry);
		}
	}


}



//////////////////////////////
//
// SLINK.getLinkCount -- return the number of link entries
//    in the object.
//

SLINK.prototype.getLinkCount = function () {
	return this.flatList.length;
}



//////////////////////////////
//
// SLINK.prototype.linksToHtml --
//

SLINK.prototype.linksToHtml = function () {
	this.addLinkEntry();

	var output = "";

	var renderLinkList = Handlebars.compile(this.defaultEntryTemplate);
	var categories = this.getCategoryList();
	for (var property in categories) {
		if (categories.hasOwnProperty(property)) {
			output += '<a name="' + property.replace(/\s+/g, '_') + '"> </a>';
			output += '<details open class="link-category">'
			output += '<summary class="category">';
			output += property;
			output += '</summary>';
			output += renderLinkList(categories[property]);
			output += '</details>';
		}
	}
	// var  = this.getFlatList();
	// var html = renderLinkList(listing);
	var linkcount = document.querySelector('#link-count');
	var count = this.getLinkCount();
	if (linkcount) {
		linkcount.innerHTML = count;
	}
	return output;
}



//////////////////////////////
//
// SLINK.loadAtonLinks -- 
//

SLINK.prototype.loadAtonLinks = function (element) {
	if (!element.title) {
		return;
	}
	var file = element.title;
	if (!file) {
		return;
	}
	var that = this;

   var request = new XMLHttpRequest();
   request.open('GET', file);
   request.addEventListener('load', function() {
      if (request.status == 200) {
         try {
				var aton = new ATON();
				aton.setOnlyChildRoot();
            var parsed = aton.parse(request.responseText);
				that.addLinkEntry(parsed);
				element.innerHTML = that.linksToHtml();
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
// SLINK.prototype.getFlatList --
//

SLINK.prototype.getFlatList = function () {
	return this.flatList;
};



//////////////////////////////
//
// SLINK.prototype.getCategoryList --
//

SLINK.prototype.getCategoryList = function () {
	return this.categoryList;
};




///////////////////////////////////////////////////////////////////////////
//
// Static fuctions for SLINK:
//


//////////////////////////////
//
// SLINK.getSearchInterface -- Return HTML code for displaying a
//   search interface.
//

SLINK.getSearchInterface = function () {
	return SLINK.renderSearchForm();
};



//////////////////////////////
//
// SLINK.loadSearchInterface -- Given an element or null, fill in the 
//    appropriate element with a search form.
//

SLINK.loadSearchInterface = function(element) {
	if (!element) {
		element = document.querySelector('.slink-search');
	}
	if (!element) {
		console.log('Cannot create search interface. No slink-search class element.');
		console.log(document.body);
		return false;
	}
	element.innerHTML = SLINK.getSearchInterface();
	element.querySelector('#search-text').focus();
	return true;
};



///////////////////////////////////////////////////////////////////////////
//
// Handlebar helping functions
//

//////////////////////////////
//
// Handlebars helper url --
//

Handlebars.registerHelper('url', function(url) {
	var output = '';
	if (Array.isArray(url)) {
		for (var i=0; i<url.length; i++) {
			output += getUrlText(url[i]);
		}
	} else {
		output += getUrlText(url);
	}
	return new Handlebars.SafeString(output);
});



//////////////////////////////
//
// getUrlText --
//

function getUrlText(url) {
	url = url.replace(/^\s+/, '')
	         .replace(/\s+$/, '');
	var link = url;
	var post = '';
	var matches;
	if (matches = url.match(/^([^\s]+)\s+(.*)$/)) {
		link = matches[1];
		post = matches[2];
	}
	var output = '';
	output += '<a ';
	if (link.length > 90) {
		output += ' style="font-size:80%;" ';
	}
	output += 'href="';
	output += link;
	output += '">';
	output += link;
	output += '</a>';

	if (post) {
		output += ' <span class="url-note">' + post + '</span>';
	}
	output += '<br>';
	return output;
}



///////////////////////////////////////////////////////////////////////////
//
// User interface --
//


//////////////////////////////
//
// event listener keypress -- Perform keyboard commands.
//

document.addEventListener('keypress', function(event) {
	if ((typeof event.target.id !== 'undefined') &&
			event.target.id.match(/search-text/i)) {
		// don't process the keyboard command if searching for text
		return;
	}
	switch (event.keyCode) {
		case BKey:             // show brief listing
			showBriefListings();
			break;

		case CKey:             // close all categories
			closeAllLinks();
			break;

		case OKey:             // open all categories
			openAllLinks();
			break;

		case PKey:             // toggle display of prefaces
			togglePrefaceDisplay();
			break;

		case XKey:             // clear the search
			clearSearch();
			break;

		case IKey:             // toggle display of images
			if (Images) {
				hideImages();
			} else {
				showImages();
			}
			break;

		case TKey:             // go to top of page
			window.scrollTo(0, 0);
			break;
	}
});



//////////////////////////////
//
// openAllLinks --
//

function openAllLinks() {
	var details = document.querySelectorAll('details');
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// closeAllLinks --
//

function closeAllLinks() {
	var details = document.querySelectorAll('details');
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
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
		displayAllLinks(LINKS);
	}
	showBriefListings();
}



//////////////////////////////
//
// showBriefListings --
//

function showBriefListings() {
   // show a brief list of all links.
	var details = document.querySelectorAll('details.link-entry');
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
	var categories = document.querySelectorAll('details.category');
	for (var i=0; i<categories.length; i++) {
		categories[i].open = true;
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



//////////////////////////////
//
// doSearch -- Perform a search on the link entries and 
//   update the list of links with the search results.
//
// #search-text   = ID of search query field.
// #search-scope  = ID of title-only search option.
//

SLINK.prototype.doSearch = function (event) {
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
   var scope = document.querySelector('#search-scope');
	if (scope) {
		scope = scope.checked;
	} else {
		scope = false;
	}

	if (searchstring.match(/^\s*$/)) {
		clearSearch();
	} else {
   	var matches = LINKS.getLinkMatches(searchstring, scope);
		this.displaySearchResults(matches);
	}
}



///////////////////////////////
//
// displaySearchResults -- Display search results, which are a list
//   of link entries.  The link entries belong to various categories,
//   so show the category when a new one appears in the list.
//

SLINK.prototype.displaySearchResults = function (links) {
	var tempLINKS = buildSearchCategories(links);
	displayAllLinks(tempLINKS);
	var count = this.showMatchCounts(tempLINKS);
	openCategoryDetails();
}



//////////////////////////////
//
// openCategoryDetails --
//

function openCategoryDetails() {
	var list = document.querySelectorAll('#categories > details');
	for (var i=0; i<list.length; i++) {
		list[i].open = true;
	}
}



/////////////////////////////
//
// getLinkMatches -- Return a list of the link entries which 
//     match to the given query string.  The scope is "true" if
//     only titles should be searched; otherwise, both title and
//     the main entry text for the link will be searched.
//

SLINK.prototype.getLinkMatches = function(searchstring, scope)  {
	var output = [];
	searchstring = searchstring.replace(/^\s+/, '');
	searchstring = searchstring.replace(/\s+$/, '');
	searchstring = searchstring.replace(/\s+/g, ' ');
	searchstring = searchstring.replace(/ not /g, ' -');
	searchstring = searchstring.replace(/ or /g, ' |');
	var queries = searchstring.split(' ');
	
	var categories = this.getCategories();
	var links;
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
	for (i=0; i<categories.length; i++) {
		links = this.categoryList[categories[i]];
		for (j=0; j<links.length; j++) {
			if (!links[j].raw) {
				links[j].raw = JSON.stringify(links[j]);
			}
			if (!links[j].search) {
				// make this the accented character removed version:
				links[j].search = JSON.stringify(links[j]);
			}
			if (!links[j].title) {
				links[j].title = links[j].TITLE;
			}
			if (!links[j].titlesearch) {
				links[j].titlesearch = links[j].TITLE;
			}
			results = [];
			for (k=0; k<queries.length; k++) {
				if (scope) {
					// title only search
					if (links[j].title.match(re[k])) {
						results.push(true);
					} else if (links[j].titlesearch.match(re[k])) {
						results.push(true);
					} else {
						results.push(false);
					}
				} else {
					// full entry search
					if (links[j].raw.match(re[k])) {
						results.push(true);
					} else if (links[j].search.match(re[k])) {
						results.push(true);
					} else {
						results.push(false);
					}
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
	}
	return output;
};



//////////////////////////////
//
// getCategories -- Return an array of all link categories.
//

SLINK.prototype.getCategories = function (object) {
	if (typeof object === 'undefined') {
		object = this.categoryList;
	}
	var output = [];
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			output.push(property);
		}
	}
	return output;
}



//////////////////////////////
//
// getCategory -- Get a specific category by index.
//

SLINK.prototype.getCategory = function (index) {
	if (typeof object === 'undefined') {
		object = this;
	}
	var cats = this.getCategories();
	return this.getCategories(object)[index];
}



//////////////////////////////
//
// displayAllLinks -- Show a complete list of all links.  The contents
//  of the LINKS object is expected to be complete.
//

function displayAllLinks(object) {
	var count = 0;
	var element = document.querySelector('#categories');
	if (element) {
		var html = renderAllLinks(object);
		element.innerHTML = html;
		count = showMatchCounts(object);
	}
	if (count == 1) {
		openAllLinks();
	} else if (count > 1) {
		closeAllLinks();
	}
}



//////////////////////////////
//
// buildSearchCategories -- Create a temporary LINKS-like structure
//    and store link matches in it (so that the link list template
//    can be used to print the matches).
//

function buildSearchCategories(inlinks) {
	var tempLINKS = {
   	category: []
	}
	var cat = tempLINKS.category;
	var lastheading = '';
	var heading = '';
	for (var i=0; i<inlinks.length; i++) {
		heading = inlinks[i].heading;
		if (heading !== lastheading) {
			addLinkCategory(heading, 'dummy', tempLINKS);
			cat[cat.length - 1].heading = heading;
		}
		lastheading = heading;
		cat[cat.length - 1].links.push(inlinks[i]);
	}
	return tempLINKS;
}



//////////////////////////////
//
// showMatchCounts -- Show number of matched links: the sum at the
//   top of the list, then for each individual list.
//

SLINK.prototype.showMatchCounts = function (object) {
	if (typeof object === 'undefined') {
		object = LINKS;
	}

	var count = 0;
	var linkcount = document.querySelector('#link-count');
	if (linkcount) {
		count = this.getLinkCount(object);
		if (count == 1) {
			// if there is only one match, the display the link
			// link expanded by default.
			document.querySelector('details.category').open = true;
		}
		linkcount.innerHTML = count;
	}

	// show counts for each category
	var slots = document.querySelectorAll('.category-link-count');
	var cat = this.getCategories(object);
	if (cat.length != slots.length) {
		// These should match, give up otherwise
	}
	var counter;
	for (var i=0; i<slots.length; i++) {
		counter = 0;
		for (var j=0; j<cat[i].links.length; j++) {
			if (cat[i].links[j].type === 'link') {
				counter++;
			}
		}
		slots[i].innerHTML = counter;
	}
	return count;
}



//////////////////////////////
//
// getLinkCount -- Return the total number of link entries in
//   the LINKS data structure.  This function will ignore the 
//   entries which are section headings.
//

SLINK.prototype.getLinkCount = function (object) {
	if (typeof object === 'undefined') {
		object = this;
	}
console.log(this.flatList.length);
	return this.flatList.length;
}



//////////////////////////////
//
// addLinkCategory -- Append a new category to the LINKS object.
//    If the third parameter is empty, then assign to LINKS; otherwise,
//    assign new category to input object.
//

function addLinkCategory(heading, templ, object) {
	if (typeof object === 'undefined') {
		object = LINKS;	
	}
console.log("ADDING HEADING", heading);
	var entry = {
		heading: heading,
		templ: templ,
		index: object.category.length,
		preface: '',
		links: []
	};
	object.category.push(entry);
}




