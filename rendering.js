/**
 * TIGEN - Advanced Renderer with Materials & Lighting
 */

class Mesh extends Component {
  constructor(entity) {
    super(entity);
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.castShadow = true;
    this.receiveShadow = true;
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

  setGeometry(geometryType, params = {}) {
    let geom;
    switch (geometryType) {
      case 'box':
        geom = new THREE.BoxGeometry(params.width || 1, params.height || 1, params.depth || 1);
        break;
      case 'sphere':
        geom = new THREE.SphereGeometry(params.radius || 1, params.widthSegments || 32, params.heightSegments || 32);
        break;
      case 'cylinder':
        geom = new THREE.CylinderGeometry(params.radiusTop || 1, params.radiusBottom || 1, params.height || 1, params.radialSegments || 32);
        break;
      case 'plane':
        geom = new THREE.PlaneGeometry(params.width || 1, params.height || 1);
        break;
      case 'torus':
        geom = new THREE.TorusGeometry(params.radius || 1, params.tube || 0.4, params.radialSegments || 16, params.tubularSegments || 100);
        break;
      case 'cone':
        geom = new THREE.ConeGeometry(params.radius || 1, params.height || 1, params.radialSegments || 32);
        break;
      default:
        geom = new THREE.BoxGeometry(1, 1, 1);
    }
    this.geometry = geom;
    this.updateMesh();
  }

  setMaterial(materialType, params = {}) {
    let mat;
    switch (materialType) {
      case 'standard':
        mat = new THREE.MeshStandardMaterial(params);
        break;
      case 'physical':
        mat = new THREE.MeshPhysicalMaterial(params);
        break;
      case 'normal':
        mat = new THREE.MeshNormalMaterial(params);
        break;
      case 'Lambert':
        mat = new THREE.MeshLambertMaterial(params);
        break;
      case 'phong':
        mat = new THREE.MeshPhongMaterial(params);
        break;
      default:
        mat = new THREE.MeshStandardMaterial(params);
    }
    this.material = mat;
    this.updateMesh();
  }

  updateMesh() {
    const scene = this.entity.scene;
    
    if (this.mesh && scene) {
      scene.remove(this.mesh);
    }

    if (this.geometry && this.material) {
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.userData.entity = this.entity;
      this.mesh.castShadow = this.castShadow;
      this.mesh.receiveShadow = this.receiveShadow;
      
      if (scene && this.enabled) {
        scene.add(this.mesh);
      }
    }
  }

  toJSON() {
    return {
      geometry: this.geometry ? { type: this.geometry.type } : null,
      material: this.material ? { type: this.material.type, color: this.material.color ? this.material.color.getHexString() : 0xffffff } : null,
      castShadow: this.castShadow,
      receiveShadow: this.receiveShadow
    };
  }

  update(dt) {
    if (this.mesh) {
      this.mesh.position.copy(this.entity.transform.position);
      this.mesh.rotation.copy(this.entity.transform.rotation);
      this.mesh.scale.copy(this.entity.transform.scale);
    }
  }
}

class Light extends Component {
  constructor(entity) {
    super(entity);
    this.light = null;
    this.type = "ambient";
    this.intensity = 1;
    this.color = 0xffffff;
    this.range = 100;
    this.castShadow = true;
  }

  createLight() {
    switch (this.type) {
      case 'ambient':
        this.light = new THREE.AmbientLight(this.color, this.intensity);
        break;
      case 'directional':
        this.light = new THREE.DirectionalLight(this.color, this.intensity);
        this.light.castShadow = this.castShadow;
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.far = 500;
        break;
      case 'point':
        this.light = new THREE.PointLight(this.color, this.intensity, this.range);
        this.light.castShadow = this.castShadow;
        break;
      case 'spot':
        this.light = new THREE.SpotLight(this.color, this.intensity, this.range, Math.PI / 6, 0.5, 2);
        this.light.castShadow = this.castShadow;
        break;
    }
  }

  setType(type) {
    this.type = type;
    this.createLight();
  }

  onDestroy() {
    if (this.light && this.entity.scene) {
      this.entity.scene.remove(this.light);
    }
  }

  toJSON() {
    return {
      type: this.type,
      intensity: this.intensity,
      color: this.color,
      range: this.range,
      castShadow: this.castShadow
    };
  }

  update(dt) {
    if (this.light) {
      this.light.position.copy(this.entity.transform.position);
    }
  }
}

class Camera extends Component {
  constructor(entity) {
    super(entity);
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.set(20, 20, 20);
    this.fov = 70;
    this.near = 0.1;
    this.far = 2000;
    this.isActive = true;
  }

  updateProjection() {
    this.camera.fov = this.fov;
    this.camera.near = this.near;
    this.camera.far = this.far;
    this.camera.updateProjectionMatrix();
  }

  toJSON() {
    return {
      fov: this.fov,
      near: this.near,
      far: this.far,
      isActive: this.isActive
    };
  }
}

class AdvancedRenderer {
  constructor(scene, viewport) {
    this.scene = scene;
    this.viewport = viewport;
    this.camera = new THREE.PerspectiveCamera(70, viewport.clientWidth / viewport.clientHeight, 0.1, 2000);
    this.camera.position.set(20, 20, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;

    viewport.appendChild(this.renderer.domElement);

    // Post-processing
    this.composer = null;
    try {
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.RenderPass !== 'undefined') {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.setupEffects();
      }
    } catch (e) {
      console.warn("Post-processing disabled due to missing dependencies:", e);
    }

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupEffects() {
    // Add bloom effect for better visuals
    if (this.composer && typeof THREE.BloomPass !== 'undefined') {
      const bloomPass = new THREE.BloomPass(0.5, 25, 4, 256);
      this.composer.addPass(bloomPass);
    }
  }

  onWindowResize() {
    const width = this.viewport.clientWidth;
    const height = this.viewport.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  draw() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
