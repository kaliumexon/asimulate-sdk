/**
 * ASIMULATE SDK - Force System
 * Manages and applies various types of forces to physics objects
 */

import type {
  ForceConfig,
  ForceType,
  AppliedForce,
  ForceRecord,
  Vector3,
} from '../types';
import { Vec3, MathUtils } from '../math';
import type { PhysicsObject } from '../core/PhysicsObject';

/**
 * Simple 3D noise function for turbulence
 */
function noise3D(x: number, y: number, z: number, seed = 0): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Force System - manages all forces in the simulation
 */
export class ForceSystem {
  private _forces: Map<string, ForceConfig> = new Map();
  private _forceRecords: Map<string, AppliedForce[]> = new Map();

  /**
   * Add a force configuration
   */
  addForce(id: string, config: ForceConfig): void {
    this._forces.set(id, {
      ...config,
      id,
      enabled: config.enabled ?? true,
    });
  }

  /**
   * Remove a force
   */
  removeForce(id: string): boolean {
    return this._forces.delete(id);
  }

  /**
   * Get a force configuration
   */
  getForce(id: string): ForceConfig | undefined {
    return this._forces.get(id);
  }

  /**
   * Get all forces
   */
  getForces(): Map<string, ForceConfig> {
    return new Map(this._forces);
  }

  /**
   * Remove all forces targeting a specific object
   */
  removeForcesForObject(objectId: string): void {
    for (const [id, config] of this._forces) {
      if (config.target === objectId) {
        this._forces.delete(id);
      } else if (Array.isArray(config.target)) {
        const index = config.target.indexOf(objectId);
        if (index !== -1) {
          config.target.splice(index, 1);
          if (config.target.length === 0) {
            this._forces.delete(id);
          }
        }
      }
    }
  }

  /**
   * Clear all forces
   */
  clear(): void {
    this._forces.clear();
    this._forceRecords.clear();
  }

  /**
   * Apply all forces to objects
   */
  applyForces(objects: Map<string, PhysicsObject>, time: number, dt: number): void {
    this._forceRecords.clear();

    for (const [forceId, config] of this._forces) {
      if (!config.enabled) continue;

      // Check timing
      if (config.startTime !== undefined && time < config.startTime) continue;
      if (config.duration !== undefined && config.startTime !== undefined) {
        if (time > config.startTime + config.duration) continue;
      }

      // Get target objects
      const targets = this._getTargetObjects(config, objects);

      for (const obj of targets) {
        const appliedForce = this._calculateForce(config, obj, objects, time, dt);
        if (appliedForce) {
          obj.applyForce(appliedForce.force, appliedForce.applicationPoint);

          // Record the force
          if (!this._forceRecords.has(obj.id)) {
            this._forceRecords.set(obj.id, []);
          }
          this._forceRecords.get(obj.id)!.push({
            ...appliedForce,
            sourceId: forceId,
          });
        }
      }
    }
  }

  /**
   * Get recorded forces for an object at current time
   */
  getForceRecord(objectId: string, timestamp: number): ForceRecord {
    const forces = this._forceRecords.get(objectId) ?? [];
    
    let netForce = Vec3.ZERO;
    let netTorque = Vec3.ZERO;

    for (const f of forces) {
      netForce = Vec3.add(netForce, f.force);
      netTorque = Vec3.add(netTorque, f.torque);
    }

    return {
      timestamp,
      objectId,
      forces,
      netForce,
      netTorque,
    };
  }

  private _getTargetObjects(config: ForceConfig, objects: Map<string, PhysicsObject>): PhysicsObject[] {
    if (!config.target || config.target === 'all') {
      return Array.from(objects.values()).filter(o => !o.isStatic);
    }

    if (typeof config.target === 'string') {
      const obj = objects.get(config.target);
      return obj && !obj.isStatic ? [obj] : [];
    }

    return config.target
      .map(id => objects.get(id))
      .filter((o): o is PhysicsObject => o !== undefined && !o.isStatic);
  }

  private _calculateForce(
    config: ForceConfig,
    obj: PhysicsObject,
    objects: Map<string, PhysicsObject>,
    time: number,
    dt: number
  ): AppliedForce | null {
    switch (config.type) {
      case 'constant':
        return this._applyConstantForce(config, obj);

      case 'impulse':
        return this._applyImpulse(config, obj, time);

      case 'torque':
        return this._applyTorqueForce(config, obj);

      case 'spring':
        return this._applySpringForce(config, obj, objects);

      case 'attractor':
        return this._applyAttractorForce(config, obj);

      case 'repulsor':
        return this._applyRepulsorForce(config, obj);

      case 'thruster':
        return this._applyThrusterForce(config, obj);

      case 'explosion':
        return this._applyExplosionForce(config, obj, time);

      case 'force-field':
        return this._applyForceField(config, obj, time);

      case 'vortex-field':
        return this._applyVortexField(config, obj);

      case 'noise-field':
        return this._applyNoiseField(config, obj, time);

      default:
        return null;
    }
  }

  private _applyConstantForce(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;

    if (!direction) return null;

    const force = Vec3.scale(Vec3.normalize(direction), magnitude);
    const point = this._parseVector3(config.point) ?? Vec3.ZERO;

    return {
      type: 'constant',
      sourceId: null,
      force,
      applicationPoint: obj.localToWorld(point),
      torque: Vec3.ZERO,
    };
  }

  private _applyImpulse(config: ForceConfig, obj: PhysicsObject, time: number): AppliedForce | null {
    // Impulse only applies once at startTime
    const startTime = config.startTime ?? 0;
    if (Math.abs(time - startTime) > 0.001) return null;

    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;

    if (!direction) return null;

    const impulse = Vec3.scale(Vec3.normalize(direction), magnitude);
    const point = this._parseVector3(config.point);

    // Apply impulse directly
    obj.applyImpulse(impulse, point);

    return {
      type: 'impulse',
      sourceId: null,
      force: impulse,
      applicationPoint: point ? obj.localToWorld(point) : obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyTorqueForce(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;

    if (!direction) return null;

    const torque = Vec3.scale(Vec3.normalize(direction), magnitude);
    obj.applyTorque(torque);

    return {
      type: 'torque',
      sourceId: null,
      force: Vec3.ZERO,
      applicationPoint: obj.position,
      torque,
    };
  }

  private _applySpringForce(
    config: ForceConfig,
    obj: PhysicsObject,
    objects: Map<string, PhysicsObject>
  ): AppliedForce | null {
    const anchorA = this._parseVector3(config.anchorA) ?? Vec3.ZERO;
    let anchorB = this._parseVector3(config.anchorB);
    
    // If anchorB references another object
    if (config.target && typeof config.target === 'string') {
      const targetObj = objects.get(config.target);
      if (targetObj) {
        anchorB = targetObj.localToWorld(anchorB ?? Vec3.ZERO);
      }
    }

    if (!anchorB) return null;

    const pointA = obj.localToWorld(anchorA);
    const direction = Vec3.sub(anchorB, pointA);
    const distance = Vec3.length(direction);
    const restLength = config.restLength ?? 0;
    const stiffness = config.stiffness ?? 100;
    const damping = config.damping ?? 1;

    // Hooke's law: F = -k * (x - x0)
    const stretch = distance - restLength;
    const normalizedDir = distance > 0 ? Vec3.scale(direction, 1 / distance) : Vec3.ZERO;

    // Spring force
    let forceMag = stiffness * stretch;

    // Damping force (based on relative velocity)
    const relVelocity = Vec3.dot(obj.velocity, normalizedDir);
    forceMag += damping * relVelocity;

    const force = Vec3.scale(normalizedDir, forceMag);

    return {
      type: 'spring',
      sourceId: null,
      force,
      applicationPoint: pointA,
      torque: Vec3.ZERO,
    };
  }

  private _applyAttractorForce(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 100;
    const maxDistance = config.maxDistance ?? Infinity;

    const direction = Vec3.sub(center, obj.position);
    const distance = Vec3.length(direction);

    if (distance > maxDistance || distance < 0.001) return null;

    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude;

    // Apply falloff
    forceMag *= this._calculateFalloff(config, distance);

    const force = Vec3.scale(normalizedDir, forceMag);

    return {
      type: 'attractor',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyRepulsorForce(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 100;
    const maxDistance = config.maxDistance ?? Infinity;

    const direction = Vec3.sub(obj.position, center);
    const distance = Vec3.length(direction);

    if (distance > maxDistance || distance < 0.001) return null;

    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude;

    // Apply falloff
    forceMag *= this._calculateFalloff(config, distance);

    const force = Vec3.scale(normalizedDir, forceMag);

    return {
      type: 'repulsor',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyThrusterForce(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1000;
    const point = this._parseVector3(config.point) ?? Vec3.ZERO;

    if (!direction) return null;

    // Transform direction to world space (relative to object)
    const worldDir = obj.localToWorld(direction);
    const localDir = Vec3.sub(worldDir, obj.position);
    const force = Vec3.scale(Vec3.normalize(localDir), magnitude);
    const applicationPoint = obj.localToWorld(point);

    return {
      type: 'thruster',
      sourceId: null,
      force,
      applicationPoint,
      torque: Vec3.ZERO,
    };
  }

  private _applyExplosionForce(config: ForceConfig, obj: PhysicsObject, time: number): AppliedForce | null {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 10000;
    const maxDistance = config.maxDistance ?? 10;
    const startTime = config.startTime ?? 0;
    const duration = config.duration ?? 0.1;

    // Explosion only applies during its duration
    if (time < startTime || time > startTime + duration) return null;

    const direction = Vec3.sub(obj.position, center);
    const distance = Vec3.length(direction);

    if (distance > maxDistance || distance < 0.001) return null;

    // Time falloff (strongest at start)
    const timeFactor = 1 - (time - startTime) / duration;

    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude * timeFactor;

    // Quadratic falloff with distance
    forceMag *= Math.pow(1 - distance / maxDistance, 2);

    const force = Vec3.scale(normalizedDir, forceMag);

    return {
      type: 'explosion',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyForceField(config: ForceConfig, obj: PhysicsObject, time: number): AppliedForce | null {
    if (!config.fieldFunction) return null;

    const force = config.fieldFunction(obj.position, obj.velocity, time);

    return {
      type: 'force-field',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyVortexField(config: ForceConfig, obj: PhysicsObject): AppliedForce | null {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const axis = Vec3.normalize(this._parseVector3(config.axis) ?? Vec3.UP);
    const tangentialStrength = config.tangentialStrength ?? 100;
    const radialStrength = config.radialStrength ?? -10;
    const maxDistance = config.maxDistance ?? Infinity;

    // Vector from center to object
    const toObj = Vec3.sub(obj.position, center);
    
    // Project onto plane perpendicular to axis
    const alongAxis = Vec3.scale(axis, Vec3.dot(toObj, axis));
    const radial = Vec3.sub(toObj, alongAxis);
    const distance = Vec3.length(radial);

    if (distance > maxDistance || distance < 0.001) return null;

    const radialNorm = Vec3.scale(radial, 1 / distance);
    
    // Tangential direction (perpendicular to radial and axis)
    const tangential = Vec3.cross(axis, radialNorm);

    // Combined force
    const tangentForce = Vec3.scale(tangential, tangentialStrength);
    const radialForce = Vec3.scale(radialNorm, radialStrength);
    const force = Vec3.add(tangentForce, radialForce);

    return {
      type: 'vortex-field',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _applyNoiseField(config: ForceConfig, obj: PhysicsObject, time: number): AppliedForce | null {
    const frequency = config.frequency ?? 1;
    const amplitude = config.amplitude ?? 100;
    const octaves = config.octaves ?? 3;

    let fx = 0, fy = 0, fz = 0;
    let amp = amplitude;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
      const px = obj.position.x * freq + time;
      const py = obj.position.y * freq + time;
      const pz = obj.position.z * freq + time;

      fx += (noise3D(px, py, pz, 0) - 0.5) * 2 * amp;
      fy += (noise3D(px, py, pz, 100) - 0.5) * 2 * amp;
      fz += (noise3D(px, py, pz, 200) - 0.5) * 2 * amp;

      amp *= 0.5;
      freq *= 2;
    }

    const force = Vec3.create(fx, fy, fz);

    return {
      type: 'noise-field',
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO,
    };
  }

  private _calculateFalloff(config: ForceConfig, distance: number): number {
    const maxDistance = config.maxDistance ?? Infinity;
    
    switch (config.falloff) {
      case 'none':
        return 1;

      case 'linear':
        return Math.max(0, 1 - distance / maxDistance);

      case 'quadratic':
        return Math.max(0, Math.pow(1 - distance / maxDistance, 2));

      case 'custom':
        return config.falloffFunction?.(distance) ?? 1;

      default:
        return 1;
    }
  }

  private _parseVector3(value?: Vector3 | [number, number, number]): Vector3 | undefined {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return Vec3.fromArray(value);
    }
    return value;
  }
}

export default ForceSystem;
