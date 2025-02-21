import * as THREE from 'three';

export class DroneCamera {
  constructor(scene, targetModel) {
    this.scene = scene;
    this.targetModel = targetModel; // 无人机模型引用
    // 创建底部摄像头及其渲染器
    this.bottomCamera = new THREE.PerspectiveCamera(90, 1, 0.01, 1000);
    this.bottomCameraRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.bottomCameraRenderer.setSize(240, 240);
  }

  // 更新摄像头位置，使其跟随无人机
  update() {
    if (!this.targetModel) return;
    this.bottomCamera.position.copy(this.targetModel.position);
    this.bottomCamera.position.y += 0.02
    ; // 稍微向上偏移
    this.bottomCamera.rotation.x = -Math.PI / 2; // 摄像头朝下
    this.bottomCamera.updateProjectionMatrix();
  }

  render() {
    if (this.scene && this.bottomCamera) {
      this.bottomCameraRenderer.render(this.scene, this.bottomCamera);
    }
  }

  getElement() {
    return this.bottomCameraRenderer.domElement;
  }

  // 获取摄像头图像数据
  getImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    context.drawImage(this.bottomCameraRenderer.domElement, 0, 0);
    return canvas;
  }
} 