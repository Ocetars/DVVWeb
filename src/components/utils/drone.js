import { DroneMovement } from './DroneMovement.js';
import { DroneCamera } from './DroneCamera.js';

export class Drone {
    constructor(scene) {
        this.scene = scene;
        this.movement = new DroneMovement(scene);
        this.camera = null; // 待无人机模型加载完成后初始化
    }

    // 在 ThreeScene 的动画循环中调用，传入 delta 时间
    update(delta) {
        this.movement.update(delta);
        // 当无人机模型加载成功后，创建摄像头模块（仅创建一次）
        if (this.movement.model && !this.camera) {
            this.camera = new DroneCamera(this.scene, this.movement.model);
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

    // 运动控制接口，均委托给 DroneMovement
    moveForward(speedFactor = 1, duration = 0) {
        this.movement.moveForward(speedFactor, duration);
    }

    moveBackward(speedFactor = 1, duration = 0) {
        this.movement.moveBackward(speedFactor, duration);
    }

    moveLeft(speedFactor = 1, duration = 0) {
        this.movement.moveLeft(speedFactor, duration);
    }

    moveRight(speedFactor = 1, duration = 0) {
        this.movement.moveRight(speedFactor, duration);
    }

    moveUp(speedFactor = 1, duration = 0) {
        this.movement.moveUp(speedFactor, duration);
    }

    moveDown(speedFactor = 1, duration = 0) {
        this.movement.moveDown(speedFactor, duration);
    }

    stop() {
        this.movement.stop();
    }

    // 摄像头相关接口，委托给 DroneCamera
    getBottomCameraElement() {
        return this.camera ? this.camera.getElement() : null;
    }

    getBottomCameraImage() {
        return this.camera ? this.camera.getImage() : null;
    }
}
