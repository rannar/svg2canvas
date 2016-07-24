var RGBColor = require( 'rgbcolor' );
var stackBlur = require( 'stackblur' );

var SVGProperty = function(name,value){
	this.name = name;
	this.value = value;
}

SVGProperty.prototype.getValue = function(){
	return this.value;
}
SVGProperty.prototype.hasValue = function(){
	return (this.value != null && this.value !== '');
}
//return the numerical value of the property
SVGProperty.prototype.numValue = function(){
	if(!this.hasValue()) return 0;

	var n = parseFloat(this.value);
	if((this.value + '').match(/%$/)){
		n = n / 100.0;
	}
	return n;
}

SVGProperty.prototype.valueOfDefault = function(def){
	if(this.hasValue()) return this.value;
	return def;
}

SVGProperty.prototype.numValueOrDefault = function(def) {
	if (this.hasValue()) return this.numValue();
	return def;
}

SVGProperty.prototype.addOpacity = function(opacityProp){
	var newValue = this.value;
	if(opacityProp.value != null && opacityProp.value != '' && typeof this.value == 'string'){
		var color = new RGBColor(this.value);
		if (color.ok) {
			newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';
		}
	}
	return new svg.Property(this.name, newValue);
}

//fill = 'url(#f2:0)' = >svg.Definitions['f2:0'];
SVGProperty.prototype.getDefinition = function(){
	var name = this.value.match(/#([^\)'"]+)/);
	if (name) { name = name[1]; }
	if (!name) { name = this.value; }
	return SVG.Definitions[name];
}

SVGProperty.prototype.isUrlDefinition = function(){
	return this.value.indexOf('url(') == 0;
}

SVGProperty.prototype.getFillStyleDefinition = function(e,opacityProp){
	var def = this.getDefinition();
	//gradient
	if(def != null && def.createGradient){
		return def.createGradient(SVG.ctx, e, opacityProp);
	}
	//pattern
	if(def != null && def.createPattern){
		if (def.getHrefAttribute().hasValue()) {
			var pt = def.attribute('patternTransform');
			def = def.getHrefAttribute().getDefinition();
			if (pt.hasValue()) { 
				def.attribute('patternTransform', true).value = pt.value; 
			}
		}
		return def.createPattern(SVG.ctx, e);
	}
	return null;
}

//length extensions
SVGProperty.prototype.getDPI = function(viewPort){
	return 96.0;
}
SVGProperty.prototype.getEM = function(viewPort){
	var em = 12;
	var fontSize = new SVGProperty('fontSize',SVG.Font.Parse(SVG.ctx.font).fontSize);
	if(fontSize.hasValue()) em = fontSize.toPixels(viewPort);
	return em;
}
svg.Property.prototype.getUnits = function() {
	var s = this.value+'';
	return s.replace(/[0-9\.\-]/g,'');
}

// get the length as pixels
svg.Property.prototype.toPixels = function(viewPort, processPercent) {
	if (!this.hasValue()) return 0;
	var s = this.value+'';
	if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
	if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
	if (s.match(/px$/)) return this.numValue();
	if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
	if (s.match(/pc$/)) return this.numValue() * 15;
	if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
	if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
	if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
	if (s.match(/%$/)) return this.numValue() * SVG.ViewPort.ComputeSize(viewPort);
	var n = this.numValue();
	if (processPercent && n < 1.0) return n * SVG.ViewPort.ComputeSize(viewPort);
	return n;
}

// time extensions
// get the time as milliseconds
svg.Property.prototype.toMilliseconds = function() {
	if (!this.hasValue()) return 0;
	var s = this.value+'';
	if (s.match(/s$/)) return this.numValue() * 1000;
	if (s.match(/ms$/)) return this.numValue();
	return this.numValue();
}

// angle extensions
// get the angle as radians
svg.Property.prototype.toRadians = function() {
	if (!this.hasValue()) return 0;
	var s = this.value+'';
	if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
	if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
	if (s.match(/rad$/)) return this.numValue();
	return this.numValue() * (Math.PI / 180.0);
}

// text extensions
// get the text baseline
var textBaselineMapping = {
	'baseline': 'alphabetic',
	'before-edge': 'top',
	'text-before-edge': 'top',
	'middle': 'middle',
	'central': 'middle',
	'after-edge': 'bottom',
	'text-after-edge': 'bottom',
	'ideographic': 'ideographic',
	'alphabetic': 'alphabetic',
	'hanging': 'hanging',
	'mathematical': 'alphabetic'
};
svg.Property.prototype.toTextBaseline = function () {
	if (!this.hasValue()) return null;
	return textBaselineMapping[this.value];
}