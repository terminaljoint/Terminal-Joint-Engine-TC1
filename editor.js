class TIGEN_Editor {
  constructor() {
    this.vp = document.getElementById("vp");
    this.scene = new TIGEN_Scene();
    this.renderer = new AdvancedRenderer(this.scene, this.vp);
    this.physicsEngine = new PhysicsEngine();
    this.entities = [];
    this.selectedEntity = null;
    this.playMode = false;
    this.savedState = null;

    // UI References (safely get elements - may not exist in auto-start mode)
    this.playBtn = document.getElementById("play-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.addBoxBtn = document.getElementById("add-box");

    this.initWorld();
    this.bindUI();
    this.setupControls();
  }

  initWorld() {
    // Create default entities
    const cube = this.createDefaultCube();
    
    // Add a light
    const lightEntity = this.scene.createEntity("Directional Light");
    lightEntity.addComponent(Light);
    
    // Add camera controller
    const cameraEntity = this.scene.createEntity("Main Camera");
    const camera = cameraEntity.addComponent(Camera);
    const controller = cameraEntity.addComponent(FreeCameraController);
    
    if (window.TIGEN_Outliner) {
      window.TIGEN_Outliner.setScene(this.scene);
    }
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
    
    const collider = entity.addComponent(Collider);
    collider.size.set(2, 2, 2);
    
    this.physicsEngine.registerBody(physics);
    this.physicsEngine.registerCollider(collider);
    
    return entity;
  }

  bindUI() {
    // Safely bind UI elements - they may not exist in auto-start mode
    if (this.playBtn) this.playBtn.onclick = () => this.togglePlayMode();
    if (this.clearBtn) this.clearBtn.onclick = () => this.clear();
    if (this.addBoxBtn) this.addBoxBtn.onclick = () => this.spawnBox();
  }

  setupControls() {
    // Orbit controls for editor
    this.orbitControls = new THREE.OrbitControls(
      this.renderer.camera,
      this.renderer.renderer.domElement
    );
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.autoRotate = false;

    // Click to select
    window.addEventListener('click', (e) => {
      if (e.target === this.renderer.renderer.domElement) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (e.clientX / this.vp.clientWidth) * 2 - 1,
          -(e.clientY / this.vp.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.renderer.camera);
        
        const objects = this.getMeshesFromEntities();
        const intersects = raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
          const entity = intersects[0].object.userData.entity;
          if (entity) {
            this.selectEntity(entity);
          }
        }
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Delete' && this.selectedEntity) {
        this.scene.removeEntity(this.selectedEntity);
        this.selectedEntity = null;
        if (window.TIGEN_Inspector) {
          window.TIGEN_Inspector.selected = null;
          window.TIGEN_Inspector.refresh();
        }
        if (window.TIGEN_Outliner) {
          window.TIGEN_Outliner.refresh();
        }
      }
    });
  }

  getMeshesFromEntities() {
    const meshes = [];
    this.scene.entities.forEach(entity => {
      const mesh = entity.getComponent(Mesh);
      if (mesh && mesh.mesh) {
        meshes.push(mesh.mesh);
      }
    });
    return meshes;
  }

  selectEntity(entity) {
    this.selectedEntity = entity;
    if (window.TIGEN_Inspector) {
      window.TIGEN_Inspector.select(entity);
    }
    if (window.TIGEN_Outliner) {
      window.TIGEN_Outliner.refresh();
    }
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
    
    const collider = entity.addComponent(Collider);
    collider.size.set(1, 1, 1);
    
    this.physicsEngine.registerBody(physics);
    this.physicsEngine.registerCollider(collider);
    
    if (window.TIGEN_Outliner) {
      window.TIGEN_Outliner.refresh();
    }
  }

  togglePlayMode() {
    this.playMode = !this.playMode;
    
    if (this.playMode) {
      if (this.playBtn) {
        this.playBtn.textContent = "STOP";
        this.playBtn.style.background = "#ff4d4d";
      }
      this.savedState = JSON.stringify(this.scene.toJSON());
      // Start simulation
    } else {
      if (this.playBtn) {
        this.playBtn.textContent = "ENTER GAMEWORLD";
        this.playBtn.style.background = "#00ff88";
      }
      // Restore state
    }
  }

  clear() {
    if (!confirm("Clear world?")) return;
    this.scene.clear();
    this.selectedEntity = null;
    if (window.TIGEN_Inspector) {
      window.TIGEN_Inspector.selected = null;
      window.TIGEN_Inspector.refresh();
    }
    if (window.TIGEN_Outliner) {
      window.TIGEN_Outliner.refresh();
    }
  }

  update(dt) {
    this.orbitControls.update();
    this.scene.update(dt);
    this.physicsEngine.update(dt);
  }

  render() {
    this.renderer.draw();
  }
}
 
