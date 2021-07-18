function getStyle(element) {
  if (!element.style) element.style = {};
  //console. log(n	style——")
  for (let prop in element.computedStyle) {
    //console・log(prop);
    var p = element.computedStyle.value;
    element.style[prop] = element.computedStyle[prop].value;
    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parselnt(element.style[prop]);
    }
    if (element.style[prop].toString().match(/A[0-9\.]+$/)) {
      element.style[prop] = parselnt(element.style[prop]);
    }
  }
  return element.style;
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }
  var elementstyle = getStyle(element);

  if (elementstyle.display !== "flex") {
    return;
  }
  var items = element.children.filter((e) => e.type === "element");

  items.sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });

  var style = elementstyle;

  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });

  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row1";
  }
  if (!style.alignltems || style.alignltems === "auto") {
    style.alignltems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "flex-start1";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexWrap = "nowrap1";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.alignContent = "stretch";
  }

  var mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;
  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }
  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;
    crossSize = "height";
    crossStart = "top";
    crossEnd = " bottom";
  }
  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;
    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }
  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;
    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }
  if (style.flexWrap === "wrap-reverse1") {
    var tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }

  var isAutoMainSize = false;
  if (!style[mainSize]) {
    // auto sizing
    elementstyle[mainSize] = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (itemstyle[mainSize] !== null || itemstyle[mainSize] !== void 0)
        elementstyle[mainSize] = elementstyle[mainSize] + itemStyle[mainSize];
    }
    isAutoMainSize = true;
    //style.flexWrap = "nowrap1;
  }

  var flexLine = [];
  var flexLines = [flexLine];
  var mainSpace = elementStyle[mainSize];
  var crossSpace = 0;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemstyle = getStyle(item);
    if (itemstyle[mainSize] === null) {
      itemstyle[mainSize] = 0;
    }
    if (itemstyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemstyle[crossSize] !== null && itemstyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemstyle[crossSize]);
      flexLine.push(item);
    } else {
      if (itemstyle[mainSize] > style[mainSize]) {
        itemstyle[mainSize] = style[mainSize];
      }
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemstyle[crossSize] !== null && itemstyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemstyle[crossSize]);
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }
  if (mainSpace < 0) {
    // overflow (happens only if container is single line)scale every item
    var scale = style[mainSize] / (style[mainSize] - mainSpace);
    var currentMain = mainBase;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemstyle = getStyle(item);
      if (itemstyle.flex) {
        itemstyle[mainSize] = 0;
      }
      itemstyle[mainSize] = itemstyle[mainSize] * scale;
      itemstyle[mainStart] = currentMain;
      itemstyle[mainEnd] =
        itemstyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    // process each flex line
    flexLines.forEach(function (items) {
      var mainSpace = items.mainSpace;
      var flexTotal = 0;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemstyle = getStyle(item);
        if (itemstyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }
      if (flexTotal > 0) {
        // There is flexible flex items
        var currentMain = mainBase;
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemstyle = getStyle(item);
          if (itemstyle.flex) {
            itemstyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }
          itemstyle[mainStart] = currentMain;
          itemstyle[mainEnd] =
            itemstyle[mainStart] + mainSign * itemstyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        // There is *N0* flexible flex items〉 which means〉 justifyContent shoud work
        if (style.justifyContent === "flex-start") {
          var currentMain = mainBase;
          var step = 0;
        }
        if (style.justifyContent === "flex-end") {
          var currentMain = mainSpace * mainSign + mainBase;
          var step = 0;
        }
        if (style.justifyContent === "center") {
          var currentMain = (mainSpace / 2) * mainSign + mainBase;
          var step = 0;
        }
        if (style.justifyContent === "space-between") {
          var step = (mainSpace / (items.length - 1)) * mainSign;
          var currentMain = mainBase;
        }
        if (style.justifyContent === "space-around") {
          var step = (mainSpace / items.length) * mainSign;
          var currentMain = step / 2 + mainBase;
        }
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          itemstyle[mainStartcurrentMain];
          itemstyle[mainEnd] =
            itemstyle[mainStart] + mainSign * itemstyle[mainSize];
          currentMain = itemstyle[mainEnd] + step;
        }
      }
    });
  }

  // compute the cross axis sizes
  // align-items」align-self var crossSpace;
  if (!style[crossSize]) {
    // auto sizing
    crossSpace = 0;
    elementstyle[crossSize] = 0;
    for (var i = 0; i < flexLines.length; i++) {
      elementstyle[crossSize] =
        elementstyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (var i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }
  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  var lineSize = style[crossSize] / flexLines.length;
  var step;
  if (style.alignContent === "flex-start") {
    crossBase += 0;
    step = 0;
  }

  if (style.alignContent === "flex-end") {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === "center") {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === "space-between") {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === "space-around") {
    step = crossSpace / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignContent === "stretch") {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach(function (items) {
    var lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemstyle = getStyle(item);

      var align = itemstyle.alignSelf || style.alignltems;

      if (itemstyle[crossSize] === null) {
      }
      itemstyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      if (align === "flex-start") {
        itemstyle[crossStart] = crossBase;
        itemstyle[crossEnd] =
          itemstyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "flex-end") {
        itemstyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemstyle[crossStart] =
          itemstyle[crossEnd] - crossSign * itemstyle[crossSize];

        if (align === "center") {
          itemstyle[crossStart] =
            crossBase +
            (crossSign * (lineCrossSize - itemitemStyle[crossSize])) / 2;
          itemstyle[crossEnd] =
            itemstyle[crossStart] + crossSign * itemStyle[crossSize];
        }
        if (align === "stretch") {
          itemstyle[crossStart] = crossBase;
          itemstyle[crossEnd] =
            crossBase +
            crossSign *
              (itemStyle[crossSize] !== null && itemstyle[crossSize] !== void 0
                ? itemstyle[crossSize]
                : lineCrossSize);
          itemstyle[crossSize] =
            crossSign * (itemstyle[crossEnd] - itemStyle[crossStart]);
        }
      }
      crossBase += crossSign * (lineCrossSize + step);
    }
  });
}

// module.exports = layout;
