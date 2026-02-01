/**
 * TIGEN - Advanced Inspector System
 * Real-time entity and component editing
 */

class TIGENInspector {
  constructor() {
    this.selected = null;
    this.container = document.getElementById("ins-root");
    this.noSelectionContainer = document.getElementById("ins-none");
    this.setupEventListeners();
  }

  select(entity) {
    this.selected = entity;
    this.refresh();
  }

  refresh() {
    this.container.innerHTML = '';

    if (!this.selected) {
      this.noSelectionContainer.style.display = 'block';
      return;
    }

    this.noSelectionContainer.style.display = 'none';

    // Entity Name
    const nameSection = this.createSection('Entity Properties');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = this.selected.name;
    nameInput.className = 'inspector-input';
    nameInput.onchange = (e) => {
      this.selected.name = e.target.value;
      TIGEN_Outliner.refresh();
    };
    nameSection.appendChild(this.createField('Name', nameInput));
    this.container.appendChild(nameSection);

    // Transform
    this.addTransformInspector();

    // Components
    this.addComponentInspector();

    // Add Component Button
    const addCompBtn = document.createElement('button');
    addCompBtn.textContent = '+ Add Component';
    addCompBtn.className = 'inspector-btn-add';
    addCompBtn.onclick = () => this.showComponentMenu();
    this.container.appendChild(addCompBtn);
  }

  addTransformInspector() {
    const transform = this.selected.transform;
    const section = this.createSection('Transform');

    // Position
    section.appendChild(this.createVector3Inspector('Position', transform.position, (v) => {
      transform.position.copy(v);
    }));

    // Rotation
    section.appendChild(this.createVector3Inspector('Rotation', transform.rotation, (v) => {
      transform.rotation.copy(v);
    }));

    // Scale
    section.appendChild(this.createVector3Inspector('Scale', transform.scale, (v) => {
      transform.scale.copy(v);
    }));

    this.container.appendChild(section);
  }

  addComponentInspector() {
    if (this.selected.components.size === 0) return;

    const section = this.createSection('Components');

    this.selected.components.forEach((component, name) => {
      const compDiv = document.createElement('div');
      compDiv.className = 'component-box';

      const header = document.createElement('div');
      header.className = 'component-header';
      header.textContent = name;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'component-remove-btn';
      removeBtn.onclick = () => {
        this.selected.removeComponent(component.constructor);
        this.refresh();
      };
      header.appendChild(removeBtn);

      compDiv.appendChild(header);

      // Component properties
      if (component.toJSON) {
        const props = component.toJSON();
        Object.keys(props).forEach(key => {
          const value = props[key];
          const input = document.createElement('input');
          input.type = typeof value === 'boolean' ? 'checkbox' : 'text';
          input.value = Array.isArray(value) ? value.join(', ') : value;
          input.checked = value;
          input.className = 'component-input';
          
          compDiv.appendChild(this.createField(key, input));
        });
      }

      section.appendChild(compDiv);
    });

    this.container.appendChild(section);
  }

  createVector3Inspector(label, vector, onChange) {
    const container = document.createElement('div');
    container.className = 'vector3-inspector';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'inspector-label';
    container.appendChild(labelEl);

    ['x', 'y', 'z'].forEach(axis => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = vector[axis].toFixed(2);
      input.step = 0.1;
      input.className = 'vector-input';
      input.onchange = () => {
        vector[axis] = parseFloat(input.value);
        if (onChange) onChange(vector);
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'vector-field';
      const axisLabel = document.createElement('span');
      axisLabel.textContent = axis.toUpperCase();
      axisLabel.className = 'axis-label';
      wrapper.appendChild(axisLabel);
      wrapper.appendChild(input);

      container.appendChild(wrapper);
    });

    return container;
  }

  createSection(title) {
    const section = document.createElement('div');
    section.className = 'inspector-section';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    return section;
  }

  createField(label, input) {
    const field = document.createElement('div');
    field.className = 'inspector-field';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'field-label';

    field.appendChild(labelEl);
    field.appendChild(input);

    return field;
  }

  showComponentMenu() {
    const components = [
      { name: 'Mesh', class: Mesh },
      { name: 'Physics', class: Physics },
      { name: 'Collider', class: Collider },
      { name: 'Light', class: Light },
      { name: 'Camera', class: Camera },
      { name: 'ParticleSystem', class: ParticleSystem },
      { name: 'Animator', class: Animator },
      { name: 'AudioSource', class: AudioSource }
    ];

    const menu = document.createElement('div');
    menu.className = 'component-menu';

    components.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.textContent = comp.name;
      item.onclick = () => {
        this.selected.addComponent(comp.class);
        this.refresh();
        menu.remove();
      };
      menu.appendChild(item);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => menu.remove();
    menu.appendChild(closeBtn);

    this.container.appendChild(menu);
  }

  setupEventListeners() {
    // Inspector updates on entity changes
    document.addEventListener('entitySelected', (e) => {
      this.select(e.detail.entity);
    });
  }
}

class TIGENOutliner {
  constructor() {
    this.container = document.getElementById("hierarchy");
    this.scene = null;
  }

  setScene(scene) {
    this.scene = scene;
    this.refresh();
  }

  refresh() {
    if (!this.scene) return;

    this.container.innerHTML = '';

    this.scene.entities.forEach(entity => {
      const element = this.createEntityElement(entity);
      this.container.appendChild(element);
    });
  }

  createEntityElement(entity, parent = null) {
    const div = document.createElement('div');
    div.className = 'outline-item';
    div.dataset.entityId = entity.id;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = entity.name;
    nameSpan.className = 'entity-name';
    nameSpan.onclick = () => {
      document.querySelectorAll('.outline-item').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      document.dispatchEvent(new CustomEvent('entitySelected', { detail: { entity } }));
    };

    div.appendChild(nameSpan);

    if (entity.children && entity.children.length > 0) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'outline-children';
      entity.children.forEach(child => {
        childrenDiv.appendChild(this.createEntityElement(child, entity));
      });
      div.appendChild(childrenDiv);
    }

    return div;
  }
}

const TIGEN_Inspector = new TIGENInspector();
const TIGEN_Outliner = new TIGENOutliner();
