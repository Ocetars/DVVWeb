import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class Drone {
    constructor(scene) {
        this.scene = scene;
        this.mixer = null; // 用于动画混合器
        this.animations = []; // 存储动画片段
        this.clock = new THREE.Clock(); // 添加时钟来计算时间增量
        this.velocity = new THREE.Vector3(0, 0, 0); // 运动速度
        this.maxSpeed = 0.005; // 最大运动速度
        this.altitude = 0.5; // 初始高度（地面高度为0）
        
        // 添加运动控制相关属性
        this.currentMovement = null;
        this.movementEndTime = 0;
        this.lastMovementCommand = null; // 添加上一次的移动命令记录
        this.isStopping = false; // 添加停止标志
        
        // 添加底部摄像头
        this.bottomCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
        this.bottomCameraRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.bottomCameraRenderer.setSize(240, 240); // 设置小窗口大小
        
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        
        loader.load(
            '/dji_phantom_4_animation/scene.gltf',
            (gltf) => {
                this.model = gltf.scene;
                // 调整模型大小
                this.model.scale.set(1, 1, 1);
                // 调整模型位置
                this.model.position.set(0, 0.5, 2);
                // 添加到场景
                this.scene.add(this.model);

                // 设置动画
                this.mixer = new THREE.AnimationMixer(this.model);
                this.animations = gltf.animations;
                
                // 播放所有动画
                if (this.animations.length > 0) {
                    this.animations.forEach(clip => {
                        const action = this.mixer.clipAction(clip);
                        action.setDuration(1); // 设置动画持续时间为1秒
                        // 或者使用timeScale调整速度
                        action.timeScale = 1.5; // 大于1加速，小于1减速
                        action.play();
                        console.log('播放动画:', clip.name);
                    });
                }

                console.log('动画列表:', this.animations);
            },
            (progress) => {
                console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('模型加载出错:', error);
            }
        );
    }

    // 修改运动控制方法
    moveForward(speedFactor = 1, duration = 0) {
        // 如果当前正在执行停止命令，则不接受新的移动
        if (this.isStopping) {
            return;
        }
        this.velocity.z = -this.maxSpeed * speedFactor;
        this.setMovementDuration('forward', duration);
    }

    moveBackward(speedFactor = 1, duration = 0) {
        if (this.isStopping) {
            return;
        }
        this.velocity.z = this.maxSpeed * speedFactor;
        this.setMovementDuration('backward', duration);
    }

    moveLeft(speedFactor = 1, duration = 0) {
        if (this.isStopping) {
            return;
        }
        this.velocity.x = -this.maxSpeed * speedFactor;
        this.setMovementDuration('left', duration);
    }

    moveRight(speedFactor = 1, duration = 0) {
        if (this.isStopping) {
            return;
        }
        this.velocity.x = this.maxSpeed * speedFactor;
        this.setMovementDuration('right', duration);
    }

    moveUp(speedFactor = 1, duration = 0) {
        if (this.isStopping) {
            return;
        }
        this.velocity.y = this.maxSpeed * speedFactor;
        this.setMovementDuration('up', duration);
    }

    moveDown(speedFactor = 1, duration = 0) {
        if (this.isStopping) {
            return;
        }
        this.velocity.y = -this.maxSpeed * speedFactor;
        this.setMovementDuration('down', duration);
    }

    // 添加定时控制相关方法
    setMovementDuration(movement, duration) {
        // 如果是相同的移动命令，则忽略
        const currentCommand = `${movement}_${duration}`;
        if (this.lastMovementCommand === currentCommand) {
            return;
        }
        
        if (duration > 0) {
            this.currentMovement = movement;
            this.movementEndTime = performance.now() + duration * 1000;
            this.lastMovementCommand = currentCommand;
            this.isStopping = false; // 开始新的移动时，清除停止标志
            console.log(`设置${movement}运动，持续时间：${duration}秒，将在${new Date(this.movementEndTime).toISOString()}停止`);
        }
    }

    stop() {
        console.log('停止运动');
        this.isStopping = true; // 设置停止标志
        this.velocity.set(0, 0, 0);
        this.currentMovement = null;
        this.movementEndTime = 0;
        this.lastMovementCommand = null;
    }

    update() {
        // 更新动画混合器
        const delta = this.clock.getDelta(); // 获取实际的时间增量
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // 检查是否需要停止当前运动
        if (this.currentMovement && performance.now() >= this.movementEndTime) {
            console.log(`当前时间：${new Date(performance.now()).toISOString()}，已达到停止时间：${new Date(this.movementEndTime).toISOString()}`);
            this.stop();
        }
        
        // 更新位置
        if (this.model) {
            // 使用deltaTime来更新位置，使移动速度与帧率无关
            const frameVelocity = this.velocity.clone().multiplyScalar(delta * 60); // 标准化到60fps的速度
            this.model.position.add(frameVelocity);
            this.altitude = this.model.position.y;
            
            // 更新底部摄像头位置
            this.bottomCamera.position.copy(this.model.position);
            this.bottomCamera.position.y -= 0.01; // 稍微往下偏移
            this.bottomCamera.rotation.x = -Math.PI / 2; // 朝下看
            this.bottomCamera.updateProjectionMatrix();
        }
    }

    // 渲染底部摄像头视角
    renderBottomCamera() {
        if (this.scene && this.bottomCamera) {
            this.bottomCameraRenderer.render(this.scene, this.bottomCamera);
        }
    }

    // 获取底部摄像头渲染器的DOM元素
    getBottomCameraElement() {
        return this.bottomCameraRenderer.domElement;
    }

    // 获取底部摄像头图像数据
    getBottomCameraImage() {
        // 创建一个临时的 canvas 来获取图像数据
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const context = canvas.getContext('2d');
        
        // 将 WebGL 画布的内容绘制到 2D canvas
        context.drawImage(this.bottomCameraRenderer.domElement, 0, 0);
        
        return canvas;
    }
}
