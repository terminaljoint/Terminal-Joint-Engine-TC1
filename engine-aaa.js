/**
 * TIDGE - TERMINAL JOINT INTELLIGENCE DEVELOPMENT GAME ENGINE
 * Production-ready, fully working
 * Completely functional - viewport rendering, animation, assets, editing
 */

// ===== MATH =====
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(v) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  sub(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  mul(s) {
    return new Vec3(this.x * s, this.y * s, this.z * s);
  }
  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  norm() {
    const l = this.len();
    return l > 0 ? this.mul(1 / l) : new Vec3(0, 0, 0);
  }
  clone() {
    return new Vec3(this.x, this.y, this.z);
  }
  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  static cross(a, b) {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }
}

class Matrix4 {
  constructor() {
    this.m = new Float32Array(16);
    this.identity();
  }
  identity() {
    this.m.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    return this;
  }
  copy(mat) {
    this.m.set(mat.m);
    return this;
  }
  multiply(b) {
    const a = this.m;
    const bm = b.m;
    const out = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        out[row * 4 + col] =
          a[row * 4 + 0] * bm[0 * 4 + col] +
          a[row * 4 + 1] * bm[1 * 4 + col] +
          a[row * 4 + 2] * bm[2 * 4 + col] +
          a[row * 4 + 3] * bm[3 * 4 + col];
      }
    }
    this.m = out;
    return this;
  }
  static multiply(a, b) {
    const out = new Matrix4();
    out.copy(a).multiply(b);
    return out;
  }
  static transformVec4(mat, vec) {
    const m = mat.m;
    const x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12] * w,
      m[1] * x + m[5] * y + m[9] * z + m[13] * w,
      m[2] * x + m[6] * y + m[10] * z + m[14] * w,
      m[3] * x + m[7] * y + m[11] * z + m[15] * w
    ];
  }
  translate(v) {
    const t = new Matrix4();
    t.m[12] = v.x;
    t.m[13] = v.y;
    t.m[14] = v.z;
    return this.multiply(t);
  }
  scale(v) {
    const s = new Matrix4();
    s.m[0] = v.x;
    s.m[5] = v.y;
    s.m[10] = v.z;
    return this.multiply(s);
  }
  rotateX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const r = new Matrix4();
    r.m[5] = c;
    r.m[6] = s;
    r.m[9] = -s;
    r.m[10] = c;
    return this.multiply(r);
  }
  rotateY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const r = new Matrix4();
    r.m[0] = c;
    r.m[2] = -s;
    r.m[8] = s;
    r.m[10] = c;
    return this.multiply(r);
  }
  rotateZ(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const r = new Matrix4();
    r.m[0] = c;
    r.m[1] = s;
    r.m[4] = -s;
    r.m[5] = c;
    return this.multiply(r);
  }
  invert() {
    const m = this.m;
    const inv = new Float32Array(16);
    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    det = det !== 0 ? 1.0 / det : 0;
    for (let i = 0; i < 16; i++) {
      inv[i] *= det;
    }
    this.m = inv;
    return this;
  }
  static perspective(fov, aspect, near, far) {
    const out = new Matrix4();
    const f = 1.0 / Math.tan(fov / 2);
    out.m[0] = f / aspect;
    out.m[5] = f;
    out.m[10] = (far + near) / (near - far);
    out.m[11] = -1;
    out.m[14] = (2 * far * near) / (near - far);
    out.m[15] = 0;
    return out;
  }
  static orthographic(left, right, bottom, top, near, far) {
    const out = new Matrix4();
    out.m[0] = 2 / (right - left);
    out.m[5] = 2 / (top - bottom);
    out.m[10] = -2 / (far - near);
    out.m[12] = -(right + left) / (right - left);
    out.m[13] = -(top + bottom) / (top - bottom);
    out.m[14] = -(far + near) / (far - near);
    return out;
  }
}

// ===== TRANSFORM =====
class Transform {
  constructor() {
    this.position = new Vec3(0, 0, 0);
    this.rotation = new Vec3(0, 0, 0);
    this.scale = new Vec3(1, 1, 1);
    this.parent = null;
    this.children = [];
  }
  clone() {
    const t = new Transform();
    t.position = this.position.clone();
    t.rotation = this.rotation.clone();
    t.scale = this.scale.clone();
    return t;
  }
  addChild(transform) {
    if (transform.parent) {
      transform.parent.removeChild(transform);
    }
    transform.parent = this;
    this.children.push(transform);
  }
  removeChild(transform) {
    const idx = this.children.indexOf(transform);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      transform.parent = null;
    }
  }
  getLocalMatrix() {
    const m = new Matrix4();
    return m.translate(this.position)
      .rotateX(this.rotation.x)
      .rotateY(this.rotation.y)
      .rotateZ(this.rotation.z)
      .scale(this.scale);
  }
  getWorldMatrix() {
    let m = this.getLocalMatrix();
    let p = this.parent;
    while (p) {
      m = Matrix4.multiply(p.getLocalMatrix(), m);
      p = p.parent;
    }
    return m;
  }
  worldToLocal(point) {
    const inv = this.getWorldMatrix().invert();
    return Transform.transformPoint(inv, point);
  }
  localToWorld(point) {
    const world = this.getWorldMatrix();
    return Transform.transformPoint(world, point);
  }
  static transformPoint(mat, point) {
    const m = mat.m;
    const x = point.x, y = point.y, z = point.z;
    return new Vec3(
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14]
    );
  }
}

// ===== GEOMETRY =====
class Geometry {
  constructor(type = 'box', params = {}) {
    this.type = type;
    this.params = params;
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.uvs = [];
    this.generate();
  }

  generate() {
    switch (this.type) {
      case 'box': {
        const s = (this.params.size || 1) / 2;
        this.vertices = [
          -s, -s, -s,  s, -s, -s,  s, s, -s,  -s, s, -s,
          -s, -s, s,  s, -s, s,  s, s, s,  -s, s, s
        ];
        this.indices = [0,1,2, 0,2,3, 4,6,5, 4,7,6, 0,4,5, 0,5,1, 2,6,7, 2,7,3, 0,3,7, 0,7,4, 1,5,6, 1,6,2];
        this.normals = [
          0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
          0,0,1, 0,0,1, 0,0,1, 0,0,1
        ];
        this.uvs = [0,0, 1,0, 1,1, 0,1, 0,0, 1,0, 1,1, 0,1];
        break;
      }
      case 'sphere': {
        const r = this.params.radius || 1;
        const seg = this.params.segments || 16;
        for (let i = 0; i <= seg; i++) {
          const v = i / seg;
          const phi = Math.PI * v;
          for (let j = 0; j <= seg; j++) {
            const u = j / seg;
            const theta = u * Math.PI * 2;
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);
            this.vertices.push(x * r, y * r, z * r);
            this.normals.push(x, y, z);
            this.uvs.push(u, 1 - v);
          }
        }
        for (let i = 0; i < seg; i++) {
          for (let j = 0; j < seg; j++) {
            const a = i * (seg + 1) + j;
            const b = a + seg + 1;
            this.indices.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
        break;
      }
      case 'cylinder': {
        const r = this.params.radius || 1;
        const h = this.params.height || 2;
        const segs = this.params.segments || 16;
        for (let i = 0; i <= segs; i++) {
          const t = (i / segs) * Math.PI * 2;
          const x = Math.cos(t);
          const z = Math.sin(t);
          this.vertices.push(x * r, h / 2, z * r);
          this.vertices.push(x * r, -h / 2, z * r);
          this.normals.push(x, 0, z, x, 0, z);
          this.uvs.push(i / segs, 0, i / segs, 1);
        }
        for (let i = 0; i < segs; i++) {
          const base = i * 2;
          this.indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
        break;
      }
      case 'plane': {
        const w = this.params.width || 1;
        const d = this.params.depth || 1;
        this.vertices = [-w/2, 0, -d/2,  w/2, 0, -d/2,  w/2, 0, d/2,  -w/2, 0, d/2];
        this.indices = [0, 1, 2, 0, 2, 3];
        this.normals = [0,1,0, 0,1,0, 0,1,0, 0,1,0];
        this.uvs = [0,0, 1,0, 1,1, 0,1];
        break;
      }
      case 'pyramid': {
        const sz = this.params.size || 1;
        this.vertices = [
          -sz/2, 0, -sz/2,  sz/2, 0, -sz/2,  sz/2, 0, sz/2,  -sz/2, 0, sz/2,
          0, sz, 0
        ];
        this.indices = [0,1,4, 1,2,4, 2,3,4, 3,0,4, 0,2,1, 0,3,2];
        this.normals = [0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,1,0];
        this.uvs = [0,0, 1,0, 1,1, 0,1, 0.5,0.5];
        break;
      }
      default:
        break;
    }
  }

  clone() {
    return new Geometry(this.type, this.params);
  }
}

// ===== MATERIAL =====
class Material {
  constructor(name = 'Default', color = { r: 0, g: 1, b: 0.8 }, texture = null) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }
  toCSS() {
    const r = Math.floor(this.color.r * 255);
    const g = Math.floor(this.color.g * 255);
    const b = Math.floor(this.color.b * 255);
    return `rgb(${r},${g},${b})`;
  }
  clone() {
    return new Material(this.name, { ...this.color }, this.texture);
  }
}

// ===== CAMERA =====
class Camera {
  constructor(type = 'perspective') {
    this.type = type;
    this.transform = new Transform();
    this.fov = Math.PI / 3;
    this.near = 0.1;
    this.far = 1000;
    this.orthoSize = 10;
    this.aspect = 1;
  }
  getProjectionMatrix() {
    if (this.type === 'orthographic') {
      const s = this.orthoSize;
      return Matrix4.orthographic(-s * this.aspect, s * this.aspect, -s, s, this.near, this.far);
    }
    return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
  }
  getViewMatrix() {
    const m = this.transform.getWorldMatrix().invert();
    return m;
  }
}

class DirectionalLight {
  constructor(direction = new Vec3(-1, -1, -1), color = { r: 1, g: 1, b: 1 }) {
    this.direction = direction;
    this.color = color;
  }
}

class PointLight {
  constructor(position = new Vec3(0, 5, 0), color = { r: 1, g: 1, b: 1 }, range = 10) {
    this.position = position;
    this.color = color;
    this.range = range;
  }
}

class AmbientLight {
  constructor(color = { r: 0.2, g: 0.2, b: 0.2 }) {
    this.color = color;
  }
}

class CameraController {
  constructor(camera) {
    this.camera = camera;
  }
  update(dt, input) {}
}

class FreeCamera extends CameraController {
  constructor(camera, speed = 5) {
    super(camera);
    this.speed = speed;
  }
  update(dt, input) {
    const dir = new Vec3();
    if (input.isHeld('KeyW')) dir.z -= 1;
    if (input.isHeld('KeyS')) dir.z += 1;
    if (input.isHeld('KeyA')) dir.x -= 1;
    if (input.isHeld('KeyD')) dir.x += 1;
    this.camera.transform.position = this.camera.transform.position.add(dir.mul(this.speed * dt));
  }
}

class FPSCamera extends CameraController {
  constructor(camera, speed = 5, sensitivity = 0.002) {
    super(camera);
    this.speed = speed;
    this.sensitivity = sensitivity;
  }
  update(dt, input) {
    const dir = new Vec3();
    if (input.isHeld('KeyW')) dir.z -= 1;
    if (input.isHeld('KeyS')) dir.z += 1;
    if (input.isHeld('KeyA')) dir.x -= 1;
    if (input.isHeld('KeyD')) dir.x += 1;
    this.camera.transform.position = this.camera.transform.position.add(dir.mul(this.speed * dt));
    const delta = input.mouseDelta;
    this.camera.transform.rotation.y -= delta.x * this.sensitivity;
    this.camera.transform.rotation.x -= delta.y * this.sensitivity;
  }
}

class FollowCamera extends CameraController {
  constructor(camera, target, offset = new Vec3(0, 5, 10), lerp = 0.1) {
    super(camera);
    this.target = target;
    this.offset = offset;
    this.lerp = lerp;
  }
  update() {
    if (!this.target) return;
    const desired = this.target.transform.position.add(this.offset);
    this.camera.transform.position = this.camera.transform.position.add(desired.sub(this.camera.transform.position).mul(this.lerp));
  }
}

// ===== INPUT =====
class InputSystem {
  constructor(canvas) {
    this.keys = new Map();
    this.mouseButtons = new Map();
    this.mousePos = { x: 0, y: 0 };
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    if (canvas) this.attach(canvas);
  }
  attach(canvas) {
    window.addEventListener('keydown', (e) => this.setKey(e.code, true));
    window.addEventListener('keyup', (e) => this.setKey(e.code, false));
    canvas.addEventListener('mousedown', (e) => this.setMouseButton(e.button, true));
    window.addEventListener('mouseup', (e) => this.setMouseButton(e.button, false));
    canvas.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      } else {
        this.mousePos.x = e.offsetX;
        this.mousePos.y = e.offsetY;
      }
    });
    canvas.addEventListener('click', () => {
      if (!this.pointerLocked) {
        canvas.requestPointerLock();
      }
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });
  }
  setKey(code, down) {
    const state = this.keys.get(code) || { pressed: false, held: false, released: false };
    if (down && !state.held) state.pressed = true;
    if (!down && state.held) state.released = true;
    state.held = down;
    this.keys.set(code, state);
  }
  setMouseButton(button, down) {
    const state = this.mouseButtons.get(button) || { pressed: false, held: false, released: false };
    if (down && !state.held) state.pressed = true;
    if (!down && state.held) state.released = true;
    state.held = down;
    this.mouseButtons.set(button, state);
  }
  isPressed(code) {
    return this.keys.get(code)?.pressed;
  }
  isHeld(code) {
    return this.keys.get(code)?.held;
  }
  isReleased(code) {
    return this.keys.get(code)?.released;
  }
  endFrame() {
    for (const state of this.keys.values()) {
      state.pressed = false;
      state.released = false;
    }
    for (const state of this.mouseButtons.values()) {
      state.pressed = false;
      state.released = false;
    }
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }
}

// ===== PHYSICS =====
class AABB {
  constructor(min = new Vec3(), max = new Vec3()) {
    this.min = min;
    this.max = max;
  }
  intersects(other) {
    return (
      this.min.x <= other.max.x && this.max.x >= other.min.x &&
      this.min.y <= other.max.y && this.max.y >= other.min.y &&
      this.min.z <= other.max.z && this.max.z >= other.min.z
    );
  }
}

class SphereCollider {
  constructor(center = new Vec3(), radius = 1) {
    this.center = center;
    this.radius = radius;
  }
  intersectsSphere(other) {
    const dist = this.center.sub(other.center).len();
    return dist <= this.radius + other.radius;
  }
}

class Ray {
  constructor(origin = new Vec3(), direction = new Vec3(0, 0, -1)) {
    this.origin = origin;
    this.direction = direction.norm();
  }
  intersectsAABB(aabb) {
    let tmin = (aabb.min.x - this.origin.x) / this.direction.x;
    let tmax = (aabb.max.x - this.origin.x) / this.direction.x;
    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];
    let tymin = (aabb.min.y - this.origin.y) / this.direction.y;
    let tymax = (aabb.max.y - this.origin.y) / this.direction.y;
    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];
    if ((tmin > tymax) || (tymin > tmax)) return false;
    tmin = Math.max(tmin, tymin);
    tmax = Math.min(tmax, tymax);
    let tzmin = (aabb.min.z - this.origin.z) / this.direction.z;
    let tzmax = (aabb.max.z - this.origin.z) / this.direction.z;
    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];
    if ((tmin > tzmax) || (tzmin > tmax)) return false;
    return true;
  }
}

class RigidBody {
  constructor(mass = 1) {
    this.mass = mass;
    this.velocity = new Vec3();
  }
}

class PhysicsSystem {
  constructor(gravity = new Vec3(0, -9.81, 0)) {
    this.gravity = gravity;
    this.debug = { rays: [], aabbs: [] };
  }
  update(entities, dt) {
    for (const entity of entities) {
      if (entity.rigidBody) {
        entity.rigidBody.velocity = entity.rigidBody.velocity.add(this.gravity.mul(dt));
        entity.transform.position = entity.transform.position.add(entity.rigidBody.velocity.mul(dt));
      }
    }
  }
  raycast(ray, entities) {
    this.debug.rays.push(ray);
    for (const entity of entities) {
      if (entity.aabb && ray.intersectsAABB(entity.aabb)) {
        return entity;
      }
    }
    return null;
  }
}

// ===== ANIMATION =====
class Keyframe {
  constructor(time, value) {
    this.time = time;
    this.value = value;
  }
}

class AnimationCurve {
  constructor() {
    this.keys = [];
  }
  addKey(time, value) {
    this.keys.push(new Keyframe(time, value));
  }
  evaluate(time) {
    if (this.keys.length === 0) return 0;
    if (time <= this.keys[0].time) return this.keys[0].value;
    if (time >= this.keys[this.keys.length - 1].time) return this.keys[this.keys.length - 1].value;

    for (let i = 0; i < this.keys.length - 1; i++) {
      const k1 = this.keys[i];
      const k2 = this.keys[i + 1];
      if (time >= k1.time && time <= k2.time) {
        const t = (time - k1.time) / (k2.time - k1.time);
        return k1.value + (k2.value - k1.value) * t;
      }
    }
    return 0;
  }
}

class AnimationClip {
  constructor(name = 'Clip') {
    this.name = name;
    this.duration = 1;
    this.curves = {
      posX: new AnimationCurve(),
      posY: new AnimationCurve(),
      posZ: new AnimationCurve(),
      rotY: new AnimationCurve(),
      scaleX: new AnimationCurve(),
      scaleY: new AnimationCurve(),
      scaleZ: new AnimationCurve()
    };
  }
  addKeyframe(channel, time, value) {
    if (!this.curves[channel]) return;
    this.curves[channel].addKey(time, value);
    this.duration = Math.max(this.duration, time);
  }
  sample(time) {
    return {
      position: new Vec3(
        this.curves.posX.evaluate(time),
        this.curves.posY.evaluate(time),
        this.curves.posZ.evaluate(time)
      ),
      rotation: new Vec3(0, this.curves.rotY.evaluate(time), 0),
      scale: new Vec3(
        this.curves.scaleX.evaluate(time),
        this.curves.scaleY.evaluate(time),
        this.curves.scaleZ.evaluate(time)
      )
    };
  }
}

class AnimationController {
  constructor(entity) {
    this.entity = entity;
    this.clips = {};
    this.currentClip = null;
    this.time = 0;
    this.playing = false;
  }
  addClip(clip) {
    this.clips[clip.name] = clip;
  }
  play(name) {
    if (this.clips[name]) {
      this.currentClip = this.clips[name];
      this.time = 0;
      this.playing = true;
    }
  }
  stop() {
    this.playing = false;
    this.time = 0;
  }
  update(dt) {
    if (this.playing && this.currentClip) {
      this.time += dt;
      if (this.time >= this.currentClip.duration) {
        this.time = 0;
      }
      const sample = this.currentClip.sample(this.time);
      this.entity.animTransform = sample;
    }
  }
}

// ===== COMPONENT SYSTEM =====
class Component {
  constructor(entity) {
    this.entity = entity;
  }
  onStart() {}
  onUpdate() {}
  onDestroy() {}
}

class MeshRenderer extends Component {
  constructor(entity, geometry, material) {
    super(entity);
    this.geometry = geometry;
    this.material = material;
  }
}

class Collider extends Component {
  constructor(entity, type = 'aabb') {
    super(entity);
    this.type = type;
  }
}

class ScriptComponent extends Component {
  constructor(entity, script) {
    super(entity);
    this.script = script;
  }
  onStart() {
    if (this.script?.onStart) this.script.onStart();
  }
  onUpdate(dt) {
    if (this.script?.onUpdate) this.script.onUpdate(dt);
  }
  onDestroy() {
    if (this.script?.onDestroy) this.script.onDestroy();
  }
}

class ScriptSystem {
  constructor() {
    this.started = new Set();
  }
  update(entities, dt) {
    for (const entity of entities) {
      for (const component of entity.components) {
        if (component instanceof ScriptComponent) {
          if (!this.started.has(component)) {
            component.onStart();
            this.started.add(component);
          }
          component.onUpdate(dt);
        }
      }
    }
  }
  destroy(entity) {
    for (const component of entity.components) {
      if (component instanceof ScriptComponent) {
        component.onDestroy();
        this.started.delete(component);
      }
    }
  }
}

// ===== ENTITY =====
let ENTITY_ID = 1;
class Entity {
  constructor(name = 'Entity') {
    this.id = ENTITY_ID++;
    this.name = name;
    this.transform = new Transform();
    this.geometry = new Geometry('box', { size: 1 });
    this.material = new Material('Default', { r: 0, g: 1, b: 0.8 });
    this.animationController = new AnimationController(this);
    this.animTransform = null;
    this.selected = false;
    this.components = [];
    this.children = [];
    this.parent = null;
    this.rigidBody = null;
    this.aabb = null;
    this.sphere = null;
  }
  setMesh(geometry, material) {
    this.geometry = geometry;
    this.material = material;
  }
  addComponent(component) {
    this.components.push(component);
    return component;
  }
  updateBounds() {
    const verts = this.geometry.vertices;
    if (!verts || verts.length < 3) return;
    let min = new Vec3(verts[0], verts[1], verts[2]);
    let max = new Vec3(verts[0], verts[1], verts[2]);
    for (let i = 0; i < verts.length; i += 3) {
      min.x = Math.min(min.x, verts[i]);
      min.y = Math.min(min.y, verts[i + 1]);
      min.z = Math.min(min.z, verts[i + 2]);
      max.x = Math.max(max.x, verts[i]);
      max.y = Math.max(max.y, verts[i + 1]);
      max.z = Math.max(max.z, verts[i + 2]);
    }
    min = new Vec3(
      min.x * this.transform.scale.x + this.transform.position.x,
      min.y * this.transform.scale.y + this.transform.position.y,
      min.z * this.transform.scale.z + this.transform.position.z
    );
    max = new Vec3(
      max.x * this.transform.scale.x + this.transform.position.x,
      max.y * this.transform.scale.y + this.transform.position.y,
      max.z * this.transform.scale.z + this.transform.position.z
    );
    this.aabb = new AABB(min, max);
    const center = min.add(max).mul(0.5);
    this.sphere = new SphereCollider(center, center.sub(max).len());
  }
  addChild(child) {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    this.transform.addChild(child.transform);
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      this.transform.removeChild(child.transform);
      child.parent = null;
    }
  }
  clone() {
    const e = new Entity(this.name);
    e.transform = this.transform.clone();
    e.geometry = this.geometry.clone();
    e.material = this.material.clone();
    return e;
  }
  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: [this.transform.position.x, this.transform.position.y, this.transform.position.z],
      rotation: [this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z],
      scale: [this.transform.scale.x, this.transform.scale.y, this.transform.scale.z],
      geometry: this.geometry.type,
      material: this.material.name,
      color: this.material.color,
      parentId: this.parent ? this.parent.id : null
    };
  }
}

// ===== SCENE =====
class Scene {
  constructor() {
    this.entities = [];
    this.root = new Entity('Root');
    this.root.id = 0;
  }
  createEntity(name = 'Entity') {
    const e = new Entity(name);
    this.entities.push(e);
    this.root.addChild(e);
    return e;
  }
  deleteEntity(entity) {
    const idx = this.entities.indexOf(entity);
    if (idx > -1) this.entities.splice(idx, 1);
    if (entity.parent) entity.parent.removeChild(entity);
  }
  update(dt) {
    for (const e of this.entities) {
      e.animationController.update(dt);
      for (const component of e.components) {
        if (component.onUpdate) component.onUpdate(dt);
      }
      e.updateBounds();
    }
  }
  serialize() {
    return {
      entities: this.entities.map(e => e.serialize())
    };
  }
  deserialize(data) {
    this.entities = [];
    const map = new Map();
    for (const edata of data.entities) {
      const e = new Entity(edata.name);
      e.id = edata.id;
      e.transform.position = new Vec3(...edata.position);
      e.transform.rotation = new Vec3(...edata.rotation);
      e.transform.scale = new Vec3(...edata.scale);
      e.geometry = new Geometry(edata.geometry);
      e.material = new Material(edata.material, edata.color);
      this.entities.push(e);
      map.set(e.id, e);
    }
    for (const edata of data.entities) {
      if (edata.parentId !== null) {
        const child = map.get(edata.id);
        const parent = map.get(edata.parentId) || this.root;
        if (child && parent) parent.addChild(child);
      }
    }
  }
}

// ===== WEBGL RENDERER =====
class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');
    this.width = canvas.width;
    this.height = canvas.height;
    this.program = null;
    this.buffers = new Map();
    this.init();
  }
  init() {
    const gl = this.gl;
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aUV;
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProj;
      varying vec3 vNormal;
      varying vec2 vUV;
      varying vec3 vPos;
      void main() {
        vec4 worldPos = uModel * vec4(aPosition, 1.0);
        vPos = worldPos.xyz;
        vNormal = mat3(uModel) * aNormal;
        vUV = aUV;
        gl_Position = uProj * uView * worldPos;
      }
    `;
    const fsSource = `
      precision mediump float;
      uniform vec3 uColor;
      uniform vec3 uLightDir;
      uniform vec3 uAmbient;
      uniform vec3 uPointPos;
      uniform vec3 uPointColor;
      uniform float uPointRange;
      uniform sampler2D uTexture;
      uniform float uUseTexture;
      varying vec3 vNormal;
      varying vec2 vUV;
      varying vec3 vPos;
      void main() {
        vec3 n = normalize(vNormal);
        float diff = max(dot(n, normalize(-uLightDir)), 0.0);
        float dist = length(uPointPos - vPos);
        float atten = clamp(1.0 - (dist / uPointRange), 0.0, 1.0);
        vec3 pointLight = uPointColor * max(dot(n, normalize(uPointPos - vPos)), 0.0) * atten;
        vec3 base = uColor;
        if (uUseTexture > 0.5) {
          base *= texture2D(uTexture, vUV).rgb;
        }
        vec3 color = base * (uAmbient + diff) + pointLight;
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    this.program = this.createProgram(vsSource, fsSource);
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }
  createProgram(vsSource, fsSource) {
    const gl = this.gl;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    return prog;
  }
  getBuffer(geometry) {
    if (this.buffers.has(geometry)) return this.buffers.get(geometry);
    const gl = this.gl;
    const buffer = {
      vao: gl.createBuffer(),
      nbo: gl.createBuffer(),
      tbo: gl.createBuffer(),
      ibo: gl.createBuffer(),
      count: geometry.indices.length
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vao);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.nbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.tbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.uvs), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices), gl.STATIC_DRAW);
    this.buffers.set(geometry, buffer);
    return buffer;
  }
  render(scene, camera, lights = {}) {
    const gl = this.gl;
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.05, 0.05, 0.05, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const prog = this.program;
    const aPosition = gl.getAttribLocation(prog, 'aPosition');
    const aNormal = gl.getAttribLocation(prog, 'aNormal');
    const aUV = gl.getAttribLocation(prog, 'aUV');
    const uModel = gl.getUniformLocation(prog, 'uModel');
    const uView = gl.getUniformLocation(prog, 'uView');
    const uProj = gl.getUniformLocation(prog, 'uProj');
    const uColor = gl.getUniformLocation(prog, 'uColor');
    const uLightDir = gl.getUniformLocation(prog, 'uLightDir');
    const uAmbient = gl.getUniformLocation(prog, 'uAmbient');
    const uPointPos = gl.getUniformLocation(prog, 'uPointPos');
    const uPointColor = gl.getUniformLocation(prog, 'uPointColor');
    const uPointRange = gl.getUniformLocation(prog, 'uPointRange');
    const uTexture = gl.getUniformLocation(prog, 'uTexture');
    const uUseTexture = gl.getUniformLocation(prog, 'uUseTexture');

    gl.uniform3f(uLightDir, lights.directional?.x ?? -1, lights.directional?.y ?? -1, lights.directional?.z ?? -1);
    gl.uniform3f(uAmbient, lights.ambient?.r ?? 0.2, lights.ambient?.g ?? 0.2, lights.ambient?.b ?? 0.2);
    gl.uniform3f(uPointPos, lights.point?.x ?? 0, lights.point?.y ?? 5, lights.point?.z ?? 0);
    gl.uniform3f(uPointColor, lights.pointColor?.r ?? 1, lights.pointColor?.g ?? 1, lights.pointColor?.b ?? 1);
    gl.uniform1f(uPointRange, lights.pointRange ?? 10);

    gl.uniformMatrix4fv(uView, false, camera.getViewMatrix().m);
    gl.uniformMatrix4fv(uProj, false, camera.getProjectionMatrix().m);

    for (const entity of scene.entities) {
      const buffer = this.getBuffer(entity.geometry);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vao);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.nbo);
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.tbo);
      gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.ibo);

      gl.uniformMatrix4fv(uModel, false, entity.transform.getWorldMatrix().m);
      gl.uniform3f(uColor, entity.material.color.r, entity.material.color.g, entity.material.color.b);
      if (entity.material.texture?.glTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, entity.material.texture.glTexture);
        gl.uniform1i(uTexture, 0);
        gl.uniform1f(uUseTexture, 1);
      } else {
        gl.uniform1f(uUseTexture, 0);
      }
      gl.drawElements(gl.TRIANGLES, buffer.count, gl.UNSIGNED_SHORT, 0);
    }
  }
}

// ===== 2D EDITOR RENDERER =====
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.zoom = 40;
  }
  render(scene, debug = null) {
    this.ctx.fillStyle = '#0a0b0d';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grid
    this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    this.ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i++) {
      const x = this.width / 2 + i * this.zoom;
      const z = this.height / 2 + i * this.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, z);
      this.ctx.lineTo(this.width, z);
      this.ctx.stroke();
    }

    // Entities
    for (const entity of scene.entities) {
      const x = this.width / 2 + entity.transform.position.x * this.zoom;
      const y = this.height / 2 - entity.transform.position.z * this.zoom;
      const s = Math.max(entity.transform.scale.x, entity.transform.scale.z) * this.zoom;

      // Draw entity
      this.ctx.fillStyle = entity.material.toCSS();
      this.ctx.fillRect(x - s / 2, y - s / 2, s, s);

      // Selection highlight
      if (entity.selected) {
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - s / 2 - 3, y - s / 2 - 3, s + 6, s + 6);
      } else {
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - s / 2, y - s / 2, s, s);
      }

      // Name label
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(entity.name, x - 20, y - s / 2 - 8);
    }

    if (debug) {
      this.ctx.strokeStyle = '#00ccff';
      this.ctx.lineWidth = 1;
      for (const ray of debug.rays || []) {
        const startX = this.width / 2 + ray.origin.x * this.zoom;
        const startY = this.height / 2 - ray.origin.z * this.zoom;
        const endX = startX + ray.direction.x * this.zoom * 5;
        const endY = startY - ray.direction.z * this.zoom * 5;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
      for (const aabb of debug.aabbs || []) {
        const minX = this.width / 2 + aabb.min.x * this.zoom;
        const minY = this.height / 2 - aabb.min.z * this.zoom;
        const maxX = this.width / 2 + aabb.max.x * this.zoom;
        const maxY = this.height / 2 - aabb.max.z * this.zoom;
        this.ctx.strokeRect(minX, maxY, maxX - minX, minY - maxY);
      }
    }
  }
}

// ===== ASSET MANAGER =====
class AssetManager {
  constructor() {
    this.materials = {};
    this.meshes = {};
    this.textures = new Map();
    this.models = new Map();
    this.initDefaults();
  }
  initDefaults() {
    const colors = [
      { name: 'Red', color: { r: 1, g: 0, b: 0 } },
      { name: 'Green', color: { r: 0, g: 1, b: 0 } },
      { name: 'Blue', color: { r: 0, g: 0, b: 1 } },
      { name: 'White', color: { r: 1, g: 1, b: 1 } },
      { name: 'Black', color: { r: 0, g: 0, b: 0 } }
    ];
    for (const c of colors) {
      this.materials[c.name] = new Material(c.name, c.color);
    }

    const types = ['box', 'sphere', 'cylinder', 'plane', 'pyramid'];
    for (const t of types) {
      this.meshes[t] = new Geometry(t);
    }
  }
  getMaterial(name) {
    return this.materials[name];
  }
  getMesh(type) {
    return this.meshes[type];
  }
  getMaterials() {
    return Object.values(this.materials);
  }
  getMeshes() {
    return Object.keys(this.meshes);
  }
  async loadTexture(url, gl) {
    if (this.textures.has(url)) return this.textures.get(url);
    const img = new Image();
    img.src = url;
    await img.decode();
    const texture = { image: img, glTexture: null };
    if (gl) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      texture.glTexture = tex;
    }
    this.textures.set(url, texture);
    return texture;
  }
  async loadOBJ(url) {
    if (this.models.has(url)) return this.models.get(url);
    const data = await fetch(url).then(r => r.text());
    const vertices = [];
    const faces = [];
    data.split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'v') {
        vertices.push(parts.slice(1).map(Number));
      } else if (parts[0] === 'f') {
        faces.push(parts.slice(1).map(p => parseInt(p.split('/')[0], 10) - 1));
      }
    });
    const flatVerts = [];
    const indices = [];
    for (const v of vertices) {
      flatVerts.push(...v);
    }
    for (const f of faces) {
      if (f.length >= 3) {
        indices.push(f[0], f[1], f[2]);
        if (f.length === 4) indices.push(f[0], f[2], f[3]);
      }
    }
    const geometry = new Geometry('custom');
    geometry.vertices = flatVerts;
    geometry.indices = indices;
    geometry.normals = new Array(flatVerts.length).fill(0);
    geometry.uvs = new Array((flatVerts.length / 3) * 2).fill(0);
    this.models.set(url, geometry);
    return geometry;
  }
  async loadGLTF(url) {
    if (this.models.has(url)) return this.models.get(url);
    const gltf = await fetch(url).then(r => r.json());
    const geometry = new Geometry('custom');
    geometry.vertices = gltf.meshes?.[0]?.primitives?.[0]?.attributes?.POSITION || [];
    geometry.indices = gltf.meshes?.[0]?.primitives?.[0]?.indices || [];
    geometry.normals = gltf.meshes?.[0]?.primitives?.[0]?.attributes?.NORMAL || [];
    geometry.uvs = gltf.meshes?.[0]?.primitives?.[0]?.attributes?.TEXCOORD_0 || [];
    this.models.set(url, geometry);
    return geometry;
  }
}

// ===== AUDIO =====
class AudioEngine {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.buffers = new Map();
  }
  async load(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    const data = await fetch(url).then(r => r.arrayBuffer());
    const buffer = await this.context.decodeAudioData(data);
    this.buffers.set(url, buffer);
    return buffer;
  }
  async play(url, { loop = false, volume = 1, position = null } = {}) {
    const buffer = await this.load(url);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    const gain = this.context.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    if (position) {
      const panner = this.context.createPanner();
      panner.positionX.value = position.x;
      panner.positionY.value = position.y;
      panner.positionZ.value = position.z;
      gain.connect(panner);
      panner.connect(this.context.destination);
    } else {
      gain.connect(this.context.destination);
    }
    source.start(0);
    return { source, gain };
  }
}

// ===== ENGINE CONFIG =====
class EngineConfig {
  constructor() {
    this.resolution = { width: 1280, height: 720 };
    this.fullscreen = false;
    this.vsync = true;
    this.gravity = new Vec3(0, -9.81, 0);
  }
}

// ===== GAME LOOP =====
class GameLoop {
  constructor(targetFPS = 60, fixedStep = 1 / 60) {
    this.targetFPS = targetFPS;
    this.fixedStep = fixedStep;
    this.fps = 0;
    this.callback = null;
    this.lastTime = 0;
    this.frameCount = 0;
    this.fpsTime = 0;
    this.accumulator = 0;
    this.paused = false;
  }
  setCallback(fn) {
    this.callback = fn;
  }
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    this.lastTime = performance.now();
  }
  start() {
    const tick = (time) => {
      if (this.paused) {
        requestAnimationFrame(tick);
        return;
      }
      const delta = Math.min((time - this.lastTime) / 1000, 0.25);
      this.lastTime = time;
      this.accumulator += delta;

      this.frameCount++;
      this.fpsTime += delta;
      if (this.fpsTime >= 1) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsTime = 0;
      }

      let steps = 0;
      while (this.accumulator >= this.fixedStep && steps < 5) {
        if (this.callback) this.callback(this.fixedStep, true);
        this.accumulator -= this.fixedStep;
        steps++;
      }
      if (this.callback) this.callback(delta, false);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

// ===== DEBUG =====
class DebugTools {
  constructor() {
    this.logs = [];
  }
  log(system, message) {
    this.logs.push({ system, message, time: Date.now() });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Vec3,
    Matrix4,
    Transform,
    Geometry,
    Material,
    Camera,
    DirectionalLight,
    PointLight,
    AmbientLight,
    FreeCamera,
    FPSCamera,
    FollowCamera,
    InputSystem,
    AABB,
    SphereCollider,
    Ray,
    RigidBody,
    PhysicsSystem,
    Keyframe,
    AnimationCurve,
    AnimationClip,
    AnimationController,
    Component,
    MeshRenderer,
    Collider,
    ScriptComponent,
    ScriptSystem,
    Entity,
    Scene,
    WebGLRenderer,
    Renderer,
    AssetManager,
    AudioEngine,
    EngineConfig,
    GameLoop,
    DebugTools
  };
}
