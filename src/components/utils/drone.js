import { DroneMovement } from './DroneMovement.js';
import { DroneCamera } from './DroneCamera.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Drone {
    constructor(scene) {
        this.scene = scene;
        this.movement = new DroneMovement();
        this.camera = null;
        this.isLoading = true;
        // 创建自定义事件
        this.loadingProgressEvent = new CustomEvent('droneLoadingProgress', {
            detail: { progress: 0 }
        });
        this.loadingCompleteEvent = new CustomEvent('droneLoadingComplete');
        this.loadModel();
    }

    // 更新加载进度
    updateLoadingProgress(progress) {
        this.loadingProgressEvent.detail.progress = progress;
        window.dispatchEvent(this.loadingProgressEvent);
        if (progress >= 100) {
            this.isLoading = false;
            window.dispatchEvent(this.loadingCompleteEvent);
        }
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        // 添加延迟加载机制
        let artificialProgress = 0;
        const progressInterval = setInterval(() => {
            if (artificialProgress < 98) { // 改为98，留出空间给最终加载完成
                artificialProgress += 2;
                this.updateLoadingProgress(artificialProgress);
            } else {
                clearInterval(progressInterval);
            }
        }, 100);

        loader.load(
            '/dji_phantom_4_animation/scene.gltf',
            (gltf) => {
                clearInterval(progressInterval);
                const model = gltf.scene;
                // 调整模型大小和位置
                model.scale.set(1, 1, 1);
                model.position.set(0, 0.05, 0);
                model.rotation.y = -Math.PI / 2;

                // 调整模型颜色为灰色
                model.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            // 如果是单个材质
                            if (!Array.isArray(child.material)) {
                                child.material.color.setHex(0xA0A0A0); // 设置为中灰色
                            } 
                            // 如果是材质数组
                            else {
                                child.material.forEach(mat => {
                                    mat.color.setHex(0xA0A0A0);
                                });
                            }
                        }
                    }
                });

                this.scene.add(model);

                // 将加载的模型设置给运动控制模块
                this.movement.setModel(model);

                // 创建摄像头模块（仅创建一次）
                if (!this.camera) {
                    this.camera = new DroneCamera(this.scene, model);
                }

                // 设置动画
                this.mixer = new THREE.AnimationMixer(model);
                const animations = gltf.animations;
                if (animations.length > 0) {
                    animations.forEach(clip => {
                        const action = this.mixer.clipAction(clip);
                        action.setDuration(1);
                        action.timeScale = 0;
                        action.play();
                        // console.log('播放动画:', clip.name);
                    });
                }
                // console.log('动画列表:', animations);

                // 确保最后平滑过渡到100%
                if (artificialProgress < 100) {
                    const remainingProgress = 100 - artificialProgress;
                    const steps = 5; // 分5步完成剩余进度
                    let currentStep = 0;
                    
                    const finalInterval = setInterval(() => {
                        currentStep++;
                        const progress = artificialProgress + (remainingProgress * currentStep / steps);
                        this.updateLoadingProgress(progress);
                        
                        if (currentStep >= steps) {
                            clearInterval(finalInterval);
                            // 最后触发完成事件
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('droneLoadingComplete'));
                            }, 200);
                        }
                    }, 100);
                } else {
                    // 如果已经到达100%，直接触发完成事件
                    window.dispatchEvent(new CustomEvent('droneLoadingComplete'));
                }
            },
            (progress) => {
                // 使用实际加载进度和人工进度的较大值
                const realProgress = (progress.loaded / progress.total) * 100;
                artificialProgress = Math.max(artificialProgress, realProgress);
            },
            (error) => {
                clearInterval(progressInterval);
                console.error('模型加载出错:', error);
                window.dispatchEvent(new CustomEvent('droneLoadingError', { 
                    detail: { error: error.message } 
                }));
            }
        );
    }

    // 在动画循环中调用，传入 delta 时间
    update(delta) {
        this.movement.update(delta);
        if (this.mixer) {
            // 根据高度调整动画速度
            if (this.movement && this.movement.model) {
                const currentHeight = this.movement.model.position.y;
                // 获取所有动画动作
                this.mixer.time = 0; // 重置动画时间以确保平滑过渡
                this.mixer._actions.forEach(action => {
                    action.timeScale = currentHeight <= 0.05 ? 1 : 3;
                });
            }
            this.mixer.update(delta);
        }
    }

    updateCamera() {
        if (this.camera) {
            this.camera.update();
        }
    }

    renderCamera() {
        if (this.camera) {
            this.camera.render();
        }
    }

    // 新增方法：设置悬停（当前运动命令置为悬停）
    hover() {
        if (this.movement && this.movement.model) {
            this.movement.setMovementCommand({
                hover: true,
                angle: 0,
                speed: 0,
                altitude: this.movement.model.position.y
            });
        }
    }

    // 摄像头相关接口，委托给 DroneCamera
    getBottomCameraElement() {
        return this.camera ? this.camera.getElement() : null;
    }

    getBottomCameraImage() {
        return this.camera ? this.camera.getImage() : null;
    }
}
