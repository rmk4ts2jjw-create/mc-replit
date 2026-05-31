---
name: Canvas OKLCH colors
description: The HTML Canvas 2D API does not support oklch() color strings; using them crashes at runtime.
---

Browser Canvas API (`CanvasRenderingContext2D`) does NOT accept OKLCH color strings.

Calling `ctx.fillStyle = "oklch(0.85 0.16 90)"` or `grad.addColorStop(0, "oklch(0.85 0.16 90)80")` throws:
> Failed to execute 'addColorStop' on 'CanvasGradient': The value provided ('oklch(...)') could not be parsed as a color.

**Fix:** Use HSL or RGBA for all canvas color operations:
```javascript
ctx.fillStyle = `hsl(${accentHue}, 70%, 60%)`;
ctx.strokeStyle = `hsla(${accentHue}, 60%, 55%, 0.25)`;
grad.addColorStop(0, `hsla(${accentHue}, 70%, 60%, 0.5)`);
grad.addColorStop(1, `hsla(${accentHue}, 70%, 60%, 0)`);
```

**Why:** OKLCH is a CSS color space supported in modern browsers for CSS properties but NOT in the Canvas 2D API color parsing code.

**How to apply:** Any time a component draws on `<canvas>` and has access to an OKLCH accent prop, pass or compute a numeric `accentHue` alongside it and use `hsl()`/`hsla()` instead.
