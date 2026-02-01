/* Outliner GUI - shows scene hierarchy and dispatches selection */
(function(){
  window.OutlinerGUI = {
    container: null,
    init(body){
      this.container = body;
      const controls = document.createElement('div'); controls.className='gui-controls';
      const btn = document.createElement('button'); btn.className='small-btn'; btn.textContent='Refresh'; btn.onclick = ()=> this.refresh();
      controls.appendChild(btn);
      body.appendChild(controls);
      const list = document.createElement('div'); list.id='outliner-list'; body.appendChild(list);
      this.refresh();
      document.addEventListener('entityCreated', ()=> this.refresh());
    },

    refresh(){
      const list = document.getElementById('outliner-list'); if (!list) return; list.innerHTML='';
      const scene = window.TIGEN && TIGEN.scene ? TIGEN.scene : (window.TIGEN_Scene || null);
      if (!scene || !scene.entities) return;
      scene.entities.forEach(entity => {
        const el = document.createElement('div'); el.className='outline-item'; el.dataset.id = entity.id;
        el.textContent = entity.name || `Entity ${entity.id}`;
        el.onclick = ()=>{
          document.querySelectorAll('.outline-item').forEach(n=>n.classList.remove('selected'));
          el.classList.add('selected');
          document.dispatchEvent(new CustomEvent('entitySelected',{detail:{entity}}));
        };
        // Accept asset drops
        el.addEventListener('dragover', (e)=>{ e.preventDefault(); });
        el.addEventListener('drop', (e)=>{ e.preventDefault(); const key = e.dataTransfer.getData('text/plain'); document.dispatchEvent(new CustomEvent('assetDropped',{detail:{entity, key}})); });
        list.appendChild(el);
      });
    }
  };
})();
