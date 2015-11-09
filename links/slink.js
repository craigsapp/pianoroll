//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Wed Oct 21 09:28:12 PDT 2015
// Last Modified: Sun Nov  8 18:53:28 PST 2015
// Filename:      slink.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// Description:   Searchable links object.
//
// Example entry:
//
// @BEGIN: LINK
// @TITLE:          Title for the link entry
// @URL:            URL for the link entry.  A space will terminate the link,
//                  and a parenthetical comment about the link may follow.
//                  More that one @URL entry can be given, as well as
//                  @URL2-@URL9 which function equally to allow multiple links
//                  listed for the entry.
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
	this.categoryOrder = [];
	this.flatList      = [];
	this.categoryList  = {};
	return this;
}


//////////////////////////////
//
// SLINK prototypes -- Fill in dummy contents for now.  Real
//     definitions are in slink.html.
//

// Templates loaded later, defined in slink.html:
SLINK.prototype.entryTemplate        = '';
SLINK.prototype.defaultEntryTemplate = '';
SLINK.prototype.searchTemplate       = '';
SLINK.prototype.catButtonsTemplate   = '';
SLINK.prototype.categoryTemplate     = '';
SLINK.prototype.subcategoryTemplate     = '';

// Template rendering functions, defined laster in slink.html:
SLINK.prototype.renderSearchForm      = function() { return 'Error1'; };
SLINK.prototype.renderCatButtons      = function() { return 'Error2'; };
SLINK.prototype.renderCategoryList    = function() { return 'Error3'; };
SLINK.prototype.renderSubcategoryList = function() { return 'Error4'; };
SLINK.prototype.renderFlatList        = function() { return 'Error5'; };



//////////////////////////////
//
// SLINK.prototype.addLinkEntry -- Add a link to the list (both flat and
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

	if (this.categoryList[entry.CATEGORY]) {
		this.categoryList[entry.CATEGORY].links.push(entry);
	} else {
		this.addLinkCategory(entry.CATEGORY);
		this.categoryList[entry.CATEGORY].links.push(entry);
	}

	if (entry.category2) {
		if (this.categoryList[entry.CATEGORY2]) {
			this.categoryList[entry.CATEGORY2].push(entry);
		} else {
			this.addLinkCategory(entry.CATEGORY2);
			this.categoryList[entry.CATEGORY2].push(entry);
		}
	}

	if (entry.category3) {
		if (this.categoryList[entry.CATEGORY3]) {
			this.categoryList[entry.CATEGORY3].push(entry);
		} else {
			this.addLinkCategory(entry.CATEGORY3);
			this.categoryList[entry.CATEGORY3].push(entry);
		}
	}

}



//////////////////////////////
//
// SLINK.readData -- Add list of links to object.
//

SLINK.prototype.readData = function (data) {
	// .ORDER == order to display categories.	
	// .ORDER.CATEGORY[].SHORT == abbreviated category title
	// .ORDER.CATEGORY[].LONG  == abbreviated category title
	// .LINK  == array of links.

	if (data.ORDER) {
		this.categoryList  = {};
		this.categoryOrder = [];
		this.flatList      = [];

		if (data.ORDER.CATEGORY) {
			for (var i=0; i<data.ORDER.CATEGORY.length; i++) {
				this.categoryOrder.push({
					longname:  data.ORDER.CATEGORY[i].LONG,
					shortname: data.ORDER.CATEGORY[i].SHORT
				});
				this.addLinkCategory(data.ORDER.CATEGORY[i].SHORT,
				                     data.ORDER.CATEGORY[i].LONG);
			}
		}

	}

	this.addLinkEntry(data.LINK);
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
// SLINK.prototype.linksToHtml -- Convert the list of links
//    into HTML content, displayed by category.
//

SLINK.prototype.linksToHtml = function () {
	var output = '';
	output += this.renderCategoryList(this.categoryList);
	var linkcount = document.querySelector('#link-count');
	var count = this.getLinkCount();
	if (linkcount) {
		linkcount.innerHTML = count;
	}
	return output;
}



//////////////////////////////
//
// SLINK.prototype.loadAtonLinks --
//

SLINK.prototype.loadAtonLinks = function (element) {
	if (!element.title) {
		return;
	}
	var file = element.title;
	element.title = ' ';
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
            var parsed = aton.parse(request.responseText);
				that.readData(parsed);
				element.innerHTML = that.linksToHtml();
				showBriefListings();
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

SLINK.prototype.getSearchInterface = function () {
	return SLINK.prototype.renderSearchForm();
};



//////////////////////////////
//
// SLINK.prototype.loadSearchInterface -- Given an element or null,
//		fill in the appropriate element with a search form.
//

SLINK.prototype.loadSearchInterface = function(element) {
	if (!element) {
		element = document.querySelector('.slink-search');
	}
	if (!element) {
		console.log('Cannot create search interface. No slink-search class element.');
		console.log(document.body);
		return false;
	}
	element.innerHTML = SLINK.prototype.getSearchInterface();
	element.querySelector('#search-text').focus();
	return true;
};



///////////////////////////////////////////////////////////////////////////
//
// Handlebar helping functions
//

//////////////////////////////
//
// url helper --
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
// getUrlText helper --
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



//////////////////////////////
//
// anchor helper -- Create a hyperlink anchor, replacing spaces
//    with underscores.
//

Handlebars.registerHelper('anchor', function(link) {
	if (link) {
		return '<a name="' + link.replace(/\s+/g, '_') + '"> </a>';
	} else {
		return '';
	}
});



//////////////////////////////
//
// subCategoriesList helper --
//

Handlebars.registerHelper('subCategoriesList', function(catlist) {
	if (!catlist) {
		return '';
	}
	if (catlist.length == 0) {
		return '';
	}

	var i;
	var sublist = new SLINK;

	for (i=0; i<catlist.links.length; i++) {
		var copy = JSON.parse(JSON.stringify(catlist.links[i]));
		copy.CATEGORY = copy.SUBCATEGORY;
		sublist.addLinkCategory(copy.CATEGORY);
		sublist.addLinkEntry(copy);
	}

	var count = sublist.getCategories().length;
	var output;
	if ((count == 1) || (sublist.flatList.length < 10)) {
		output = sublist.renderFlatList(sublist.flatList);
	} else {
		output = sublist.renderSubcategoryList(sublist.categoryList);
	}
	return new Handlebars.SafeString(output);
});



///////////////////////////////////////////////////////////////////////////
//
// User interface --
//

var LINKS = null;


//////////////////////////////
//
// DOMContentLoaded event listener -- What to do once the page has
//   been loaded (add the links to the page).
//

document.addEventListener('DOMContentLoaded', function() {

	// Fill in templates:
	SLINK.prototype.searchTemplate = document.querySelector(
			'#slink-search-template').innerHTML;
	SLINK.prototype.entryTemplate = document.querySelector(
			'#slink-flat-template').innerHTML;
	SLINK.prototype.catButtonsTemplate = document.querySelector(
			'#slink-catbuttons-template').innerHTML;
	SLINK.prototype.categoryTemplate = document.querySelector(
			'#slink-list-template').innerHTML;
	SLINK.prototype.subcategoryTemplate = document.querySelector(
			'#slink-sublist-template').innerHTML;

	// Fill in rendering functions:
	SLINK.prototype.renderSearchForm =
			Handlebars.compile(SLINK.prototype.searchTemplate);
	SLINK.prototype.renderCatButtons =
			Handlebars.compile(SLINK.prototype.catButtonsTemplate);
	SLINK.prototype.renderCategoryList =
			Handlebars.compile(SLINK.prototype.categoryTemplate);
	SLINK.prototype.renderSubcategoryList =
			Handlebars.compile(SLINK.prototype.subcategoryTemplate);
	SLINK.prototype.renderFlatList =
			Handlebars.compile(SLINK.prototype.entryTemplate);

	LINKS = new SLINK;
	LINKS.loadSearchInterface();
	LINKS.loadLinks();

	Handlebars.registerPartial('entryList',
			SLINK.prototype.entryTemplate);
	Handlebars.registerPartial('catButtons',
			SLINK.prototype.catButtonsTemplate);

	var mc = document.querySelector('#main-content');
	mc.addEventListener("click", handleShiftClick);

});



//////////////////////////////
//
// loadLinks -- Display list of links on page (when the links
//   file is in the ATON format).
//

SLINK.prototype.loadLinks = function () {
	var slinks = document.querySelectorAll('[class^="slink"]');
	for (var i=0; i<slinks.length; i++) {
		if (!slinks[i].title) {
			continue;
		}
		this.loadAtonLinks(slinks[i]);
	}
}



//////////////////////////////
//
// handleAltClick -- When alt-click is done on a collapsed link
//    entry, the entry will not expand, but rather the first
//    URL link in the entry will be opened in anoother browser
//    tab.  This allows quick access to the linked pages while
//    viewing the link list in brief display mode.
//

function handleShiftClick(event) {
	if (!event.altKey) {
		return;
	}
	if (!event.path) {
		return;
	}
	var i;
	for (i=0; i<event.path.length; i++) {
		if ((event.path[i].tagName == 'SUMMARY') &&
			 (event.path[i].className.match(/\blink-entry\b/))) {
			var parent = event.path[i].parentNode;
			if (parent.nodeName != 'DETAILS') {
				break;
			}
			event.stopPropagation();
			event.preventDefault();
			var link = parent.querySelector("a");
			var a = document.createElement('A');
			a.href = link;
			a.target = '_new';
			a.style.display = 'none';
			document.body.appendChild(a);
			a.click();
			break;
		}
	}
}



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
	var details = document.querySelectorAll('details.link-category');
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
	var count = 0;
	if (element) {
		element.value = '';
		count = LINKS.displayAllLinks();
	}
	if (count > 1) {
		showBriefListings();
	}
}



//////////////////////////////
//
// showBriefListings --
//

function showBriefListings() {
   // show a brief list of all links.
	var i;
	var details = document.querySelectorAll('details.link-entry');
	for (i=0; i<details.length; i++) {
		details[i].open = false;
	}
	var categories = document.querySelectorAll('details.link-category');
	for (i=0; i<categories.length; i++) {
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
		matches.displaySearchResults();
	}
}



///////////////////////////////
//
// displaySearchResults -- Display search results, which are a list
//   of link entries.  The link entries belong to various categories,
//   so show the category when a new one appears in the list.
//

SLINK.prototype.displaySearchResults = function () {
	this.displayAllLinks();
	this.showMatchCounts();
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
	var output = new SLINK;
   output.categoryOrder = this.categoryOrder;
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
	links = this.flatList;
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
			output.addLinkEntry(links[j]);
		}
	}
	return output;
};



//////////////////////////////
//
// getCategories -- Return an array of all link categories.
//

SLINK.prototype.getCategories = function () {
	var output = [];
	if (!this.categoryList) {
		return output;
	}
	for (var property in this.categoryList) {
		if (this.categoryList.hasOwnProperty(property)) {
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
	var cats = this.getCategories();
	return cats[index];
}



//////////////////////////////
//
// SLINK.prototype.displayAllLinks -- Show a complete list of all links.
//  The contents of the LINKS object is expected to be complete.
//

SLINK.prototype.displayAllLinks = function () {

	var slinks = document.querySelectorAll('[class^="slink"]');
	for (var i=0; i<slinks.length; i++) {
		if (!slinks[i].title) {
			continue;
		}
		slinks[i].innerHTML = this.linksToHtml();
	}

	var count = this.getLinkCount();
	if (count == 1) {
		openAllLinks();
	} else if (count > 1) {
		showBriefListings();
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
   	linkCategory: []
	}
	var cat = tempLINKS.linkCategory;
	var lastheading = '';
	var heading = '';
	for (var i=0; i<inlinks.length; i++) {
		heading = inlinks[i].heading;
		if (heading !== lastheading) {
			tempLINKS.addLinkCategory(heading);
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
			// document.querySelector('details.category').open = true;
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
		var list = this.categoryList[cat[i]].links;
		if (list) {
			counter += list.length;
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
	return this.flatList.length;
}



//////////////////////////////
//
// addLinkCategory -- Append a new category to the LINKS object.
//    If the third parameter is empty, then assign to LINKS; otherwise,
//    assign new category to input object.
//

SLINK.prototype.addLinkCategory = function (short, long) {
	if (!long) {
		long = this.getLongCategoryName(short);
	}
	if (!long) {
		long = short;
	}
	if (this.categoryList[long]) {
		// don't add the same category twice.
		return;
	}
   var cat = this.getCategories();
	var entry = {
		longname:  long,
		shortname: short,
		index:     cat.length,
		preface:   '',
		links:     []
	};
	this.categoryList[short] = entry;
}



//////////////////////////////
//
// getLongCategoryName -- Give a short name, get the long name.
//

SLINK.prototype.getLongCategoryName = function (shortname) {
	for (var i=0; i<this.categoryOrder.length; i++) {
		if (this.categoryOrder[i].shortname == shortname) {
			return this.categoryOrder[i].longname;
		}
	}
	
	for (var property in this.categoryList) {
		if (this.categoryList.hasOwnProperty(property)) {
			if (property.shortname == shortname) {
				return property.longname;
			}
		}
	}
	return null;
}



//////////////////////////////
//
// openCategoryLinks --
//

function openCategoryLinks(event) {

	// don't let the click directly affect the category details click toggle:
	event.stopPropagation();
	event.preventDefault();
	var element = event.target;
	while (element.parentNode) {
		if (element.nodeName === 'DETAILS') {
			break;
		}
		element = element.parentNode;
	}
	if (element.nodeName !== 'DETAILS') {
		return;
	}
	element.open = 'open';

	var details = element.querySelectorAll('details');
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// closeCategoryLinks --
//

function closeCategoryLinks(index) {
	// don't let the click directly affect the category details click toggle:
	event.stopPropagation();
	event.preventDefault();
	var element = event.target;
	while (element.parentNode) {
		if (element.nodeName === 'DETAILS') {
			break;
		}
		element = element.parentNode;
	}
	if (element.nodeName !== 'DETAILS') {
		return;
	}
	if (element.open) {
		element.removeAttribute('open');
	}

	var details = element.querySelectorAll('details.link-entry');
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}



//////////////////////////////
//
// closeEventLinks -- Minimize individual link entries (but
//    does not affect category level (or subcategory levles).
//

function closeEventLinks(event) {
	// don't let the click directly affect the category details click toggle:
	event.stopPropagation();
	event.preventDefault();
	var element = event.target;
	while (element.parentNode) {
		if (element.nodeName === 'DETAILS') {
			break;
		}
		element = element.parentNode;
	}
	if (element.nodeName !== 'DETAILS') {
		return;
	}
	var details = element.querySelectorAll('details.link-entry');
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}



