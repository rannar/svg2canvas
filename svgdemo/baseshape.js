window.onload = function(){

	var svg = document.getElementById('shapeSvg');

	getAttribute(svg);
	// console.log(jsstr);
	console.log(canvsstr);
}
var elementId = 1;
var jsstr = '';
var canvsstr = '';
function getAttribute(element){
	console.log(element.attributes);
	canvsstr += 'var '+element.tagName + elementId +' = svg.CreateElement("'+element.tagName+'",{'
	for(var i = 0; i < element.attributes.length; i++){
		var tagName = element.tagName;
		var attributeName = element.attributes[i].name;
		var attributeValue = element.getAttribute(attributeName);
		// jsstr += element.tagName + elementId +'.setAttribute("'+attributeName+'","'+attributeValue+'");'; 
		if(i != element.attributes.length - 1){
			canvsstr += '"' + attributeName + '":"' + attributeValue +'",';
		}else{
			canvsstr += '"' + attributeName + '":"' + attributeValue +'"';
		}
		
	}
	// canvsstr += '});';
	var textContent = element.textContent.trim();
	if(textContent && (element.nodeName == 'tspan' || element.nodeName == 'text')){
		canvsstr += '},"'+textContent+'");';
	}else{
		canvsstr += '});';
	}
	var eleParent = element.parentNode;
	element.id = elementId;
	canvsstr += eleParent.tagName + eleParent.id  + '.addChild('+element.tagName+element.id+');';

	
	for(var i = 0; i < element.children.length; i++){
    	var childelement = element.children[i];
    	var tagName = childelement.tagName;
    	console.log("parent element",element.id);
    	elementId++;
    	// jsstr += 'var ' + tagName + elementId + ' = createTag("'+childelement.tagName+'");';
    	// jsstr += element.tagName + element.id  + '.appendChild('+tagName+elementId+');';
    	// canvsstr += element.tagName + element.id  + '.addChild('+tagName+elementId+');';
    	// console.log(element.attributes);
    	getAttribute(childelement);
    }
}