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

  // 获取默认纹理，从 '/textures/Logo_orgin.png' 加载默认纹理
  getDefaultTexture() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/textures/Logo_orgin.png', (loadedTexture) => {
      if (loadedTexture.image) {
        // 利用 canvas 将加载的图片转换为 Base64 数据
        const canvas = document.createElement('canvas');
        canvas.width = loadedTexture.image.width;
        canvas.height = loadedTexture.image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(loadedTexture.image, 0, 0);
        // 将默认纹理的 Base64 数据保存到实例变量中，方便后续使用
        this.defaultTextureData = canvas.toDataURL('image/png');
      }
    });
    return texture;
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
        // 将比例精确到小数点后两位
        const aspect = Math.round((img.naturalWidth / img.naturalHeight) * 100) / 100;
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
          // 将比例精确到小数点后两位
          const aspect = Math.round((img.naturalWidth / img.naturalHeight) * 100) / 100;
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