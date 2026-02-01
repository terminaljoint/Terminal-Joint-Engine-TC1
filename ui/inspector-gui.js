/* Inspector GUI - edits selected entity properties */
(function(){
  window.InspectorGUI = {
    container:null,
    current:null,
    init(body){
      this.container = body;
      const info = document.createElement('div'); info.id='inspector-body'; this.container.appendChild(info);
      document.addEventListener('entitySelected',(e)=> this.show(e.detail.entity));
    },

    show(entity){
      this.current = entity;
      const root = document.getElementById('inspector-body'); if (!root) return; root.innerHTML='';
      if (!entity){ root.textContent='No selection'; return; }
        // Add Component controls
        const addRow = document.createElement('div'); addRow.className='inspector-row';
        const addLabel = document.createElement('label'); addLabel.textContent='Add';
        const addSelect = document.createElement('select');
        ['Mesh','Physics','Collider','Light','Camera','ParticleSystem','Animator','AudioSource'].forEach(n=>{ const o=document.createElement('option'); o.value=n; o.textContent=n; addSelect.appendChild(o); });
        const addBtn = document.createElement('button'); addBtn.className='small-btn'; addBtn.textContent='Add'; addBtn.onclick = ()=>{
          const name = addSelect.value;
          const ctor = window[name] || window['TIGEN_'+name] || null;
          if (ctor && entity.addComponent) entity.addComponent(ctor);
          else console.warn('Component constructor not found:', name);
          if (window.TIGEN_Outliner && TIGEN_Outliner.refresh) TIGEN_Outliner.refresh();
          this.show(entity);
        };
        addRow.appendChild(addLabel); addRow.appendChild(addSelect); addRow.appendChild(addBtn); root.appendChild(addRow);
      // Name
      const nameRow = document.createElement('div'); nameRow.className='inspector-row';
      const nameLabel = document.createElement('label'); nameLabel.textContent='Name';
      const nameInput = document.createElement('input'); nameInput.value = entity.name || '';
      nameInput.onchange = ()=>{ entity.name = nameInput.value; if (window.TIGEN_Outliner && TIGEN_Outliner.refresh) TIGEN_Outliner.refresh(); };
      nameRow.appendChild(nameLabel); nameRow.appendChild(nameInput); root.appendChild(nameRow);

      // Transform (position)
      const pos = entity.transform && entity.transform.position ? entity.transform.position : null;
      if (pos){ ['x','y','z'].forEach(axis=>{
        const row = document.createElement('div'); row.className='inspector-row';
        const lab = document.createElement('label'); lab.textContent = axis.toUpperCase();
        const inp = document.createElement('input'); inp.type='number'; inp.step='0.1'; inp.value = (pos[axis]||0).toFixed(2);
        inp.onchange = ()=>{ pos[axis] = parseFloat(inp.value); };
        row.appendChild(lab); row.appendChild(inp); root.appendChild(row);
      }); }

        // Components summary with simple editors
        if (entity.components && entity.components.size){
          const compHeader = document.createElement('div'); compHeader.className='gui-header'; compHeader.textContent='Components'; root.appendChild(compHeader);
          entity.components.forEach((c,name)=>{
            const d = document.createElement('div'); d.className='outline-item';
            const label = document.createElement('span'); label.textContent = name || c.constructor.name;
            const editBtn = document.createElement('button'); editBtn.className='small-btn'; editBtn.textContent='Edit';
            editBtn.onclick = ()=> this.openComponentEditor(entity,c,name);
            d.appendChild(label); d.appendChild(editBtn); root.appendChild(d);
          });
        }

        // Event bindings editor
        const evHeader = document.createElement('div'); evHeader.className='gui-header'; evHeader.textContent='Events'; root.appendChild(evHeader);
        const evBody = document.createElement('div'); evBody.className='gui-body';
        const addEvRow = document.createElement('div'); addEvRow.className='inspector-row';
        const evSelect = document.createElement('select'); ['onUpdate','onCollision','onTrigger','onStart'].forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; evSelect.appendChild(o);} );
        const evInput = document.createElement('input'); evInput.placeholder='handlerFunctionName';
        const evBtn = document.createElement('button'); evBtn.className='small-btn'; evBtn.textContent='Bind'; evBtn.onclick = ()=>{
          entity._eventBindings = entity._eventBindings || {};
          entity._eventBindings[evSelect.value] = evInput.value;
          this.show(entity);
        };
        addEvRow.appendChild(evSelect); addEvRow.appendChild(evInput); addEvRow.appendChild(evBtn);
        evBody.appendChild(addEvRow);
        // list existing
        const bindings = entity._eventBindings || {};
        Object.keys(bindings).forEach(k=>{
          const r = document.createElement('div'); r.className='inspector-row';
          const l = document.createElement('label'); l.textContent = k;
          const v = document.createElement('input'); v.value = bindings[k]; v.onchange = ()=>{ bindings[k]=v.value; };
          const rem = document.createElement('button'); rem.className='small-btn'; rem.textContent='Remove'; rem.onclick = ()=>{ delete bindings[k]; this.show(entity); };
          r.appendChild(l); r.appendChild(v); r.appendChild(rem); evBody.appendChild(r);
        });
        root.appendChild(evBody);
      },

      openComponentEditor(entity, component, name){
        // Simple modal-like editor appended to inspector-body
        const root = document.getElementById('inspector-body');
        const modal = document.createElement('div'); modal.style.background='#070708'; modal.style.border='1px solid rgba(255,255,255,0.04)'; modal.style.padding='10px'; modal.style.marginTop='10px';
        const title = document.createElement('div'); title.className='gui-header'; title.textContent = `Edit: ${name || component.constructor.name}`; modal.appendChild(title);
        const body = document.createElement('div'); body.className='gui-body';
        // If component has toJSON, create fields
        if (component.toJSON){
          const props = component.toJSON();
          Object.keys(props).forEach(k=>{
            const row = document.createElement('div'); row.className='inspector-row';
            const lab = document.createElement('label'); lab.textContent = k;
            const inp = document.createElement('input'); inp.value = props[k]; inp.onchange = ()=>{
              if (typeof component[k] !== 'undefined') component[k] = inp.value;
              else component[k] = inp.value;
            };
            row.appendChild(lab); row.appendChild(inp); body.appendChild(row);
          });
        } else {
          const p = document.createElement('div'); p.textContent='No editable properties available.'; body.appendChild(p);
        }
        const save = document.createElement('button'); save.className='small-btn'; save.textContent='Close'; save.onclick = ()=>{ modal.remove(); };
        modal.appendChild(body); modal.appendChild(save); root.appendChild(modal);
      },
  };
})();
