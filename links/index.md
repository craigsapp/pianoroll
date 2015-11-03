---
layout: default
breadcrumbs: [['/','home']]
title: Links
---

<script src="slink.js"></script>
<link rel="stylesheet" href="slink.css">

<script>
// vim: ts=3



document.addEventListener("DOMContentLoaded", function() {
	loadLinks();
});

function loadLinks() {
	var slinks = document.querySelectorAll('[class^="slink"]');
	for (var i=0; i<slinks.length; i++) {
		var slink = new SLINK;
		slink.loadAtonLinks(slinks[i]);
	}
}

</script>



<h1> Links </h1>

<div class="slink" title="links.aton"></div>
