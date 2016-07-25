/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */

// canvg(target, s)
// empty parameters: replace all 'svg' elements on page with 'canvas' elements
// target: canvas element or the id of a canvas element
// s: svg string, url to svg file, or xml document
// opts: optional hash of options
//		 ignoreMouse: true => ignore mouse events
//		 ignoreAnimation: true => ignore animations
//		 ignoreDimensions: true => does not try to resize canvas
//		 ignoreClear: true => does not clear canvas
//		 offsetX: int => draws at a x offset
//		 offsetY: int => draws at a y offset
//		 scaleWidth: int => scales horizontally to width
//		 scaleHeight: int => scales vertically to height
//		 renderCallback: function => will call the function after the first render is completed
//		 forceRedraw: function => will call the function on every frame, if it returns true, will redraw
var canvg = function (target, s, opts) {
	// no parameters
	if (target == null && s == null && opts == null) {
		//debugger;
		var svgTags = document.querySelectorAll('svg');
		for (var i=0; i<svgTags.length; i++) {
			var svgTag = svgTags[i];
			var c = document.createElement('canvas');
			c.width = svgTag.clientWidth;
			c.height = svgTag.clientHeight;
			svgTag.parentNode.insertBefore(c, svgTag);
			svgTag.parentNode.removeChild(svgTag);
			var div = document.createElement('div');
			div.appendChild(svgTag);
			canvg(c, div.innerHTML);
		}
		return;
	}

	if (typeof target == 'string') {
		target = document.getElementById(target);
	}

	// store class on canvas
	if (target.svg != null) target.svg.stop();
	// var svg = build(opts || {});
	// on i.e. 8 for flash canvas, we can't assign the property so check for it
	if (!(target.childNodes.length == 1 && target.childNodes[0].nodeName == 'OBJECT')) target.svg = svg;

	var ctx = target.getContext('2d');
	svg.init(ctx);
	
	// svg.loadXml(s);
}

// see https://developer.mozilla.org/en-US/docs/Web/API/Element.matches
var matchesSelector;
if (typeof Element.prototype.matches != 'undefined') {
	matchesSelector = function(node, selector) {
		return node.matches(selector);
	};
} else if (typeof Element.prototype.webkitMatchesSelector != 'undefined') {
	matchesSelector = function(node, selector) {
		return node.webkitMatchesSelector(selector);
	};
} else if (typeof Element.prototype.mozMatchesSelector != 'undefined') {
	matchesSelector = function(node, selector) {
		return node.mozMatchesSelector(selector);
	};
} else if (typeof Element.prototype.msMatchesSelector != 'undefined') {
	matchesSelector = function(node, selector) {
		return node.msMatchesSelector(selector);
	};
} else if (typeof Element.prototype.oMatchesSelector != 'undefined') {
	matchesSelector = function(node, selector) {
		return node.oMatchesSelector(selector);
	};
} else {
	// requires Sizzle: https://github.com/jquery/sizzle/wiki/Sizzle-Documentation
	// or jQuery: http://jquery.com/download/
	// or Zepto: http://zeptojs.com/#
	// without it, this is a ReferenceError

	if (typeof jQuery === 'function' || typeof Zepto === 'function') {
		matchesSelector = function (node, selector) {
			return $(node).is(selector);
		};
	}

	if (typeof matchesSelector === 'undefined') {
		matchesSelector = Sizzle.matchesSelector;
	}
}

// slightly modified version of https://github.com/keeganstreet/specificity/blob/master/specificity.js
var attributeRegex = /(\[[^\]]+\])/g;
var idRegex = /(#[^\s\+>~\.\[:]+)/g;
var classRegex = /(\.[^\s\+>~\.\[:]+)/g;
var pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;
var pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi;
var pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g;
var elementRegex = /([^\s\+>~\.\[:]+)/g;
function getSelectorSpecificity(selector) {
	var typeCount = [0, 0, 0];
	var findMatch = function(regex, type) {
		var matches = selector.match(regex);
		if (matches == null) {
			return;
		}
		typeCount[type] += matches.length;
		selector = selector.replace(regex, ' ');
	};

	selector = selector.replace(/:not\(([^\)]*)\)/g, '     $1 ');
	selector = selector.replace(/{[\s\S]*/gm, ' ');
	findMatch(attributeRegex, 1);
	findMatch(idRegex, 0);
	findMatch(classRegex, 1);
	findMatch(pseudoElementRegex, 2);
	findMatch(pseudoClassWithBracketsRegex, 1);
	findMatch(pseudoClassRegex, 1);
	selector = selector.replace(/[\*\s\+>~]/g, ' ');
	selector = selector.replace(/[#\.]/g, ' ');
	findMatch(elementRegex, 2);
	return typeCount.join('');
}

if (typeof CanvasRenderingContext2D  != 'undefined') {
	CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh, opts) {
		var cOpts = {
			ignoreMouse: true,
			ignoreAnimation: true,
			ignoreDimensions: true,
			ignoreClear: true,
			offsetX: dx,
			offsetY: dy,
			scaleWidth: dw,
			scaleHeight: dh
		}
		
		for(var prop in opts) {
			if(opts.hasOwnProperty(prop)){
				cOpts[prop] = opts[prop];
			}
		}
		canvg(this.canvas, s, cOpts);

	}
}

