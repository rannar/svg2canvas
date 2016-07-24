#要创建的标签
##svg
attribute:
width height viewbox


##g
transform translate type
##defs


##font
attribute:
id horiz-adv-x 

##font-face
attribute:
font-family line-height units-per-em font-weight

##glyph
attribute:
d unicode horiz-adv-x

##foreignObject
attribute:
x y width height 

##text
attribute:
font-weight font-size font-family fill x y fill-rule style transform


##rect
attribute:
x y width height fill

##addGradient
=>
linearGradient
radialGradient
attribute:
id ...
##stop
attribute:
stop-color
...


##pattern
##image

##path
attribute: fill fill-opacity stroke d

##filter

##feComponentTransfer
attribute:
in result

##feFunc + rgb[i]
attribute:
type slope intercept Ue

##feFuncA
attribute:
type slope xh

feOffset
attribute:
dx dy result

##feGaussianBlur
stdDeviation in result

##feComposite
in in2 operator k2 k3 result

##feFlood
attribute:
result

##feGaussianBlur
in result stdDeviation

clipPath
clippathunits type