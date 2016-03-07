var changeLightness = function(context, type, amount) {

  // Variable setup
  var selection = context.selection

  if (checkLayerCount(selection.count())) {
    var layer = selection[0]
    var selectedColor = layer.style().fills().firstObject().color()

    // http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    var red = selectedColor.red()
    var green = selectedColor.green()
    var blue = selectedColor.blue()

    var max = Math.max(red, blue, green)
    var min = Math.min(red, blue, green)

    // Convert the RGB selection to HSL
    var hue
    var saturation
    var lightness = (max + min) / 2

    if (max === min) {
      hue = 0
      saturation = 0
    } else {
      var d = max - min
      saturation = lightness > 0.5  ? d / (2 - max - min) : d / (max + min)

      if (max === red) {
        hue = (green - blue) / d + (green < blue ? 6 : 0)
      } else if (max === green) {
        hue = (blue - red) / d + 2
      } else if (max === blue) {
        hue = (red - green) / d + 4
      }

      hue /= 6

      if (type === "darken") {
        lightness = lightness - amount
      } else {
        lightness = lightness + amount
      }
    }

    // Convert it back to RGB to set the color
    var newRed
    var newGreen
    var newBlue

    if (saturation === 0) {
      newRed = lightness
      newGreen = lightness
      newBlue = lightness
    } else {
      var q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation

      var p = 2 * lightness - q;

      newRed = convertHueToRgb (p, q, hue + 1/3)
      newGreen = convertHueToRgb (p, q, hue)
      newBlue = convertHueToRgb (p, q, hue - 1/3)
    }

    selectedColor.setRed(newRed)
    selectedColor.setGreen(newGreen)
    selectedColor.setBlue(newBlue)
  }
}

var checkLayerCount = function(selectionCount) {
  var app = NSApplication.sharedApplication()
  var isOneLayerSelected = false

  switch (selectionCount) {
    case 0:
      app.displayDialog_withTitle("You must select a layer first.", "Darken Lighten Colors")
    break

    case 1:
      isOneLayerSelected = true
    break

    default:
      app.displayDialog_withTitle("Only one layer can be selected.", "Darken Lighten Colors")
    break
  }

  return isOneLayerSelected
}

var convertHueToRgb = function (p, q, t) {
  var calcValue

  if (t < 0) {
    t += 1;
  }

  if (t > 1) {
    t -= 1;
  }

  if (t < 1 / 6) {
    calcValue = p + (q - p) * 6 * t

    if (calcValue > 1) {
      calcValue = 1
    } else if (calcValue < 0) {
      calcValue = 0
    }

    return calcValue
  }

  if (t < 1 / 2) {
    if (q > 1) {
      calcValue = 1
    } else if (q < 0) {
      calcValue = 0
    } else {
      calcValue = q
    }

    return calcValue
  }

  if (t < 2/3) {
    calcValue = p + (q - p) * (2 / 3 - t) * 6
    if (calcValue > 1) {
      calcValue = 1
    } else if (calcValue < 0) {
      calcValue = 0
    }

    return calcValue
  }

  if (p > 1) {
    calcValue = 1
  } else if (p < 0) {
    calcValue = 0
  } else {
    calcValue = p
  }

  return calcValue;
}
