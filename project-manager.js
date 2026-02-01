/**
 * TIGEN Project Manager
 * Handles project creation, loading, saving, and exporting with localStorage
 */

class TIGENProjectManager {
  constructor() {
    this.projects = [];
    this.currentProject = null;
    this.storageKey = 'tigen_projects';
    this.currentProjectKey = 'tigen_current_project';
    this.loadProjects();
  }

  /**
   * Load all projects from localStorage
   */
  loadProjects() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.projects = stored ? JSON.parse(stored) : [];
      console.log(`✓ Loaded ${this.projects.length} projects from storage`);
    } catch (e) {
      console.error('Failed to load projects:', e);
      this.projects = [];
    }
  }

  /**
   * Save projects to localStorage
   */
  saveProjects() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.projects));
      console.log('✓ Projects saved to storage');
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  }

  /**
   * Create a new project
   */
  createProject(name, description = '') {
    const project = {
      id: this.generateId(),
      name: name,
      description: description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entities: [],
      settings: {
        gravity: -9.81,
        backgroundColor: '#111111',
        skyColor: '#87ceeb'
      }
    };

    this.projects.push(project);
    this.saveProjects();
    console.log(`✓ Project created: ${name}`);
    return project;
  }

  /**
   * Load a project into the editor
   */
  loadProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    this.currentProject = project;
    localStorage.setItem(this.currentProjectKey, projectId);
    console.log(`✓ Project loaded: ${project.name}`);
    return project;
  }

  /**
   * Get current project
   */
  getCurrentProject() {
    if (!this.currentProject) {
      const projectId = localStorage.getItem(this.currentProjectKey);
      if (projectId) {
        this.loadProject(projectId);
      }
    }
    return this.currentProject;
  }

  /**
   * Save current project
   */
  saveCurrentProject() {
    if (!this.currentProject) return false;

    this.currentProject.updatedAt = new Date().toISOString();
    this.saveProjects();
    console.log(`✓ Project saved: ${this.currentProject.name}`);
    return true;
  }

  /**
   * Update project name
   */
  renameProject(projectId, newName) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.name = newName;
      project.updatedAt = new Date().toISOString();
      this.saveProjects();
      return true;
    }
    return false;
  }

  /**
   * Delete a project
   */
  deleteProject(projectId) {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index > -1) {
      const name = this.projects[index].name;
      this.projects.splice(index, 1);
      this.saveProjects();
      
      if (this.currentProject?.id === projectId) {
        this.currentProject = null;
        localStorage.removeItem(this.currentProjectKey);
      }
      
      console.log(`✓ Project deleted: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Export project as JSON
   */
  exportProjectJSON(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return null;

    const json = JSON.stringify(project, null, 2);
    this.downloadFile(json, `${project.name}.json`, 'application/json');
    console.log(`✓ Project exported as JSON: ${project.name}`);
    return json;
  }

  /**
   * Export project as standalone HTML
   */
  exportProjectHTML(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return null;

    const html = this.generateStandaloneHTML(project);
    this.downloadFile(html, `${project.name}.html`, 'text/html');
    console.log(`✓ Project exported as HTML: ${project.name}`);
    return html;
  }

  /**
   * Import a project from JSON
   */
  importProjectJSON(jsonData) {
    try {
      const project = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Validate project structure
      if (!project.name || !Array.isArray(project.entities)) {
        throw new Error('Invalid project format');
      }

      // Generate new ID to avoid conflicts
      project.id = this.generateId();
      project.createdAt = new Date().toISOString();
      project.updatedAt = new Date().toISOString();

      this.projects.push(project);
      this.saveProjects();
      console.log(`✓ Project imported: ${project.name}`);
      return project;
    } catch (e) {
      console.error('Failed to import project:', e);
      return null;
    }
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    return this.projects.find(p => p.id === projectId);
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return this.projects;
  }

  /**
   * Add entity to current project
   */
  addEntity(entity) {
    if (!this.currentProject) return false;
    
    const entityData = {
      id: this.generateId(),
      name: entity.name,
      position: entity.transform?.position || { x: 0, y: 0, z: 0 },
      rotation: entity.transform?.rotation || { x: 0, y: 0, z: 0 },
      scale: entity.transform?.scale || { x: 1, y: 1, z: 1 },
      components: [],
      data: entity
    };

    this.currentProject.entities.push(entityData);
    this.saveCurrentProject();
    return entityData;
  }

  /**
   * Remove entity from current project
   */
  removeEntity(entityId) {
    if (!this.currentProject) return false;
    
    const index = this.currentProject.entities.findIndex(e => e.id === entityId);
    if (index > -1) {
      this.currentProject.entities.splice(index, 1);
      this.saveCurrentProject();
      return true;
    }
    return false;
  }

  /**
   * Update entity in current project
   */
  updateEntity(entityId, updates) {
    if (!this.currentProject) return false;
    
    const entity = this.currentProject.entities.find(e => e.id === entityId);
    if (entity) {
      Object.assign(entity, updates);
      this.saveCurrentProject();
      return true;
    }
    return false;
  }

  /**
   * Get all entities from current project
   */
  getEntities() {
    return this.currentProject?.entities || [];
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Download file to user's device
   */
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate standalone HTML file
   */
  generateStandaloneHTML(project) {
    const projectDataJSON = JSON.stringify(project, null, 2);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - TIGEN</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0b0d; overflow: hidden; width: 100vw; height: 100vh; }
    #vp { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    .info { position: fixed; top: 20px; left: 20px; color: #00ff88; font-size: 14px; background: rgba(0,0,0,0.8); padding: 15px 20px; border-radius: 4px; border: 1px solid #00ff88; }
    .controls { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px; }
    button { background: #00ff88; color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    button:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(0,255,136,0.4); }
  </style>
</head>
<body>
  <div id="vp"></div>
  <div class="info">
    <div><strong>${project.name}</strong></div>
    <div style="font-size: 12px; color: #666; margin-top: 5px;">Entities: ${project.entities.length}</div>
  </div>
  <div class="controls">
    <button onclick="resetCamera()">Reset Camera</button>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
  <script>
    // Project data embedded
    const projectData = ${projectDataJSON};
    
    console.log('Project loaded:', projectData.name);
    console.log('Entities:', projectData.entities.length);
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('vp').appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create default cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1;
    cube.castShadow = true;
    scene.add(cube);
    
    // Create ground plane
    const groundGeom = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    function resetCamera() {
      camera.position.set(20, 20, 20);
      camera.lookAt(0, 0, 0);
    }
    
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      renderer.render(scene, camera);
    }
    
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
  <\/script>
</body>
</html>`;
  }
}

// Global instance
window.TIGENProjectManager = new TIGENProjectManager();
console.log('✓ Project Manager initialized');
