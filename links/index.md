---
layout: default
breadcrumbs: [['/','home']]
title: Links
---

<script src="slink.js"></script>
<link rel="stylesheet" href="slink.css">

{% include slink/slink.html %}

<script>
// vim: ts=3


document.addEventListener("DOMContentLoaded", function() {
	SLINK.loadSearchInterface();
	loadLinks();
});



function loadLinks() {
	var slinks = document.querySelectorAll('[class^="slink"]');
	for (var i=0; i<slinks.length; i++) {
		if (!slinks[i].title) {
			continue;
		}
		LINKS.loadAtonLinks(slinks[i]);
	}
}


</script>



<h1> Links </h1>

<div class="slink-search"></div>
<div id="#categories" class="slink" title="links.aton"></div>


