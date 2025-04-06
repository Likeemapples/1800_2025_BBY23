import Granim from "https://cdn.skypack.dev/granim";

new Granim({
  element: "#granimCanvas1",
  direction: "left-right",
  states: {
    "default-state": {
      gradients: [
        // ["#b2f0ca", "#44c732", "#28791b"],
        // ["#28791b", "#44c732", "#b2f0ca"],
        [
          { color: "#daf6d5", pos: 0.2 },
          { color: "#8fe382", pos: 0.8 },
          { color: "#36a725", pos: 1 },
        ],
        [
          { color: "#36a725", pos: 0 },
          { color: "#8fe382", pos: 0.2 },
          { color: "#daf6d5", pos: 0.8 },
        ],
      ],
      transitionSpeed: 6000,
      loop: true,
    },
  },
});
