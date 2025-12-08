/**
 * ASIMULATE SDK - Physics Object
 * Represents a single physics-enabled object in the simulation
 */

import type {
  ObjectConfig,
  ObjectType,
  SimObject,
  ObjectState,
  PhysicsMaterial,
  Vector3,
  Quaternion,
  Matrix3,
  BoundingVolume,
} from '../types';
import { Vec3, Quat, Mat3 } from '../math';

/**
 * Default physical material
 */
const DEFAULT_MATERIAL: Required<PhysicsMaterial> = {
  friction: 0.5,
  staticFriction: 0.6,
  restitution: 0.3,
  rollingResistance: 0.01,
};

/**
 * Calculate inertia tensor for common shapes
 */
function calculateInertiaTensor(type: ObjectType, config: ObjectConfig, mass: number): Matrix3 {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;

  switch (type) {
    case 'sphere': {
      const i = (2 / 5) * mass * radius * radius;
      return Mat3.diagonal(i, i, i);
    }

    case 'box': {
      const ix = (1 / 12) * mass * (height * height + depth * depth);
      const iy = (1 / 12) * mass * (width * width + depth * depth);
      const iz = (1 / 12) * mass * (width * width + height * height);
      return Mat3.diagonal(ix, iy, iz);
    }

    case 'cylinder': {
      const ix = (1 / 12) * mass * (3 * radius * radius + height * height);
      const iy = (1 / 2) * mass * radius * radius;
      const iz = ix;
      return Mat3.diagonal(ix, iy, iz);
    }

    case 'capsule': {
      const cylinderMass = mass * (height / (height + (4 / 3) * radius));
      const sphereMass = mass - cylinderMass;

      const cylIx = (1 / 12) * cylinderMass * (3 * radius * radius + height * height);
      const cylIy = (1 / 2) * cylinderMass * radius * radius;

      const sphI = (2 / 5) * sphereMass * radius * radius;
      const sphOffset = (height / 2 + radius) * (height / 2 + radius);

      const ix = cylIx + 2 * (sphI + sphereMass * sphOffset / 2);
      const iy = cylIy + 2 * sphI;
      const iz = ix;

      return Mat3.diagonal(ix, iy, iz);
    }

    case 'cone': {
      const ix = (3 / 20) * mass * radius * radius + (3 / 80) * mass * height * height;
      const iy = (3 / 10) * mass * radius * radius;
      const iz = ix;
      return Mat3.diagonal(ix, iy, iz);
    }

    default: {
      // Default to sphere-like for unknown shapes
      const avgSize = Math.cbrt(width * height * depth);
      const i = (2 / 5) * mass * avgSize * avgSize;
      return Mat3.diagonal(i, i, i);
    }
  }
}

/**
 * Calculate volume for common shapes
 */
function calculateVolume(type: ObjectType, config: ObjectConfig): number {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;

  switch (type) {
    case 'sphere':
      return (4 / 3) * Math.PI * radius * radius * radius;
    case 'box':
      return width * height * depth;
    case 'cylinder':
      return Math.PI * radius * radius * height;
    case 'capsule':
      return Math.PI * radius * radius * height + (4 / 3) * Math.PI * radius * radius * radius;
    case 'cone':
      return (1 / 3) * Math.PI * radius * radius * height;
    default:
      return width * height * depth;
  }
}

/**
 * Calculate bounding volume for shapes
 */
function calculateBoundingVolume(type: ObjectType, config: ObjectConfig, scale: Vector3): BoundingVolume {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;

  switch (type) {
    case 'sphere':
      return {
        type: 'sphere',
        center: Vec3.ZERO,
        radius: radius * Math.max(scale.x, scale.y, scale.z),
      };

    default:
      return {
        type: 'box',
        center: Vec3.ZERO,
        halfExtents: {
          x: (width / 2) * scale.x,
          y: (height / 2) * scale.y,
          z: (depth / 2) * scale.z,
        },
      };
  }
}

/**
 * Calculate cross-sectional area for drag
 */
function calculateCrossSectionArea(type: ObjectType, config: ObjectConfig): number {
  const { radius = 1, width = 1, height = 1 } = config;

  switch (type) {
    case 'sphere':
      return Math.PI * radius * radius;
    case 'box':
      return width * height; // front face
    case 'cylinder':
      return Math.PI * radius * radius;
    default:
      return width * height;
  }
}

/**
 * Physics Object Implementation
 */
export class PhysicsObject implements SimObject {
  readonly id: string;
  name: string;
  readonly type: ObjectType;

  // Transform
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;

  // Physics properties
  private _mass: number;
  private _inverseMass: number;
  centerOfMass: Vector3;
  inertiaTensor: Matrix3;
  private _inverseInertiaTensor: Matrix3;

  // Material
  material: Required<PhysicsMaterial>;

  // Dynamics
  velocity: Vector3;
  angularVelocity: Vector3;
  linearDamping: number;
  angularDamping: number;

  // Aerodynamics
  dragCoefficient: number;
  liftCoefficient: number;
  crossSectionArea: number;

  // State
  isStatic: boolean;
  isKinematic: boolean;
  isTrigger: boolean;
  isSleeping: boolean;

  // Collision
  collisionGroup: number;
  collisionMask: number;

  // Additional
  charge: number;
  temperature: number;
  customData: Record<string, unknown>;

  // Shape-specific data
  radius: number;
  width: number;
  height: number;
  depth: number;
  length: number;

  // Internal state
  sleepTime = 0;
  private _accumulatedForce: Vector3 = Vec3.create();
  private _accumulatedTorque: Vector3 = Vec3.create();
  private _initialState: ObjectConfig;
  private _volume: number;
  private _boundingVolume: BoundingVolume;

  constructor(id: string, config: ObjectConfig) {
    this.id = id;
    this.name = config.name ?? id;
    this.type = config.type;

    // Store initial config for reset
    this._initialState = { ...config };

    // Shape parameters
    this.radius = config.radius ?? 1;
    this.width = config.width ?? 1;
    this.height = config.height ?? 1;
    this.depth = config.depth ?? 1;
    this.length = config.length ?? 1;

    // Transform
    this.position = this._parseVector3(config.position) ?? Vec3.create();
    this.rotation = this._parseQuaternion(config.rotation) ?? Quat.identity();
    this.scale = this._parseVector3(config.scale) ?? Vec3.create(1, 1, 1);

    // Calculate volume
    this._volume = calculateVolume(config.type, config);

    // Mass (either from config or calculated from density)
    if (config.mass !== undefined) {
      this._mass = config.mass;
    } else if (config.density !== undefined) {
      this._mass = config.density * this._volume;
    } else {
      this._mass = 1;
    }

    // Static objects have infinite mass (inverse mass = 0)
    this.isStatic = config.isStatic ?? false;
    this._inverseMass = this.isStatic ? 0 : 1 / this._mass;

    // Center of mass
    this.centerOfMass = config.centerOfMass ?? Vec3.create();

    // Inertia tensor
    if (config.inertiaTensor) {
      this.inertiaTensor = config.inertiaTensor;
    } else {
      this.inertiaTensor = calculateInertiaTensor(config.type, config, this._mass);
    }
    
    // Calculate inverse inertia tensor
    this._inverseInertiaTensor = this.isStatic ? Mat3.zero() : (Mat3.inverse(this.inertiaTensor) ?? Mat3.identity());

    // Material
    this.material = { ...DEFAULT_MATERIAL, ...config.material };

    // Dynamics
    this.velocity = this._parseVector3(config.velocity) ?? Vec3.create();
    this.angularVelocity = this._parseVector3(config.angularVelocity) ?? Vec3.create();
    this.linearDamping = config.linearDamping ?? 0.01;
    this.angularDamping = config.angularDamping ?? 0.05;

    // Aerodynamics
    this.dragCoefficient = config.dragCoefficient ?? 0.47; // sphere default
    this.liftCoefficient = config.liftCoefficient ?? 0;
    this.crossSectionArea = config.crossSectionArea ?? calculateCrossSectionArea(config.type, config);

    // State flags
    this.isKinematic = config.isKinematic ?? false;
    this.isTrigger = config.isTrigger ?? false;
    this.isSleeping = false;

    // Collision
    this.collisionGroup = config.collisionGroup ?? 1;
    this.collisionMask = config.collisionMask ?? 0xffffffff;

    // Additional properties
    this.charge = config.charge ?? 0;
    this.temperature = config.temperature ?? 293.15; // 20°C in Kelvin
    this.customData = config.customData ?? {};

    // Calculate bounding volume
    this._boundingVolume = calculateBoundingVolume(config.type, config, this.scale);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  get mass(): number {
    return this._mass;
  }

  set mass(value: number) {
    this._mass = value;
    this._inverseMass = this.isStatic ? 0 : 1 / value;
    // Recalculate inertia tensor
    this.inertiaTensor = calculateInertiaTensor(this.type, this._initialState, value);
    this._inverseInertiaTensor = this.isStatic ? Mat3.zero() : (Mat3.inverse(this.inertiaTensor) ?? Mat3.identity());
  }

  get inverseMass(): number {
    return this._inverseMass;
  }

  get inverseInertiaTensor(): Matrix3 {
    return this._inverseInertiaTensor;
  }

  get volume(): number {
    return this._volume;
  }

  get kineticEnergy(): number {
    // Linear kinetic energy: 0.5 * m * v^2
    const linearKE = 0.5 * this._mass * Vec3.lengthSquared(this.velocity);

    // Rotational kinetic energy: 0.5 * w^T * I * w
    const Iw = Mat3.multiplyVector(this.inertiaTensor, this.angularVelocity);
    const rotationalKE = 0.5 * Vec3.dot(this.angularVelocity, Iw);

    return linearKE + rotationalKE;
  }

  get momentum(): Vector3 {
    return Vec3.scale(this.velocity, this._mass);
  }

  get angularMomentum(): Vector3 {
    return Mat3.multiplyVector(this.inertiaTensor, this.angularVelocity);
  }

  get boundingBox(): BoundingVolume {
    return this._boundingVolume;
  }

  // ============================================================================
  // FORCE APPLICATION
  // ============================================================================

  applyForce(force: Vector3, point?: Vector3): void {
    if (this.isStatic) return;
    
    this.wakeUp();
    this._accumulatedForce = Vec3.add(this._accumulatedForce, force);

    // If point is specified, calculate torque
    if (point) {
      const worldPoint = this.localToWorld(point);
      const r = Vec3.sub(worldPoint, this.position);
      const torque = Vec3.cross(r, force);
      this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
    }
  }

  applyImpulse(impulse: Vector3, point?: Vector3): void {
    if (this.isStatic) return;

    this.wakeUp();
    this.velocity = Vec3.add(this.velocity, Vec3.scale(impulse, this._inverseMass));

    if (point) {
      const worldPoint = this.localToWorld(point);
      const r = Vec3.sub(worldPoint, this.position);
      const angularImpulse = Vec3.cross(r, impulse);
      const deltaOmega = Mat3.multiplyVector(this._inverseInertiaTensor, angularImpulse);
      this.angularVelocity = Vec3.add(this.angularVelocity, deltaOmega);
    }
  }

  applyTorque(torque: Vector3): void {
    if (this.isStatic) return;
    
    this.wakeUp();
    this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
  }

  accumulateForce(force: Vector3): void {
    this._accumulatedForce = Vec3.add(this._accumulatedForce, force);
  }

  accumulateTorque(torque: Vector3): void {
    this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
  }

  clearAccumulatedForces(): void {
    this._accumulatedForce = Vec3.create();
    this._accumulatedTorque = Vec3.create();
  }

  getAccumulatedForces(): { force: Vector3; torque: Vector3 } {
    return {
      force: Vec3.clone(this._accumulatedForce),
      torque: Vec3.clone(this._accumulatedTorque),
    };
  }

  // ============================================================================
  // TRANSFORM METHODS
  // ============================================================================

  setPosition(position: Vector3): void {
    this.position = Vec3.clone(position);
    this.wakeUp();
  }

  setRotation(rotation: Quaternion): void {
    this.rotation = Quat.clone(rotation);
    this.wakeUp();
  }

  setVelocity(velocity: Vector3): void {
    this.velocity = Vec3.clone(velocity);
    this.wakeUp();
  }

  setAngularVelocity(angularVelocity: Vector3): void {
    this.angularVelocity = Vec3.clone(angularVelocity);
    this.wakeUp();
  }

  localToWorld(localPoint: Vector3): Vector3 {
    const scaled = Vec3.multiply(localPoint, this.scale);
    const rotated = Quat.rotateVector(this.rotation, scaled);
    return Vec3.add(this.position, rotated);
  }

  worldToLocal(worldPoint: Vector3): Vector3 {
    const translated = Vec3.sub(worldPoint, this.position);
    const rotated = Quat.rotateVector(Quat.conjugate(this.rotation), translated);
    return Vec3.divide(rotated, this.scale);
  }

  getForward(): Vector3 {
    return Quat.rotateVector(this.rotation, Vec3.FORWARD);
  }

  getUp(): Vector3 {
    return Quat.rotateVector(this.rotation, Vec3.UP);
  }

  getRight(): Vector3 {
    return Quat.rotateVector(this.rotation, Vec3.RIGHT);
  }

  // ============================================================================
  // SLEEP STATE
  // ============================================================================

  sleep(): void {
    if (this.isStatic) return;
    this.isSleeping = true;
    this.velocity = Vec3.create();
    this.angularVelocity = Vec3.create();
  }

  wakeUp(): void {
    if (this.isStatic) return;
    this.isSleeping = false;
    this.sleepTime = 0;
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  getState(timestamp: number): ObjectState {
    // Calculate acceleration from accumulated forces
    const acceleration = this.isStatic
      ? Vec3.ZERO
      : Vec3.scale(this._accumulatedForce, this._inverseMass);
    
    const angularAcceleration = this.isStatic
      ? Vec3.ZERO
      : Mat3.multiplyVector(this._inverseInertiaTensor, this._accumulatedTorque);

    return {
      timestamp,
      objectId: this.id,
      position: Vec3.clone(this.position),
      rotation: Quat.clone(this.rotation),
      velocity: Vec3.clone(this.velocity),
      angularVelocity: Vec3.clone(this.angularVelocity),
      acceleration,
      angularAcceleration,
      kineticEnergy: this.kineticEnergy,
      potentialEnergy: 0, // Calculated by engine with gravity
      totalEnergy: this.kineticEnergy,
      momentum: this.momentum,
      angularMomentum: this.angularMomentum,
    };
  }

  restoreState(state: ObjectState): void {
    this.position = Vec3.clone(state.position);
    this.rotation = Quat.clone(state.rotation);
    this.velocity = Vec3.clone(state.velocity);
    this.angularVelocity = Vec3.clone(state.angularVelocity);
  }

  reset(): void {
    this.position = this._parseVector3(this._initialState.position) ?? Vec3.create();
    this.rotation = this._parseQuaternion(this._initialState.rotation) ?? Quat.identity();
    this.velocity = this._parseVector3(this._initialState.velocity) ?? Vec3.create();
    this.angularVelocity = this._parseVector3(this._initialState.angularVelocity) ?? Vec3.create();
    this.clearAccumulatedForces();
    this.wakeUp();
  }

  clone(): PhysicsObject {
    return new PhysicsObject(`${this.id}_clone`, this.toJSON());
  }

  toJSON(): ObjectConfig {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      radius: this.radius,
      width: this.width,
      height: this.height,
      depth: this.depth,
      length: this.length,
      position: Vec3.toArray(this.position),
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w],
      scale: Vec3.toArray(this.scale),
      mass: this._mass,
      centerOfMass: this.centerOfMass,
      material: { ...this.material },
      velocity: Vec3.toArray(this.velocity),
      angularVelocity: Vec3.toArray(this.angularVelocity),
      linearDamping: this.linearDamping,
      angularDamping: this.angularDamping,
      dragCoefficient: this.dragCoefficient,
      liftCoefficient: this.liftCoefficient,
      crossSectionArea: this.crossSectionArea,
      isStatic: this.isStatic,
      isKinematic: this.isKinematic,
      isTrigger: this.isTrigger,
      collisionGroup: this.collisionGroup,
      collisionMask: this.collisionMask,
      charge: this.charge,
      temperature: this.temperature,
      customData: { ...this.customData },
    };
  }

  // ============================================================================
  // COLLISION HELPERS
  // ============================================================================

  /**
   * Get closest point on this object to given point
   */
  closestPoint(point: Vector3): Vector3 {
    const localPoint = this.worldToLocal(point);
    let closestLocal: Vector3;

    switch (this.type) {
      case 'sphere': {
        const dist = Vec3.length(localPoint);
        if (dist === 0) {
          closestLocal = Vec3.create(this.radius, 0, 0);
        } else {
          closestLocal = Vec3.scale(Vec3.normalize(localPoint), this.radius);
        }
        break;
      }

      case 'box': {
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const halfD = this.depth / 2;
        closestLocal = {
          x: Math.max(-halfW, Math.min(halfW, localPoint.x)),
          y: Math.max(-halfH, Math.min(halfH, localPoint.y)),
          z: Math.max(-halfD, Math.min(halfD, localPoint.z)),
        };
        break;
      }

      case 'cylinder': {
        const halfH = this.height / 2;
        const { x, y, z } = localPoint;
        const radialDist = Math.sqrt(x * x + z * z);
        
        if (radialDist <= this.radius && Math.abs(y) <= halfH) {
          // Point is inside
          closestLocal = localPoint;
        } else {
          const clampedY = Math.max(-halfH, Math.min(halfH, y));
          const clampedRadial = Math.min(this.radius, radialDist);
          const factor = clampedRadial / (radialDist || 1);
          closestLocal = { x: x * factor, y: clampedY, z: z * factor };
        }
        break;
      }

      default:
        // Default to box behavior
        closestLocal = localPoint;
    }

    return this.localToWorld(closestLocal);
  }

  /**
   * Check if point is inside this object
   */
  containsPoint(point: Vector3): boolean {
    const local = this.worldToLocal(point);

    switch (this.type) {
      case 'sphere':
        return Vec3.lengthSquared(local) <= this.radius * this.radius;

      case 'box': {
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const halfD = this.depth / 2;
        return (
          Math.abs(local.x) <= halfW &&
          Math.abs(local.y) <= halfH &&
          Math.abs(local.z) <= halfD
        );
      }

      case 'cylinder': {
        const halfH = this.height / 2;
        const radialDistSq = local.x * local.x + local.z * local.z;
        return radialDistSq <= this.radius * this.radius && Math.abs(local.y) <= halfH;
      }

      default:
        return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private _parseVector3(value?: Vector3 | [number, number, number]): Vector3 | undefined {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return Vec3.fromArray(value);
    }
    return value;
  }

  private _parseQuaternion(value?: Quaternion | [number, number, number, number]): Quaternion | undefined {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return { x: value[0], y: value[1], z: value[2], w: value[3] };
    }
    return value;
  }
}

export default PhysicsObject;
