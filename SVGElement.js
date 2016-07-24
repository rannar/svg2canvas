var SVGElement = {};
//类ElementBase
SVGElement.ElementBase = function(nodeName,nodeAttributes){
	this.attributes = {};
	this.styles = {};
	this.stylesSpecificity = {};
	this.children = [];

	//add attributes
	for(var i = 0; i < nodeAttributes.length; i++){
		var nodeAttribute = nodeAttributes[i];
		var attributeName = nodeAttribute.name;
		this.attributes[attributeName] = new SVGProperty(attributeName,nodeAttribute.value);
	}

	this.addStylesFromStyleDefinition();

	//add inline styles
	if (this.attribute('style').hasValue()) {
		var styles = this.attribute('style').value.split(';');
		for (var i=0; i<styles.length; i++) {
			if (SVG.trim(styles[i]) != '') {
				var style = styles[i].split(':');
				var name = SVG.trim(style[0]);
				var value = SVG.trim(style[1]);
				this.styles[name] = new SVGProperty(name, value);
			}
		}
	}

	// add id
	if (this.attribute('id').hasValue()) {
		if (SVG.Definitions[this.attribute('id').value] == null) {
			SVG.Definitions[this.attribute('id').value] = this;
		}
	}

	// add id
	if (this.attribute('id').hasValue()) {
		if (SVG.Definitions[this.attribute('id').value] == null) {
			SVG.Definitions[this.attribute('id').value] = this;
		}
	}

}

//get or create attribute
SVGElement.ElementBase.prototype.attribute = function(name,createIfNotExists){
	var a = this.attributes[name];
	if(a != null) return a;

	if (createIfNotExists == true) { 
		a = new SVGProperty(name, ''); 
		this.attributes[name] = a; 
	}
	return a || SVG.EmptyProperty;
}

SVGElement.ElementBase.prototype.getHrefAttribute = function() {
	for (var a in this.attributes) {
		if (a == 'href' || a.match(/:href$/)) {
			return this.attributes[a];
		}
	}
	return SVG.EmptyProperty;
}

//get or create style,crawls up node tree
SVGElement.ElementBase.prototype.style = function(name,createIfNotExists,skipAncestors){
	var s = this.styles[name];
	if(s != null) return s;

	var a = this.attribute(name);
	if(a != null && a.hasValue()){
		this.styles[name] = a;
		return a;
	}

	if(skipAncestors != true){
		var p = this.parent;
		if(p != null){
			var ps = p.style(name);
			if(ps != null && ps.hasValue()){
				return ps;
			}
		}
	}
	if (createIfNotExists == true) {
		s = new SVGProperty(name, ''); 
		this.styles[name] = s; 
	}
	return s || SVG.EmptyProperty;
}

// base render
SVGElement.ElementBase.prototype.render = function(ctx) {
	// don't render display=none
	if (this.style('display').value == 'none') return;

	// don't render visibility=hidden
	if (this.style('visibility').value == 'hidden') return;

	ctx.save();
	if (this.style('mask').hasValue()) { // mask
		var mask = this.style('mask').getDefinition();
		if (mask != null) mask.apply(ctx, this);
	}
	else if (this.style('filter').hasValue()) { // filter
		var filter = this.style('filter').getDefinition();
		if (filter != null) filter.apply(ctx, this);
	}
	else {
		this.setContext(ctx);
		this.renderChildren(ctx);
		this.clearContext(ctx);
	}
	ctx.restore();
}

// base set context
SVGElement.ElementBase.prototype.setContext = function(ctx) {
	// OVERRIDE ME!
}

// base clear context
SVGElement.ElementBase.prototype.clearContext = function(ctx) {
	// OVERRIDE ME!
}

// base render children
SVGElement.ElementBase.prototype.renderChildren = function(ctx) {
	for (var i=0; i<this.children.length; i++) {
		this.children[i].render(ctx);
	}
}

SVGElement.ElementBase.prototpe.addChild = function(childNodeName,childAttributes,create){
	var child = {};
	if(create){
		child = SVG.CreateElement(childNode);
	}
	child.parent = this;
	if(child.type != 'title'){
		this.children.push(child);
	}
}


SVGElement.ElementBase.prototpe.addStylesFromStyleDefinition = function () {
	// add styles
	for (var selector in SVG.Styles) {
		if (selector[0] != '@' && matchesSelector(node, selector)) {
			var styles = SVG.Styles[selector];
			var specificity = SVG.StylesSpecificity[selector];
			if (styles != null) {
				for (var name in styles) {
					var existingSpecificity = this.stylesSpecificity[name];
					if (typeof existingSpecificity == 'undefined') {
						existingSpecificity = '000';
					}
					if (specificity > existingSpecificity) {
						this.styles[name] = styles[name];
						this.stylesSpecificity[name] = specificity;
					}
				}
			}
		}
	}
};

//RenderedElementBase 
SVGElement.RenderedElementBase = function(nodeName,nodeattributes){
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.RenderedElementBase.prototype = new SVGElement.ElementBase;

SVGElement.RenderedElementBase.prototype.setContext = function(ctx) {
	// fill
	if (this.style('fill').isUrlDefinition()) {
		var fs = this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));
		if (fs != null) ctx.fillStyle = fs;
	}
	else if (this.style('fill').hasValue()) {
		var fillStyle = this.style('fill');
		if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
		if (fillStyle.value != 'inherit') ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
	}
	if (this.style('fill-opacity').hasValue()) {
		var fillStyle = new SVGProperty('fill', ctx.fillStyle);
		fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));
		ctx.fillStyle = fillStyle.value;
	}

	// stroke
	if (this.style('stroke').isUrlDefinition()) {
		var fs = this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));
		if (fs != null) ctx.strokeStyle = fs;
	}
	else if (this.style('stroke').hasValue()) {
		var strokeStyle = this.style('stroke');
		if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
		if (strokeStyle.value != 'inherit') ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
	}
	if (this.style('stroke-opacity').hasValue()) {
		var strokeStyle = new SVGProperty('stroke', ctx.strokeStyle);
		strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));
		ctx.strokeStyle = strokeStyle.value;
	}
	if (this.style('stroke-width').hasValue()) {
		var newLineWidth = this.style('stroke-width').toPixels();
		ctx.lineWidth = newLineWidth == 0 ? 0.001 : newLineWidth; // browsers don't respect 0
    }
	if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
	if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
	if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;
	if (this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value != 'none') {
		var gaps = SVG.ToNumberArray(this.style('stroke-dasharray').value);
		if (typeof ctx.setLineDash != 'undefined') { ctx.setLineDash(gaps); }
		else if (typeof ctx.webkitLineDash != 'undefined') { ctx.webkitLineDash = gaps; }
		else if (typeof ctx.mozDash != 'undefined' && !(gaps.length==1 && gaps[0]==0)) { ctx.mozDash = gaps; }

		var offset = this.style('stroke-dashoffset').numValueOrDefault(1);
		if (typeof ctx.lineDashOffset != 'undefined') { ctx.lineDashOffset = offset; }
		else if (typeof ctx.webkitLineDashOffset != 'undefined') { ctx.webkitLineDashOffset = offset; }
		else if (typeof ctx.mozDashOffset != 'undefined') { ctx.mozDashOffset = offset; }
	}

	// font
	if (typeof ctx.font != 'undefined') {
		ctx.font = SVG.Font.CreateFont(
			this.style('font-style').value,
			this.style('font-variant').value,
			this.style('font-weight').value,
			this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '',
			this.style('font-family').value).toString();
	}

	// transform
	if (this.style('transform', false, true).hasValue()) {
		var transform = new SVG.Transform(this.style('transform', false, true).value);
		transform.apply(ctx);
	}

	// clip
	if (this.style('clip-path', false, true).hasValue()) {
		var clip = this.style('clip-path', false, true).getDefinition();
		if (clip != null) clip.apply(ctx);
	}

	// opacity
	if (this.style('opacity').hasValue()) {
		ctx.globalAlpha = this.style('opacity').numValue();
	}
}

//PathElementBase
SVGElement.PathElementBase = function(node) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.PathElementBase.PathElementBase.prototype = new SVGElement.RenderedElementBase;
SVGElement.PathElementBase.prototype.path = function(ctx) {
	if (ctx != null) ctx.beginPath();
	return new SVG.BoundingBox();
}

SVGElement.PathElementBase.prototype.renderChildren = function(ctx) {
	this.path(ctx);
	SVG.Mouse.checkPath(this, ctx);
	if (ctx.fillStyle != '') {
		if (this.style('fill-rule').valueOrDefault('inherit') != 'inherit') { ctx.fill(this.style('fill-rule').value); }
		else { ctx.fill(); }
	}
	if (ctx.strokeStyle != '') ctx.stroke();

	var markers = this.getMarkers();
	if (markers != null) {
		if (this.style('marker-start').isUrlDefinition()) {
			var marker = this.style('marker-start').getDefinition();
			marker.render(ctx, markers[0][0], markers[0][1]);
		}
		if (this.style('marker-mid').isUrlDefinition()) {
			var marker = this.style('marker-mid').getDefinition();
			for (var i=1;i<markers.length-1;i++) {
				marker.render(ctx, markers[i][0], markers[i][1]);
			}
		}
		if (this.style('marker-end').isUrlDefinition()) {
			var marker = this.style('marker-end').getDefinition();
			marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
		}
	}
}

SVGElement.PathElementBase.prototype.getBoundingBox = function() {
	return this.path();
}

SVGElement.PathElementBase.prototype.getMarkers = function() {
	return null;
}

//SVG Element
SVGElement.svg = function(node) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.baseClearContext = this.clearContext;
	this.clearContext = function(ctx) {
		this.baseClearContext(ctx);
		SVG.ViewPort.RemoveCurrent();
	}

	this.baseSetContext = this.setContext;
	this.setContext = function(ctx) {
		// initial values and defaults
		ctx.strokeStyle = 'rgba(0,0,0,0)';
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'miter';
		ctx.miterLimit = 4;
		if (typeof ctx.font != 'undefined' && typeof window.getComputedStyle != 'undefined') {
			ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');
		}

		this.baseSetContext(ctx);

		// create new view port
		if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
		if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
		ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));

		var width = SVG.ViewPort.width();
		var height = SVG.ViewPort.height();

		if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
		if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
		if (typeof this.root == 'undefined') {
			width = this.attribute('width').toPixels('x');
			height = this.attribute('height').toPixels('y');

			var x = 0;
			var y = 0;
			if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
				x = -this.attribute('refX').toPixels('x');
				y = -this.attribute('refY').toPixels('y');
			}

			if (this.attribute('overflow').valueOrDefault('hidden') != 'visible') {
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(width, y);
				ctx.lineTo(width, height);
				ctx.lineTo(x, height);
				ctx.closePath();
				ctx.clip();
			}
		}
		SVG.ViewPort.SetCurrent(width, height);

		// viewbox
		if (this.attribute('viewBox').hasValue()) {
			var viewBox = SVG.ToNumberArray(this.attribute('viewBox').value);
			var minX = viewBox[0];
			var minY = viewBox[1];
			width = viewBox[2];
			height = viewBox[3];

			SVG.AspectRatio(ctx,
							this.attribute('preserveAspectRatio').value,
							SVG.ViewPort.width(),
							width,
							SVG.ViewPort.height(),
							height,
							minX,
							minY,
							this.attribute('refX').value,
							this.attribute('refY').value);

			SVG.ViewPort.RemoveCurrent();
			SVG.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
		}
	}
}
SVGElement.SVG.prototype = new SVGElement.RenderedElementBase;

//rect 
SVGElement.rect = function(nodeName,nodeAttributes){
	this.base = SVGElement.PathElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.rect.prototype = new SVGElement.PathElementBase;
SVGElement.rect.prototype.path = function(ctx){
	var x = this.attribute('x').toPixels('x');
	var y = this.attribute('y').toPixels('y');
	var width = this.attribute('width').toPixels('x');
	var height = this.attribute('height').toPixels('y');
	var rx = this.attribute('rx').toPixels('x');
	var ry = this.attribute('ry').toPixels('y');
	if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
	if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
	rx = Math.min(rx, width / 2.0);
	ry = Math.min(ry, height / 2.0);
	if (ctx != null) {
		ctx.beginPath();
		ctx.moveTo(x + rx, y);
		ctx.lineTo(x + width - rx, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
		ctx.lineTo(x + width, y + height - ry);
		ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
		ctx.lineTo(x + rx, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
		ctx.lineTo(x, y + ry);
		ctx.quadraticCurveTo(x, y, x + rx, y)
		ctx.closePath();
	}

	return new SVG.BoundingBox(x, y, x + width, y + height);
}

// circle element
SVGElement.circle = function(nodeName,nodeAttributes) {
	this.base = SVGElement.PathElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.circle.prototype = new SVGElement.PathElementBase;
SVGElement.circle.prototype.path = function(ctx) {
	var cx = this.attribute('cx').toPixels('x');
	var cy = this.attribute('cy').toPixels('y');
	var r = this.attribute('r').toPixels();

	if (ctx != null) {
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
		ctx.closePath();
	}

	return new SVG.BoundingBox(cx - r, cy - r, cx + r, cy + r);
}


// ellipse element
SVGElement.ellipse = function(nodeName,nodeAttributes) {
	this.base = SVGElement.PathElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.ellipse.prototype = new SVGElement.PathElementBase;
SVGElement.ellipse.prototype.path = function(ctx) {
	var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
	var rx = this.attribute('rx').toPixels('x');
	var ry = this.attribute('ry').toPixels('y');
	var cx = this.attribute('cx').toPixels('x');
	var cy = this.attribute('cy').toPixels('y');

	if (ctx != null) {
		ctx.beginPath();
		ctx.moveTo(cx, cy - ry);
		ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
		ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
		ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
		ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
		ctx.closePath();
	}

	return new SVG.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
}



// line element
SVGElement.line = function(node) {
	this.base = SVGElement.PathElementBase;
	this.base(nodeName,nodeAttributes);
}
SVGElement.line.prototype = new SVGElement.PathElementBase;
SVGElement.line.prototype.getPoints = function() {
	return [
		new SVG.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
		new SVG.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
}

SVGElement.line.prototype.path = function(ctx) {
	var points = this.getPoints();

	if (ctx != null) {
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		ctx.lineTo(points[1].x, points[1].y);
	}

	return new SVG.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
}

SVGElement.line.prototype.getMarkers = function() {
	var points = this.getPoints();
	var a = points[0].angleTo(points[1]);
	return [[points[0], a], [points[1], a]];
}


// polyline element
SVGElement.polyline = function(node) {
	this.base = SVGElementt.PathElementBase;
	this.base(nodeName,nodeAttributes);

	this.points = SVG.CreatePath(this.attribute('points').value);
}
SVGElement.polyline.prototype = new SVGElement.PathElementBase;
SVGElement.polyline.prototype.path = function(ctx) {
	var bb = new SVG.BoundingBox(this.points[0].x, this.points[0].y);
	if (ctx != null) {
		ctx.beginPath();
		ctx.moveTo(this.points[0].x, this.points[0].y);
	}
	for (var i=1; i<this.points.length; i++) {
		bb.addPoint(this.points[i].x, this.points[i].y);
		if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	return bb;
}

SVGElement.polyline.prototype.getMarkers = function() {
	var markers = [];
	for (var i=0; i<this.points.length - 1; i++) {
		markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
	}
	if (markers.length > 0) {
		markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
	}
	return markers;
}

// polygon element
SVGElement.polygon = function(node) {
	this.base = SVGElement.polyline;
	this.base(nodeName,nodeAttributes);

	this.basePath = this.path;
}
SVGElement.polygon.prototype = new SVGElement.polyline;
SVGElement.polygon.prototype.path = function(ctx) {
	var bb = this.basePath(ctx);
	if (ctx != null) {
		ctx.lineTo(this.points[0].x, this.points[0].y);
		ctx.closePath();
	}
	return bb;
}


// path element
SVGElement.path = function(nodeName,nodeAttributes) {
	this.base = SVGElement.PathElementBase;
	this.base(nodeName,nodeAttributes);

	var d = this.attribute('d').value;
	// TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
	d = d.replace(/,/gm,' '); // get rid of all commas
	// As the end of a match can also be the start of the next match, we need to run this replace twice.
	for(var i=0; i<2; i++)
		d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // suffix commands with spaces
	d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // prefix commands with spaces
	d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits on +- signs
	// Again, we need to run this twice to find all occurances
	for(var i=0; i<2; i++)
		d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when they start with a comma
	d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
	d = SVG.compressSpaces(d); // compress multiple spaces
	d = SVG.trim(d);
	this.PathParser = new (function(d) {
		this.tokens = d.split(' ');

		this.reset = function() {
			this.i = -1;
			this.command = '';
			this.previousCommand = '';
			this.start = new SVG.Point(0, 0);
			this.control = new SVG.Point(0, 0);
			this.current = new SVG.Point(0, 0);
			this.points = [];
			this.angles = [];
		}

		this.isEnd = function() {
			return this.i >= this.tokens.length - 1;
		}

		this.isCommandOrEnd = function() {
			if (this.isEnd()) return true;
			return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
		}

		this.isRelativeCommand = function() {
			switch(this.command)
			{
				case 'm':
				case 'l':
				case 'h':
				case 'v':
				case 'c':
				case 's':
				case 'q':
				case 't':
				case 'a':
				case 'z':
					return true;
					break;
			}
			return false;
		}

		this.getToken = function() {
			this.i++;
			return this.tokens[this.i];
		}

		this.getScalar = function() {
			return parseFloat(this.getToken());
		}

		this.nextCommand = function() {
			this.previousCommand = this.command;
			this.command = this.getToken();
		}

		this.getPoint = function() {
			var p = new SVG.Point(this.getScalar(), this.getScalar());
			return this.makeAbsolute(p);
		}

		this.getAsControlPoint = function() {
			var p = this.getPoint();
			this.control = p;
			return p;
		}

		this.getAsCurrentPoint = function() {
			var p = this.getPoint();
			this.current = p;
			return p;
		}

		this.getReflectedControlPoint = function() {
			if (this.previousCommand.toLowerCase() != 'c' &&
			    this.previousCommand.toLowerCase() != 's' &&
				this.previousCommand.toLowerCase() != 'q' &&
				this.previousCommand.toLowerCase() != 't' ){
				return this.current;
			}

			// reflect point
			var p = new SVG.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
			return p;
		}

		this.makeAbsolute = function(p) {
			if (this.isRelativeCommand()) {
				p.x += this.current.x;
				p.y += this.current.y;
			}
			return p;
		}

		this.addMarker = function(p, from, priorTo) {
			// if the last angle isn't filled in because we didn't have this point yet ...
			if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length-1] == null) {
				this.angles[this.angles.length-1] = this.points[this.points.length-1].angleTo(priorTo);
			}
			this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
		}

		this.addMarkerAngle = function(p, a) {
			this.points.push(p);
			this.angles.push(a);
		}

		this.getMarkerPoints = function() { return this.points; }
		this.getMarkerAngles = function() {
			for (var i=0; i<this.angles.length; i++) {
				if (this.angles[i] == null) {
					for (var j=i+1; j<this.angles.length; j++) {
						if (this.angles[j] != null) {
							this.angles[i] = this.angles[j];
							break;
						}
					}
				}
			}
			return this.angles;
		}
	})(d);

	this.path = function(ctx) {
		var pp = this.PathParser;
		pp.reset();

		var bb = new SVG.BoundingBox();
		if (ctx != null) ctx.beginPath();
		while (!pp.isEnd()) {
			pp.nextCommand();
			switch (pp.command) {
			case 'M':
			case 'm':
				var p = pp.getAsCurrentPoint();
				pp.addMarker(p);
				bb.addPoint(p.x, p.y);
				if (ctx != null) ctx.moveTo(p.x, p.y);
				pp.start = pp.current;
				while (!pp.isCommandOrEnd()) {
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, pp.start);
					bb.addPoint(p.x, p.y);
					if (ctx != null) ctx.lineTo(p.x, p.y);
				}
				break;
			case 'L':
			case 'l':
				while (!pp.isCommandOrEnd()) {
					var c = pp.current;
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, c);
					bb.addPoint(p.x, p.y);
					if (ctx != null) ctx.lineTo(p.x, p.y);
				}
				break;
			case 'H':
			case 'h':
				while (!pp.isCommandOrEnd()) {
					var newP = new SVG.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
					pp.addMarker(newP, pp.current);
					pp.current = newP;
					bb.addPoint(pp.current.x, pp.current.y);
					if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
				}
				break;
			case 'V':
			case 'v':
				while (!pp.isCommandOrEnd()) {
					var newP = new SVG.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
					pp.addMarker(newP, pp.current);
					pp.current = newP;
					bb.addPoint(pp.current.x, pp.current.y);
					if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
				}
				break;
			case 'C':
			case 'c':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var p1 = pp.getPoint();
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, p1);
					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'S':
			case 's':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var p1 = pp.getReflectedControlPoint();
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, p1);
					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'Q':
			case 'q':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, cntrl);
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
					if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'T':
			case 't':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var cntrl = pp.getReflectedControlPoint();
					pp.control = cntrl;
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, cntrl);
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
					if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'A':
			case 'a':
				while (!pp.isCommandOrEnd()) {
				    var curr = pp.current;
					var rx = pp.getScalar();
					var ry = pp.getScalar();
					var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
					var largeArcFlag = pp.getScalar();
					var sweepFlag = pp.getScalar();
					var cp = pp.getAsCurrentPoint();

					// Conversion from endpoint to center parameterization
					// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
					// x1', y1'
					var currp = new SVG.Point(
						Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
						-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
					);
					// adjust radii
					var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
					if (l > 1) {
						rx *= Math.sqrt(l);
						ry *= Math.sqrt(l);
					}
					// cx', cy'
					var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
						((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
						(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
					);
					if (isNaN(s)) s = 0;
					var cpp = new SVG.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
					// cx, cy
					var centp = new SVG.Point(
						(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
						(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
					);
					// vector magnitude
					var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
					// ratio between two vectors
					var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
					// angle between two vectors
					var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
					// initial angle
					var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
					// angle delta
					var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
					var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
					var ad = a(u, v);
					if (r(u,v) <= -1) ad = Math.PI;
					if (r(u,v) >= 1) ad = 0;

					// for markers
					var dir = 1 - sweepFlag ? 1.0 : -1.0;
					var ah = a1 + dir * (ad / 2.0);
					var halfWay = new SVG.Point(
						centp.x + rx * Math.cos(ah),
						centp.y + ry * Math.sin(ah)
					);
					pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
					pp.addMarkerAngle(cp, ah - dir * Math.PI);

					bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
					if (ctx != null) {
						var r = rx > ry ? rx : ry;
						var sx = rx > ry ? 1 : rx / ry;
						var sy = rx > ry ? ry / rx : 1;

						ctx.translate(centp.x, centp.y);
						ctx.rotate(xAxisRotation);
						ctx.scale(sx, sy);
						ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
						ctx.scale(1/sx, 1/sy);
						ctx.rotate(-xAxisRotation);
						ctx.translate(-centp.x, -centp.y);
					}
				}
				break;
			case 'Z':
			case 'z':
				if (ctx != null) ctx.closePath();
				pp.current = pp.start;
			}
		}

		return bb;
	}

	this.getMarkers = function() {
		var points = this.PathParser.getMarkerPoints();
		var angles = this.PathParser.getMarkerAngles();

		var markers = [];
		for (var i=0; i<points.length; i++) {
			markers.push([points[i], angles[i]]);
		}
		return markers;
	}
}
SVGElement.path.prototype = new SVGElement.PathElementBase;

// pattern element
SVGElement.pattern = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.createPattern = function(ctx, element) {
		var width = this.attribute('width').toPixels('x', true);
		var height = this.attribute('height').toPixels('y', true);

		// render me using a temporary svg element
		var tempSvg = new SVGElement.svg();
		tempSVG.attributes['viewBox'] = new SVGProperty('viewBox', this.attribute('viewBox').value);
		tempSVG.attributes['width'] = new SVGProperty('width', width + 'px');
		tempSVG.attributes['height'] = new SVGProperty('height', height + 'px');
		tempSVG.attributes['transform'] = new SVGProperty('transform', this.attribute('patternTransform').value);
		tempSVG.children = this.children;

		var c = document.createElement('canvas');
		c.width = width;
		c.height = height;
		var cctx = c.getContext('2d');
		if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
			cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));
		}
		// render 3x3 grid so when we transform there's no white space on edges
		for (var x=-1; x<=1; x++) {
			for (var y=-1; y<=1; y++) {
				cctx.save();
				tempSVG.attributes['x'] = new SVGProperty('x', x * c.width);
				tempSVG.attributes['y'] = new SVGProperty('y', y * c.height);
				tempSVG.render(cctx);
				cctx.restore();
			}
		}
		var pattern = ctx.createPattern(c, 'repeat');
		return pattern;
	}
}
SVGElement.pattern.prototype = new SVGElement.ElementBase;

// marker element
SVGElement.marker = function(node) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.baseRender = this.render;
	this.render = function(ctx, point, angle) {
		ctx.translate(point.x, point.y);
		if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
		if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
		ctx.save();

		// render me using a temporary svg element
		var tempSvg = new SVGElement.svg();
		tempSVG.attributes['viewBox'] = new SVGProperty('viewBox', this.attribute('viewBox').value);
		tempSVG.attributes['refX'] = new SVGProperty('refX', this.attribute('refX').value);
		tempSVG.attributes['refY'] = new SVGProperty('refY', this.attribute('refY').value);
		tempSVG.attributes['width'] = new SVGProperty('width', this.attribute('markerWidth').value);
		tempSVG.attributes['height'] = new SVGProperty('height', this.attribute('markerHeight').value);
		tempSVG.attributes['fill'] = new SVGProperty('fill', this.attribute('fill').valueOrDefault('black'));
		tempSVG.attributes['stroke'] = new SVGProperty('stroke', this.attribute('stroke').valueOrDefault('none'));
		tempSVG.children = this.children;
		tempSVG.render(ctx);

		ctx.restore();
		if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
		if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
		ctx.translate(-point.x, -point.y);
	}
}
SVGElement.marker.prototype = new SVGElement.ElementBase;

// definitions element
SVGElement.defs = function(node) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.render = function(ctx) {
		// NOOP
	}
}
SVGElement.defs.prototype = new SVGElement.ElementBase;

// base for gradients
SVGElement.GradientBase = function(node) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.stops = [];
	for (var i=0; i<this.children.length; i++) {
		var child = this.children[i];
		if (child.type == 'stop') this.stops.push(child);
	}

	this.getGradient = function() {
		// OVERRIDE ME!
	}
	
	this.gradientUnits = function () {
		return this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');
	}
	
	this.attributesToInherit = ['gradientUnits'];
	
	this.inheritStopContainer = function (stopsContainer) {
		for (var i=0; i<this.attributesToInherit.length; i++) {
			var attributeToInherit = this.attributesToInherit[i];
			if (!this.attribute(attributeToInherit).hasValue() && stopsContainer.attribute(attributeToInherit).hasValue()) {
				this.attribute(attributeToInherit, true).value = stopsContainer.attribute(attributeToInherit).value;
			}
		}
	}

	this.createGradient = function(ctx, element, parentOpacityProp) {
		var stopsContainer = this;
		if (this.getHrefAttribute().hasValue()) {
			stopsContainer = this.getHrefAttribute().getDefinition();
			this.inheritStopContainer(stopsContainer);
		}

		var addParentOpacity = function (color) {
			if (parentOpacityProp.hasValue()) {
				var p = new SVGProperty('color', color);
				return p.addOpacity(parentOpacityProp).value;
			}
			return color;
		};

		var g = this.getGradient(ctx, element);
		if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
		for (var i=0; i<stopsContainer.stops.length; i++) {
			g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
		}

		if (this.attribute('gradientTransform').hasValue()) {
			// render as transformed pattern on temporary canvas
			var rootView = SVG.ViewPort.viewPorts[0];

			var rect = new SVGElement.rect();
			rect.attributes['x'] = new SVGProperty('x', -SVG.MAX_VIRTUAL_PIXELS/3.0);
			rect.attributes['y'] = new SVGProperty('y', -SVG.MAX_VIRTUAL_PIXELS/3.0);
			rect.attributes['width'] = new SVGProperty('width', SVG.MAX_VIRTUAL_PIXELS);
			rect.attributes['height'] = new SVGProperty('height', SVG.MAX_VIRTUAL_PIXELS);

			var group = new SVGElement.g();
			group.attributes['transform'] = new SVGProperty('transform', this.attribute('gradientTransform').value);
			group.children = [ rect ];

			var tempSvg = new SVGElement.svg();
			tempSVG.attributes['x'] = new SVGProperty('x', 0);
			tempSVG.attributes['y'] = new SVGProperty('y', 0);
			tempSVG.attributes['width'] = new SVGProperty('width', rootView.width);
			tempSVG.attributes['height'] = new SVGProperty('height', rootView.height);
			tempSVG.children = [ group ];

			var c = document.createElement('canvas');
			c.width = rootView.width;
			c.height = rootView.height;
			var tempCtx = c.getContext('2d');
			tempCtx.fillStyle = g;
			tempSVG.render(tempCtx);
			return tempCtx.createPattern(c, 'no-repeat');
		}

		return g;
	}
}
SVGElement.GradientBase.prototype = new SVGElement.ElementBase;

// linear gradient element
SVGElement.linearGradient = function(node) {
	this.base = SVGElement.GradientBase;
	this.base(nodeName,nodeAttributes);
	
	this.attributesToInherit.push('x1');
	this.attributesToInherit.push('y1');
	this.attributesToInherit.push('x2');
	this.attributesToInherit.push('y2');

	this.getGradient = function(ctx, element) {
		var bb = this.gradientUnits() == 'objectBoundingBox' ? element.getBoundingBox() : null;

		if (!this.attribute('x1').hasValue()
		 && !this.attribute('y1').hasValue()
		 && !this.attribute('x2').hasValue()
		 && !this.attribute('y2').hasValue()) {
			this.attribute('x1', true).value = 0;
			this.attribute('y1', true).value = 0;
			this.attribute('x2', true).value = 1;
			this.attribute('y2', true).value = 0;
		 }

		var x1 = (this.gradientUnits() == 'objectBoundingBox'
			? bb.x() + bb.width() * this.attribute('x1').numValue()
			: this.attribute('x1').toPixels('x'));
		var y1 = (this.gradientUnits() == 'objectBoundingBox'
			? bb.y() + bb.height() * this.attribute('y1').numValue()
			: this.attribute('y1').toPixels('y'));
		var x2 = (this.gradientUnits() == 'objectBoundingBox'
			? bb.x() + bb.width() * this.attribute('x2').numValue()
			: this.attribute('x2').toPixels('x'));
		var y2 = (this.gradientUnits() == 'objectBoundingBox'
			? bb.y() + bb.height() * this.attribute('y2').numValue()
			: this.attribute('y2').toPixels('y'));

		if (x1 == x2 && y1 == y2) return null;
		return ctx.createLinearGradient(x1, y1, x2, y2);
	}
}
SVGElement.linearGradient.prototype = new SVGElement.GradientBase;

// radial gradient element
SVGElement.radialGradient = function(nodeName,nodeAttributes) {
	this.base = SVGElement.GradientBase;
	this.base(nodeName,nodeAttributes);
	
	this.attributesToInherit.push('cx');
	this.attributesToInherit.push('cy');
	this.attributesToInherit.push('r');
	this.attributesToInherit.push('fx');
	this.attributesToInherit.push('fy');

	this.getGradient = function(ctx, element) {
		var bb = element.getBoundingBox();

		if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
		if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
		if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';

		var cx = (this.gradientUnits() == 'objectBoundingBox'
			? bb.x() + bb.width() * this.attribute('cx').numValue()
			: this.attribute('cx').toPixels('x'));
		var cy = (this.gradientUnits() == 'objectBoundingBox'
			? bb.y() + bb.height() * this.attribute('cy').numValue()
			: this.attribute('cy').toPixels('y'));

		var fx = cx;
		var fy = cy;
		if (this.attribute('fx').hasValue()) {
			fx = (this.gradientUnits() == 'objectBoundingBox'
			? bb.x() + bb.width() * this.attribute('fx').numValue()
			: this.attribute('fx').toPixels('x'));
		}
		if (this.attribute('fy').hasValue()) {
			fy = (this.gradientUnits() == 'objectBoundingBox'
			? bb.y() + bb.height() * this.attribute('fy').numValue()
			: this.attribute('fy').toPixels('y'));
		}

		var r = (this.gradientUnits() == 'objectBoundingBox'
			? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
			: this.attribute('r').toPixels());

		return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
	}
}
SVGElement.radialGradient.prototype = new SVGElement.GradientBase;

// gradient stop element
SVGElement.stop = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.offset = this.attribute('offset').numValue();
	if (this.offset < 0) this.offset = 0;
	if (this.offset > 1) this.offset = 1;

	var stopColor = this.style('stop-color', true);
	if (stopColor.value === '') stopColor.value = '#000';
	if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity'));
	this.color = stopColor.value;
}
SVGElement.stop.prototype = new SVGElement.ElementBase;

// animation base element
SVGElement.AnimateBase = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	SVG.Animations.push(this);

	this.duration = 0.0;
	this.begin = this.attribute('begin').toMilliseconds();
	this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();

	this.getProperty = function() {
		var attributeType = this.attribute('attributeType').value;
		var attributeName = this.attribute('attributeName').value;

		if (attributeType == 'CSS') {
			return this.parent.style(attributeName, true);
		}
		return this.parent.attribute(attributeName, true);
	};

	this.initialValue = null;
	this.initialUnits = '';
	this.removed = false;

	this.calcValue = function() {
		// OVERRIDE ME!
		return '';
	}

	this.update = function(delta) {
		// set initial value
		if (this.initialValue == null) {
			this.initialValue = this.getProperty().value;
			this.initialUnits = this.getProperty().getUnits();
		}

		// if we're past the end time
		if (this.duration > this.maxDuration) {
			// loop for indefinitely repeating animations
			if (this.attribute('repeatCount').value == 'indefinite'
			 || this.attribute('repeatDur').value == 'indefinite') {
				this.duration = 0.0
			}
			else if (this.attribute('fill').valueOrDefault('remove') == 'freeze' && !this.frozen) {
				this.frozen = true;
				this.parent.animationFrozen = true;
				this.parent.animationFrozenValue = this.getProperty().value;
			}
			else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
				this.removed = true;
				this.getProperty().value = this.parent.animationFrozen ? this.parent.animationFrozenValue : this.initialValue;
				return true;
			}
			return false;
		}
		this.duration = this.duration + delta;

		// if we're past the begin time
		var updated = false;
		if (this.begin < this.duration) {
			var newValue = this.calcValue(); // tween

			if (this.attribute('type').hasValue()) {
				// for transform, etc.
				var type = this.attribute('type').value;
				newValue = type + '(' + newValue + ')';
			}

			this.getProperty().value = newValue;
			updated = true;
		}

		return updated;
	}

	this.from = this.attribute('from');
	this.to = this.attribute('to');
	this.values = this.attribute('values');
	if (this.values.hasValue()) this.values.value = this.values.value.split(';');

	// fraction of duration we've covered
	this.progress = function() {
		var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
		if (this.values.hasValue()) {
			var p = ret.progress * (this.values.value.length - 1);
			var lb = Math.floor(p), ub = Math.ceil(p);
			ret.from = new SVGProperty('from', parseFloat(this.values.value[lb]));
			ret.to = new SVGProperty('to', parseFloat(this.values.value[ub]));
			ret.progress = (p - lb) / (ub - lb);
		}
		else {
			ret.from = this.from;
			ret.to = this.to;
		}
		return ret;
	}
}
SVGElement.AnimateBase.prototype = new SVGElement.ElementBase;

// animate element
SVGElement.animate = function(nodeName,nodeAttributes) {
	this.base = SVGElement.AnimateBase;
	this.base(nodeName,nodeAttributes);

	this.calcValue = function() {
		var p = this.progress();

		// tween value linearly
		var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
		return newValue + this.initialUnits;
	};
}
SVGElement.animate.prototype = new SVGElement.AnimateBase;

// animate color element
SVGElement.animateColor = function(nodeName,nodeAttributes) {
	this.base = SVGElement.AnimateBase;
	this.base(nodeName,nodeAttributes);

	this.calcValue = function() {
		var p = this.progress();
		var from = new RGBColor(p.from.value);
		var to = new RGBColor(p.to.value);

		if (from.ok && to.ok) {
			// tween color linearly
			var r = from.r + (to.r - from.r) * p.progress;
			var g = from.g + (to.g - from.g) * p.progress;
			var b = from.b + (to.b - from.b) * p.progress;
			return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
		}
		return this.attribute('from').value;
	};
}
SVGElement.animateColor.prototype = new SVGElement.AnimateBase;

// animate transform element
SVGElement.animateTransform = function(nodeName,nodeAttributes) {
	this.base = SVGElement.AnimateBase;
	this.base(nodeName,nodeAttributes);

	this.calcValue = function() {
		var p = this.progress();

		// tween value linearly
		var from = SVG.ToNumberArray(p.from.value);
		var to = SVG.ToNumberArray(p.to.value);
		var newValue = '';
		for (var i=0; i<from.length; i++) {
			newValue += from[i] + (to[i] - from[i]) * p.progress + ' ';
		}
		return newValue;
	};
}
SVGElement.animateTransform.prototype = new SVGElement.animate;

// font element
SVGElement.font = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.horizAdvX = this.attribute('horiz-adv-x').numValue();

	this.isRTL = false;
	this.isArabic = false;
	this.fontFace = null;
	this.missingGlyph = null;
	this.glyphs = [];
	for (var i=0; i<this.children.length; i++) {
		var child = this.children[i];
		if (child.type == 'font-face') {
			this.fontFace = child;
			if (child.style('font-family').hasValue()) {
				SVG.Definitions[child.style('font-family').value] = this;
			}
		}
		else if (child.type == 'missing-glyph') this.missingGlyph = child;
		else if (child.type == 'glyph') {
			if (child.arabicForm != '') {
				this.isRTL = true;
				this.isArabic = true;
				if (typeof this.glyphs[child.unicode] == 'undefined') this.glyphs[child.unicode] = [];
				this.glyphs[child.unicode][child.arabicForm] = child;
			}
			else {
				this.glyphs[child.unicode] = child;
			}
		}
	}
}
SVGElement.font.prototype = new SVGElement.ElementBase;

// font-face element
SVGElement.fontface = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.ascent = this.attribute('ascent').value;
	this.descent = this.attribute('descent').value;
	this.unitsPerEm = this.attribute('units-per-em').numValue();
}
SVGElement.fontface.prototype = new SVGElement.ElementBase;

// missing-glyph element
SVGElement.missingglyph = function(nodeName,nodeAttributes) {
	this.base = SVGElement.path;
	this.base(nodeName,nodeAttributes);

	this.horizAdvX = 0;
}
SVGElement.missingglyph.prototype = new SVGElement.path;

// glyph element
SVGElement.glyph = function(nodeName,nodeAttributes) {
	this.base = SVGElement.path;
	this.base(nodeName,nodeAttributes);

	this.horizAdvX = this.attribute('horiz-adv-x').numValue();
	this.unicode = this.attribute('unicode').value;
	this.arabicForm = this.attribute('arabic-form').value;
}
SVGElement.glyph.prototype = new SVGElement.path;

// text element
SVGElement.text = function(nodeName,nodeAttributes) {
	this.captureTextNodes = true;
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.baseSetContext = this.setContext;
	this.setContext = function(ctx) {
		this.baseSetContext(ctx);

		var textBaseline = this.style('dominant-baseline').toTextBaseline();
		if (textBaseline == null) textBaseline = this.style('alignment-baseline').toTextBaseline();
		if (textBaseline != null) ctx.textBaseline = textBaseline;
	}

	this.getBoundingBox = function () {
		var x = this.attribute('x').toPixels('x');
		var y = this.attribute('y').toPixels('y');
		var fontSize = this.parent.style('font-size').numValueOrDefault(SVG.Font.Parse(SVG.ctx.font).fontSize);
		return new SVG.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2.0 / 3.0) * this.children[0].getText().length, y);
	}

	this.renderChildren = function(ctx) {
		this.x = this.attribute('x').toPixels('x');
		this.y = this.attribute('y').toPixels('y');
		if (this.attribute('dx').hasValue()) this.x += this.attribute('dx').toPixels('x');
		if (this.attribute('dy').hasValue()) this.y += this.attribute('dy').toPixels('y');
		this.x += this.getAnchorDelta(ctx, this, 0);
		for (var i=0; i<this.children.length; i++) {
			this.renderChild(ctx, this, this, i);
		}
	}

	this.getAnchorDelta = function (ctx, parent, startI) {
		var textAnchor = this.style('text-anchor').valueOrDefault('start');
		if (textAnchor != 'start') {
			var width = 0;
			for (var i=startI; i<parent.children.length; i++) {
				var child = parent.children[i];
				if (i > startI && child.attribute('x').hasValue()) break; // new group
				width += child.measureTextRecursive(ctx);
			}
			return -1 * (textAnchor == 'end' ? width : width / 2.0);
		}
		return 0;
	}

	this.renderChild = function(ctx, textParent, parent, i) {
		var child = parent.children[i];
		if (child.attribute('x').hasValue()) {
			child.x = child.attribute('x').toPixels('x') + textParent.getAnchorDelta(ctx, parent, i);
			if (child.attribute('dx').hasValue()) child.x += child.attribute('dx').toPixels('x');
		}
		else {
			if (child.attribute('dx').hasValue()) textParent.x += child.attribute('dx').toPixels('x');
			child.x = textParent.x;
		}
		textParent.x = child.x + child.measureText(ctx);

		if (child.attribute('y').hasValue()) {
			child.y = child.attribute('y').toPixels('y');
			if (child.attribute('dy').hasValue()) child.y += child.attribute('dy').toPixels('y');
		}
		else {
			if (child.attribute('dy').hasValue()) textParent.y += child.attribute('dy').toPixels('y');
			child.y = textParent.y;
		}
		textParent.y = child.y;

		child.render(ctx);

		for (var i=0; i<child.children.length; i++) {
			textParent.renderChild(ctx, textParent, child, i);
		}
	}
}
SVGElement.text.prototype = new SVGElement.RenderedElementBase;

// text base
SVGElement.TextElementBase = function(nodeName,nodeAttributes) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.getGlyph = function(font, text, i) {
		var c = text[i];
		var glyph = null;
		if (font.isArabic) {
			var arabicForm = 'isolated';
			if ((i==0 || text[i-1]==' ') && i<text.length-2 && text[i+1]!=' ') arabicForm = 'terminal';
			if (i>0 && text[i-1]!=' ' && i<text.length-2 && text[i+1]!=' ') arabicForm = 'medial';
			if (i>0 && text[i-1]!=' ' && (i == text.length-1 || text[i+1]==' ')) arabicForm = 'initial';
			if (typeof font.glyphs[c] != 'undefined') {
				glyph = font.glyphs[c][arabicForm];
				if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
			}
		}
		else {
			glyph = font.glyphs[c];
		}
		if (glyph == null) glyph = font.missingGlyph;
		return glyph;
	}

	this.renderChildren = function(ctx) {
		var customFont = this.parent.style('font-family').getDefinition();
		if (customFont != null) {
			var fontSize = this.parent.style('font-size').numValueOrDefault(SVG.Font.Parse(SVG.ctx.font).fontSize);
			var fontStyle = this.parent.style('font-style').valueOrDefault(SVG.Font.Parse(SVG.ctx.font).fontStyle);
			var text = this.getText();
			if (customFont.isRTL) text = text.split("").reverse().join("");

			var dx = SVG.ToNumberArray(this.parent.attribute('dx').value);
			for (var i=0; i<text.length; i++) {
				var glyph = this.getGlyph(customFont, text, i);
				var scale = fontSize / customFont.fontFace.unitsPerEm;
				ctx.translate(this.x, this.y);
				ctx.scale(scale, -scale);
				var lw = ctx.lineWidth;
				ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
				if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
				glyph.render(ctx);
				if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
				ctx.lineWidth = lw;
				ctx.scale(1/scale, -1/scale);
				ctx.translate(-this.x, -this.y);

				this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
				if (typeof dx[i] != 'undefined' && !isNaN(dx[i])) {
					this.x += dx[i];
				}
			}
			return;
		}

		if (ctx.fillStyle != '') ctx.fillText(SVG.compressSpaces(this.getText()), this.x, this.y);
		if (ctx.strokeStyle != '') ctx.strokeText(SVG.compressSpaces(this.getText()), this.x, this.y);
	}

	this.getText = function() {
		// OVERRIDE ME
	}

	this.measureTextRecursive = function(ctx) {
		var width = this.measureText(ctx);
		for (var i=0; i<this.children.length; i++) {
			width += this.children[i].measureTextRecursive(ctx);
		}
		return width;
	}

	this.measureText = function(ctx) {
		var customFont = this.parent.style('font-family').getDefinition();
		if (customFont != null) {
			var fontSize = this.parent.style('font-size').numValueOrDefault(SVG.Font.Parse(SVG.ctx.font).fontSize);
			var measure = 0;
			var text = this.getText();
			if (customFont.isRTL) text = text.split("").reverse().join("");
			var dx = SVG.ToNumberArray(this.parent.attribute('dx').value);
			for (var i=0; i<text.length; i++) {
				var glyph = this.getGlyph(customFont, text, i);
				measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
				if (typeof dx[i] != 'undefined' && !isNaN(dx[i])) {
					measure += dx[i];
				}
			}
			return measure;
		}

		var textToMeasure = SVG.compressSpaces(this.getText());
		if (!ctx.measureText) return textToMeasure.length * 10;

		ctx.save();
		this.setContext(ctx);
		var width = ctx.measureText(textToMeasure).width;
		ctx.restore();
		return width;
	}
}
SVGElement.TextElementBase.prototype = new SVGElement.RenderedElementBase;

// tspan
SVGElement.tspan = function(nodeName,nodeAttributes) {
	this.captureTextNodes = true;
	this.base = SVGElement.TextElementBase;
	this.base(nodeName,nodeAttributes);

	this.text = SVG.compressSpaces(node.value || node.text || node.textContent || '');
	this.getText = function() {
		// if this node has children, then they own the text
		if (this.children.length > 0) { return ''; }
		return this.text;
	}
}
SVGElement.tspan.prototype = new SVGElement.TextElementBase;

// tref
SVGElement.tref = function(nodeName,nodeAttributes) {
	this.base = SVGElement.TextElementBase;
	this.base(nodeName,nodeAttributes);

	this.getText = function() {
		var element = this.getHrefAttribute().getDefinition();
		if (element != null) return element.children[0].getText();
	}
}
SVGElement.tref.prototype = new SVGElement.TextElementBase;

// a element
SVGElement.a = function(nodeName,nodeAttributes) {
	this.base = SVGElement.TextElementBase;
	this.base(nodeName,nodeAttributes);

	this.hasText = node.childNodes.length > 0;
	for (var i=0; i<node.childNodes.length; i++) {
		if (node.childNodes[i].nodeType != 3) this.hasText = false;
	}

	// this might contain text
	this.text = this.hasText ? node.childNodes[0].value : '';
	this.getText = function() {
		return this.text;
	}

	this.baseRenderChildren = this.renderChildren;
	this.renderChildren = function(ctx) {
		if (this.hasText) {
			// render as text element
			this.baseRenderChildren(ctx);
			var fontSize = new SVGProperty('fontSize', SVG.Font.Parse(SVG.ctx.font).fontSize);
			SVG.Mouse.checkBoundingBox(this, new SVG.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));
		}
		else if (this.children.length > 0) {
			// render as temporary group
			var g = new SVGElement.g();
			g.children = this.children;
			g.parent = this;
			g.render(ctx);
		}
	}

	this.onclick = function() {
		window.open(this.getHrefAttribute().value);
	}

	this.onmousemove = function() {
		SVG.ctx.canvas.style.cursor = 'pointer';
	}
}
SVGElement.a.prototype = new SVGElement.TextElementBase;

// image element
SVGElement.image = function(nodeName,nodeAttributes) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	var href = this.getHrefAttribute().value;
	if (href == '') { return; }
	var isSvg = href.match(/\.svg$/)

	SVG.Images.push(this);
	this.loaded = false;
	if (!isSvg) {
		this.img = document.createElement('img');
		if (SVG.opts['useCORS'] == true) { this.img.crossOrigin = 'Anonymous'; }
		var self = this;
		this.img.onload = function() { self.loaded = true; }
		this.img.onerror = function() { SVG.log('ERROR: image "' + href + '" not found'); self.loaded = true; }
		this.img.src = href;
	}
	else {
		this.img = SVG.ajax(href);
		this.loaded = true;
	}

	this.renderChildren = function(ctx) {
		var x = this.attribute('x').toPixels('x');
		var y = this.attribute('y').toPixels('y');

		var width = this.attribute('width').toPixels('x');
		var height = this.attribute('height').toPixels('y');
		if (width == 0 || height == 0) return;

		ctx.save();
		if (isSvg) {
			ctx.drawSvg(this.img, x, y, width, height);
		}
		else {
			ctx.translate(x, y);
			SVG.AspectRatio(ctx,
							this.attribute('preserveAspectRatio').value,
							width,
							this.img.width,
							height,
							this.img.height,
							0,
							0);
			ctx.drawImage(this.img, 0, 0);
		}
		ctx.restore();
	}

	this.getBoundingBox = function() {
		var x = this.attribute('x').toPixels('x');
		var y = this.attribute('y').toPixels('y');
		var width = this.attribute('width').toPixels('x');
		var height = this.attribute('height').toPixels('y');
		return new SVG.BoundingBox(x, y, x + width, y + height);
	}
}
SVGElement.image.prototype = new SVGElement.RenderedElementBase;

// group element
SVGElement.g = function(nodeName,nodeAttributes) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.getBoundingBox = function() {
		var bb = new SVG.BoundingBox();
		for (var i=0; i<this.children.length; i++) {
			bb.addBoundingBox(this.children[i].getBoundingBox());
		}
		return bb;
	};
}
SVGElement.g.prototype = new SVGElement.RenderedElementBase;

// symbol element
SVGElement.symbol = function(nodeName,nodeAttributes) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.render = function(ctx) {
		// NO RENDER
	};
}
SVGElement.symbol.prototype = new SVGElement.RenderedElementBase;

// style element
SVGElement.style = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	// text, or spaces then CDATA
	var css = ''
	for (var i=0; i<node.childNodes.length; i++) {
	  css += node.childNodes[i].data;
	}
	css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
	css = SVG.compressSpaces(css); // replace whitespace
	var cssDefs = css.split('}');
	for (var i=0; i<cssDefs.length; i++) {
		if (SVG.trim(cssDefs[i]) != '') {
			var cssDef = cssDefs[i].split('{');
			var cssClasses = cssDef[0].split(',');
			var cssProps = cssDef[1].split(';');
			for (var j=0; j<cssClasses.length; j++) {
				var cssClass = SVG.trim(cssClasses[j]);
				if (cssClass != '') {
					var props = SVG.Styles[cssClass] || {};
					for (var k=0; k<cssProps.length; k++) {
						var prop = cssProps[k].indexOf(':');
						var name = cssProps[k].substr(0, prop);
						var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
						if (name != null && value != null) {
							props[SVG.trim(name)] = new SVGProperty(SVG.trim(name), SVG.trim(value));
						}
					}
					SVG.Styles[cssClass] = props;
					SVG.StylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);
					if (cssClass == '@font-face') {
						var fontFamily = props['font-family'].value.replace(/"/g,'');
						var srcs = props['src'].value.split(',');
						for (var s=0; s<srcs.length; s++) {
							if (srcs[s].indexOf('format("svg")') > 0) {
								var urlStart = srcs[s].indexOf('url');
								var urlEnd = srcs[s].indexOf(')', urlStart);
								var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
								var doc = SVG.parseXml(SVG.ajax(url));
								var fonts = doc.getElementsByTagName('font');
								for (var f=0; f<fonts.length; f++) {
									var font = SVG.CreateElement(fonts[f]);
									SVG.Definitions[fontFamily] = font;
								}
							}
						}
					}
				}
			}
		}
	}
}
SVGElement.style.prototype = new SVGElement.ElementBase;

// use element
SVGElement.use = function(nodeName,nodeAttributes) {
	this.base = SVGElement.RenderedElementBase;
	this.base(nodeName,nodeAttributes);

	this.baseSetContext = this.setContext;
	this.setContext = function(ctx) {
		this.baseSetContext(ctx);
		if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
		if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
	}

	var element = this.getHrefAttribute().getDefinition();

	this.path = function(ctx) {
		if (element != null) element.path(ctx);
	}

	this.getBoundingBox = function() {
		if (element != null) return element.getBoundingBox();
	}

	this.renderChildren = function(ctx) {
		if (element != null) {
			var tempSvg = element;
			if (element.type == 'symbol') {
				// render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
				tempSvg = new SVGElement.svg();
				tempSVG.type = 'svg';
				tempSVG.attributes['viewBox'] = new SVGProperty('viewBox', element.attribute('viewBox').value);
				tempSVG.attributes['preserveAspectRatio'] = new SVGProperty('preserveAspectRatio', element.attribute('preserveAspectRatio').value);
				tempSVG.attributes['overflow'] = new SVGProperty('overflow', element.attribute('overflow').value);
				tempSVG.children = element.children;
			}
			if (tempSVG.type == 'svg') {
				// if symbol or svg, inherit width/height from me
				if (this.attribute('width').hasValue()) tempSVG.attributes['width'] = new SVGProperty('width', this.attribute('width').value);
				if (this.attribute('height').hasValue()) tempSVG.attributes['height'] = new SVGProperty('height', this.attribute('height').value);
			}
			var oldParent = tempSVG.parent;
			tempSVG.parent = null;
			tempSVG.render(ctx);
			tempSVG.parent = oldParent;
		}
	}
}
SVGElement.use.prototype = new SVGElement.RenderedElementBase;

// mask element
SVGElement.mask = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.apply = function(ctx, element) {
		// render as temp svg
		var x = this.attribute('x').toPixels('x');
		var y = this.attribute('y').toPixels('y');
		var width = this.attribute('width').toPixels('x');
		var height = this.attribute('height').toPixels('y');

		if (width == 0 && height == 0) {
			var bb = new SVG.BoundingBox();
			for (var i=0; i<this.children.length; i++) {
				bb.addBoundingBox(this.children[i].getBoundingBox());
			}
			var x = Math.floor(bb.x1);
			var y = Math.floor(bb.y1);
			var width = Math.floor(bb.width());
			var	height = Math.floor(bb.height());
		}

		// temporarily remove mask to avoid recursion
		var mask = element.attribute('mask').value;
		element.attribute('mask').value = '';

			var cMask = document.createElement('canvas');
			cMask.width = x + width;
			cMask.height = y + height;
			var maskCtx = cMask.getContext('2d');
			this.renderChildren(maskCtx);

			var c = document.createElement('canvas');
			c.width = x + width;
			c.height = y + height;
			var tempCtx = c.getContext('2d');
			element.render(tempCtx);
			tempCtx.globalCompositeOperation = 'destination-in';
			tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
			tempCtx.fillRect(0, 0, x + width, y + height);

			ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
			ctx.fillRect(0, 0, x + width, y + height);

		// reassign mask
		element.attribute('mask').value = mask;
	}

	this.render = function(ctx) {
		// NO RENDER
	}
}
SVGElement.mask.prototype = new SVGElement.ElementBase;

// clip element
SVGElement.clipPath = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.apply = function(ctx) {
		var oldBeginPath = CanvasRenderingContext2D.prototype.beginPath;
		CanvasRenderingContext2D.prototype.beginPath = function () { };

		var oldClosePath = CanvasRenderingContext2D.prototype.closePath;
		CanvasRenderingContext2D.prototype.closePath = function () { };

		oldBeginPath.call(ctx);
		for (var i=0; i<this.children.length; i++) {
			var child = this.children[i];
			if (typeof child.path != 'undefined') {
				var transform = null;
				if (child.style('transform', false, true).hasValue()) {
					transform = new SVG.Transform(child.style('transform', false, true).value);
					transform.apply(ctx);
				}
				child.path(ctx);
				CanvasRenderingContext2D.prototype.closePath = oldClosePath;
				if (transform) { transform.unapply(ctx); }
			}
		}
		oldClosePath.call(ctx);
		ctx.clip();

		CanvasRenderingContext2D.prototype.beginPath = oldBeginPath;
		CanvasRenderingContext2D.prototype.closePath = oldClosePath;
	}

	this.render = function(ctx) {
		// NO RENDER
	}
}
SVGElement.clipPath.prototype = new SVGElement.ElementBase;

// filters
SVGElement.filter = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.apply = function(ctx, element) {
		// render as temp svg
		var bb = element.getBoundingBox();
		var x = Math.floor(bb.x1);
		var y = Math.floor(bb.y1);
		var width = Math.floor(bb.width());
		var	height = Math.floor(bb.height());

		// temporarily remove filter to avoid recursion
		var filter = element.style('filter').value;
		element.style('filter').value = '';

		var px = 0, py = 0;
		for (var i=0; i<this.children.length; i++) {
			var efd = this.children[i].extraFilterDistance || 0;
			px = Math.max(px, efd);
			py = Math.max(py, efd);
		}

		var c = document.createElement('canvas');
		c.width = width + 2*px;
		c.height = height + 2*py;
		var tempCtx = c.getContext('2d');
		tempCtx.translate(-x + px, -y + py);
		element.render(tempCtx);

		// apply filters
		for (var i=0; i<this.children.length; i++) {
			if (typeof this.children[i].apply == 'function') {
				this.children[i].apply(tempCtx, 0, 0, width + 2*px, height + 2*py);
			}
		}

		// render on me
		ctx.drawImage(c, 0, 0, width + 2*px, height + 2*py, x - px, y - py, width + 2*px, height + 2*py);

		// reassign filter
		element.style('filter', true).value = filter;
	}

	this.render = function(ctx) {
		// NO RENDER
	}
}
SVGElement.filter.prototype = new SVGElement.ElementBase;

SVGElement.feMorphology = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.apply = function(ctx, x, y, width, height) {
		// TODO: implement
	}
}
SVGElement.feMorphology.prototype = new SVGElement.ElementBase;

SVGElement.feComposite = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.apply = function(ctx, x, y, width, height) {
		// TODO: implement
	}
}
SVGElement.feComposite.prototype = new SVGElement.ElementBase;

SVGElement.feColorMatrix = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	var matrix = SVG.ToNumberArray(this.attribute('values').value);
	switch (this.attribute('type').valueOrDefault('matrix')) { // http://www.w3.org/TR/SVG/filters.html#feColorMatrixElement
		case 'saturate':
			var s = matrix[0];
			matrix = [0.213+0.787*s,0.715-0.715*s,0.072-0.072*s,0,0,
					  0.213-0.213*s,0.715+0.285*s,0.072-0.072*s,0,0,
					  0.213-0.213*s,0.715-0.715*s,0.072+0.928*s,0,0,
					  0,0,0,1,0,
					  0,0,0,0,1];
			break;
		case 'hueRotate':
			var a = matrix[0] * Math.PI / 180.0;
			var c = function (m1,m2,m3) { return m1 + Math.cos(a)*m2 + Math.sin(a)*m3; };
			matrix = [c(0.213,0.787,-0.213),c(0.715,-0.715,-0.715),c(0.072,-0.072,0.928),0,0,
					  c(0.213,-0.213,0.143),c(0.715,0.285,0.140),c(0.072,-0.072,-0.283),0,0,
					  c(0.213,-0.213,-0.787),c(0.715,-0.715,0.715),c(0.072,0.928,0.072),0,0,
					  0,0,0,1,0,
					  0,0,0,0,1];
			break;
		case 'luminanceToAlpha':
			matrix = [0,0,0,0,0,
					  0,0,0,0,0,
					  0,0,0,0,0,
					  0.2125,0.7154,0.0721,0,0,
					  0,0,0,0,1];
			break;
	}

	function imGet(img, x, y, width, height, rgba) {
		return img[y*width*4 + x*4 + rgba];
	}

	function imSet(img, x, y, width, height, rgba, val) {
		img[y*width*4 + x*4 + rgba] = val;
	}

	function m(i, v) {
		var mi = matrix[i];
		return mi * (mi < 0 ? v - 255 : v);
	}

	this.apply = function(ctx, x, y, width, height) {
		// assuming x==0 && y==0 for now
		var srcData = ctx.getImageData(0, 0, width, height);
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var r = imGet(srcData.data, x, y, width, height, 0);
				var g = imGet(srcData.data, x, y, width, height, 1);
				var b = imGet(srcData.data, x, y, width, height, 2);
				var a = imGet(srcData.data, x, y, width, height, 3);
				imSet(srcData.data, x, y, width, height, 0, m(0,r)+m(1,g)+m(2,b)+m(3,a)+m(4,1));
				imSet(srcData.data, x, y, width, height, 1, m(5,r)+m(6,g)+m(7,b)+m(8,a)+m(9,1));
				imSet(srcData.data, x, y, width, height, 2, m(10,r)+m(11,g)+m(12,b)+m(13,a)+m(14,1));
				imSet(srcData.data, x, y, width, height, 3, m(15,r)+m(16,g)+m(17,b)+m(18,a)+m(19,1));
			}
		}
		ctx.clearRect(0, 0, width, height);
		ctx.putImageData(srcData, 0, 0);
	}
}
SVGElement.feColorMatrix.prototype = new SVGElement.ElementBase;

SVGElement.feGaussianBlur = function(nodeName,nodeAttributes) {
	this.base = SVGElement.ElementBase;
	this.base(nodeName,nodeAttributes);

	this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());
	this.extraFilterDistance = this.blurRadius;

	this.apply = function(ctx, x, y, width, height) {
		if (typeof stackBlur.canvasRGBA == 'undefined') {
			SVG.log('ERROR: StackBlur.js must be included for blur to work');
			return;
		}

		// StackBlur requires canvas be on document
		ctx.canvas.id = SVG.UniqueId();
		ctx.canvas.style.display = 'none';
		document.body.appendChild(ctx.canvas);
		stackBlur.canvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);
		document.body.removeChild(ctx.canvas);
	}
}
SVGElement.feGaussianBlur.prototype = new SVGElement.ElementBase;

// title element, do nothing
SVGElement.title = function(nodeName,nodeAttributes) {
}
SVGElement.title.prototype = new SVGElement.ElementBase;

// desc element, do nothing
SVGElement.desc = function(nodeName,nodeAttributes) {
}
SVGElement.desc.prototype = new SVGElement.ElementBase;

SVGElement.MISSING = function(nodeName,nodeAttributes@) {
	SVG.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
}
SVGElement.MISSING.prototype = new SVGElement.ElementBase;
