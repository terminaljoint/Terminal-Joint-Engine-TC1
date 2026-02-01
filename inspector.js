if (typeof window.TIGEN_Inspector === 'undefined') {
  window.TIGEN_Inspector = {
    selected: null,

    select(obj) {
      this.selected = obj;
      const el = document.getElementById("ins-none");
      if (el) el.style.display = obj ? "none" : "block";
    },
    refresh() {}
  };
}

if (typeof window.TIGEN_Outliner === 'undefined') {
  window.TIGEN_Outliner = {
    setScene(scene) {},
    refresh() {}
  };
}
