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
		'		<summary>													\n' +
		'			{{{TITLE}}}												\n' +
		'		</summary>													\n' +
		'		{{#if URL}}													\n' +
		'			<a href="{{URL}}">{{URL}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL2}}												\n' +
		'			<a href="{{URL2}}">{{URL2}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL3}}												\n' +
		'			<a href="{{URL3}}">{{URL3}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL4}}												\n' +
		'			<a href="{{URL4}}">{{URL4}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL5}}												\n' +
		'			<a href="{{URL5}}">{{URL5}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL6}}												\n' +
		'			<a href="{{URL6}}">{{URL6}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL7}}												\n' +
		'			<a href="{{URL7}}">{{URL7}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL8}}												\n' +
		'			<a href="{{URL8}}">{{URL8}}</a><br>				\n' +
		'		{{/if}}														\n' +
		'		{{#if URL9}}												\n' +
		'			<a href="{{URL9}}">{{URL9}}</a><br>				\n' +
		'		{{/if}}														\n' +
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
	var slink = new SLINK;
	this.addLinkEntry();

	var output = "";

	var renderLinkList = Handlebars.compile(this.defaultEntryTemplate);
	var categories = this.getCategoryList();
	for (var property in categories) {
		if (categories.hasOwnProperty(property)) {

			output += '<details open class="link-category">'
			output += '<summary>';
			output += property;
			output += '</summary>';
			output += renderLinkList(categories[property]);
			output += '</details>';
		}
	}
	// var  = this.getFlatList();
	// var html = renderLinkList(listing);
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
console.log(parsed);
				that.addLinkEntry(parsed);
console.log("got here", that);
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


