/*
 * Active Drift Physics Module
 * 
 * Implements momentum-based sliding and counter-steering for realistic drift behavior.
 * 
 * Usage:
 *   const drift = new ActiveDrift({ mass, dragCoefficient, steeringSensitivity });
 *   const { newVelocity, newAngle } = drift.update(currentVelocity, currentAngle, acceleration, steeringInput, deltaTime);
 */

class ActiveDrift {
  constructor({ mass = 1500, dragCoefficient = 0.02, steeringSensitivity = 0.05 } = {}) {
    this.mass = mass; // vehicle mass in kg
    this.dragCoefficient = dragCoefficient; // scalar drag coefficient
    this.steeringSensitivity = steeringSensitivity; // how responsive counter-steering is
    // Internal momentum component to simulate inertia
    this.momentum = 0;
  }

  /*
   * Updates the physics state based on inputs.
   * @param {number} currentVelocity - current speed (m/s)
   * @param {number} currentAngle - current heading (radians)
   * @param {number} acceleration - forward acceleration input (m/s^2)
   * @param {number} steeringInput - steering input (-1 left, 0, 1 right)
   * @param {number} deltaTime - time step in seconds
   * @returns {object} { newVelocity, newAngle }
   */
  update(currentVelocity, currentAngle, acceleration, steeringInput, deltaTime) {
    // Basic physics: update velocity with acceleration and drag
    let accel = acceleration - (this.dragCoefficient * currentVelocity);
    let newVelocity = currentVelocity + accel * deltaTime;

    // Calculate momentum change
    this.momentum = newVelocity * this.mass;  // simple momentum calculation

    // Calculate counter-steering adjustment
    // The drifting physics includes a correction based on momentum and steering input.
    let driftAdjustment = steeringInput * this.steeringSensitivity * (this.momentum / this.mass);
    let newAngle = currentAngle + driftAdjustment * deltaTime;

    return { newVelocity, newAngle };
  }
}

// Export the module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActiveDrift;
} else {
  window.ActiveDrift = ActiveDrift;
}
