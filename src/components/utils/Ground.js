import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export class Ground {
  constructor(scene, width = 2, depth = 2) {
    this.scene = scene;
    this.width = width;
    this.depth = depth;
    this.mesh = null;
    this.materials = null;
    this.topMaterial = null;
    
    this.init();
  }

  // 获取默认灰色纹理
  getDefaultTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
  }

  init() {
    const groundGeometry = new RoundedBoxGeometry(this.width, 0.1, this.depth, 10, 0.05);
    this.materials = [
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // right
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // left
      new THREE.MeshPhongMaterial({ map: this.getDefaultTexture() }), // top
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // bottom
      new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
      new THREE.MeshPhongMaterial({ color: 0xffffff })  // back
    ];

    this.mesh = new THREE.Mesh(groundGeometry, this.materials);
    this.topMaterial = this.materials[2];
    this.scene.add(this.mesh);
  }

  // 更新地面几何体
  updateGeometry(width, depth) {
    this.width = width;
    this.depth = depth;
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new RoundedBoxGeometry(width, 0.1, depth, 10, 0.05);
    }
  }

  // 更新顶面纹理
  updateTexture(texture) {
    if (this.topMaterial) {
      this.topMaterial.map = texture;
      this.topMaterial.needsUpdate = true;
    }
  }

  // 处理图片上传
  handleImageUpload(file, callback) {
    if (typeof file === 'string' && file.startsWith('data:image')) {
      // 如果已经是 base64 格式，直接使用
      const loader = new THREE.TextureLoader();
      loader.load(file, (texture) => {
        texture.needsUpdate = true;
        this.updateTexture(texture);
      });

      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        if (callback) {
          callback(aspect);
        }
      };
      img.src = file;
    } else if (file instanceof File) {
      // 如果是文件对象，转换为 base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        const loader = new THREE.TextureLoader();
        loader.load(base64Data, (texture) => {
          texture.needsUpdate = true;
          this.updateTexture(texture);
        });

        const img = new Image();
        img.onload = () => {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (callback) {
            callback(aspect);
          }
        };
        img.src = base64Data;
      };
      reader.readAsDataURL(file);
    }
  }
} 