/**
 * ASIMULATE SDK - Constraint System
 * Physics constraints: joints, hinges, springs, motors, etc.
 */

import {
  Vector3,
  Quaternion,
  Matrix3,
  ConstraintType,
  ConstraintConfig,
  ConstraintState
} from '../types';
import { Vec3, Quat, Mat3 } from '../math';

// ============================================================================
// Constraint Body Interface
// ============================================================================

export interface ConstraintBody {
  id: string;
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  mass: number;
  invMass: number;
  inertia: Matrix3;
  invInertia: Matrix3;
  isStatic: boolean;
  isKinematic: boolean;
}

// ============================================================================
// Base Constraint
// ============================================================================

export interface Constraint {
  id: string;
  type: ConstraintType;
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  enabled: boolean;
  breakForce: number;
  breakTorque: number;
  isBroken: boolean;

  // Computed values
  reactionForce: Vector3;
  reactionTorque: Vector3;

  // Methods
  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void;
  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void;
  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void;
  getState(): ConstraintState;
}

// ============================================================================
// Fixed Constraint (Weld Joint)
// ============================================================================

export class FixedConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'fixed';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  // Initial relative rotation
  private initialRelativeRotation: Quaternion;
  private effectiveMass: Matrix3 = Mat3.identity();
  private angularMass: Matrix3 = Mat3.identity();
  private positionBias: Vector3 = { x: 0, y: 0, z: 0 };
  private angularBias: Vector3 = { x: 0, y: 0, z: 0 };
  private baumgarte: number = 0.2;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    breakForce?: number;
    breakTorque?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
    if (config.breakTorque !== undefined) this.breakTorque = config.breakTorque;
    this.initialRelativeRotation = { x: 0, y: 0, z: 0, w: 1 };
  }

  setInitialState(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (bodyB) {
      this.initialRelativeRotation = Quat.multiply(
        Quat.conjugate(bodyA.rotation),
        bodyB.rotation
      );
    } else {
      this.initialRelativeRotation = Quat.conjugate(bodyA.rotation);
    }
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      rB = { x: 0, y: 0, z: 0 };
      worldAnchorB = this.anchorB;
    }

    // Position error
    const positionError = Vec3.sub(worldAnchorB, worldAnchorA);
    this.positionBias = Vec3.scale(positionError, this.baumgarte / dt);

    // Angular error
    const currentRelativeRot = bodyB
      ? Quat.multiply(Quat.conjugate(bodyA.rotation), bodyB.rotation)
      : Quat.conjugate(bodyA.rotation);

    const errorQuat = Quat.multiply(currentRelativeRot, Quat.conjugate(this.initialRelativeRotation));
    this.angularBias = Vec3.scale({ x: errorQuat.x * 2, y: errorQuat.y * 2, z: errorQuat.z * 2 }, this.baumgarte / dt);

    // Calculate effective mass
    const skewA = Mat3.skew(rA);
    const skewB = Mat3.skew(rB);

    let K = Mat3.identity();
    K = Mat3.scale(K, bodyA.invMass);

    const IA = Mat3.multiply(Mat3.multiply(skewA, bodyA.invInertia), Mat3.transpose(skewA));
    K = Mat3.add(K, IA);

    if (bodyB) {
      K = Mat3.scale(K, 1); // Add bodyB.invMass
      K[0] += bodyB.invMass;
      K[4] += bodyB.invMass;
      K[8] += bodyB.invMass;

      const IB = Mat3.multiply(Mat3.multiply(skewB, bodyB.invInertia), Mat3.transpose(skewB));
      K = Mat3.add(K, IB);
    }

    this.effectiveMass = Mat3.inverse(K) || Mat3.identity();

    // Angular effective mass
    let angularK = bodyA.invInertia;
    if (bodyB) {
      angularK = Mat3.add(angularK, bodyB.invInertia);
    }
    this.angularMass = Mat3.inverse(angularK) || Mat3.identity();
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);

    let velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    let velB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      velB = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB));
    } else {
      rB = { x: 0, y: 0, z: 0 };
      velB = { x: 0, y: 0, z: 0 };
    }

    // Relative velocity
    const relVel = Vec3.sub(velB, velA);
    const Cdot = Vec3.add(relVel, this.positionBias);

    // Position impulse
    const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));

    // Apply position impulse
    this.applyImpulse(bodyA, bodyB, rA, rB, impulse);

    // Angular constraint
    const angVelA = bodyA.angularVelocity;
    const angVelB = bodyB ? bodyB.angularVelocity : { x: 0, y: 0, z: 0 };
    const relAngVel = Vec3.sub(angVelB, angVelA);
    const angCdot = Vec3.add(relAngVel, this.angularBias);

    const angularImpulse = Mat3.multiplyVector(this.angularMass, Vec3.negate(angCdot));

    // Apply angular impulse
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.angularVelocity = Vec3.sub(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, angularImpulse)
      );
    }
    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, angularImpulse)
      );
    }

    // Accumulate reaction forces
    this.reactionForce = Vec3.add(this.reactionForce, impulse);
    this.reactionTorque = Vec3.add(this.reactionTorque, angularImpulse);

    // Check break
    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Position solving handled in velocity phase with Baumgarte
  }

  private applyImpulse(
    bodyA: ConstraintBody,
    bodyB: ConstraintBody | null,
    rA: Vector3,
    rB: Vector3,
    impulse: Vector3
  ): void {
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
      bodyA.angularVelocity = Vec3.sub(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, Vec3.cross(rA, impulse))
      );
    }

    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.cross(rB, impulse))
      );
    }
  }

  private checkBreak(): void {
    const forceMag = Vec3.length(this.reactionForce);
    const torqueMag = Vec3.length(this.reactionTorque);

    if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: 0,
      currentDistance: 0,
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Hinge Constraint (Revolute Joint)
// ============================================================================

export class HingeConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'hinge';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  axis: Vector3; // Local to bodyA
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  // Limits
  lowerLimit: number = -Math.PI;
  upperLimit: number = Math.PI;
  limitsEnabled: boolean = false;

  // Motor
  motorEnabled: boolean = false;
  motorTargetVelocity: number = 0;
  motorMaxTorque: number = 0;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  private currentAngle: number = 0;
  private effectiveMass: Matrix3 = Mat3.identity();
  private angularMass: number = 0;
  private motorMass: number = 0;
  private positionBias: Vector3 = { x: 0, y: 0, z: 0 };
  private baumgarte: number = 0.2;
  private initialAngle: number = 0;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    axis: Vector3;
    lowerLimit?: number;
    upperLimit?: number;
    limitsEnabled?: boolean;
    motorEnabled?: boolean;
    motorTargetVelocity?: number;
    motorMaxTorque?: number;
    breakForce?: number;
    breakTorque?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    this.axis = Vec3.normalize(config.axis);

    if (config.lowerLimit !== undefined) this.lowerLimit = config.lowerLimit;
    if (config.upperLimit !== undefined) this.upperLimit = config.upperLimit;
    if (config.limitsEnabled !== undefined) this.limitsEnabled = config.limitsEnabled;
    if (config.motorEnabled !== undefined) this.motorEnabled = config.motorEnabled;
    if (config.motorTargetVelocity !== undefined) this.motorTargetVelocity = config.motorTargetVelocity;
    if (config.motorMaxTorque !== undefined) this.motorMaxTorque = config.motorMaxTorque;
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
    if (config.breakTorque !== undefined) this.breakTorque = config.breakTorque;
  }

  setInitialState(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    this.initialAngle = this.calculateAngle(bodyA, bodyB);
  }

  private calculateAngle(bodyA: ConstraintBody, bodyB: ConstraintBody | null): number {
    const worldAxisA = Quat.rotateVector(bodyA.rotation, this.axis);

    // Get a perpendicular reference vector
    let refA: Vector3;
    if (Math.abs(this.axis.y) < 0.9) {
      refA = Vec3.normalize(Vec3.cross(this.axis, { x: 0, y: 1, z: 0 }));
    } else {
      refA = Vec3.normalize(Vec3.cross(this.axis, { x: 1, y: 0, z: 0 }));
    }

    const worldRefA = Quat.rotateVector(bodyA.rotation, refA);
    const worldRefB = bodyB
      ? Quat.rotateVector(bodyB.rotation, refA)
      : refA;

    // Project onto plane perpendicular to axis
    const projA = Vec3.sub(worldRefA, Vec3.scale(worldAxisA, Vec3.dot(worldRefA, worldAxisA)));
    const projB = Vec3.sub(worldRefB, Vec3.scale(worldAxisA, Vec3.dot(worldRefB, worldAxisA)));

    const lenA = Vec3.length(projA);
    const lenB = Vec3.length(projB);

    if (lenA < 1e-6 || lenB < 1e-6) return 0;

    const normA = Vec3.scale(projA, 1 / lenA);
    const normB = Vec3.scale(projB, 1 / lenB);

    const dot = Math.max(-1, Math.min(1, Vec3.dot(normA, normB)));
    const cross = Vec3.cross(normA, normB);
    const sign = Vec3.dot(cross, worldAxisA) > 0 ? 1 : -1;

    return sign * Math.acos(dot);
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      rB = { x: 0, y: 0, z: 0 };
      worldAnchorB = this.anchorB;
    }

    // Position error
    const positionError = Vec3.sub(worldAnchorB, worldAnchorA);
    this.positionBias = Vec3.scale(positionError, this.baumgarte / dt);

    // Calculate current angle
    this.currentAngle = this.calculateAngle(bodyA, bodyB) - this.initialAngle;

    // Effective mass for position constraint
    const skewA = Mat3.skew(rA);
    const skewB = Mat3.skew(rB);

    let K = Mat3.identity();
    K[0] = bodyA.invMass;
    K[4] = bodyA.invMass;
    K[8] = bodyA.invMass;

    const IA = Mat3.multiply(Mat3.multiply(skewA, bodyA.invInertia), Mat3.transpose(skewA));
    K = Mat3.add(K, IA);

    if (bodyB) {
      K[0] += bodyB.invMass;
      K[4] += bodyB.invMass;
      K[8] += bodyB.invMass;

      const IB = Mat3.multiply(Mat3.multiply(skewB, bodyB.invInertia), Mat3.transpose(skewB));
      K = Mat3.add(K, IB);
    }

    this.effectiveMass = Mat3.inverse(K) || Mat3.identity();

    // Angular effective mass for hinge axis
    const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);
    const iA = Vec3.dot(worldAxis, Mat3.multiplyVector(bodyA.invInertia, worldAxis));
    const iB = bodyB ? Vec3.dot(worldAxis, Mat3.multiplyVector(bodyB.invInertia, worldAxis)) : 0;
    this.angularMass = iA + iB > 0 ? 1 / (iA + iB) : 0;
    this.motorMass = this.angularMass;
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const rB = bodyB
      ? Quat.rotateVector(bodyB.rotation, this.anchorB)
      : { x: 0, y: 0, z: 0 };

    // Position constraint
    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = bodyB
      ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB))
      : { x: 0, y: 0, z: 0 };

    const relVel = Vec3.sub(velB, velA);
    const Cdot = Vec3.add(relVel, this.positionBias);

    const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));
    this.applyImpulse(bodyA, bodyB, rA, rB, impulse);

    this.reactionForce = Vec3.add(this.reactionForce, impulse);

    // Motor
    const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);

    if (this.motorEnabled) {
      const angVelA = Vec3.dot(bodyA.angularVelocity, worldAxis);
      const angVelB = bodyB ? Vec3.dot(bodyB.angularVelocity, worldAxis) : 0;
      const relAngVel = angVelB - angVelA;

      let motorImpulse = this.motorMass * (this.motorTargetVelocity - relAngVel);
      motorImpulse = Math.max(-this.motorMaxTorque, Math.min(this.motorMaxTorque, motorImpulse));

      const angImpulse = Vec3.scale(worldAxis, motorImpulse);

      if (!bodyA.isStatic && !bodyA.isKinematic) {
        bodyA.angularVelocity = Vec3.sub(
          bodyA.angularVelocity,
          Mat3.multiplyVector(bodyA.invInertia, angImpulse)
        );
      }
      if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
        bodyB.angularVelocity = Vec3.add(
          bodyB.angularVelocity,
          Mat3.multiplyVector(bodyB.invInertia, angImpulse)
        );
      }

      this.reactionTorque = Vec3.add(this.reactionTorque, angImpulse);
    }

    // Limits
    if (this.limitsEnabled) {
      const angVelA = Vec3.dot(bodyA.angularVelocity, worldAxis);
      const angVelB = bodyB ? Vec3.dot(bodyB.angularVelocity, worldAxis) : 0;
      const relAngVel = angVelB - angVelA;

      if (this.currentAngle <= this.lowerLimit) {
        // Lower limit
        const limitImpulse = this.angularMass * (-relAngVel + this.baumgarte * (this.lowerLimit - this.currentAngle));
        if (limitImpulse > 0) {
          const angImpulse = Vec3.scale(worldAxis, limitImpulse);
          if (!bodyA.isStatic && !bodyA.isKinematic) {
            bodyA.angularVelocity = Vec3.sub(
              bodyA.angularVelocity,
              Mat3.multiplyVector(bodyA.invInertia, angImpulse)
            );
          }
          if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
            bodyB.angularVelocity = Vec3.add(
              bodyB.angularVelocity,
              Mat3.multiplyVector(bodyB.invInertia, angImpulse)
            );
          }
        }
      } else if (this.currentAngle >= this.upperLimit) {
        // Upper limit
        const limitImpulse = this.angularMass * (-relAngVel + this.baumgarte * (this.upperLimit - this.currentAngle));
        if (limitImpulse < 0) {
          const angImpulse = Vec3.scale(worldAxis, limitImpulse);
          if (!bodyA.isStatic && !bodyA.isKinematic) {
            bodyA.angularVelocity = Vec3.sub(
              bodyA.angularVelocity,
              Mat3.multiplyVector(bodyA.invInertia, angImpulse)
            );
          }
          if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
            bodyB.angularVelocity = Vec3.add(
              bodyB.angularVelocity,
              Mat3.multiplyVector(bodyB.invInertia, angImpulse)
            );
          }
        }
      }
    }

    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Position solving handled in velocity phase
  }

  private applyImpulse(
    bodyA: ConstraintBody,
    bodyB: ConstraintBody | null,
    rA: Vector3,
    rB: Vector3,
    impulse: Vector3
  ): void {
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
      bodyA.angularVelocity = Vec3.sub(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, Vec3.cross(rA, impulse))
      );
    }

    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.cross(rB, impulse))
      );
    }
  }

  private checkBreak(): void {
    const forceMag = Vec3.length(this.reactionForce);
    const torqueMag = Vec3.length(this.reactionTorque);

    if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: this.currentAngle,
      currentDistance: 0,
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Ball Constraint (Ball-and-Socket Joint)
// ============================================================================

export class BallConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'ball';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  private effectiveMass: Matrix3 = Mat3.identity();
  private positionBias: Vector3 = { x: 0, y: 0, z: 0 };
  private baumgarte: number = 0.2;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    breakForce?: number;
    breakTorque?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
    if (config.breakTorque !== undefined) this.breakTorque = config.breakTorque;
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      rB = { x: 0, y: 0, z: 0 };
      worldAnchorB = this.anchorB;
    }

    const positionError = Vec3.sub(worldAnchorB, worldAnchorA);
    this.positionBias = Vec3.scale(positionError, this.baumgarte / dt);

    const skewA = Mat3.skew(rA);
    const skewB = Mat3.skew(rB);

    let K = Mat3.identity();
    K[0] = bodyA.invMass;
    K[4] = bodyA.invMass;
    K[8] = bodyA.invMass;

    const IA = Mat3.multiply(Mat3.multiply(skewA, bodyA.invInertia), Mat3.transpose(skewA));
    K = Mat3.add(K, IA);

    if (bodyB) {
      K[0] += bodyB.invMass;
      K[4] += bodyB.invMass;
      K[8] += bodyB.invMass;

      const IB = Mat3.multiply(Mat3.multiply(skewB, bodyB.invInertia), Mat3.transpose(skewB));
      K = Mat3.add(K, IB);
    }

    this.effectiveMass = Mat3.inverse(K) || Mat3.identity();
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const rB = bodyB
      ? Quat.rotateVector(bodyB.rotation, this.anchorB)
      : { x: 0, y: 0, z: 0 };

    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = bodyB
      ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB))
      : { x: 0, y: 0, z: 0 };

    const relVel = Vec3.sub(velB, velA);
    const Cdot = Vec3.add(relVel, this.positionBias);

    const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));
    this.applyImpulse(bodyA, bodyB, rA, rB, impulse);

    this.reactionForce = Vec3.add(this.reactionForce, impulse);
    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Position solving handled in velocity phase
  }

  private applyImpulse(
    bodyA: ConstraintBody,
    bodyB: ConstraintBody | null,
    rA: Vector3,
    rB: Vector3,
    impulse: Vector3
  ): void {
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
      bodyA.angularVelocity = Vec3.sub(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, Vec3.cross(rA, impulse))
      );
    }

    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.cross(rB, impulse))
      );
    }
  }

  private checkBreak(): void {
    if (Vec3.length(this.reactionForce) > this.breakForce) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: 0,
      currentDistance: 0,
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Distance Constraint
// ============================================================================

export class DistanceConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'distance';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  distance: number;
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  private effectiveMass: number = 0;
  private bias: number = 0;
  private axis: Vector3 = { x: 0, y: 1, z: 0 };
  private baumgarte: number = 0.2;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    distance: number;
    breakForce?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    this.distance = config.distance;
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      rB = { x: 0, y: 0, z: 0 };
      worldAnchorB = this.anchorB;
    }

    const delta = Vec3.sub(worldAnchorB, worldAnchorA);
    const currentDist = Vec3.length(delta);

    if (currentDist > 1e-6) {
      this.axis = Vec3.scale(delta, 1 / currentDist);
    } else {
      this.axis = { x: 0, y: 1, z: 0 };
    }

    const error = currentDist - this.distance;
    this.bias = this.baumgarte * error / dt;

    // Effective mass
    const rnA = Vec3.cross(rA, this.axis);
    const rnB = Vec3.cross(rB, this.axis);

    let K = bodyA.invMass;
    K += Vec3.dot(rnA, Mat3.multiplyVector(bodyA.invInertia, rnA));

    if (bodyB) {
      K += bodyB.invMass;
      K += Vec3.dot(rnB, Mat3.multiplyVector(bodyB.invInertia, rnB));
    }

    this.effectiveMass = K > 0 ? 1 / K : 0;
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const rB = bodyB
      ? Quat.rotateVector(bodyB.rotation, this.anchorB)
      : { x: 0, y: 0, z: 0 };

    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = bodyB
      ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB))
      : { x: 0, y: 0, z: 0 };

    const relVel = Vec3.sub(velB, velA);
    const Cdot = Vec3.dot(relVel, this.axis) + this.bias;

    const lambda = -this.effectiveMass * Cdot;
    const impulse = Vec3.scale(this.axis, lambda);

    this.applyImpulse(bodyA, bodyB, rA, rB, impulse);
    this.reactionForce = Vec3.add(this.reactionForce, impulse);
    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Position solving handled in velocity phase
  }

  private applyImpulse(
    bodyA: ConstraintBody,
    bodyB: ConstraintBody | null,
    rA: Vector3,
    rB: Vector3,
    impulse: Vector3
  ): void {
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
      bodyA.angularVelocity = Vec3.sub(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, Vec3.cross(rA, impulse))
      );
    }

    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.cross(rB, impulse))
      );
    }
  }

  private checkBreak(): void {
    if (Vec3.length(this.reactionForce) > this.breakForce) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    const rA = this.anchorA; // Simplified - would need body reference
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: 0,
      currentDistance: this.distance, // Would calculate actual distance
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Spring Constraint
// ============================================================================

export class SpringConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'spring';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  restLength: number;
  stiffness: number;
  damping: number;
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  private currentLength: number = 0;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    restLength: number;
    stiffness: number;
    damping: number;
    breakForce?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    this.restLength = config.restLength;
    this.stiffness = config.stiffness;
    this.damping = config.damping;
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    // Spring doesn't need velocity preparation
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;
    let rB: Vector3;

    if (bodyB) {
      rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      rB = { x: 0, y: 0, z: 0 };
      worldAnchorB = this.anchorB;
    }

    const delta = Vec3.sub(worldAnchorB, worldAnchorA);
    this.currentLength = Vec3.length(delta);

    if (this.currentLength < 1e-6) return;

    const axis = Vec3.scale(delta, 1 / this.currentLength);

    // Spring force: F = -k * (x - x0)
    const displacement = this.currentLength - this.restLength;
    const springForce = this.stiffness * displacement;

    // Damping force: F = -c * v
    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = bodyB
      ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB))
      : { x: 0, y: 0, z: 0 };
    const relVel = Vec3.dot(Vec3.sub(velB, velA), axis);
    const dampingForce = this.damping * relVel;

    const totalForce = springForce + dampingForce;
    const impulse = Vec3.scale(axis, totalForce);

    // Apply as force (not impulse) - multiply by dt would happen in engine
    this.applyForce(bodyA, bodyB, rA, rB, impulse);

    this.reactionForce = impulse;
    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Springs don't need position solving
  }

  private applyForce(
    bodyA: ConstraintBody,
    bodyB: ConstraintBody | null,
    rA: Vector3,
    rB: Vector3,
    force: Vector3
  ): void {
    // For springs, we apply forces not impulses
    // The engine should handle the dt multiplication
    if (!bodyA.isStatic && !bodyA.isKinematic) {
      bodyA.velocity = Vec3.add(bodyA.velocity, Vec3.scale(force, bodyA.invMass * 0.016)); // ~60fps dt
      bodyA.angularVelocity = Vec3.add(
        bodyA.angularVelocity,
        Mat3.multiplyVector(bodyA.invInertia, Vec3.scale(Vec3.cross(rA, force), 0.016))
      );
    }

    if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.sub(bodyB.velocity, Vec3.scale(force, bodyB.invMass * 0.016));
      bodyB.angularVelocity = Vec3.sub(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.scale(Vec3.cross(rB, force), 0.016))
      );
    }
  }

  private checkBreak(): void {
    if (Vec3.length(this.reactionForce) > this.breakForce) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: 0,
      currentDistance: this.currentLength,
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Slider Constraint (Prismatic Joint)
// ============================================================================

export class SliderConstraint implements Constraint {
  id: string;
  type: ConstraintType = 'slider';
  bodyA: string;
  bodyB: string | 'world';
  anchorA: Vector3;
  anchorB: Vector3;
  axis: Vector3;
  enabled: boolean = true;
  breakForce: number = Infinity;
  breakTorque: number = Infinity;
  isBroken: boolean = false;

  // Limits
  lowerLimit: number = -Infinity;
  upperLimit: number = Infinity;
  limitsEnabled: boolean = false;

  // Motor
  motorEnabled: boolean = false;
  motorTargetVelocity: number = 0;
  motorMaxForce: number = 0;

  reactionForce: Vector3 = { x: 0, y: 0, z: 0 };
  reactionTorque: Vector3 = { x: 0, y: 0, z: 0 };

  private currentPosition: number = 0;
  private effectiveMass: number = 0;
  private baumgarte: number = 0.2;

  constructor(config: {
    id: string;
    bodyA: string;
    bodyB: string | 'world';
    anchorA: Vector3;
    anchorB: Vector3;
    axis: Vector3;
    lowerLimit?: number;
    upperLimit?: number;
    limitsEnabled?: boolean;
    motorEnabled?: boolean;
    motorTargetVelocity?: number;
    motorMaxForce?: number;
    breakForce?: number;
    breakTorque?: number;
  }) {
    this.id = config.id;
    this.bodyA = config.bodyA;
    this.bodyB = config.bodyB;
    this.anchorA = { ...config.anchorA };
    this.anchorB = { ...config.anchorB };
    this.axis = Vec3.normalize(config.axis);

    if (config.lowerLimit !== undefined) this.lowerLimit = config.lowerLimit;
    if (config.upperLimit !== undefined) this.upperLimit = config.upperLimit;
    if (config.limitsEnabled !== undefined) this.limitsEnabled = config.limitsEnabled;
    if (config.motorEnabled !== undefined) this.motorEnabled = config.motorEnabled;
    if (config.motorTargetVelocity !== undefined) this.motorTargetVelocity = config.motorTargetVelocity;
    if (config.motorMaxForce !== undefined) this.motorMaxForce = config.motorMaxForce;
    if (config.breakForce !== undefined) this.breakForce = config.breakForce;
    if (config.breakTorque !== undefined) this.breakTorque = config.breakTorque;
  }

  prepare(bodyA: ConstraintBody, bodyB: ConstraintBody | null, dt: number): void {
    if (!this.enabled || this.isBroken) return;

    const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);

    const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
    const worldAnchorA = Vec3.add(bodyA.position, rA);

    let worldAnchorB: Vector3;

    if (bodyB) {
      const rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
      worldAnchorB = Vec3.add(bodyB.position, rB);
    } else {
      worldAnchorB = this.anchorB;
    }

    const delta = Vec3.sub(worldAnchorB, worldAnchorA);
    this.currentPosition = Vec3.dot(delta, worldAxis);

    // Effective mass along axis
    let K = bodyA.invMass;
    if (bodyB) {
      K += bodyB.invMass;
    }
    this.effectiveMass = K > 0 ? 1 / K : 0;
  }

  solve(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    if (!this.enabled || this.isBroken) return;

    const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);

    // Motor
    if (this.motorEnabled) {
      const relVel = bodyB
        ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis)
        : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);

      let motorImpulse = this.effectiveMass * (this.motorTargetVelocity - relVel);
      motorImpulse = Math.max(-this.motorMaxForce, Math.min(this.motorMaxForce, motorImpulse));

      const impulse = Vec3.scale(worldAxis, motorImpulse);

      if (!bodyA.isStatic && !bodyA.isKinematic) {
        bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
      }
      if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
        bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      }

      this.reactionForce = Vec3.add(this.reactionForce, impulse);
    }

    // Limits
    if (this.limitsEnabled) {
      if (this.currentPosition <= this.lowerLimit) {
        const relVel = bodyB
          ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis)
          : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);

        const limitImpulse = this.effectiveMass * (-relVel + this.baumgarte * (this.lowerLimit - this.currentPosition));

        if (limitImpulse > 0) {
          const impulse = Vec3.scale(worldAxis, limitImpulse);
          if (!bodyA.isStatic && !bodyA.isKinematic) {
            bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
          }
          if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
            bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
          }
        }
      } else if (this.currentPosition >= this.upperLimit) {
        const relVel = bodyB
          ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis)
          : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);

        const limitImpulse = this.effectiveMass * (-relVel + this.baumgarte * (this.upperLimit - this.currentPosition));

        if (limitImpulse < 0) {
          const impulse = Vec3.scale(worldAxis, limitImpulse);
          if (!bodyA.isStatic && !bodyA.isKinematic) {
            bodyA.velocity = Vec3.sub(bodyA.velocity, Vec3.scale(impulse, bodyA.invMass));
          }
          if (bodyB && !bodyB.isStatic && !bodyB.isKinematic) {
            bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
          }
        }
      }
    }

    this.checkBreak();
  }

  solvePosition(bodyA: ConstraintBody, bodyB: ConstraintBody | null): void {
    // Position solving handled in velocity phase
  }

  private checkBreak(): void {
    const forceMag = Vec3.length(this.reactionForce);
    const torqueMag = Vec3.length(this.reactionTorque);

    if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
      this.isBroken = true;
    }
  }

  getState(): ConstraintState {
    return {
      constraintId: this.id,
      reactionForce: { ...this.reactionForce },
      reactionTorque: { ...this.reactionTorque },
      currentAngle: 0,
      currentDistance: this.currentPosition,
      isBroken: this.isBroken
    };
  }
}

// ============================================================================
// Constraint Solver
// ============================================================================

export class ConstraintSolver {
  private constraints: Map<string, Constraint> = new Map();
  private velocityIterations: number = 8;
  private positionIterations: number = 3;

  constructor(options?: {
    velocityIterations?: number;
    positionIterations?: number;
  }) {
    if (options?.velocityIterations) this.velocityIterations = options.velocityIterations;
    if (options?.positionIterations) this.positionIterations = options.positionIterations;
  }

  addConstraint(constraint: Constraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  removeConstraint(id: string): void {
    this.constraints.delete(id);
  }

  getConstraint(id: string): Constraint | undefined {
    return this.constraints.get(id);
  }

  solve(
    bodies: Map<string, ConstraintBody>,
    dt: number
  ): ConstraintState[] {
    const states: ConstraintState[] = [];

    // Remove broken constraints
    for (const [id, constraint] of this.constraints) {
      if (constraint.isBroken) {
        this.constraints.delete(id);
      }
    }

    // Prepare all constraints
    for (const constraint of this.constraints.values()) {
      if (!constraint.enabled || constraint.isBroken) continue;

      const bodyA = bodies.get(constraint.bodyA);
      const bodyB = constraint.bodyB === 'world' ? null : bodies.get(constraint.bodyB);

      if (!bodyA) continue;

      // Reset reaction forces
      constraint.reactionForce = { x: 0, y: 0, z: 0 };
      constraint.reactionTorque = { x: 0, y: 0, z: 0 };

      constraint.prepare(bodyA, bodyB, dt);
    }

    // Velocity iterations
    for (let i = 0; i < this.velocityIterations; i++) {
      for (const constraint of this.constraints.values()) {
        if (!constraint.enabled || constraint.isBroken) continue;

        const bodyA = bodies.get(constraint.bodyA);
        const bodyB = constraint.bodyB === 'world' ? null : bodies.get(constraint.bodyB);

        if (!bodyA) continue;

        constraint.solve(bodyA, bodyB);
      }
    }

    // Position iterations
    for (let i = 0; i < this.positionIterations; i++) {
      for (const constraint of this.constraints.values()) {
        if (!constraint.enabled || constraint.isBroken) continue;

        const bodyA = bodies.get(constraint.bodyA);
        const bodyB = constraint.bodyB === 'world' ? null : bodies.get(constraint.bodyB);

        if (!bodyA) continue;

        constraint.solvePosition(bodyA, bodyB);
      }
    }

    // Collect states
    for (const constraint of this.constraints.values()) {
      states.push(constraint.getState());
    }

    return states;
  }

  clear(): void {
    this.constraints.clear();
  }

  getConstraints(): Constraint[] {
    return Array.from(this.constraints.values());
  }
}

// ============================================================================
// Constraint Factory
// ============================================================================

export class ConstraintFactory {
  static create(config: ConstraintConfig): Constraint {
    switch (config.type) {
      case 'fixed':
        return new FixedConstraint({
          id: config.id || `fixed_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          breakForce: config.breakForce,
          breakTorque: config.breakTorque
        });

      case 'hinge':
        return new HingeConstraint({
          id: config.id || `hinge_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          axis: config.axis || { x: 0, y: 0, z: 1 },
          lowerLimit: config.limits?.min,
          upperLimit: config.limits?.max,
          limitsEnabled: config.limits !== undefined,
          breakForce: config.breakForce,
          breakTorque: config.breakTorque
        });

      case 'ball':
        return new BallConstraint({
          id: config.id || `ball_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          breakForce: config.breakForce,
          breakTorque: config.breakTorque
        });

      case 'distance':
        return new DistanceConstraint({
          id: config.id || `distance_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          distance: Vec3.length(Vec3.sub(config.anchorB, config.anchorA)),
          breakForce: config.breakForce
        });

      case 'spring':
        return new SpringConstraint({
          id: config.id || `spring_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          restLength: Vec3.length(Vec3.sub(config.anchorB, config.anchorA)),
          stiffness: config.stiffness || 100,
          damping: config.damping || 10,
          breakForce: config.breakForce
        });

      case 'slider':
        return new SliderConstraint({
          id: config.id || `slider_${Date.now()}`,
          bodyA: config.bodyA,
          bodyB: config.bodyB,
          anchorA: config.anchorA,
          anchorB: config.anchorB,
          axis: config.axis || { x: 1, y: 0, z: 0 },
          lowerLimit: config.limits?.min,
          upperLimit: config.limits?.max,
          limitsEnabled: config.limits !== undefined,
          breakForce: config.breakForce,
          breakTorque: config.breakTorque
        });

      default:
        throw new Error(`Unknown constraint type: ${config.type}`);
    }
  }
}

export default ConstraintSolver;
