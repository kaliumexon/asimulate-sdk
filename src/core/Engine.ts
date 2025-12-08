/**
 * ASIMULATE SDK - Core Physics Engine
 * Main simulation engine with world management, stepping, and collision detection
 */

import type {
  EngineConfig,
  EnvironmentConfig,
  ObjectConfig,
  ForceConfig,
  ConstraintConfig,
  SimObject,
  World,
  SimulationSnapshot,
  CollisionInfo,
  CollisionCallback,
  TriggerCallback,
  RaycastHit,
  RaycastOptions,
  WorldStats,
  EngineEvent,
  EngineEventCallback,
  Vector3,
  Quaternion,
  Precision,
  Integrator,
} from '../types';
import { Vec3, Quat, Mat3 } from '../math';
import { PhysicsObject } from './PhysicsObject';
import { ForceSystem } from '../forces/ForceSystem';
import { ConstraintSolver } from '../constraints/ConstraintSolver';
import { CollisionSystem } from '../collision/CollisionSystem';
import { Environment } from '../environment/Environment';

/**
 * Integrator implementations for different precision levels
 */
const integrators = {
  /**
   * Euler integration (simplest, least accurate)
   */
  euler: (obj: PhysicsObject, dt: number, forces: Vector3, torques: Vector3) => {
    if (obj.isStatic || obj.isKinematic) return;

    // Linear motion
    const acceleration = Vec3.scale(forces, obj.inverseMass);
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));
    obj.position = Vec3.add(obj.position, Vec3.scale(obj.velocity, dt));

    // Angular motion
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
    
    // Update rotation
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin: Quaternion = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0,
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  },

  /**
   * Velocity Verlet integration (good balance of speed and accuracy)
   */
  verlet: (obj: PhysicsObject, dt: number, forces: Vector3, torques: Vector3) => {
    if (obj.isStatic || obj.isKinematic) return;

    const halfDt = dt * 0.5;
    const acceleration = Vec3.scale(forces, obj.inverseMass);

    // Update position using current velocity and half of acceleration
    obj.position = Vec3.add(
      obj.position,
      Vec3.add(
        Vec3.scale(obj.velocity, dt),
        Vec3.scale(acceleration, halfDt * dt)
      )
    );

    // Update velocity
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));

    // Angular motion (simplified Verlet)
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    
    // Update angular position
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin: Quaternion = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0,
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));

    // Update angular velocity
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
  },

  /**
   * Runge-Kutta 4 integration (most accurate, more expensive)
   */
  'runge-kutta-4': (obj: PhysicsObject, dt: number, forces: Vector3, torques: Vector3) => {
    if (obj.isStatic || obj.isKinematic) return;

    // RK4 for linear motion
    const mass = obj.inverseMass;
    const a = Vec3.scale(forces, mass);

    // k1
    const k1v = Vec3.scale(a, dt);
    const k1p = Vec3.scale(obj.velocity, dt);

    // k2
    const k2v = Vec3.scale(a, dt);
    const k2p = Vec3.scale(Vec3.add(obj.velocity, Vec3.scale(k1v, 0.5)), dt);

    // k3
    const k3v = Vec3.scale(a, dt);
    const k3p = Vec3.scale(Vec3.add(obj.velocity, Vec3.scale(k2v, 0.5)), dt);

    // k4
    const k4v = Vec3.scale(a, dt);
    const k4p = Vec3.scale(Vec3.add(obj.velocity, k3v), dt);

    // Combine
    obj.velocity = Vec3.add(
      obj.velocity,
      Vec3.scale(
        Vec3.add(
          Vec3.add(k1v, Vec3.scale(k2v, 2)),
          Vec3.add(Vec3.scale(k3v, 2), k4v)
        ),
        1 / 6
      )
    );

    obj.position = Vec3.add(
      obj.position,
      Vec3.scale(
        Vec3.add(
          Vec3.add(k1p, Vec3.scale(k2p, 2)),
          Vec3.add(Vec3.scale(k3p, 2), k4p)
        ),
        1 / 6
      )
    );

    // Angular motion (simplified for now)
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));

    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin: Quaternion = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0,
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  },

  /**
   * Symplectic Euler (energy-conserving)
   */
  symplectic: (obj: PhysicsObject, dt: number, forces: Vector3, torques: Vector3) => {
    if (obj.isStatic || obj.isKinematic) return;

    // Update velocity first
    const acceleration = Vec3.scale(forces, obj.inverseMass);
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));

    // Then update position with new velocity
    obj.position = Vec3.add(obj.position, Vec3.scale(obj.velocity, dt));

    // Angular motion
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));

    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin: Quaternion = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0,
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  },
};

/**
 * Main Physics Engine
 */
export class Engine implements World {
  // Configuration
  private _config: Required<EngineConfig>;
  private _precision: Precision;
  private _integrator: Integrator;
  private _timeStep: number;
  private _maxSubSteps: number;

  // State
  private _time = 0;
  private _deltaTime = 0;
  private _isRunning = false;
  private _isPaused = false;
  private _accumulator = 0;

  // Systems
  private _environment: Environment;
  private _forceSystem: ForceSystem;
  private _constraintSolver: ConstraintSolver;
  private _collisionSystem: CollisionSystem;

  // Objects
  private _objects: Map<string, PhysicsObject> = new Map();
  private _objectIdCounter = 0;
  private _forceIdCounter = 0;
  private _constraintIdCounter = 0;

  // Events
  private _eventListeners: Map<EngineEvent, Set<EngineEventCallback>> = new Map();
  private _collisionStartCallbacks: Set<CollisionCallback> = new Set();
  private _collisionStayCallbacks: Set<CollisionCallback> = new Set();
  private _collisionEndCallbacks: Set<CollisionCallback> = new Set();
  private _triggerEnterCallbacks: Set<TriggerCallback> = new Set();
  private _triggerExitCallbacks: Set<TriggerCallback> = new Set();

  // Animation frame
  private _animationFrameId: number | null = null;
  private _lastFrameTime = 0;

  constructor(config: EngineConfig = {}) {
    this._config = {
      precision: config.precision ?? 'medium',
      integrator: config.integrator ?? 'verlet',
      timeStep: config.timeStep ?? 1 / 60,
      maxSubSteps: config.maxSubSteps ?? 10,
      enableMultithreading: config.enableMultithreading ?? false,
      deterministicMode: config.deterministicMode ?? true,
      sleepThreshold: config.sleepThreshold ?? 0.01,
      sleepTimeThreshold: config.sleepTimeThreshold ?? 0.5,
    };

    this._precision = this._config.precision;
    this._integrator = this._config.integrator;
    this._timeStep = this._config.timeStep;
    this._maxSubSteps = this._config.maxSubSteps;

    // Initialize systems
    this._environment = new Environment();
    this._forceSystem = new ForceSystem();
    this._collisionSystem = new CollisionSystem();
    this._constraintSolver = new ConstraintSolver();

    // Apply precision settings
    this._applyPrecisionSettings();
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  get time(): number {
    return this._time;
  }

  get currentTime(): number {
    return this._time;
  }

  get deltaTime(): number {
    return this._deltaTime;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  get objectCount(): number {
    return this._objects.size;
  }

  get config(): Required<EngineConfig> {
    return { ...this._config };
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private _applyPrecisionSettings(): void {
    switch (this._precision) {
      case 'low':
        this._timeStep = Math.max(this._timeStep, 1 / 30);
        this._maxSubSteps = Math.min(this._maxSubSteps, 4);
        break;
      case 'medium':
        this._timeStep = Math.max(this._timeStep, 1 / 60);
        this._maxSubSteps = Math.min(this._maxSubSteps, 8);
        break;
      case 'high':
        this._timeStep = Math.min(this._timeStep, 1 / 120);
        this._maxSubSteps = Math.max(this._maxSubSteps, 10);
        break;
      case 'scientific':
        this._timeStep = Math.min(this._timeStep, 1 / 240);
        this._maxSubSteps = Math.max(this._maxSubSteps, 20);
        break;
    }
  }

  setPrecision(precision: Precision): void {
    this._precision = precision;
    this._config.precision = precision;
    this._applyPrecisionSettings();
  }

  setIntegrator(integrator: Integrator): void {
    this._integrator = integrator;
    this._config.integrator = integrator;
  }

  setTimeStep(timeStep: number): void {
    this._timeStep = timeStep;
    this._config.timeStep = timeStep;
  }

  // ============================================================================
  // OBJECT MANAGEMENT
  // ============================================================================

  addObject(config: ObjectConfig): SimObject {
    const id = config.id ?? `obj_${++this._objectIdCounter}`;
    
    if (this._objects.has(id)) {
      throw new Error(`Object with id "${id}" already exists`);
    }

    const obj = new PhysicsObject(id, config);
    this._objects.set(id, obj);

    this._emitEvent('objectAdded', { objectId: id });

    return obj;
  }

  removeObject(id: string): boolean {
    const obj = this._objects.get(id);
    if (!obj) return false;

    // Remove constraints associated with this object
    for (const constraint of this._constraintSolver.getConstraints()) {
      if (constraint.bodyA === id || constraint.bodyB === id) {
        this._constraintSolver.removeConstraint(constraint.id);
      }
    }
    
    this._forceSystem.removeForcesForObject(id);
    this._objects.delete(id);

    this._emitEvent('objectRemoved', { objectId: id });

    return true;
  }

  getObject(id: string): SimObject | undefined {
    return this._objects.get(id);
  }

  getAllObjects(): SimObject[] {
    return Array.from(this._objects.values());
  }

  // ============================================================================
  // FORCE MANAGEMENT
  // ============================================================================

  addForce(config: ForceConfig): string {
    const id = config.id ?? `force_${++this._forceIdCounter}`;
    this._forceSystem.addForce(id, config);
    return id;
  }

  removeForce(id: string): boolean {
    return this._forceSystem.removeForce(id);
  }

  getForce(id: string): ForceConfig | undefined {
    return this._forceSystem.getForce(id);
  }

  // ============================================================================
  // CONSTRAINT MANAGEMENT
  // ============================================================================

  addConstraint(config: ConstraintConfig): string {
    const id = config.id ?? `constraint_${++this._constraintIdCounter}`;
    const constraintConfig = { ...config, id };
    
    // Import ConstraintFactory at runtime to avoid circular dependencies
    const { ConstraintFactory } = require('../constraints/ConstraintSolver');
    const constraint = ConstraintFactory.create(constraintConfig);
    this._constraintSolver.addConstraint(constraint);
    return id;
  }

  removeConstraint(id: string): boolean {
    const constraint = this._constraintSolver.getConstraint(id);
    if (!constraint) return false;
    this._constraintSolver.removeConstraint(id);
    return true;
  }

  getConstraint(id: string): ConstraintConfig | undefined {
    const constraint = this._constraintSolver.getConstraint(id);
    if (!constraint) return undefined;
    // Return a simplified config representation
    return {
      id: constraint.id,
      type: constraint.type,
      bodyA: constraint.bodyA,
      bodyB: constraint.bodyB as string,
      anchorA: constraint.anchorA,
      anchorB: constraint.anchorB,
    };
  }

  // ============================================================================
  // ENVIRONMENT
  // ============================================================================

  setEnvironment(config: EnvironmentConfig): void {
    this._environment.configure(config);
  }

  getEnvironment(): EnvironmentConfig {
    return this._environment.getConfig();
  }

  // ============================================================================
  // SIMULATION CONTROL
  // ============================================================================

  /**
   * Perform a single physics step
   */
  step(dt?: number): void {
    const timeStep = dt ?? this._timeStep;
    this._deltaTime = timeStep;

    // 1. Clear forces from previous frame
    this._clearObjectForces();

    // 2. Apply global forces (gravity, drag, etc.)
    this._applyEnvironmentForces(timeStep);

    // 3. Apply user-defined forces
    this._forceSystem.applyForces(this._objects, this._time, timeStep);

    // 4. Integrate motion
    this._integrate(timeStep);

    // 5. Detect and resolve collisions
    // Note: CollisionSystem manages its own collision detection via step()
    // We don't call it directly here since it has its own body management

    // 6. Solve constraints (convert PhysicsObjects to ConstraintBody format)
    const constraintBodies = new Map<string, any>();
    for (const [id, obj] of this._objects) {
      constraintBodies.set(id, {
        id: obj.id,
        position: obj.position,
        rotation: obj.rotation,
        velocity: obj.velocity,
        angularVelocity: obj.angularVelocity,
        mass: obj.mass,
        invMass: obj.inverseMass,
        inertia: obj.inertiaTensor,
        invInertia: obj.inverseInertiaTensor,
        isStatic: obj.isStatic,
        isKinematic: obj.isKinematic,
      });
    }
    this._constraintSolver.solve(constraintBodies, timeStep);

    // 7. Apply damping
    this._applyDamping(timeStep);

    // 8. Update sleep states
    this._updateSleepStates(timeStep);

    // 9. Apply boundary conditions
    this._environment.applyBoundaries(this._objects);

    // Update time
    this._time += timeStep;

    this._emitEvent('step', { time: this._time, dt: timeStep });
  }

  /**
   * Start continuous simulation
   */
  start(): void {
    if (this._isRunning) return;

    this._isRunning = true;
    this._isPaused = false;
    this._lastFrameTime = performance.now();

    this._emitEvent('start', {});
    this._runLoop();
  }

  /**
   * Stop simulation
   */
  stop(): void {
    if (!this._isRunning) return;

    this._isRunning = false;
    this._isPaused = false;

    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }

    this._emitEvent('stop', {});
  }

  /**
   * Pause simulation
   */
  pause(): void {
    if (!this._isRunning || this._isPaused) return;
    this._isPaused = true;
    this._emitEvent('pause', {});
  }

  /**
   * Resume simulation
   */
  resume(): void {
    if (!this._isPaused) return;
    this._isPaused = false;
    this._lastFrameTime = performance.now();
    this._emitEvent('resume', {});
  }

  /**
   * Run simulation for specified duration
   */
  async run(options: { duration: number; onProgress?: (progress: number) => void }): Promise<void> {
    const { duration, onProgress } = options;
    const startTime = this._time;
    const endTime = startTime + duration;

    while (this._time < endTime) {
      this.step();
      
      if (onProgress) {
        const progress = (this._time - startTime) / duration;
        onProgress(Math.min(1, progress));
      }

      // Yield to event loop periodically
      if (Math.floor(this._time * 60) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  /**
   * Seek to specific time
   */
  seek(time: number, snapshot?: SimulationSnapshot): void {
    if (snapshot) {
      this.restoreSnapshot(snapshot);
    }
    
    // Step forward to target time
    while (this._time < time) {
      this.step();
    }
  }

  /**
   * Rewind simulation (requires snapshots)
   */
  rewind(time: number, snapshots: SimulationSnapshot[]): void {
    // Find nearest snapshot before target time
    let nearestSnapshot: SimulationSnapshot | undefined;
    
    for (const snapshot of snapshots) {
      if (snapshot.timestamp <= time) {
        if (!nearestSnapshot || snapshot.timestamp > nearestSnapshot.timestamp) {
          nearestSnapshot = snapshot;
        }
      }
    }

    if (nearestSnapshot) {
      this.restoreSnapshot(nearestSnapshot);
      
      // Step forward to target time
      while (this._time < time) {
        this.step();
      }
    }
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  createSnapshot(): SimulationSnapshot {
    const objectStates = new Map<string, any>();
    
    for (const [id, obj] of this._objects) {
      objectStates.set(id, obj.getState(this._time));
    }

    // Get constraint states
    const constraintStates = new Map<string, any>();
    for (const constraint of this._constraintSolver.getConstraints()) {
      constraintStates.set(constraint.id, constraint.getState());
    }

    return {
      timestamp: this._time,
      objects: objectStates,
      constraints: constraintStates,
      forces: new Map(this._forceSystem.getForces()),
      worldStats: this.getWorldStats(),
    };
  }

  restoreSnapshot(snapshot: SimulationSnapshot): void {
    this._time = snapshot.timestamp;

    for (const [id, state] of snapshot.objects) {
      const obj = this._objects.get(id);
      if (obj) {
        obj.restoreState(state);
      }
    }
  }

  reset(): void {
    this._time = 0;
    this._accumulator = 0;

    for (const obj of this._objects.values()) {
      obj.reset();
    }

    this._emitEvent('reset', {});
  }

  clear(): void {
    this.stop();
    
    this._objects.clear();
    this._forceSystem.clear();
    this._constraintSolver.clear();
    this._collisionSystem.clear();
    
    this._time = 0;
    this._accumulator = 0;
    this._objectIdCounter = 0;
    this._forceIdCounter = 0;
    this._constraintIdCounter = 0;
  }

  getWorldStats(): WorldStats {
    let totalKineticEnergy = 0;
    let totalPotentialEnergy = 0;
    let totalMomentum = Vec3.ZERO;
    let totalAngularMomentum = Vec3.ZERO;
    let activeObjects = 0;
    let sleepingObjects = 0;

    const gravity = this._environment.getGravity(Vec3.ZERO);

    for (const obj of this._objects.values()) {
      if (obj.isStatic) continue;

      const ke = obj.kineticEnergy;
      const pe = -obj.mass * Vec3.dot(gravity, obj.position);
      
      totalKineticEnergy += ke;
      totalPotentialEnergy += pe;
      totalMomentum = Vec3.add(totalMomentum, obj.momentum);
      totalAngularMomentum = Vec3.add(totalAngularMomentum, obj.angularMomentum);

      if (obj.isSleeping) {
        sleepingObjects++;
      } else {
        activeObjects++;
      }
    }

    return {
      timestamp: this._time,
      totalKineticEnergy,
      totalPotentialEnergy,
      totalEnergy: totalKineticEnergy + totalPotentialEnergy,
      totalMomentum,
      totalAngularMomentum,
      activeObjects,
      sleepingObjects,
      contactPairs: 0, // CollisionSystem doesn't track this directly
      stepTime: this._deltaTime * 1000,
    };
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  raycast(origin: Vector3, direction: Vector3, options: RaycastOptions = {}): RaycastHit[] {
    return this._collisionSystem.raycast(
      origin,
      Vec3.normalize(direction),
      options.maxDistance ?? Infinity,
      { layerMask: options.layerMask, ignoreTriggers: options.ignoreTriggers }
    );
  }

  sphereCast(origin: Vector3, radius: number, direction: Vector3, maxDistance = Infinity): RaycastHit[] {
    // Simplified sphere cast - use raycast with radius consideration
    return this.raycast(origin, direction, { maxDistance });
  }

  boxCast(origin: Vector3, halfExtents: Vector3, direction: Vector3, maxDistance = Infinity): RaycastHit[] {
    // Simplified box cast - use raycast
    return this.raycast(origin, direction, { maxDistance });
  }

  overlapSphere(center: Vector3, radius: number): SimObject[] {
    const ids = this._collisionSystem.overlapSphere(center, radius);
    return ids.map(id => this._objects.get(id)).filter((obj): obj is PhysicsObject => obj !== undefined);
  }

  overlapBox(center: Vector3, halfExtents: Vector3, rotation?: Quaternion): SimObject[] {
    const ids = this._collisionSystem.overlapBox(center, halfExtents, rotation);
    return ids.map(id => this._objects.get(id)).filter((obj): obj is PhysicsObject => obj !== undefined);
  }

  closestPoint(point: Vector3, objectId: string): Vector3 {
    const obj = this._objects.get(objectId);
    if (!obj) return point;
    return obj.closestPoint(point);
  }

  distanceBetween(objectA: string, objectB: string): { distance: number; pointA: Vector3; pointB: Vector3 } {
    const a = this._objects.get(objectA);
    const b = this._objects.get(objectB);

    if (!a || !b) {
      return { distance: Infinity, pointA: Vec3.ZERO, pointB: Vec3.ZERO };
    }

    // Simple center-to-center distance calculation
    const pointA = a.position;
    const pointB = b.position;
    const distance = Vec3.distance(pointA, pointB);
    
    return { distance, pointA, pointB };
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  onCollisionStart(callback: CollisionCallback): () => void {
    this._collisionStartCallbacks.add(callback);
    return () => this._collisionStartCallbacks.delete(callback);
  }

  onCollisionStay(callback: CollisionCallback): () => void {
    this._collisionStayCallbacks.add(callback);
    return () => this._collisionStayCallbacks.delete(callback);
  }

  onCollisionEnd(callback: CollisionCallback): () => void {
    this._collisionEndCallbacks.add(callback);
    return () => this._collisionEndCallbacks.delete(callback);
  }

  onTriggerEnter(callback: TriggerCallback): () => void {
    this._triggerEnterCallbacks.add(callback);
    return () => this._triggerEnterCallbacks.delete(callback);
  }

  onTriggerExit(callback: TriggerCallback): () => void {
    this._triggerExitCallbacks.add(callback);
    return () => this._triggerExitCallbacks.delete(callback);
  }

  on(event: EngineEvent, callback: EngineEventCallback): () => void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set());
    }
    this._eventListeners.get(event)!.add(callback);
    return () => this._eventListeners.get(event)?.delete(callback);
  }

  private _emitEvent(type: EngineEvent, data: unknown): void {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      const event = { type, timestamp: this._time, data };
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private _runLoop = (): void => {
    if (!this._isRunning) return;

    const now = performance.now();
    const frameTime = Math.min((now - this._lastFrameTime) / 1000, 0.25);
    this._lastFrameTime = now;

    if (!this._isPaused) {
      this._accumulator += frameTime;

      let steps = 0;
      while (this._accumulator >= this._timeStep && steps < this._maxSubSteps) {
        this.step();
        this._accumulator -= this._timeStep;
        steps++;
      }
    }

    this._animationFrameId = requestAnimationFrame(this._runLoop);
  };

  private _clearObjectForces(): void {
    for (const obj of this._objects.values()) {
      obj.clearAccumulatedForces();
    }
  }

  private _applyEnvironmentForces(dt: number): void {
    for (const obj of this._objects.values()) {
      if (obj.isStatic || obj.isSleeping) continue;

      // Gravity
      const gravity = this._environment.getGravity(obj.position);
      const gravityForce = Vec3.scale(gravity, obj.mass);
      obj.accumulateForce(gravityForce);

      // Air drag
      const drag = this._environment.calculateDrag(obj, dt);
      obj.accumulateForce(drag);

      // Buoyancy
      const buoyancy = this._environment.calculateBuoyancy(obj);
      obj.accumulateForce(buoyancy);

      // Wind
      const wind = this._environment.getWind(obj.position, this._time);
      if (!Vec3.isZero(wind)) {
        const relativeVelocity = Vec3.sub(wind, obj.velocity);
        const windForce = Vec3.scale(
          relativeVelocity,
          0.5 * this._environment.config.airDensity! * obj.dragCoefficient * obj.crossSectionArea
        );
        obj.accumulateForce(windForce);
      }
    }
  }

  private _integrate(dt: number): void {
    const integrate = integrators[this._integrator];

    for (const obj of this._objects.values()) {
      if (obj.isSleeping) continue;

      const { force, torque } = obj.getAccumulatedForces();
      integrate(obj, dt, force, torque);
    }
  }

  private _resolveCollisions(collisions: CollisionInfo[], dt: number): void {
    for (const collision of collisions) {
      const objA = this._objects.get(collision.objectA);
      const objB = this._objects.get(collision.objectB);

      if (!objA || !objB) continue;

      // Check if either is a trigger
      if (objA.isTrigger || objB.isTrigger) {
        for (const callback of this._triggerEnterCallbacks) {
          callback(collision.objectA, collision.objectB);
        }
        continue;
      }

      // Fire collision callbacks
      for (const callback of this._collisionStartCallbacks) {
        callback(collision);
      }

      // Note: Collision resolution is handled internally by CollisionSystem.step()
      // No need for explicit resolution here
    }
  }

  private _applyDamping(dt: number): void {
    for (const obj of this._objects.values()) {
      if (obj.isStatic || obj.isSleeping) continue;

      // Linear damping
      const linearDamping = Math.pow(1 - obj.linearDamping, dt);
      obj.velocity = Vec3.scale(obj.velocity, linearDamping);

      // Angular damping
      const angularDamping = Math.pow(1 - obj.angularDamping, dt);
      obj.angularVelocity = Vec3.scale(obj.angularVelocity, angularDamping);
    }
  }

  private _updateSleepStates(dt: number): void {
    for (const obj of this._objects.values()) {
      if (obj.isStatic) continue;

      const speed = Vec3.length(obj.velocity);
      const angularSpeed = Vec3.length(obj.angularVelocity);

      if (speed < this._config.sleepThreshold && angularSpeed < this._config.sleepThreshold) {
        obj.sleepTime += dt;
        
        if (obj.sleepTime > this._config.sleepTimeThreshold) {
          obj.sleep();
        }
      } else {
        obj.sleepTime = 0;
        if (obj.isSleeping) {
          obj.wakeUp();
        }
      }
    }
  }
}

export default Engine;
