/* Asset Browser - lists loaded assets from TIGEN_AssetManager */
(function(){
  window.AssetBrowser = {
    container:null,
    init(body){
      this.container = body;
      const controls = document.createElement('div'); controls.className='gui-controls';
      const btn = document.createElement('button'); btn.className='small-btn'; btn.textContent='Refresh'; btn.onclick = ()=> this.refresh();
      controls.appendChild(btn);
      body.appendChild(controls);

      const grid = document.createElement('div'); grid.className='assets-grid'; grid.id='assets-grid'; body.appendChild(grid);
      this.refresh();
    },

    refresh(){
      const grid = document.getElementById('assets-grid'); if (!grid) return; grid.innerHTML='';
      const mgr = window.TIGEN_AssetManager || null; if (!mgr) return;
      mgr.assets.forEach((asset, key) => {
        const t = document.createElement('div'); t.className='asset-thumb';
        t.title = key;
        t.draggable = true;
        t.addEventListener('dragstart', (ev)=>{
          ev.dataTransfer.setData('text/plain', key);
        });
        if (asset && asset.isTexture){
          const img = document.createElement('img'); img.src = asset.image ? asset.image.src : ''; img.style.maxWidth='100%'; img.style.maxHeight='100%'; t.appendChild(img);
        } else if (asset && asset.scene){
          t.textContent = 'GLTF';
        } else {
          t.textContent = key.split('/').pop();
        }
        grid.appendChild(t);
      });
    }
  };
})();
