# 🚀 Getting Started with TIGEN Standalone

## The Simplest Way to Use TIGEN

**You have two options:**

### Option 1: Open Directly (Easiest! ⭐)
```
1. Find: index-standalone.html
2. Right-click → Open with Browser
3. Done!
```

**That's it. The engine is running. No installation, no commands, no servers.**

### Option 2: With a Local Server (Better for assets)
```bash
cd TIGEN/
python3 -m http.server 8000
# Then open: http://localhost:8000/index-standalone.html
```

---

## What You Get

When you open the page, you see:
- **Left panel**: Scene hierarchy (list of entities)
- **Center**: 3D viewport (your game world)
- **Right panel**: Entity inspector (edit properties)
- **Top bar**: Playback and world controls

---

## Quick Code Examples

All code examples go in your browser's **Developer Console** (press F12).

### Create a Cube

```javascript
const cube = TIGEN.createEntity("MyCube");
const mesh = cube.addComponent(TIGEN.Mesh);
mesh.setGeometry('box', { width: 2, height: 2, depth: 2 });
mesh.setMaterial('standard', { color: 0x00ff88 });
```

### Add Physics to It

```javascript
const physics = cube.addComponent(TIGEN.Physics);
physics.mass = 1;
physics.useGravity = true;
TIGEN.loop.physicsEngine.registerBody(physics);
```

### Spawn 10 Random Boxes

```javascript
for (let i = 0; i < 10; i++) {
  const box = TIGEN.createEntity("Box_" + i);
  const mesh = box.addComponent(TIGEN.Mesh);
  mesh.setGeometry('box');
  mesh.setMaterial('standard', { color: Math.random() * 0xffffff });
  box.transform.setPosition(Math.random() * 20 - 10, 5, Math.random() * 20 - 10);
  
  const physics = box.addComponent(TIGEN.Physics);
  physics.mass = 1;
  physics.useGravity = true;
  TIGEN.loop.physicsEngine.registerBody(physics);
}
```

### Load an Animated Model

```javascript
TIGEN.loadModel('models/character.glb').then(gltf => {
  // Add to scene
  TIGEN.scene.add(gltf.scene);
  
  // Play animations
  if (gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    
    // Update in loop
    const originalRender = TIGEN.loop.render;
    TIGEN.loop.render = () => {
      mixer.update(0.016);
      originalRender();
    };
  }
});
```

### Create a Light

```javascript
const light = TIGEN.createEntity("Light");
const lightComp = light.addComponent(TIGEN.Light);
light.transform.setPosition(10, 20, 10);
```

### List All Entities

```javascript
console.log(TIGEN.scene.entities.map(e => e.name));
```

### Remove an Entity

```javascript
TIGEN.scene.removeEntity(cube);
```

---

## Complete API

### Creating Objects

```javascript
TIGEN.createEntity(name)         // Create new entity
TIGEN.Entity                     // Class for manual creation
```

### Components

```javascript
entity.addComponent(TIGEN.Mesh)          // 3D model
entity.addComponent(TIGEN.Physics)       // Physics body
entity.addComponent(TIGEN.Collider)      // Collision
entity.addComponent(TIGEN.Light)         // Light source
entity.addComponent(TIGEN.Camera)        // Camera
```

### Transform (Position/Rotation/Scale)

```javascript
entity.transform.setPosition(x, y, z)
entity.transform.setRotation(x, y, z)   // Radians
entity.transform.setScale(x, y, z)
entity.transform.translate(x, y, z)      // Relative movement
entity.transform.position                // [x, y, z]
entity.transform.rotation                // [x, y, z]
entity.transform.scale                   // [x, y, z]
```

### Mesh Component

```javascript
const mesh = entity.addComponent(TIGEN.Mesh);

// Geometry
mesh.setGeometry('box', { width: 1, height: 1, depth: 1 });
mesh.setGeometry('sphere', { radius: 1 });
mesh.setGeometry('plane', { width: 1, height: 1 });
mesh.setGeometry('cylinder', { radius: 1, height: 2 });

// Material
mesh.setMaterial('standard', { 
  color: 0xff0000,
  metalness: 0.5,
  roughness: 0.5,
  emissive: 0x000000
});
mesh.setMaterial('basic', { color: 0xff0000 });
```

### Physics Component

```javascript
const physics = entity.addComponent(TIGEN.Physics);

physics.mass = 1;                            // kg
physics.velocity = new TIGEN.THREE.Vector3(0, 0, 0);
physics.useGravity = true;
physics.update(deltaTime);

// Register with engine
TIGEN.loop.physicsEngine.registerBody(physics);
```

### Input Handling

```javascript
// Keyboard
TIGEN.Input.isKeyDown('KeyW')
TIGEN.Input.isKeyDown('Space')
TIGEN.Input.isKeyDown('ArrowUp')

// Mouse
TIGEN.Input.getMousePosition()    // {x, y}
TIGEN.Input.mouse.down            // true/false
TIGEN.Input.mouse.x               // x coordinate
TIGEN.Input.mouse.y               // y coordinate
```

### Scene Management

```javascript
TIGEN.scene                          // Active scene
TIGEN.scene.entities                 // All entities
TIGEN.scene.createEntity(name)       // Create entity
TIGEN.scene.removeEntity(entity)     // Remove entity
TIGEN.scene.clear()                  // Clear all
TIGEN.scene.findEntitiesByName(name) // Find entities
```

### Asset Loading

```javascript
TIGEN.loadModel('path/to/model.glb')      // Returns Promise<gltf>
TIGEN.loadTexture('path/to/texture.png')  // Returns Promise<texture>
TIGEN.assetManager.getAsset(url)          // Get cached asset
```

### Game Loop

```javascript
TIGEN.loop                           // Game loop instance
TIGEN.loop.start()                   // Start loop (auto-started)
TIGEN.loop.stop()                    // Stop loop
TIGEN.loop.frameCount                // Current frame
TIGEN.loop.render()                  // Render frame
```

### Access Three.js

```javascript
TIGEN.THREE                          // Direct Three.js access
new TIGEN.THREE.Vector3(0, 1, 0)
new TIGEN.THREE.Color(0xff0000)
TIGEN.THREE.MeshStandardMaterial
```

---

## File Management

### Where to Put Assets

```
TIGEN/
├── index-standalone.html
├── models/
│   ├── character.glb     ← Your 3D models
│   ├── house.glb
│   └── ...
├── textures/
│   ├── metal.png         ← Your textures
│   ├── wood.png
│   └── ...
└── sounds/
    ├── effect.wav        ← Your audio
    └── ...
```

### Loading Assets

```javascript
// Models (relative path)
TIGEN.loadModel('models/character.glb')

// Textures
TIGEN.loadTexture('textures/metal.png')

// Works with file:// or http://
```

---

## Creating a Game Script

Create a file `my-game.js`:

```javascript
window.addEventListener('DOMContentLoaded', () => {
  // Wait for TIGEN to initialize
  setTimeout(() => {
    console.log("Starting game...");
    
    // Your game code
    const player = TIGEN.createEntity("Player");
    const mesh = player.addComponent(TIGEN.Mesh);
    mesh.setGeometry('box');
    mesh.setMaterial('standard', { color: 0x00ff88 });
    
    player.transform.setPosition(0, 1, 0);
    
    // Add to physics
    const physics = player.addComponent(TIGEN.Physics);
    physics.mass = 1;
    physics.useGravity = true;
    TIGEN.loop.physicsEngine.registerBody(physics);
  }, 100);
});
```

Then add to HTML:

```html
<script src="tigen-bundle.js"></script>
<script src="my-game.js"></script>
```

---

## Troubleshooting

**Q: "TIGEN is undefined"**
A: Make sure the browser has loaded. Open console (F12) and check for errors.

**Q: Models don't load**
A: Use a local server instead of file://
   ```bash
   python3 -m http.server 8000
   ```

**Q: Asset loading fails**
A: Check the path is correct relative to index-standalone.html
   ```javascript
   // Correct (if in models/ folder)
   TIGEN.loadModel('models/file.glb')
   
   // Check console for 404 errors
   ```

**Q: Nothing renders**
A: Check that WebGL is supported. Open console (F12) for errors.

---

## Tips & Tricks

### Inspect Any Entity

```javascript
// Select in outliner, or:
TIGEN.Inspector.select(myEntity);
```

### Get Entity by Name

```javascript
const cube = TIGEN.scene.findEntitiesByName("Cube")[0];
```

### Batch Create Objects

```javascript
const createCubes = (count) => {
  for (let i = 0; i < count; i++) {
    const cube = TIGEN.createEntity("Cube_" + i);
    const mesh = cube.addComponent(TIGEN.Mesh);
    mesh.setGeometry('box');
    mesh.setMaterial('standard', { color: Math.random() * 0xffffff });
    cube.transform.setPosition(Math.random() * 20, 2 + i, 0);
  }
};

createCubes(5);
```

### Access Three.js Directly

```javascript
const vector = new TIGEN.THREE.Vector3(1, 2, 3);
const color = new TIGEN.THREE.Color(0xff0000);
const scene = TIGEN.scene;  // Is a Three.js Scene
```

---

## Next Steps

1. **Try the console examples** - Press F12, copy/paste code
2. **Load a model** - Use TIGEN.loadModel() with your assets
3. **Create a game** - Build my-game.js with your ideas
4. **Deploy** - Upload files to any web server

---

## Deployment

### GitHub Pages (Free!)
```bash
git add -A
git commit -m "My TIGEN game"
git push
# Enable Pages in GitHub settings → serve from main branch
```

### Vercel (Free!)
```bash
vercel --prod
```

### Self-Hosted
```bash
scp -r TIGEN/ user@server.com:/var/www/html/
```

---

## Resources

- **GitHub**: https://github.com/terminaljoint/TIGEN
- **Full Docs**: https://terminaljoint.github.io/TIGEN/
- **Landing Page**: https://terminaljoint.github.io/TIGEN/docs-getting-started.html

---

**That's it! Happy building! 🎮**
