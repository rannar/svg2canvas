window.onload = function(){

	var svg = document.getElementById('shapeSvg');

	getAttribute(svg);
	console.log(jsstr);
}
var elementId = 1;
var jsstr = '';
function getAttribute(element){
	console.log(element.attributes);
	for(var i = 0; i < element.attributes.length; i++){
		var tagName = element.tagName;
		var attributeName = element.attributes[i].name;
		var attributeValue = element.getAttribute(attributeName);
		jsstr += element.tagName + elementId +'.setAttribute("'+attributeName+'","'+attributeValue+'");'; 
	}
	element.id = elementId;
	for(var i = 0; i < element.children.length; i++){
    	var childelement = element.children[i];
    	var tagName = childelement.tagName;
    	console.log("parent element",element.id);
    	elementId++;
    	jsstr += 'var ' + tagName + elementId + ' = createTag("'+childelement.tagName+'");';
    	jsstr += element.tagName + element.id  + '.appendChild('+tagName+elementId+');';
    	// console.log(element.attributes);
    	getAttribute(childelement);
    }
}