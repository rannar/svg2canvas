var canvas = document.getElementById('canvas');

SVG = SVG || {};
SVG.ctx = canvas.getContext('2d');

var uniqueId = 0;
SVG.UniqueId = function () { uniqueId++; return 'canvg' + uniqueId;	};	

SVG.Definitions = SVG.Definitions || {};
SVG.Styles = {};
SVG.StylesSpecificity = {};
SVG.Animations = [];
SVG.Images = [];

SVG.CreateElement = function(nodeName,nodeAttributes){
	var e = null;
	if(typeof SVGElement[nodeName] != 'undefined'){
		e = new SVGElement[nodeName](nodeName,nodeAttributes);
	}else{
		e = new SVGElement.MISSING(nodeName,nodeAttributes);
	}
	e.type = nodeName;
	return e;
}

// images loaded
SVG.ImagesLoaded = function() {
	//debugger;
	for (var i=0; i<SVG.Images.length; i++) {
		if (!SVG.Images[i].loaded) return false;
	}
	return true;
}

// trim
SVG.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }

// compress spaces
SVG.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }

// ajax
SVG.ajax = function(url) {
	var AJAX;
	if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
	else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
	if(AJAX){
	   AJAX.open('GET',url,false);
	   AJAX.send(null);
	   return AJAX.responseText;
	}
	return null;
}

// parse xml
SVG.parseXml = function(xml) {
	if (typeof Windows != 'undefined' && typeof Windows.Data != 'undefined' && typeof Windows.Data.Xml != 'undefined') {
		var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
		var settings = new Windows.Data.Xml.Dom.XmlLoadSettings();
		settings.prohibitDtd = false;
		xmlDoc.loadXml(xml, settings);
		return xmlDoc;
	}
	else if (window.DOMParser)
	{
		var parser = new DOMParser();
		return parser.parseFromString(xml, 'text/xml');
	}
	else
	{
		xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
		var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
		xmlDoc.async = 'false';
		xmlDoc.loadXML(xml);
		return xmlDoc;
	}
}


SVG.Font = new (function() {
	this.Styles = 'normal|italic|oblique|inherit';
	this.Variants = 'normal|small-caps|inherit';
	this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

	this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
		var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', SVG.ctx.font);
		return {
			fontFamily: fontFamily || f.fontFamily,
			fontSize: fontSize || f.fontSize,
			fontStyle: fontStyle || f.fontStyle,
			fontWeight: fontWeight || f.fontWeight,
			fontVariant: fontVariant || f.fontVariant,
			toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') }
		}
	}

	var that = this;
	this.Parse = function(s) {
		var f = {};
		var d = SVG.trim(SVG.compressSpaces(s || '')).split(' ');
		var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
		var ff = '';
		for (var i=0; i<d.length; i++) {
			if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
			else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
			else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
			else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
			else { if (d[i] != 'inherit') ff += d[i]; }
		} if (ff != '') f.fontFamily = ff;
		return f;
	}
});

// points and paths
SVG.ToNumberArray = function(s) {
	var a = SVG.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
	for (var i=0; i<a.length; i++) {
		a[i] = parseFloat(a[i]);
	}
	return a;
}
SVG.Point = function(x, y) {
	this.x = x;
	this.y = y;
}

SVG.Point.prototype.angleTo = function(p) {
	return Math.atan2(p.y - this.y, p.x - this.x);
}

SVG.Point.prototype.applyTransform = function(v) {
	var xp = this.x * v[0] + this.y * v[2] + v[4];
	var yp = this.x * v[1] + this.y * v[3] + v[5];
	this.x = xp;
	this.y = yp;
}

SVG.CreatePoint = function(s) {
	var a = SVG.ToNumberArray(s);
	return new SVG.Point(a[0], a[1]);
}
SVG.CreatePath = function(s) {
	var a = SVG.ToNumberArray(s);
	var path = [];
	for (var i=0; i<a.length; i+=2) {
		path.push(new SVG.Point(a[i], a[i+1]));
	}
	return path;
}

// bounding box
SVG.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
	this.x1 = Number.NaN;
	this.y1 = Number.NaN;
	this.x2 = Number.NaN;
	this.y2 = Number.NaN;

	this.x = function() { return this.x1; }
	this.y = function() { return this.y1; }
	this.width = function() { return this.x2 - this.x1; }
	this.height = function() { return this.y2 - this.y1; }

	this.addPoint = function(x, y) {
		if (x != null) {
			if (isNaN(this.x1) || isNaN(this.x2)) {
				this.x1 = x;
				this.x2 = x;
			}
			if (x < this.x1) this.x1 = x;
			if (x > this.x2) this.x2 = x;
		}

		if (y != null) {
			if (isNaN(this.y1) || isNaN(this.y2)) {
				this.y1 = y;
				this.y2 = y;
			}
			if (y < this.y1) this.y1 = y;
			if (y > this.y2) this.y2 = y;
		}
	}
	this.addX = function(x) { this.addPoint(x, null); }
	this.addY = function(y) { this.addPoint(null, y); }

	this.addBoundingBox = function(bb) {
		this.addPoint(bb.x1, bb.y1);
		this.addPoint(bb.x2, bb.y2);
	}

	this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
		var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
		var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
		var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
		var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
		this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
	}

	this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
		// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
		var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
		this.addPoint(p0[0], p0[1]);
		this.addPoint(p3[0], p3[1]);

		for (i=0; i<=1; i++) {
			var f = function(t) {
				return Math.pow(1-t, 3) * p0[i]
				+ 3 * Math.pow(1-t, 2) * t * p1[i]
				+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
				+ Math.pow(t, 3) * p3[i];
			}

			var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
			var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
			var c = 3 * p1[i] - 3 * p0[i];

			if (a == 0) {
				if (b == 0) continue;
				var t = -c / b;
				if (0 < t && t < 1) {
					if (i == 0) this.addX(f(t));
					if (i == 1) this.addY(f(t));
				}
				continue;
			}

			var b2ac = Math.pow(b, 2) - 4 * c * a;
			if (b2ac < 0) continue;
			var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
			if (0 < t1 && t1 < 1) {
				if (i == 0) this.addX(f(t1));
				if (i == 1) this.addY(f(t1));
			}
			var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
			if (0 < t2 && t2 < 1) {
				if (i == 0) this.addX(f(t2));
				if (i == 1) this.addY(f(t2));
			}
		}
	}

	this.isPointInBox = function(x, y) {
		return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
	}

	this.addPoint(x1, y1);
	this.addPoint(x2, y2);
}

// transforms
SVG.Transform = function(v) {
	var that = this;
	this.Type = {}

	// translate
	this.Type.translate = function(s) {
		this.p = svg.CreatePoint(s);
		this.apply = function(ctx) {
			ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
		}
		this.unapply = function(ctx) {
			ctx.translate(-1.0 * this.p.x || 0.0, -1.0 * this.p.y || 0.0);
		}
		this.applyToPoint = function(p) {
			p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
		}
	}

	// rotate
	this.Type.rotate = function(s) {
		var a = svg.ToNumberArray(s);
		this.angle = new svg.Property('angle', a[0]);
		this.cx = a[1] || 0;
		this.cy = a[2] || 0;
		this.apply = function(ctx) {
			ctx.translate(this.cx, this.cy);
			ctx.rotate(this.angle.toRadians());
			ctx.translate(-this.cx, -this.cy);
		}
		this.unapply = function(ctx) {
			ctx.translate(this.cx, this.cy);
			ctx.rotate(-1.0 * this.angle.toRadians());
			ctx.translate(-this.cx, -this.cy);
		}
		this.applyToPoint = function(p) {
			var a = this.angle.toRadians();
			p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
			p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
			p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
		}
	}

	this.Type.scale = function(s) {
		this.p = svg.CreatePoint(s);
		this.apply = function(ctx) {
			ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
		}
		this.unapply = function(ctx) {
			ctx.scale(1.0 / this.p.x || 1.0, 1.0 / this.p.y || this.p.x || 1.0);
		}
		this.applyToPoint = function(p) {
			p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
		}
	}

	this.Type.matrix = function(s) {
		this.m = svg.ToNumberArray(s);
		this.apply = function(ctx) {
			ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
		}
		this.unapply = function(ctx) {
			var a = this.m[0];
			var b = this.m[2];
			var c = this.m[4];
			var d = this.m[1];
			var e = this.m[3];
			var f = this.m[5];
			var g = 0.0;
			var h = 0.0;
			var i = 1.0;
			var det = 1 / (a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g));
			ctx.transform(
				det*(e*i-f*h),
				det*(f*g-d*i),
				det*(c*h-b*i),
				det*(a*i-c*g),
				det*(b*f-c*e),
				det*(c*d-a*f)
			);
		}
		this.applyToPoint = function(p) {
			p.applyTransform(this.m);
		}
	}

	this.Type.SkewBase = function(s) {
		this.base = that.Type.matrix;
		this.base(s);
		this.angle = new svg.Property('angle', s);
	}
	this.Type.SkewBase.prototype = new this.Type.matrix;

	this.Type.skewX = function(s) {
		this.base = that.Type.SkewBase;
		this.base(s);
		this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
	}
	this.Type.skewX.prototype = new this.Type.SkewBase;

	this.Type.skewY = function(s) {
		this.base = that.Type.SkewBase;
		this.base(s);
		this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
	}
	this.Type.skewY.prototype = new this.Type.SkewBase;

	this.transforms = [];

	this.apply = function(ctx) {
		for (var i=0; i<this.transforms.length; i++) {
			this.transforms[i].apply(ctx);
		}
	}

	this.unapply = function(ctx) {
		for (var i=this.transforms.length-1; i>=0; i--) {
			this.transforms[i].unapply(ctx);
		}
	}

	this.applyToPoint = function(p) {
		for (var i=0; i<this.transforms.length; i++) {
			this.transforms[i].applyToPoint(p);
		}
	}

	var data = svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g,') ').split(/\s(?=[a-z])/);
	for (var i=0; i<data.length; i++) {
		var type = svg.trim(data[i].split('(')[0]);
		var s = data[i].split('(')[1].replace(')','');
		var transformType = this.Type[type];
		if (typeof transformType != 'undefined') {
			var transform = new transformType(s);
			transform.type = type;
			this.transforms.push(transform);
		}
	}
}

// aspect ratio
SVG.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
	// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
	aspectRatio = SVG.compressSpaces(aspectRatio);
	aspectRatio = aspectRatio.replace(/^defer\s/,''); // ignore defer
	var align = aspectRatio.split(' ')[0] || 'xMidYMid';
	var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';

	// calculate scale
	var scaleX = width / desiredWidth;
	var scaleY = height / desiredHeight;
	var scaleMin = Math.min(scaleX, scaleY);
	var scaleMax = Math.max(scaleX, scaleY);
	if (meetOrSlice == 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
	if (meetOrSlice == 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }

	refX = new SVG.Property('refX', refX);
	refY = new SVG.Property('refY', refY);
	if (refX.hasValue() && refY.hasValue()) {
		ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
	}
	else {
		// align
		if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0);
		if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0);
		if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width - desiredWidth, 0);
		if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height - desiredHeight);
	}

	// scale
	if (align == 'none') ctx.scale(scaleX, scaleY);
	else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin);
	else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax);

	// translate
	ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
}

SVG.EmptyProperty = new SVGProperty('EMPTY', '');
