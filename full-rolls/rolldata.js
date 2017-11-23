var source_{{include.collection}}_rolls = document.querySelector("#{{include.collection}}-rolls-data");
if (!source_{{include.collection}}_rolls) {
	console.log("Error: cannot find roll data for collection {{include.collection}}");
	return;
}
var parsed_{{include.collection}}_rolls = aton.parse(source_{{include.collection}}_rolls.innerText);
var templateSource = document.querySelector('#roll-template').innerHTML;
var template = Handlebars.compile(templateSource);
var htmlcontent_{{include.collection}}_rolls = template(parsed_{{include.collection}}_rolls);
var {{include.collection}}_rolls_list = document.querySelector("#{{include.collection}}-rolls");
{{include.collection}}_rolls_list.innerHTML = htmlcontent_{{include.collection}}_rolls;



