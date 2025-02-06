export class ControlManager {
  constructor(drone) {
    this.drone = drone
    this.controlInterval = null
  }

  startRandomControl(interval = 1500) {
    this.controlInterval = setInterval(() => {
      const actions = [
        () => this.drone.moveForward(),
        () => this.drone.moveBackward(),
        () => this.drone.moveLeft(),
        () => this.drone.moveRight(),
        () => this.drone.moveUp(),
        () => this.drone.moveDown(),
        () => this.drone.stop()
      ]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      randomAction()
    }, interval)
  }

  stopControl() {
    clearInterval(this.controlInterval)
  }
} 