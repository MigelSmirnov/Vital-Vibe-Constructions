document.addEventListener("DOMContentLoaded", () => {
  for (const diagram of document.querySelectorAll("[data-solar-diagram]")) {
    const cold = diagram.querySelector("[data-cold-path]");
    const hot = diagram.querySelector("[data-hot-path]");
    const sensor = diagram.querySelector(".solar-sensor");
    const toggle = diagram.querySelector("[data-solar-toggle]");
    const schemeButtons = diagram.querySelectorAll("[data-scheme]");

    const setScheme = scheme => {
      diagram.dataset.scheme = scheme;
      const diagonal = scheme === "diagonal";
      cold.setAttribute("d", diagonal ? "M665 398H260V323" : "M120 398H260V323");
      hot.setAttribute("d", diagonal ? "M260 112H665V188" : "M560 112H120V188");
      sensor.setAttribute("transform", diagonal ? "translate(548 98)" : "translate(276 98)");
      schemeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scheme === scheme)));
    };

    schemeButtons.forEach(button => button.addEventListener("click", () => setScheme(button.dataset.scheme)));
    toggle.addEventListener("click", () => {
      const playing = diagram.dataset.playing !== "false";
      diagram.dataset.playing = String(!playing);
      toggle.textContent = playing ? diagram.dataset.playLabel : diagram.dataset.pauseLabel;
    });
    setScheme("same");
  }
});
