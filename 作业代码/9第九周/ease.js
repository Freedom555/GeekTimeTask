export let linear = (v) => v;

export function cubicBezier(p1x, p1y, p2x, p2y) {
  console.log(p1x, p1y, p2x, p2y);
}

export let ease = cubicBezier(0.25, 0.1, 0.25, 0.1);
export let easeIn = cubicBezier(0.42, 0, 1, 1);
export let easeIn = cubicBezier(0, 0, 0.58, 1);
export let easeInOut = cubicBezier(0.42, 0, 0.58, 1);
