/**
 * ASIMULATE SDK - Environment
 * Handles gravity, atmosphere, boundaries, and environmental forces
 */

import type {
  EnvironmentConfig,
  EnvironmentPreset,
  BoundingVolume,
  Vector3,
  FluidField,
  GravityField,
  WindFunction,
  FieldFunction,
  BoundaryBehavior,
} from '../types';
import { Vec3 } from '../math';
import type { PhysicsObject } from '../core/PhysicsObject';

/**
 * Preset environment configurations
 */
export const EnvironmentPresets: Record<EnvironmentPreset, Partial<EnvironmentConfig>> = {
  earth: {
    gravity: { x: 0, y: -9.81, z: 0 },
    airDensity: 1.225,
    airViscosity: 1.81e-5,
    temperature: 293.15,
    pressure: 101325,
  },
  moon: {
    gravity: { x: 0, y: -1.62, z: 0 },
    airDensity: 0,
    airViscosity: 0,
    temperature: 250,
    pressure: 0,
  },
  mars: {
    gravity: { x: 0, y: -3.72, z: 0 },
    airDensity: 0.02,
    airViscosity: 1.2e-5,
    temperature: 210,
    pressure: 636,
  },
  jupiter: {
    gravity: { x: 0, y: -24.79, z: 0 },
    airDensity: 0.16,
    airViscosity: 0,
    temperature: 165,
    pressure: 100000,
  },
  space: {
    gravity: { x: 0, y: 0, z: 0 },
    airDensity: 0,
    airViscosity: 0,
    temperature: 2.7, // cosmic background
    pressure: 0,
  },
  underwater: {
    gravity: { x: 0, y: -9.81, z: 0 },
    airDensity: 1000, // water density
    airViscosity: 1.002e-3,
    temperature: 288.15,
    pressure: 202650, // ~2 atm at 10m depth
  },
  custom: {},
};

// Internal reference for backwards compatibility
const PRESETS = EnvironmentPresets;

/**
 * Environment class - manages world environment
 */
export class Environment {
  private _config: Required<EnvironmentConfig>;
  private _gravityField: GravityField | null = null;
  private _windFunction: WindFunction | null = null;
  private _magneticField: FieldFunction | null = null;
  private _electricField: FieldFunction | null = null;
  private _fluidFields: FluidField[] = [];

  constructor(config: EnvironmentConfig = {}) {
    this._config = this._createDefaultConfig();
    this.configure(config);
  }

  private _createDefaultConfig(): Required<EnvironmentConfig> {
    return {
      preset: 'earth',
      gravity: Vec3.create(0, -9.81, 0),
      airDensity: 1.225,
      airViscosity: 1.81e-5,
      temperature: 293.15,
      pressure: 101325,
      wind: Vec3.ZERO,
      fluidFields: [],
      magneticField: Vec3.ZERO,
      electricField: Vec3.ZERO,
      bounds: { type: 'none' },
      boundaryBehavior: 'reflect',
      boundaryCallback: () => {},
    };
  }

  /**
   * Configure the environment
   */
  configure(config: EnvironmentConfig): void {
    // Apply preset first
    if (config.preset && config.preset !== 'custom') {
      const preset = PRESETS[config.preset];
      Object.assign(this._config, preset);
    }

    // Then override with custom values
    if (config.gravity !== undefined) {
      if (typeof config.gravity === 'number') {
        this._config.gravity = Vec3.create(0, config.gravity, 0);
        this._gravityField = null;
      } else if ('type' in config.gravity) {
        this._gravityField = config.gravity as GravityField;
        this._config.gravity = Vec3.ZERO;
      } else {
        this._config.gravity = config.gravity as Vector3;
        this._gravityField = null;
      }
    }

    if (config.airDensity !== undefined) this._config.airDensity = config.airDensity;
    if (config.airViscosity !== undefined) this._config.airViscosity = config.airViscosity;
    if (config.temperature !== undefined) this._config.temperature = config.temperature;
    if (config.pressure !== undefined) this._config.pressure = config.pressure;

    if (config.wind !== undefined) {
      if (typeof config.wind === 'function') {
        this._windFunction = config.wind;
        this._config.wind = Vec3.ZERO;
      } else {
        this._config.wind = config.wind as Vector3;
        this._windFunction = null;
      }
    }

    if (config.fluidFields) {
      this._fluidFields = config.fluidFields;
    }

    if (config.magneticField !== undefined) {
      if (typeof config.magneticField === 'function') {
        this._magneticField = config.magneticField;
        this._config.magneticField = Vec3.ZERO;
      } else {
        this._config.magneticField = config.magneticField as Vector3;
        this._magneticField = null;
      }
    }

    if (config.electricField !== undefined) {
      if (typeof config.electricField === 'function') {
        this._electricField = config.electricField;
        this._config.electricField = Vec3.ZERO;
      } else {
        this._config.electricField = config.electricField as Vector3;
        this._electricField = null;
      }
    }

    if (config.bounds !== undefined) this._config.bounds = config.bounds;
    if (config.boundaryBehavior !== undefined) this._config.boundaryBehavior = config.boundaryBehavior;
    if (config.boundaryCallback !== undefined) this._config.boundaryCallback = config.boundaryCallback;
  }

  /**
   * Get current configuration
   */
  getConfig(): EnvironmentConfig {
    return { ...this._config };
  }

  get config(): Required<EnvironmentConfig> {
    return this._config;
  }

  /**
   * Get gravity at a specific position
   */
  getGravity(position: Vector3): Vector3 {
    if (this._gravityField) {
      switch (this._gravityField.type) {
        case 'constant':
          return this._gravityField.value ?? Vec3.ZERO;

        case 'radial': {
          const center = this._gravityField.center ?? Vec3.ZERO;
          const strength = this._gravityField.strength ?? 9.81;
          const dir = Vec3.sub(center, position);
          const distSq = Vec3.lengthSquared(dir);
          if (distSq < 0.0001) return Vec3.ZERO;
          const dist = Math.sqrt(distSq);
          return Vec3.scale(Vec3.normalize(dir), strength / distSq * dist);
        }

        case 'custom':
          return this._gravityField.customFn?.(position) ?? Vec3.ZERO;
      }
    }

    return this._config.gravity as Vector3;
  }

  /**
   * Get wind at a specific position and time
   */
  getWind(position: Vector3, time: number): Vector3 {
    if (this._windFunction) {
      return this._windFunction(position, time);
    }
    return this._config.wind as Vector3;
  }

  /**
   * Get magnetic field at position
   */
  getMagneticField(position: Vector3, time: number): Vector3 {
    if (this._magneticField) {
      return this._magneticField(position, time);
    }
    return this._config.magneticField as Vector3;
  }

  /**
   * Get electric field at position
   */
  getElectricField(position: Vector3, time: number): Vector3 {
    if (this._electricField) {
      return this._electricField(position, time);
    }
    return this._config.electricField as Vector3;
  }

  /**
   * Calculate air drag force on an object
   */
  calculateDrag(object: PhysicsObject, dt: number): Vector3 {
    const airDensity = this._config.airDensity;
    if (airDensity === 0) return Vec3.ZERO;

    const velocity = object.velocity;
    const speed = Vec3.length(velocity);
    if (speed < 0.0001) return Vec3.ZERO;

    // Drag force: F = 0.5 * rho * v^2 * Cd * A
    const dragMagnitude = 0.5 * airDensity * speed * speed * object.dragCoefficient * object.crossSectionArea;
    const dragDirection = Vec3.negate(Vec3.normalize(velocity));

    return Vec3.scale(dragDirection, dragMagnitude);
  }

  /**
   * Calculate buoyancy force on an object
   */
  calculateBuoyancy(object: PhysicsObject): Vector3 {
    // Check if object is in any fluid field
    for (const field of this._fluidFields) {
      if (this._isInBounds(object.position, field.bounds)) {
        // Buoyancy = rho_fluid * V * g
        const gravity = this.getGravity(object.position);
        const buoyancyMagnitude = field.density * object.volume * Vec3.length(gravity);
        return Vec3.scale(Vec3.negate(Vec3.normalize(gravity)), buoyancyMagnitude);
      }
    }

    return Vec3.ZERO;
  }

  /**
   * Calculate Lorentz force on charged object
   */
  calculateLorentzForce(object: PhysicsObject, time: number): Vector3 {
    if (object.charge === 0) return Vec3.ZERO;

    const E = this.getElectricField(object.position, time);
    const B = this.getMagneticField(object.position, time);

    // F = q(E + v × B)
    const electricForce = Vec3.scale(E, object.charge);
    const magneticForce = Vec3.scale(Vec3.cross(object.velocity, B), object.charge);

    return Vec3.add(electricForce, magneticForce);
  }

  /**
   * Apply boundary conditions to objects
   */
  applyBoundaries(objects: Map<string, PhysicsObject>): void {
    const bounds = this._config.bounds;
    if (!bounds || bounds.type === 'none') return;

    for (const obj of objects.values()) {
      if (obj.isStatic) continue;

      const outOfBounds = this._checkBounds(obj.position, bounds);
      if (outOfBounds) {
        this._handleBoundary(obj, bounds, this._config.boundaryBehavior);
      }
    }
  }

  private _isInBounds(position: Vector3, bounds: BoundingVolume): boolean {
    switch (bounds.type) {
      case 'box': {
        const center = bounds.center ?? Vec3.ZERO;
        const half = bounds.halfExtents ?? Vec3.ONE;
        const rel = Vec3.sub(position, center);
        return (
          Math.abs(rel.x) <= half.x &&
          Math.abs(rel.y) <= half.y &&
          Math.abs(rel.z) <= half.z
        );
      }

      case 'sphere': {
        const center = bounds.center ?? Vec3.ZERO;
        const radius = bounds.radius ?? 1;
        return Vec3.distanceSquared(position, center) <= radius * radius;
      }

      default:
        return true;
    }
  }

  private _checkBounds(position: Vector3, bounds: BoundingVolume): Vector3 | null {
    switch (bounds.type) {
      case 'box': {
        const center = bounds.center ?? Vec3.ZERO;
        const half = bounds.halfExtents ?? Vec3.ONE;
        const rel = Vec3.sub(position, center);

        if (
          Math.abs(rel.x) > half.x ||
          Math.abs(rel.y) > half.y ||
          Math.abs(rel.z) > half.z
        ) {
          return {
            x: Math.abs(rel.x) > half.x ? Math.sign(rel.x) : 0,
            y: Math.abs(rel.y) > half.y ? Math.sign(rel.y) : 0,
            z: Math.abs(rel.z) > half.z ? Math.sign(rel.z) : 0,
          };
        }
        return null;
      }

      case 'sphere': {
        const center = bounds.center ?? Vec3.ZERO;
        const radius = bounds.radius ?? 1;
        const dist = Vec3.distance(position, center);

        if (dist > radius) {
          return Vec3.normalize(Vec3.sub(position, center));
        }
        return null;
      }

      default:
        return null;
    }
  }

  private _handleBoundary(obj: PhysicsObject, bounds: BoundingVolume, behavior: BoundaryBehavior): void {
    switch (behavior) {
      case 'reflect': {
        const outDir = this._checkBounds(obj.position, bounds);
        if (!outDir) return;

        // Reflect velocity
        if (outDir.x !== 0) {
          obj.velocity.x *= -1;
          if (bounds.type === 'box') {
            const half = bounds.halfExtents?.x ?? 1;
            obj.position.x = (bounds.center?.x ?? 0) + half * Math.sign(outDir.x);
          }
        }
        if (outDir.y !== 0) {
          obj.velocity.y *= -1;
          if (bounds.type === 'box') {
            const half = bounds.halfExtents?.y ?? 1;
            obj.position.y = (bounds.center?.y ?? 0) + half * Math.sign(outDir.y);
          }
        }
        if (outDir.z !== 0) {
          obj.velocity.z *= -1;
          if (bounds.type === 'box') {
            const half = bounds.halfExtents?.z ?? 1;
            obj.position.z = (bounds.center?.z ?? 0) + half * Math.sign(outDir.z);
          }
        }

        // Damping on bounce
        obj.velocity = Vec3.scale(obj.velocity, obj.material.restitution);
        break;
      }

      case 'wrap': {
        const center = bounds.center ?? Vec3.ZERO;

        if (bounds.type === 'box') {
          const half = bounds.halfExtents ?? Vec3.ONE;
          const rel = Vec3.sub(obj.position, center);

          if (Math.abs(rel.x) > half.x) {
            obj.position.x = center.x - half.x * Math.sign(rel.x);
          }
          if (Math.abs(rel.y) > half.y) {
            obj.position.y = center.y - half.y * Math.sign(rel.y);
          }
          if (Math.abs(rel.z) > half.z) {
            obj.position.z = center.z - half.z * Math.sign(rel.z);
          }
        } else if (bounds.type === 'sphere') {
          const radius = bounds.radius ?? 1;
          const dir = Vec3.normalize(Vec3.sub(obj.position, center));
          obj.position = Vec3.add(center, Vec3.scale(dir, -radius + 0.01));
        }
        break;
      }

      case 'destroy':
        // Mark for removal (handled by engine)
        obj.customData._markedForRemoval = true;
        break;

      case 'custom':
        this._config.boundaryCallback?.(obj, bounds);
        break;
    }
  }
}

export default Environment;
