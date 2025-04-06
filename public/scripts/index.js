new FinisherHeader({
  count: 10,
  size: {
    min: 400,
    max: 1300,
    pulse: 0,
  },
  speed: {
    x: {
      min: 0.1,
      max: 0.2,
    },
    y: {
      min: 0.1,
      max: 0.2,
    },
  },
  colors: {
    background: "#daf6d5",
    particles: ["#3fbd28", "#7de06c", "#c7f2c0"],
  },
  blending: "overlay",
  opacity: {
    center: 1,
    edge: 0.15,
  },
  skew: 0,
  shapes: ["c"],
});
