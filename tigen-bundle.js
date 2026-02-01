/**
 * TIGEN v2 - Bundled Browser Build
 * Combined single-file engine with no external dependencies except Three.js
 * Works directly in browser with file:// protocol
 */

// ============================================================================
// COMPONENT SYSTEM (ECS)
// ============================================================================

class Component {
  constructor(entity) {
    this.entity = entity;
    this.enabled = true;
  }
  onEnable() {}
  onDisable() {}
  update(dt) {}
  onDestroy() {}
}

class Transform extends Component {
  constructor(entity) {
    super(entity);
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    this.rotation.set(x, y, z);
  }

  setScale(x, y, z) {
    this.scale.set(x, y, z);
  }

  translate(x, y, z) {
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
  }
}

class Entity {
  constructor(name = "Entity") {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.components = new Map();
    this.children = [];
    this.parent = null;
    this.active = true;
    this.tags = [];
    this.transform = this.addComponent(Transform);
  }

  addComponent(ComponentClass) {
    if (this.components.has(ComponentClass.name)) {
      return this.components.get(ComponentClass.name);
    }
    const component = new ComponentClass(this);
    this.components.set(ComponentClass.name, component);
    if (component.onEnable) component.onEnable();
    return component;
  }

  getComponent(ComponentClass) {
    return this.components.get(ComponentClass.name);
  }

  removeComponent(ComponentClass) {
    const component = this.components.get(ComponentClass.name);
    if (component && component.onDestroy) {
      component.onDestroy();
    }
    this.components.delete(ComponentClass.name);
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx > -1) this.children.splice(idx, 1);
    child.parent = null;
  }

  update(dt) {
    if (!this.active) return;
    for (let component of this.components.values()) {
      if (component.enabled && component.update) {
        component.update(dt);
      }
    }
    this.children.forEach(child => child.update(dt));
  }

  destroy() {
    this.components.forEach(comp => {
      if (comp.onDestroy) comp.onDestroy();
    });
    this.components.clear();
    this.children.forEach(child => child.destroy());
    this.children = [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      active: this.active,
      transform: {
        position: this.transform.position,
        rotation: this.transform.rotation,
        scale: this.transform.scale
      }
    };
  }
}

// ============================================================================
// PHYSICS ENGINE
// ============================================================================

class PhysicsEngine {
  constructor() {
    this.bodies = [];
    this.gravity = new THREE.Vector3(0, -9.81, 0);
    this.damping = 0.99;
  }

  registerBody(body) {
    if (!this.bodies.includes(body)) {
      this.bodies.push(body);
    }
  }

  update(dt) {
    this.bodies.forEach(body => {
      if (!body.useGravity) return;
      body.velocity.add(this.gravity.clone().multiplyScalar(dt));
      body.velocity.multiplyScalar(this.damping);
    });
  }
}

class Physics extends Component {
  constructor(entity) {
    super(entity);
    this.mass = 1;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.useGravity = false;
  }

  update(dt) {
    if (this.mass <= 0) return;
    this.entity.transform.position.add(this.velocity.clone().multiplyScalar(dt));
  }
}

class Collider extends Component {
  constructor(entity) {
    super(entity);
    this.size = new THREE.Vector3(1, 1, 1);
    this.isTrigger = false;
  }
}

// ============================================================================
// RENDERER & MESH
// ============================================================================

class Mesh extends Component {
  constructor(entity) {
    super(entity);
    this.mesh = null;
    this.geometry = null;
    this.material = null;
  }

  onEnable() {
    if (this.mesh && this.entity.scene) {
      this.entity.scene.add(this.mesh);
    }
  }

  onDisable() {
    if (this.mesh && this.entity.scene) {
      this.entity.scene.remove(this.mesh);
    }
  }

  setGeometry(type, options = {}) {
    const opts = { width: 1, height: 1, depth: 1, radius: 1, ...options };
    
    switch(type) {
      case 'box':
        this.geometry = new THREE.BoxGeometry(opts.width, opts.height, opts.depth);
        break;
      case 'sphere':
        this.geometry = new THREE.SphereGeometry(opts.radius, 32, 32);
        break;
      case 'plane':
        this.geometry = new THREE.PlaneGeometry(opts.width, opts.height);
        break;
      case 'cylinder':
        this.geometry = new THREE.CylinderGeometry(opts.radius, opts.radius, opts.height, 32);
        break;
    }

    if (this.mesh) {
      if (this.entity.scene) this.entity.scene.remove(this.mesh);
      this.mesh = null;
    }
  }

  setMaterial(type, options = {}) {
    const opts = { color: 0xffffff, ...options };
    
    switch(type) {
      case 'standard':
        this.material = new THREE.MeshStandardMaterial(opts);
        break;
      case 'basic':
        this.material = new THREE.MeshBasicMaterial(opts);
        break;
    }

    if (this.mesh) {
      if (this.entity.scene) this.entity.scene.remove(this.mesh);
      this.mesh = null;
    }
  }

  update(dt) {
    if (!this.mesh) {
      if (this.geometry && this.material) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.userData.entity = this.entity;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        if (this.entity.scene && this.enabled) {
          this.entity.scene.add(this.mesh);
        }
      }
    }
    
    if (this.mesh) {
      const t = this.entity.transform;
      this.mesh.position.copy(t.position);
      this.mesh.rotation.order = 'YXZ';
      this.mesh.rotation.setFromEuler(t.rotation);
      this.mesh.scale.copy(t.scale);
    }
  }
}

class Light extends Component {
  constructor(entity) {
    super(entity);
    this.light = new THREE.PointLight(0xffffff, 1);
  }

  onEnable() {
    if (this.entity.scene) {
      this.entity.scene.add(this.light);
    }
  }

  onDisable() {
    if (this.light && this.entity.scene) {
      this.entity.scene.remove(this.light);
    }
  }

  update(dt) {
    this.light.position.copy(this.entity.transform.position);
  }
}

class Camera extends Component {
  constructor(entity) {
    super(entity);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }

  update(dt) {
    this.camera.position.copy(this.entity.transform.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.setFromEuler(this.entity.transform.rotation);
  }
}

// ============================================================================
// SCENE MANAGEMENT
// ============================================================================

class TIGEN_Scene extends THREE.Scene {
  constructor() {
    super();
    this.entities = [];
    this.entityMap = new Map();
    this.background = new THREE.Color(0x0a0b0d);
    
    // Lighting setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.far = 500;
    this.add(this.directionalLight);

    // Grid
    this.add(new THREE.GridHelper(200, 100, 0x222222, 0x181818));

    this.fog = new THREE.Fog(0x0a0b0d, 500, 1000);
  }

  createEntity(name = "Entity") {
    const entity = new Entity(name);
    this.entities.push(entity);
    this.entityMap.set(entity.id, entity);
    entity.scene = this;
    return entity;
  }

  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
      this.entityMap.set(entity.id, entity);
      entity.scene = this;
    }
  }

  removeEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx > -1) {
      this.entities.splice(idx, 1);
      this.entityMap.delete(entity.id);
      entity.destroy();
    }
  }

  getEntity(id) {
    return this.entityMap.get(id);
  }

  findEntitiesByName(name) {
    return this.entities.filter(e => e.name === name);
  }

  findEntitiesByTag(tag) {
    return this.entities.filter(e => e.tags && e.tags.includes(tag));
  }

  update(dt) {
    this.entities.forEach(entity => entity.update(dt));
  }

  clear() {
    this.entities.forEach(entity => entity.destroy());
    this.entities = [];
    this.entityMap.clear();
  }

  toJSON() {
    return {
      entities: this.entities.map(e => e.toJSON())
    };
  }
}

// ============================================================================
// RENDERER
// ============================================================================

class TIGEN_Renderer {
  constructor(scene, viewport) {
    this.scene = scene;
    this.viewport = viewport;

    this.camera = new THREE.PerspectiveCamera(
      70,
      viewport.clientWidth / viewport.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(20, 20, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    viewport.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const w = this.viewport.clientWidth;
    const h = this.viewport.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getMeshes() {
    const meshes = [];
    this.scene.entities.forEach(entity => {
      const mesh = entity.getComponent(Mesh);
      if (mesh && mesh.mesh) {
        meshes.push(mesh.mesh);
      }
    });
    return meshes;
  }
}

// ============================================================================
// GAME LOOP
// ============================================================================

class TIGEN_Loop {
  constructor(scene) {
    this.scene = scene;
    this.clock = new THREE.Clock();
    this.physicsEngine = new PhysicsEngine();
    this.frameCount = 0;
    this.fixedDeltaTime = 1 / 60;
    this.fixedTimeAccumulator = 0;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    const tick = () => {
      if (!this.isRunning) return;
      requestAnimationFrame(tick);

      const dt = this.clock.getDelta();
      const cappedDt = Math.min(dt, 1 / 30);

      // Fixed timestep physics
      this.fixedTimeAccumulator += cappedDt;
      while (this.fixedTimeAccumulator >= this.fixedDeltaTime) {
        this.physicsEngine.update(this.fixedDeltaTime);
        this.fixedTimeAccumulator -= this.fixedDeltaTime;
      }

      // Update scene
      this.scene.update(cappedDt);

      // Render
      this.render();

      this.frameCount++;
    };
    tick();
  }

  stop() {
    this.isRunning = false;
  }

  render() {
    // Override in editor
  }

  setScene(scene) {
    this.scene = scene;
  }
}

// ============================================================================
// INPUT SYSTEM
// ============================================================================

const TIGEN_Input = {
  keys: {},
  mouse: { x: 0, y: 0, down: false },

  init() {
    window.addEventListener('keydown', e => this.keys[e.code] = true);
    window.addEventListener('keyup', e => this.keys[e.code] = false);
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mousedown', () => this.mouse.down = true);
    window.addEventListener('mouseup', () => this.mouse.down = false);
  },

  isKeyDown(code) {
    return this.keys[code] === true;
  },

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }
};

TIGEN_Input.init();

// ============================================================================
// ASSET MANAGER
// ============================================================================

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loading = new Map();
    this.loaders = {
      gltf: (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function') ? new THREE.GLTFLoader() : null,
      texture: new THREE.TextureLoader()
    };
  }

  loadTexture(url) {
    if (this.assets.has(url)) {
      return Promise.resolve(this.assets.get(url));
    }

    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      this.loaders.texture.load(
        url,
        (texture) => {
          this.assets.set(url, texture);
          this.loading.delete(url);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Texture load error:', url, error);
          this.loading.delete(url);
          reject(error);
        }
      );
    });

    this.loading.set(url, promise);
    return promise;
  }

  loadModel(url) {
    if (this.assets.has(url)) {
      return Promise.resolve(this.assets.get(url));
    }

    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    if (!this.loaders.gltf) {
      return Promise.reject(new Error('THREE.GLTFLoader is not available.'));
    }

    const promise = new Promise((resolve, reject) => {
      this.loaders.gltf.load(
        url,
        (gltf) => {
          this.assets.set(url, gltf);
          this.loading.delete(url);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error('Model load error:', url, error);
          this.loading.delete(url);
          reject(error);
        }
      );
    });

    this.loading.set(url, promise);
    return promise;
  }

  getAsset(url) {
    return this.assets.get(url);
  }

  unloadAsset(url) {
    const asset = this.assets.get(url);
    if (asset && asset.dispose) {
      asset.dispose();
    }
    this.assets.delete(url);
  }

  clear() {
    for (let asset of this.assets.values()) {
      if (asset && asset.dispose) {
        asset.dispose();
      }
    }
    this.assets.clear();
  }
}

const AssetManagerInstance = new AssetManager();

// ============================================================================
// INSPECTOR UI
// ============================================================================

const TIGEN_Inspector = {
  selected: null,
  root: null,

  init() {
    this.root = document.getElementById("ins-root");
    this.none = document.getElementById("ins-none");
  },

  select(entity) {
    this.selected = entity;
    if (this.none) this.none.style.display = entity ? "none" : "block";
    this.refresh();
  },

  refresh() {
    if (!this.root) return;
    this.root.innerHTML = "";

    if (!this.selected) return;

    // Entity name
    const nameDiv = document.createElement("div");
    nameDiv.innerHTML = `<label style="font-weight:bold;color:#00ff88;">Name</label><input type="text" value="${this.selected.name}" style="width:100%;padding:5px;background:#0b0c0e;border:1px solid #2a2d32;color:#fff;">`;
    this.root.appendChild(nameDiv);

    // Transform
    const transDiv = document.createElement("div");
    transDiv.style.marginTop = "10px";
    transDiv.innerHTML = `<label style="font-weight:bold;color:#00ff88;">Transform</label>`;
    const t = this.selected.transform;

    for (let axis of ['x', 'y', 'z']) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "5px";
      row.style.marginTop = "5px";
      row.innerHTML = `
        <label>${axis.toUpperCase()}:</label>
        <input type="number" step="0.1" value="${t.position[axis]}" style="width:60px;padding:3px;background:#15171a;border:1px solid #2a2d32;color:#00ff88;">
      `;
      transDiv.appendChild(row);
    }

    this.root.appendChild(transDiv);
  }
};

// ============================================================================
// OUTLINER UI
// ============================================================================

const TIGEN_Outliner = {
  scene: null,
  root: null,

  init(scene) {
    this.scene = scene;
    this.root = document.getElementById("hierarchy");
  },

  setScene(scene) {
    this.scene = scene;
    this.refresh();
  },

  refresh() {
    if (!this.root) return;
    this.root.innerHTML = "";

    if (!this.scene) return;

    this.scene.entities.forEach(entity => {
      const item = document.createElement("div");
      item.style.padding = "8px";
      item.style.cursor = "pointer";
      item.style.borderBottom = "1px solid #2a2d32";
      item.style.color = "#aaa";
      item.innerHTML = entity.name;

      item.onclick = () => {
        TIGEN_Inspector.select(entity);
        item.style.background = "rgba(0, 255, 136, 0.1)";
      };

      this.root.appendChild(item);
    });
  }
};

// ============================================================================
// EDITOR
// ============================================================================

class TIGEN_Editor {
  constructor() {
    this.vp = document.getElementById("vp");
    if (!this.vp) {
      console.error("Viewport element not found!");
      return;
    }

    this.scene = new TIGEN_Scene();
    this.renderer = new TIGEN_Renderer(this.scene, this.vp);
    this.physicsEngine = new PhysicsEngine();
    this.selectedEntity = null;
    this.playMode = false;

    // UI References
    this.playBtn = document.getElementById("play-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.addBoxBtn = document.getElementById("add-box");

    TIGEN_Inspector.init();
    TIGEN_Outliner.init(this.scene);

    this.initWorld();
    this.bindUI();
    this.setupOrbitControls();
    this.setupSelection();
  }

  initWorld() {
    // Create default cube
    this.createDefaultCube();

    // Create a light
    const lightEntity = this.scene.createEntity("Directional Light");
    const light = lightEntity.addComponent(Light);

    // Update outliner
    TIGEN_Outliner.setScene(this.scene);
  }

  createDefaultCube() {
    const entity = this.scene.createEntity("Cube");
    entity.transform.setPosition(0, 1, 0);

    const mesh = entity.addComponent(Mesh);
    mesh.setGeometry('box', { width: 2, height: 2, depth: 2 });
    mesh.setMaterial('standard', { color: 0x00ff88, metalness: 0.3, roughness: 0.4 });

    const physics = entity.addComponent(Physics);
    physics.mass = 1;
    physics.useGravity = true;

    this.physicsEngine.registerBody(physics);
    return entity;
  }

  bindUI() {
    if (this.playBtn) {
      this.playBtn.onclick = () => this.togglePlayMode();
    }
    if (this.clearBtn) {
      this.clearBtn.onclick = () => this.clear();
    }
    if (this.addBoxBtn) {
      this.addBoxBtn.onclick = () => this.spawnBox();
    }
  }

  setupOrbitControls() {
    this.orbitControls = new THREE.OrbitControls(
      this.renderer.camera,
      this.renderer.renderer.domElement
    );
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.autoRotate = false;
  }

  setupSelection() {
    window.addEventListener('click', (e) => {
      if (e.target === this.renderer.renderer.domElement) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (e.clientX / this.vp.clientWidth) * 2 - 1,
          -(e.clientY / this.vp.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.renderer.camera);

        const meshes = [];
        this.scene.entities.forEach(entity => {
          const mesh = entity.getComponent(Mesh);
          if (mesh && mesh.mesh) {
            meshes.push(mesh.mesh);
          }
        });

        const intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
          const entity = intersects[0].object.userData.entity;
          if (entity) {
            this.selectEntity(entity);
          }
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Delete' && this.selectedEntity) {
        this.scene.removeEntity(this.selectedEntity);
        this.selectedEntity = null;
        TIGEN_Inspector.select(null);
        TIGEN_Outliner.refresh();
      }
    });
  }

  selectEntity(entity) {
    this.selectedEntity = entity;
    TIGEN_Inspector.select(entity);
    TIGEN_Outliner.refresh();
  }

  spawnBox() {
    const entity = this.scene.createEntity("Cube_" + Date.now());
    entity.transform.setPosition(
      (Math.random() - 0.5) * 10,
      5,
      (Math.random() - 0.5) * 10
    );

    const mesh = entity.addComponent(Mesh);
    mesh.setGeometry('box', { width: 1, height: 1, depth: 1 });
    mesh.setMaterial('standard', {
      color: Math.random() * 0xffffff,
      metalness: Math.random(),
      roughness: Math.random()
    });

    const physics = entity.addComponent(Physics);
    physics.mass = Math.random() * 2 + 0.5;
    physics.useGravity = true;

    this.physicsEngine.registerBody(physics);
    TIGEN_Outliner.refresh();
    return entity;
  }

  togglePlayMode() {
    this.playMode = !this.playMode;
    if (this.playBtn) {
      this.playBtn.textContent = this.playMode ? "STOP" : "PLAY";
      this.playBtn.style.background = this.playMode ? "#ff4d4d" : "#00ff88";
    }
  }

  clear() {
    if (confirm("Clear all entities?")) {
      this.scene.clear();
      this.selectedEntity = null;
      TIGEN_Inspector.select(null);
      TIGEN_Outliner.refresh();
    }
  }

  render() {
    this.orbitControls.update();

    // Update all meshes
    this.scene.entities.forEach(entity => {
      const mesh = entity.getComponent(Mesh);
      if (mesh) mesh.update(0);
    });

    this.renderer.render();
  }
}

// ============================================================================
// GLOBAL TIGEN NAMESPACE
// ============================================================================

window.TIGEN = {
  VERSION: "2.0",
  scene: null,
  editor: null,
  loop: null,
  assetManager: AssetManagerInstance,

  // Core classes
  Entity: Entity,
  Component: Component,
  Transform: Transform,
  Mesh: Mesh,
  Physics: Physics,
  Collider: Collider,
  Light: Light,
  Camera: Camera,

  // Managers
  Input: TIGEN_Input,
  Inspector: TIGEN_Inspector,
  Outliner: TIGEN_Outliner,
  Scene: TIGEN_Scene,

  // Utilities
  THREE: THREE,
  PhysicsEngine: PhysicsEngine,

  // Loader
  loadModel: (url) => AssetManagerInstance.loadModel(url),
  loadTexture: (url) => AssetManagerInstance.loadTexture(url),

  // Helper function to create entities
  createEntity: function(name) {
    if (this.scene) {
      return this.scene.createEntity(name);
    }
    return new Entity(name);
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener("DOMContentLoaded", () => {
  console.log("TIGEN v2 - Initializing...");

  // Create scene
  window.TIGEN.scene = new TIGEN_Scene();

  // Create editor
  window.TIGEN.editor = new TIGEN_Editor();

  // Create main loop
  window.TIGEN.loop = new TIGEN_Loop(window.TIGEN.scene);

  // Override render function
  window.TIGEN.loop.render = () => {
    if (window.TIGEN.editor) {
      window.TIGEN.editor.render();
    }
  };

  // Start the loop
  window.TIGEN.loop.start();

  console.log("✓ TIGEN v2 Engine Initialized");
  console.log("✓ Scene, Editor, and Loop Running");
  console.log("✓ Global TIGEN namespace available");
  console.log("✓ Use TIGEN.createEntity(name) to add entities");
  console.log("✓ Use TIGEN.loadModel(url) to load assets with animations");
});
