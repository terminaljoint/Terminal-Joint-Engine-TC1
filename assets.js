/**
 * TIGEN - Asset Manager & Resource Loader
 * Handles all asset loading and caching
 */

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loading = new Map();
    this.loaders = {
      gltf: (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader === 'function') ? new THREE.GLTFLoader() : null,
      texture: new THREE.TextureLoader(),
      audio: null // Will be initialized for audio loading
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
          this.loading.delete(url);
          reject(error);
        }
      );
    });

    this.loading.set(url, promise);
    return promise;
  }

  loadAudio(url) {
    if (this.assets.has(url)) {
      return Promise.resolve(this.assets.get(url));
    }

    const promise = fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        this.assets.set(url, arrayBuffer);
        return arrayBuffer;
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

  unloadAll() {
    this.assets.forEach(asset => {
      if (asset && asset.dispose) {
        asset.dispose();
      }
    });
    this.assets.clear();
  }

  getMemoryUsage() {
    let count = 0;
    this.assets.forEach(() => count++);
    return {
      assetCount: count,
      loadingCount: this.loading.size
    };
  }
}

// Singleton instance
const TIGEN_AssetManager = new AssetManager();
