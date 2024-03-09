---
title: Drawing curved lines with D3
date: 2024-03-02
tags:
    - d3
---

Say you have two points and you want to draw a curved line between them.

{{< sketch >}}

In d3, the above could be done using `curve` applied on a `d3.line`, which can be given as value to the `"d"` attribute of a `path` like following:

```js
svg.append("path")
    .attr("d", d3.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(d3.curveBumpX)
        ([{
            x: 50,
            y: 120
        }, {
            x: 140,
            y: 40
        }])
    )
    .attr("fill", "none")
    .attr("stroke", "#000");
```

`d3.line()` is used to draw lines between given points, while the `curve` function transforms the straight lines into curved ones. In above example, we used `d3.curveBumpX` algorithm, which is one of many available types.

For more on curves:
* [d3 curves](https://d3js.org/d3-shape/curve)