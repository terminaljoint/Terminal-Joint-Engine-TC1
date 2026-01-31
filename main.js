window.addEventListener("DOMContentLoaded", () => {
  window.TIGEN = {};
  TIGEN.scene = new TIGEN_Scene();
  TIGEN.loop = new TIGEN_Loop(TIGEN.scene);
  TIGEN.loop.start();
});

