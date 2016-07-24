var createTag = function(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
};
window.onload = function() {
    var svg1 = createTag('svg');
    document.body.appendChild(svg1);
    svg1.setAttribute("id", "shapeSvg");
    svg1.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg1.setAttribute("version", "1.1");

    var circle2 = createTag("circle");
    svg1.appendChild(circle2);
    circle2.setAttribute("cx", "100");
    circle2.setAttribute("cy", "50");
    circle2.setAttribute("r", "40");
    circle2.setAttribute("stroke", "black");
    circle2.setAttribute("stroke-width", "2");
    circle2.setAttribute("fill", "red");

    var rect3 = createTag("rect");
    svg1.appendChild(rect3);
    rect3.setAttribute("width", "300");
    rect3.setAttribute("height", "100");
    rect3.setAttribute("style", "fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,0)");

    var rect4 = createTag("rect");
    svg1.appendChild(rect4);
    rect4.setAttribute("x", "50");
    rect4.setAttribute("y", "20");
    rect4.setAttribute("width", "150");
    rect4.setAttribute("height", "150");
    rect4.setAttribute("style", "fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9");
    
    var rect5 = createTag("rect");
    svg1.appendChild(rect5);
    rect5.setAttribute("x", "50");
    rect5.setAttribute("y", "20");
    rect5.setAttribute("width", "150");
    rect5.setAttribute("height", "150");
    rect5.setAttribute("style", "fill:blue;stroke:pink;stroke-width:5;opacity:0.5");
    
    var rect6 = createTag("rect");
    svg1.appendChild(rect6);
    rect6.setAttribute("x", "50");
    rect6.setAttribute("y", "20");
    rect6.setAttribute("rx", "20");
    rect6.setAttribute("ry", "20");
    rect6.setAttribute("width", "150");
    rect6.setAttribute("height", "150");
    rect6.setAttribute("style", "fill:red;stroke:black;stroke-width:5;opacity:0.5");
    
    var ellipse7 = createTag("ellipse");
    svg1.appendChild(ellipse7);
    ellipse7.setAttribute("cx", "300");
    ellipse7.setAttribute("cy", "80");
    ellipse7.setAttribute("rx", "100");
    ellipse7.setAttribute("ry", "50");
    ellipse7.setAttribute("style", "fill:yellow;stroke:purple;stroke-width:2");
    
    var ellipse8 = createTag("ellipse");
    svg1.appendChild(ellipse8);
    ellipse8.setAttribute("cx", "240");
    ellipse8.setAttribute("cy", "100");
    ellipse8.setAttribute("rx", "220");
    ellipse8.setAttribute("ry", "30");
    ellipse8.setAttribute("style", "fill:purple");
    
    var ellipse9 = createTag("ellipse");
    svg1.appendChild(ellipse9);
    ellipse9.setAttribute("cx", "220");
    ellipse9.setAttribute("cy", "70");
    ellipse9.setAttribute("rx", "190");
    ellipse9.setAttribute("ry", "20");
    ellipse9.setAttribute("style", "fill:lime");
    
    var ellipse10 = createTag("ellipse");
    svg1.appendChild(ellipse10);
    ellipse10.setAttribute("cx", "210");
    ellipse10.setAttribute("cy", "45");
    ellipse10.setAttribute("rx", "170");
    ellipse10.setAttribute("ry", "15");
    ellipse10.setAttribute("style", "fill:yellow");
    
    var line11 = createTag("line");
    svg1.appendChild(line11);
    line11.setAttribute("x1", "0");
    line11.setAttribute("y1", "0");
    line11.setAttribute("x2", "200");
    line11.setAttribute("y2", "200");
    line11.setAttribute("style", "stroke:rgb(255,0,0);stroke-width:2");
    
    var polygon12 = createTag("polygon");
    svg1.appendChild(polygon12);
    polygon12.setAttribute("points", "200,10 250,190 160,210");
    polygon12.setAttribute("style", "fill:lime;stroke:purple;stroke-width:1");
    
    var polygon13 = createTag("polygon");
    svg1.appendChild(polygon13);
    polygon13.setAttribute("points", "220,10 300,210 170,250 123,234");
    polygon13.setAttribute("style", "fill:lime;stroke:purple;stroke-width:1");
    
    var polygon14 = createTag("polygon");
    svg1.appendChild(polygon14);
    polygon14.setAttribute("points", "100,10 40,180 190,60 10,60 160,180");
    polygon14.setAttribute("style", "fill:lime;stroke:purple;stroke-width:5;fill-rule:nonzero;");
    
    var polygon15 = createTag("polygon");
    svg1.appendChild(polygon15);
    polygon15.setAttribute("points", "100,10 40,180 190,60 10,60 160,180");
    polygon15.setAttribute("style", "fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;");
    
    var polyline16 = createTag("polyline");
    svg1.appendChild(polyline16);
    polyline16.setAttribute("points", "0,40 40,40 40,80 80,80 80,120 120,120 120,160");
    polyline16.setAttribute("style", "fill:white;stroke:red;stroke-width:4");
    
    var path17 = createTag("path");
    svg1.appendChild(path17);
    path17.setAttribute("d", "M150 0 L75 200 L225 200 Z");
    
    var path18 = createTag("path");
    svg1.appendChild(path18);
    path18.setAttribute("id", "lineAB");
    path18.setAttribute("d", "M 100 350 l 150 -300");
    path18.setAttribute("stroke", "red");
    path18.setAttribute("stroke-width", "3");
    path18.setAttribute("fill", "none");
    
    var path19 = createTag("path");
    svg1.appendChild(path19);
    path19.setAttribute("id", "lineBC");
    path19.setAttribute("d", "M 250 50 l 150 300");
    path19.setAttribute("stroke", "red");
    path19.setAttribute("stroke-width", "3");
    path19.setAttribute("fill", "none");
    
    var path20 = createTag("path");
    svg1.appendChild(path20);
    path20.setAttribute("d", "M 175 200 l 150 0");
    path20.setAttribute("stroke", "green");
    path20.setAttribute("stroke-width", "3");
    path20.setAttribute("fill", "none");
    
    var path21 = createTag("path");
    svg1.appendChild(path21);
    path21.setAttribute("d", "M 100 350 q 150 -300 300 0");
    path21.setAttribute("stroke", "blue");
    path21.setAttribute("stroke-width", "5");
    path21.setAttribute("fill", "none");
    
    var g22 = createTag("g");
    svg1.appendChild(g22);
    g22.setAttribute("stroke", "black");
    g22.setAttribute("stroke-width", "3");
    g22.setAttribute("fill", "black");
    
    var circle23 = createTag("circle");
    g22.appendChild(circle23);
    circle23.setAttribute("id", "pointA");
    circle23.setAttribute("cx", "100");
    circle23.setAttribute("cy", "350");
    circle23.setAttribute("r", "3");
    
    var circle24 = createTag("circle");
    g22.appendChild(circle24);
    circle24.setAttribute("id", "pointB");
    circle24.setAttribute("cx", "250");
    circle24.setAttribute("cy", "50");
    circle24.setAttribute("r", "3");
    
    var circle25 = createTag("circle");
    g22.appendChild(circle25);
    circle25.setAttribute("id", "pointC");
    circle25.setAttribute("cx", "400");
    circle25.setAttribute("cy", "350");
    circle25.setAttribute("r", "3");
    
    var g26 = createTag("g");
    svg1.appendChild(g26);
    g26.setAttribute("font-size", "30");
    g26.setAttribute("font", "sans-serif");
    g26.setAttribute("fill", "black");
    g26.setAttribute("stroke", "none");
    g26.setAttribute("text-anchor", "middle");
    
    var text27 = createTag("text");
    g26.appendChild(text27);
    text27.setAttribute("x", "100");
    text27.setAttribute("y", "350");
    text27.setAttribute("dx", "-30");
    
    var text28 = createTag("text");
    g26.appendChild(text28);
    text28.setAttribute("x", "250");
    text28.setAttribute("y", "50");
    text28.setAttribute("dy", "-10");
    
    var text29 = createTag("text");
    g26.appendChild(text29);
    text29.setAttribute("x", "400");
    text29.setAttribute("y", "350");
    text29.setAttribute("dx", "30");
    
    var text30 = createTag("text");
    svg1.appendChild(text30);
    text30.setAttribute("x", "0");
    text30.setAttribute("y", "15");
    text30.setAttribute("fill", "red");
    
    var text31 = createTag("text");
    svg1.appendChild(text31);
    text31.setAttribute("x", "0");
    text31.setAttribute("y", "15");
    text31.setAttribute("fill", "red");
    text31.setAttribute("transform", "rotate(30 20,40)");
    
    var text32 = createTag("text");
    svg1.appendChild(text32);
    text32.setAttribute("x", "10");
    text32.setAttribute("y", "20");
    text32.setAttribute("style", "fill:red;");
    
    var tspan33 = createTag("tspan");
    text32.appendChild(tspan33);
    tspan33.setAttribute("x", "10");
    tspan33.setAttribute("y", "45");
    
    var tspan34 = createTag("tspan");
    text32.appendChild(tspan34);
    tspan34.setAttribute("x", "10");
    tspan34.setAttribute("y", "70");
    
    var a35 = createTag("a");
    svg1.appendChild(a35);
    a35.setAttribute("xlink:href", "/svg/");
    a35.setAttribute("target", "_blank");
    
    var text36 = createTag("text");
    a35.appendChild(text36);
    text36.setAttribute("x", "0");
    text36.setAttribute("y", "15");
    text36.setAttribute("fill", "red");
    
    var g37 = createTag("g");
    svg1.appendChild(g37);
    g37.setAttribute("fill", "none");
    
    var path38 = createTag("path");
    g37.appendChild(path38);
    path38.setAttribute("stroke", "red");
    path38.setAttribute("d", "M5 20 l215 0");
    
    var path39 = createTag("path");
    g37.appendChild(path39);
    path39.setAttribute("stroke", "black");
    path39.setAttribute("d", "M5 40 l215 0");
    
    var path40 = createTag("path");
    g37.appendChild(path40);
    path40.setAttribute("stroke", "blue");
    path40.setAttribute("d", "M5 60 l215 0");
    
    var g41 = createTag("g");
    svg1.appendChild(g41);
    g41.setAttribute("fill", "none");
    g41.setAttribute("stroke", "black");
    
    var path42 = createTag("path");
    g41.appendChild(path42);
    path42.setAttribute("stroke-width", "2");
    path42.setAttribute("d", "M5 20 l215 0");
    
    var path43 = createTag("path");
    g41.appendChild(path43);
    path43.setAttribute("stroke-width", "4");
    path43.setAttribute("d", "M5 40 l215 0");
    
    var path44 = createTag("path");
    g41.appendChild(path44);
    path44.setAttribute("stroke-width", "6");
    path44.setAttribute("d", "M5 60 l215 0");
    
    var g45 = createTag("g");
    svg1.appendChild(g45);
    g45.setAttribute("fill", "none");
    g45.setAttribute("stroke", "black");
    g45.setAttribute("stroke-width", "6");
    
    var path46 = createTag("path");
    g45.appendChild(path46);
    path46.setAttribute("stroke-linecap", "butt");
    path46.setAttribute("d", "M5 20 l215 0");
    
    var path47 = createTag("path");
    g45.appendChild(path47);
    path47.setAttribute("stroke-linecap", "round");
    path47.setAttribute("d", "M5 40 l215 0");
    
    var path48 = createTag("path");
    g45.appendChild(path48);
    path48.setAttribute("stroke-linecap", "square");
    path48.setAttribute("d", "M5 60 l215 0");
    
    var g49 = createTag("g");
    svg1.appendChild(g49);
    g49.setAttribute("fill", "none");
    g49.setAttribute("stroke", "black");
    g49.setAttribute("stroke-width", "4");
    
    var path50 = createTag("path");
    g49.appendChild(path50);
    path50.setAttribute("stroke-dasharray", "5,5");
    path50.setAttribute("d", "M5 20 l215 0");
    
    var path51 = createTag("path");
    g49.appendChild(path51);
    path51.setAttribute("stroke-dasharray", "10,10");
    path51.setAttribute("d", "M5 40 l215 0");
    
    var path52 = createTag("path");
    g49.appendChild(path52);
    path52.setAttribute("stroke-dasharray", "20,10,5,5,5,10");
    path52.setAttribute("d", "M5 60 l215 0");

    canvg('canvas','<svg>'+svg1.innerHTML+'</svg>');
}
