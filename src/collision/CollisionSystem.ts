/**
 * ASIMULATE SDK - Collision Detection System
 * Complete collision detection with broad phase, narrow phase, and resolution
 */

import {
  Vector3,
  Quaternion,
  Matrix3,
  CollisionInfo,
  ContactPoint,
  RaycastHit,
  BoundingBox,
  ObjectType
} from '../types';
import { Vec3, Quat, Mat3 } from '../math';

// ============================================================================
// AABB (Axis-Aligned Bounding Box)
// ============================================================================

export interface AABB {
  min: Vector3;
  max: Vector3;
}

export const AABBUtils = {
  create(min: Vector3 = { x: 0, y: 0, z: 0 }, max: Vector3 = { x: 0, y: 0, z: 0 }): AABB {
    return { min: { ...min }, max: { ...max } };
  },

  fromCenterExtents(center: Vector3, halfExtents: Vector3): AABB {
    return {
      min: Vec3.sub(center, halfExtents),
      max: Vec3.add(center, halfExtents)
    };
  },

  fromPoints(points: Vector3[]): AABB {
    if (points.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const min = { ...points[0] };
    const max = { ...points[0] };

    for (const p of points) {
      min.x = Math.min(min.x, p.x);
      min.y = Math.min(min.y, p.y);
      min.z = Math.min(min.z, p.z);
      max.x = Math.max(max.x, p.x);
      max.y = Math.max(max.y, p.y);
      max.z = Math.max(max.z, p.z);
    }

    return { min, max };
  },

  center(aabb: AABB): Vector3 {
    return {
      x: (aabb.min.x + aabb.max.x) * 0.5,
      y: (aabb.min.y + aabb.max.y) * 0.5,
      z: (aabb.min.z + aabb.max.z) * 0.5
    };
  },

  extents(aabb: AABB): Vector3 {
    return {
      x: (aabb.max.x - aabb.min.x) * 0.5,
      y: (aabb.max.y - aabb.min.y) * 0.5,
      z: (aabb.max.z - aabb.min.z) * 0.5
    };
  },

  size(aabb: AABB): Vector3 {
    return Vec3.sub(aabb.max, aabb.min);
  },

  volume(aabb: AABB): number {
    const s = AABBUtils.size(aabb);
    return s.x * s.y * s.z;
  },

  surfaceArea(aabb: AABB): number {
    const s = AABBUtils.size(aabb);
    return 2 * (s.x * s.y + s.y * s.z + s.z * s.x);
  },

  intersects(a: AABB, b: AABB): boolean {
    return (
      a.min.x <= b.max.x && a.max.x >= b.min.x &&
      a.min.y <= b.max.y && a.max.y >= b.min.y &&
      a.min.z <= b.max.z && a.max.z >= b.min.z
    );
  },

  contains(aabb: AABB, point: Vector3): boolean {
    return (
      point.x >= aabb.min.x && point.x <= aabb.max.x &&
      point.y >= aabb.min.y && point.y <= aabb.max.y &&
      point.z >= aabb.min.z && point.z <= aabb.max.z
    );
  },

  containsAABB(outer: AABB, inner: AABB): boolean {
    return (
      outer.min.x <= inner.min.x && outer.max.x >= inner.max.x &&
      outer.min.y <= inner.min.y && outer.max.y >= inner.max.y &&
      outer.min.z <= inner.min.z && outer.max.z >= inner.max.z
    );
  },

  merge(a: AABB, b: AABB): AABB {
    return {
      min: Vec3.min(a.min, b.min),
      max: Vec3.max(a.max, b.max)
    };
  },

  expand(aabb: AABB, amount: number): AABB {
    return {
      min: { x: aabb.min.x - amount, y: aabb.min.y - amount, z: aabb.min.z - amount },
      max: { x: aabb.max.x + amount, y: aabb.max.y + amount, z: aabb.max.z + amount }
    };
  },

  expandByVelocity(aabb: AABB, velocity: Vector3, dt: number): AABB {
    const result = { min: { ...aabb.min }, max: { ...aabb.max } };
    const displacement = Vec3.scale(velocity, dt);

    if (displacement.x > 0) result.max.x += displacement.x;
    else result.min.x += displacement.x;

    if (displacement.y > 0) result.max.y += displacement.y;
    else result.min.y += displacement.y;

    if (displacement.z > 0) result.max.z += displacement.z;
    else result.min.z += displacement.z;

    return result;
  },

  closestPoint(aabb: AABB, point: Vector3): Vector3 {
    return {
      x: Math.max(aabb.min.x, Math.min(point.x, aabb.max.x)),
      y: Math.max(aabb.min.y, Math.min(point.y, aabb.max.y)),
      z: Math.max(aabb.min.z, Math.min(point.z, aabb.max.z))
    };
  },

  rayIntersect(aabb: AABB, origin: Vector3, direction: Vector3): { hit: boolean; tMin: number; tMax: number } {
    let tMin = -Infinity;
    let tMax = Infinity;

    const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];

    for (const axis of axes) {
      if (Math.abs(direction[axis]) < 1e-10) {
        if (origin[axis] < aabb.min[axis] || origin[axis] > aabb.max[axis]) {
          return { hit: false, tMin: 0, tMax: 0 };
        }
      } else {
        const invD = 1 / direction[axis];
        let t1 = (aabb.min[axis] - origin[axis]) * invD;
        let t2 = (aabb.max[axis] - origin[axis]) * invD;

        if (t1 > t2) [t1, t2] = [t2, t1];

        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);

        if (tMin > tMax) {
          return { hit: false, tMin: 0, tMax: 0 };
        }
      }
    }

    return { hit: tMax >= 0, tMin: Math.max(0, tMin), tMax };
  }
};

// ============================================================================
// Collider Shapes
// ============================================================================

export interface ColliderBase {
  type: string;
  offset: Vector3;
  rotation: Quaternion;
  isTrigger: boolean;
}

export interface SphereCollider extends ColliderBase {
  type: 'sphere';
  radius: number;
}

export interface BoxCollider extends ColliderBase {
  type: 'box';
  halfExtents: Vector3;
}

export interface CylinderCollider extends ColliderBase {
  type: 'cylinder';
  radius: number;
  halfHeight: number;
}

export interface CapsuleCollider extends ColliderBase {
  type: 'capsule';
  radius: number;
  halfHeight: number;
}

export interface PlaneCollider extends ColliderBase {
  type: 'plane';
  normal: Vector3;
  distance: number;
}

export interface MeshCollider extends ColliderBase {
  type: 'mesh';
  vertices: Vector3[];
  indices: number[];
  isConvex: boolean;
}

export type Collider = SphereCollider | BoxCollider | CylinderCollider | CapsuleCollider | PlaneCollider | MeshCollider;

// ============================================================================
// Collision Body (wrapper for physics objects in collision system)
// ============================================================================

export interface CollisionBody {
  id: string;
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  collider: Collider;
  aabb: AABB;
  isStatic: boolean;
  isKinematic: boolean;
  isSleeping: boolean;
  collisionGroup: number;
  collisionMask: number;
  mass: number;
  invMass: number;
  inertia: Matrix3;
  invInertia: Matrix3;
  friction: number;
  restitution: number;
}

// ============================================================================
// Broad Phase - Spatial Partitioning
// ============================================================================

export interface BroadPhasePair {
  bodyA: string;
  bodyB: string;
}

export interface BroadPhase {
  insert(body: CollisionBody): void;
  remove(id: string): void;
  update(body: CollisionBody): void;
  queryPairs(): BroadPhasePair[];
  queryAABB(aabb: AABB): string[];
  queryRay(origin: Vector3, direction: Vector3, maxDistance: number): string[];
  querySphere(center: Vector3, radius: number): string[];
  clear(): void;
}

/**
 * Simple Sweep and Prune (SAP) broad phase
 */
export class SweepAndPrune implements BroadPhase {
  private bodies: Map<string, CollisionBody> = new Map();
  private xAxis: Array<{ id: string; value: number; isMin: boolean }> = [];
  private dirty: boolean = true;

  insert(body: CollisionBody): void {
    this.bodies.set(body.id, body);
    this.xAxis.push(
      { id: body.id, value: body.aabb.min.x, isMin: true },
      { id: body.id, value: body.aabb.max.x, isMin: false }
    );
    this.dirty = true;
  }

  remove(id: string): void {
    this.bodies.delete(id);
    this.xAxis = this.xAxis.filter(e => e.id !== id);
    this.dirty = true;
  }

  update(body: CollisionBody): void {
    this.bodies.set(body.id, body);
    for (const endpoint of this.xAxis) {
      if (endpoint.id === body.id) {
        endpoint.value = endpoint.isMin ? body.aabb.min.x : body.aabb.max.x;
      }
    }
    this.dirty = true;
  }

  queryPairs(): BroadPhasePair[] {
    if (this.dirty) {
      this.xAxis.sort((a, b) => a.value - b.value);
      this.dirty = false;
    }

    const pairs: BroadPhasePair[] = [];
    const active = new Set<string>();

    for (const endpoint of this.xAxis) {
      if (endpoint.isMin) {
        const bodyA = this.bodies.get(endpoint.id);
        if (!bodyA) continue;

        for (const otherId of active) {
          const bodyB = this.bodies.get(otherId);
          if (!bodyB) continue;

          // Check collision masks
          if ((bodyA.collisionGroup & bodyB.collisionMask) === 0 ||
              (bodyB.collisionGroup & bodyA.collisionMask) === 0) {
            continue;
          }

          // Full AABB test (Y and Z axes)
          if (AABBUtils.intersects(bodyA.aabb, bodyB.aabb)) {
            pairs.push({ bodyA: endpoint.id, bodyB: otherId });
          }
        }

        active.add(endpoint.id);
      } else {
        active.delete(endpoint.id);
      }
    }

    return pairs;
  }

  queryAABB(aabb: AABB): string[] {
    const results: string[] = [];
    for (const [id, body] of this.bodies) {
      if (AABBUtils.intersects(aabb, body.aabb)) {
        results.push(id);
      }
    }
    return results;
  }

  queryRay(origin: Vector3, direction: Vector3, maxDistance: number): string[] {
    const results: string[] = [];
    const normalizedDir = Vec3.normalize(direction);

    for (const [id, body] of this.bodies) {
      const result = AABBUtils.rayIntersect(body.aabb, origin, normalizedDir);
      if (result.hit && result.tMin <= maxDistance) {
        results.push(id);
      }
    }

    return results;
  }

  querySphere(center: Vector3, radius: number): string[] {
    const results: string[] = [];
    const sphereAABB = AABBUtils.fromCenterExtents(center, { x: radius, y: radius, z: radius });

    for (const [id, body] of this.bodies) {
      if (AABBUtils.intersects(sphereAABB, body.aabb)) {
        // More accurate sphere vs AABB test
        const closest = AABBUtils.closestPoint(body.aabb, center);
        const distSq = Vec3.lengthSq(Vec3.sub(closest, center));
        if (distSq <= radius * radius) {
          results.push(id);
        }
      }
    }

    return results;
  }

  clear(): void {
    this.bodies.clear();
    this.xAxis = [];
    this.dirty = true;
  }
}

/**
 * Spatial Hash Grid for uniform distribution
 */
export class SpatialHashGrid implements BroadPhase {
  private cellSize: number;
  private invCellSize: number;
  private cells: Map<string, Set<string>> = new Map();
  private bodies: Map<string, CollisionBody> = new Map();
  private bodyToCells: Map<string, string[]> = new Map();

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
  }

  private hashPosition(x: number, y: number, z: number): string {
    const ix = Math.floor(x * this.invCellSize);
    const iy = Math.floor(y * this.invCellSize);
    const iz = Math.floor(z * this.invCellSize);
    return `${ix},${iy},${iz}`;
  }

  private getCellsForAABB(aabb: AABB): string[] {
    const cells: string[] = [];
    const minX = Math.floor(aabb.min.x * this.invCellSize);
    const minY = Math.floor(aabb.min.y * this.invCellSize);
    const minZ = Math.floor(aabb.min.z * this.invCellSize);
    const maxX = Math.floor(aabb.max.x * this.invCellSize);
    const maxY = Math.floor(aabb.max.y * this.invCellSize);
    const maxZ = Math.floor(aabb.max.z * this.invCellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          cells.push(`${x},${y},${z}`);
        }
      }
    }

    return cells;
  }

  insert(body: CollisionBody): void {
    this.bodies.set(body.id, body);
    const cells = this.getCellsForAABB(body.aabb);
    this.bodyToCells.set(body.id, cells);

    for (const cell of cells) {
      if (!this.cells.has(cell)) {
        this.cells.set(cell, new Set());
      }
      this.cells.get(cell)!.add(body.id);
    }
  }

  remove(id: string): void {
    const cells = this.bodyToCells.get(id);
    if (cells) {
      for (const cell of cells) {
        this.cells.get(cell)?.delete(id);
      }
    }
    this.bodyToCells.delete(id);
    this.bodies.delete(id);
  }

  update(body: CollisionBody): void {
    this.remove(body.id);
    this.insert(body);
  }

  queryPairs(): BroadPhasePair[] {
    const pairs: BroadPhasePair[] = [];
    const checked = new Set<string>();

    for (const [cellKey, cellBodies] of this.cells) {
      const bodyArray = Array.from(cellBodies);

      for (let i = 0; i < bodyArray.length; i++) {
        const idA = bodyArray[i];
        const bodyA = this.bodies.get(idA);
        if (!bodyA) continue;

        for (let j = i + 1; j < bodyArray.length; j++) {
          const idB = bodyArray[j];
          const pairKey = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;

          if (checked.has(pairKey)) continue;
          checked.add(pairKey);

          const bodyB = this.bodies.get(idB);
          if (!bodyB) continue;

          // Check collision masks
          if ((bodyA.collisionGroup & bodyB.collisionMask) === 0 ||
              (bodyB.collisionGroup & bodyA.collisionMask) === 0) {
            continue;
          }

          if (AABBUtils.intersects(bodyA.aabb, bodyB.aabb)) {
            pairs.push({ bodyA: idA, bodyB: idB });
          }
        }
      }
    }

    return pairs;
  }

  queryAABB(aabb: AABB): string[] {
    const cells = this.getCellsForAABB(aabb);
    const results = new Set<string>();

    for (const cell of cells) {
      const cellBodies = this.cells.get(cell);
      if (cellBodies) {
        for (const id of cellBodies) {
          const body = this.bodies.get(id);
          if (body && AABBUtils.intersects(aabb, body.aabb)) {
            results.add(id);
          }
        }
      }
    }

    return Array.from(results);
  }

  queryRay(origin: Vector3, direction: Vector3, maxDistance: number): string[] {
    // Simple implementation - check all potential cells along ray
    const normalizedDir = Vec3.normalize(direction);
    const results = new Set<string>();
    const step = this.cellSize * 0.5;
    const steps = Math.ceil(maxDistance / step);

    for (let i = 0; i <= steps; i++) {
      const t = i * step;
      const point = Vec3.add(origin, Vec3.scale(normalizedDir, t));
      const cell = this.hashPosition(point.x, point.y, point.z);
      const cellBodies = this.cells.get(cell);

      if (cellBodies) {
        for (const id of cellBodies) {
          const body = this.bodies.get(id);
          if (body) {
            const hit = AABBUtils.rayIntersect(body.aabb, origin, normalizedDir);
            if (hit.hit && hit.tMin <= maxDistance) {
              results.add(id);
            }
          }
        }
      }
    }

    return Array.from(results);
  }

  querySphere(center: Vector3, radius: number): string[] {
    const aabb = AABBUtils.fromCenterExtents(center, { x: radius, y: radius, z: radius });
    const candidates = this.queryAABB(aabb);
    const results: string[] = [];

    for (const id of candidates) {
      const body = this.bodies.get(id);
      if (body) {
        const closest = AABBUtils.closestPoint(body.aabb, center);
        const distSq = Vec3.lengthSq(Vec3.sub(closest, center));
        if (distSq <= radius * radius) {
          results.push(id);
        }
      }
    }

    return results;
  }

  clear(): void {
    this.cells.clear();
    this.bodies.clear();
    this.bodyToCells.clear();
  }
}

// ============================================================================
// Narrow Phase - Actual Collision Detection
// ============================================================================

export interface ContactManifold {
  bodyA: string;
  bodyB: string;
  contacts: ContactPoint[];
  normal: Vector3;
  penetration: number;
  isTrigger: boolean;
}

export class NarrowPhase {
  /**
   * Test collision between two bodies and generate contact manifold
   */
  static testCollision(bodyA: CollisionBody, bodyB: CollisionBody): ContactManifold | null {
    const typeA = bodyA.collider.type;
    const typeB = bodyB.collider.type;

    // Transform colliders to world space
    const posA = Vec3.add(bodyA.position, Quat.rotateVector(bodyA.rotation, bodyA.collider.offset));
    const posB = Vec3.add(bodyB.position, Quat.rotateVector(bodyB.rotation, bodyB.collider.offset));
    const rotA = Quat.multiply(bodyA.rotation, bodyA.collider.rotation);
    const rotB = Quat.multiply(bodyB.rotation, bodyB.collider.rotation);

    let result: ContactManifold | null = null;

    // Dispatch to appropriate test function
    if (typeA === 'sphere' && typeB === 'sphere') {
      result = this.sphereVsSphere(bodyA, bodyB, posA, posB);
    } else if (typeA === 'sphere' && typeB === 'box') {
      result = this.sphereVsBox(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === 'box' && typeB === 'sphere') {
      result = this.sphereVsBox(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === 'sphere' && typeB === 'plane') {
      result = this.sphereVsPlane(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === 'plane' && typeB === 'sphere') {
      result = this.sphereVsPlane(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === 'box' && typeB === 'box') {
      result = this.boxVsBox(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === 'box' && typeB === 'plane') {
      result = this.boxVsPlane(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === 'plane' && typeB === 'box') {
      result = this.boxVsPlane(bodyB, bodyA, posB, posA, rotB, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === 'sphere' && typeB === 'capsule') {
      result = this.sphereVsCapsule(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === 'capsule' && typeB === 'sphere') {
      result = this.sphereVsCapsule(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === 'capsule' && typeB === 'capsule') {
      result = this.capsuleVsCapsule(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === 'capsule' && typeB === 'plane') {
      result = this.capsuleVsPlane(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === 'plane' && typeB === 'capsule') {
      result = this.capsuleVsPlane(bodyB, bodyA, posB, posA, rotB, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    }

    if (result) {
      result.isTrigger = bodyA.collider.isTrigger || bodyB.collider.isTrigger;
    }

    return result;
  }

  private static flipManifold(manifold: ContactManifold): ContactManifold {
    return {
      ...manifold,
      bodyA: manifold.bodyB,
      bodyB: manifold.bodyA,
      normal: Vec3.negate(manifold.normal),
      contacts: manifold.contacts.map(c => ({
        ...c,
        localA: c.localB,
        localB: c.localA,
        normal: Vec3.negate(c.normal)
      }))
    };
  }

  /**
   * Sphere vs Sphere collision
   */
  private static sphereVsSphere(
    bodyA: CollisionBody,
    bodyB: CollisionBody,
    posA: Vector3,
    posB: Vector3
  ): ContactManifold | null {
    const colliderA = bodyA.collider as SphereCollider;
    const colliderB = bodyB.collider as SphereCollider;

    const diff = Vec3.sub(posB, posA);
    const distSq = Vec3.lengthSq(diff);
    const radiusSum = colliderA.radius + colliderB.radius;

    if (distSq > radiusSum * radiusSum) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-6 ? Vec3.scale(diff, 1 / dist) : { x: 0, y: 1, z: 0 };
    const penetration = radiusSum - dist;

    const contactPoint = Vec3.add(posA, Vec3.scale(normal, colliderA.radius - penetration * 0.5));

    return {
      bodyA: bodyA.id,
      bodyB: bodyB.id,
      normal,
      penetration,
      isTrigger: false,
      contacts: [{
        position: contactPoint,
        localA: Vec3.sub(contactPoint, bodyA.position),
        localB: Vec3.sub(contactPoint, bodyB.position),
        normal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      }]
    };
  }

  /**
   * Sphere vs Box collision
   */
  private static sphereVsBox(
    sphereBody: CollisionBody,
    boxBody: CollisionBody,
    spherePos: Vector3,
    boxPos: Vector3,
    boxRot: Quaternion
  ): ContactManifold | null {
    const sphere = sphereBody.collider as SphereCollider;
    const box = boxBody.collider as BoxCollider;

    // Transform sphere center to box local space
    const invBoxRot = Quat.conjugate(boxRot);
    const localSpherePos = Quat.rotateVector(invBoxRot, Vec3.sub(spherePos, boxPos));

    // Find closest point on box to sphere center
    const closest = {
      x: Math.max(-box.halfExtents.x, Math.min(localSpherePos.x, box.halfExtents.x)),
      y: Math.max(-box.halfExtents.y, Math.min(localSpherePos.y, box.halfExtents.y)),
      z: Math.max(-box.halfExtents.z, Math.min(localSpherePos.z, box.halfExtents.z))
    };

    const diff = Vec3.sub(localSpherePos, closest);
    const distSq = Vec3.lengthSq(diff);

    if (distSq > sphere.radius * sphere.radius) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    let localNormal: Vector3;
    let penetration: number;

    if (dist > 1e-6) {
      // Sphere center outside box
      localNormal = Vec3.scale(diff, 1 / dist);
      penetration = sphere.radius - dist;
    } else {
      // Sphere center inside box - find closest face
      const dx = box.halfExtents.x - Math.abs(localSpherePos.x);
      const dy = box.halfExtents.y - Math.abs(localSpherePos.y);
      const dz = box.halfExtents.z - Math.abs(localSpherePos.z);

      if (dx <= dy && dx <= dz) {
        localNormal = { x: localSpherePos.x > 0 ? 1 : -1, y: 0, z: 0 };
        penetration = dx + sphere.radius;
      } else if (dy <= dz) {
        localNormal = { x: 0, y: localSpherePos.y > 0 ? 1 : -1, z: 0 };
        penetration = dy + sphere.radius;
      } else {
        localNormal = { x: 0, y: 0, z: localSpherePos.z > 0 ? 1 : -1 };
        penetration = dz + sphere.radius;
      }
    }

    // Transform back to world space
    const worldNormal = Quat.rotateVector(boxRot, localNormal);
    const worldClosest = Vec3.add(boxPos, Quat.rotateVector(boxRot, closest));
    const contactPoint = Vec3.add(worldClosest, Vec3.scale(worldNormal, penetration * 0.5));

    return {
      bodyA: sphereBody.id,
      bodyB: boxBody.id,
      normal: worldNormal,
      penetration,
      isTrigger: false,
      contacts: [{
        position: contactPoint,
        localA: Vec3.sub(contactPoint, sphereBody.position),
        localB: Vec3.sub(contactPoint, boxBody.position),
        normal: worldNormal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      }]
    };
  }

  /**
   * Sphere vs Plane collision
   */
  private static sphereVsPlane(
    sphereBody: CollisionBody,
    planeBody: CollisionBody,
    spherePos: Vector3,
    planePos: Vector3,
    planeRot: Quaternion
  ): ContactManifold | null {
    const sphere = sphereBody.collider as SphereCollider;
    const plane = planeBody.collider as PlaneCollider;

    // Get world space normal
    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
    
    // Distance from sphere center to plane
    const toSphere = Vec3.sub(spherePos, planePos);
    const distance = Vec3.dot(toSphere, worldNormal) - plane.distance;

    if (distance > sphere.radius) {
      return null;
    }

    const penetration = sphere.radius - distance;
    const contactPoint = Vec3.sub(spherePos, Vec3.scale(worldNormal, sphere.radius - penetration * 0.5));

    return {
      bodyA: sphereBody.id,
      bodyB: planeBody.id,
      normal: worldNormal,
      penetration,
      isTrigger: false,
      contacts: [{
        position: contactPoint,
        localA: Vec3.sub(contactPoint, sphereBody.position),
        localB: Vec3.sub(contactPoint, planeBody.position),
        normal: worldNormal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      }]
    };
  }

  /**
   * Box vs Box collision using SAT (Separating Axis Theorem)
   */
  private static boxVsBox(
    bodyA: CollisionBody,
    bodyB: CollisionBody,
    posA: Vector3,
    posB: Vector3,
    rotA: Quaternion,
    rotB: Quaternion
  ): ContactManifold | null {
    const boxA = bodyA.collider as BoxCollider;
    const boxB = bodyB.collider as BoxCollider;

    // Get rotation matrices
    const matA = Quat.toMatrix3(rotA);
    const matB = Quat.toMatrix3(rotB);

    // Box axes in world space
    const axesA = [
      { x: matA[0], y: matA[1], z: matA[2] },
      { x: matA[3], y: matA[4], z: matA[5] },
      { x: matA[6], y: matA[7], z: matA[8] }
    ];
    const axesB = [
      { x: matB[0], y: matB[1], z: matB[2] },
      { x: matB[3], y: matB[4], z: matB[5] },
      { x: matB[6], y: matB[7], z: matB[8] }
    ];

    const extentsA = [boxA.halfExtents.x, boxA.halfExtents.y, boxA.halfExtents.z];
    const extentsB = [boxB.halfExtents.x, boxB.halfExtents.y, boxB.halfExtents.z];

    const diff = Vec3.sub(posB, posA);

    let minPenetration = Infinity;
    let minAxis: Vector3 = { x: 0, y: 1, z: 0 };

    // Test 15 axes (3 from A + 3 from B + 9 cross products)
    const testAxis = (axis: Vector3): boolean => {
      const len = Vec3.length(axis);
      if (len < 1e-6) return true; // Skip degenerate axes

      const normalizedAxis = Vec3.scale(axis, 1 / len);

      // Project extents onto axis
      let radiusA = 0;
      let radiusB = 0;

      for (let i = 0; i < 3; i++) {
        radiusA += extentsA[i] * Math.abs(Vec3.dot(axesA[i], normalizedAxis));
        radiusB += extentsB[i] * Math.abs(Vec3.dot(axesB[i], normalizedAxis));
      }

      const distance = Math.abs(Vec3.dot(diff, normalizedAxis));
      const penetration = radiusA + radiusB - distance;

      if (penetration < 0) return false; // Separating axis found

      if (penetration < minPenetration) {
        minPenetration = penetration;
        minAxis = Vec3.dot(diff, normalizedAxis) < 0 
          ? Vec3.negate(normalizedAxis) 
          : normalizedAxis;
      }

      return true;
    };

    // Test face axes
    for (const axis of axesA) {
      if (!testAxis(axis)) return null;
    }
    for (const axis of axesB) {
      if (!testAxis(axis)) return null;
    }

    // Test edge-edge axes
    for (const aAxis of axesA) {
      for (const bAxis of axesB) {
        if (!testAxis(Vec3.cross(aAxis, bAxis))) return null;
      }
    }

    // Generate contact points
    const contacts = this.generateBoxBoxContacts(
      posA, rotA, boxA.halfExtents,
      posB, rotB, boxB.halfExtents,
      minAxis, minPenetration
    );

    return {
      bodyA: bodyA.id,
      bodyB: bodyB.id,
      normal: minAxis,
      penetration: minPenetration,
      isTrigger: false,
      contacts
    };
  }

  /**
   * Generate contact points for box-box collision
   */
  private static generateBoxBoxContacts(
    posA: Vector3, rotA: Quaternion, extentsA: Vector3,
    posB: Vector3, rotB: Quaternion, extentsB: Vector3,
    normal: Vector3, penetration: number
  ): ContactPoint[] {
    // Simplified: generate single contact point at center of penetration
    const contactPoint = Vec3.lerp(posA, posB, 0.5);

    return [{
      position: contactPoint,
      localA: Quat.rotateVector(Quat.conjugate(rotA), Vec3.sub(contactPoint, posA)),
      localB: Quat.rotateVector(Quat.conjugate(rotB), Vec3.sub(contactPoint, posB)),
      normal,
      normalForce: 0,
      frictionForce: { x: 0, y: 0, z: 0 }
    }];
  }

  /**
   * Box vs Plane collision
   */
  private static boxVsPlane(
    boxBody: CollisionBody,
    planeBody: CollisionBody,
    boxPos: Vector3,
    planePos: Vector3,
    boxRot: Quaternion,
    planeRot: Quaternion
  ): ContactManifold | null {
    const box = boxBody.collider as BoxCollider;
    const plane = planeBody.collider as PlaneCollider;

    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
    const planeD = Vec3.dot(planePos, worldNormal) + plane.distance;

    // Get box vertices in world space
    const vertices: Vector3[] = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const local = {
            x: x * box.halfExtents.x,
            y: y * box.halfExtents.y,
            z: z * box.halfExtents.z
          };
          vertices.push(Vec3.add(boxPos, Quat.rotateVector(boxRot, local)));
        }
      }
    }

    // Find vertices below the plane
    const contacts: ContactPoint[] = [];
    let maxPenetration = 0;

    for (const v of vertices) {
      const distance = Vec3.dot(v, worldNormal) - planeD;
      if (distance < 0) {
        const penetration = -distance;
        maxPenetration = Math.max(maxPenetration, penetration);

        const contactPoint = Vec3.sub(v, Vec3.scale(worldNormal, distance * 0.5));
        contacts.push({
          position: contactPoint,
          localA: Vec3.sub(contactPoint, boxBody.position),
          localB: Vec3.sub(contactPoint, planeBody.position),
          normal: worldNormal,
          normalForce: 0,
          frictionForce: { x: 0, y: 0, z: 0 }
        });
      }
    }

    if (contacts.length === 0) {
      return null;
    }

    return {
      bodyA: boxBody.id,
      bodyB: planeBody.id,
      normal: worldNormal,
      penetration: maxPenetration,
      isTrigger: false,
      contacts
    };
  }

  /**
   * Sphere vs Capsule collision
   */
  private static sphereVsCapsule(
    sphereBody: CollisionBody,
    capsuleBody: CollisionBody,
    spherePos: Vector3,
    capsulePos: Vector3,
    capsuleRot: Quaternion
  ): ContactManifold | null {
    const sphere = sphereBody.collider as SphereCollider;
    const capsule = capsuleBody.collider as CapsuleCollider;

    // Capsule axis in world space
    const axis = Quat.rotateVector(capsuleRot, { x: 0, y: 1, z: 0 });
    const halfAxis = Vec3.scale(axis, capsule.halfHeight);

    // Line segment endpoints
    const p0 = Vec3.sub(capsulePos, halfAxis);
    const p1 = Vec3.add(capsulePos, halfAxis);

    // Find closest point on capsule axis to sphere center
    const d = Vec3.sub(p1, p0);
    const t = Math.max(0, Math.min(1, Vec3.dot(Vec3.sub(spherePos, p0), d) / Vec3.lengthSq(d)));
    const closest = Vec3.add(p0, Vec3.scale(d, t));

    // Sphere-sphere test with closest point
    const diff = Vec3.sub(spherePos, closest);
    const distSq = Vec3.lengthSq(diff);
    const radiusSum = sphere.radius + capsule.radius;

    if (distSq > radiusSum * radiusSum) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-6 ? Vec3.scale(diff, 1 / dist) : { x: 0, y: 1, z: 0 };
    const penetration = radiusSum - dist;

    const contactPoint = Vec3.add(closest, Vec3.scale(normal, capsule.radius - penetration * 0.5));

    return {
      bodyA: sphereBody.id,
      bodyB: capsuleBody.id,
      normal,
      penetration,
      isTrigger: false,
      contacts: [{
        position: contactPoint,
        localA: Vec3.sub(contactPoint, sphereBody.position),
        localB: Vec3.sub(contactPoint, capsuleBody.position),
        normal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      }]
    };
  }

  /**
   * Capsule vs Capsule collision
   */
  private static capsuleVsCapsule(
    bodyA: CollisionBody,
    bodyB: CollisionBody,
    posA: Vector3,
    posB: Vector3,
    rotA: Quaternion,
    rotB: Quaternion
  ): ContactManifold | null {
    const capsuleA = bodyA.collider as CapsuleCollider;
    const capsuleB = bodyB.collider as CapsuleCollider;

    // Get capsule axes
    const axisA = Quat.rotateVector(rotA, { x: 0, y: 1, z: 0 });
    const axisB = Quat.rotateVector(rotB, { x: 0, y: 1, z: 0 });

    // Line segment endpoints
    const a0 = Vec3.sub(posA, Vec3.scale(axisA, capsuleA.halfHeight));
    const a1 = Vec3.add(posA, Vec3.scale(axisA, capsuleA.halfHeight));
    const b0 = Vec3.sub(posB, Vec3.scale(axisB, capsuleB.halfHeight));
    const b1 = Vec3.add(posB, Vec3.scale(axisB, capsuleB.halfHeight));

    // Find closest points between line segments
    const { pointA, pointB } = this.closestPointsOnSegments(a0, a1, b0, b1);

    // Sphere-sphere test
    const diff = Vec3.sub(pointA, pointB);
    const distSq = Vec3.lengthSq(diff);
    const radiusSum = capsuleA.radius + capsuleB.radius;

    if (distSq > radiusSum * radiusSum) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-6 ? Vec3.scale(diff, 1 / dist) : { x: 0, y: 1, z: 0 };
    const penetration = radiusSum - dist;

    const contactPoint = Vec3.lerp(pointA, pointB, 0.5);

    return {
      bodyA: bodyA.id,
      bodyB: bodyB.id,
      normal,
      penetration,
      isTrigger: false,
      contacts: [{
        position: contactPoint,
        localA: Vec3.sub(contactPoint, bodyA.position),
        localB: Vec3.sub(contactPoint, bodyB.position),
        normal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      }]
    };
  }

  /**
   * Capsule vs Plane collision
   */
  private static capsuleVsPlane(
    capsuleBody: CollisionBody,
    planeBody: CollisionBody,
    capsulePos: Vector3,
    planePos: Vector3,
    capsuleRot: Quaternion,
    planeRot: Quaternion
  ): ContactManifold | null {
    const capsule = capsuleBody.collider as CapsuleCollider;
    const plane = planeBody.collider as PlaneCollider;

    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
    const planeD = Vec3.dot(planePos, worldNormal) + plane.distance;

    // Capsule axis
    const axis = Quat.rotateVector(capsuleRot, { x: 0, y: 1, z: 0 });
    const halfAxis = Vec3.scale(axis, capsule.halfHeight);

    // Test both endpoints
    const p0 = Vec3.sub(capsulePos, halfAxis);
    const p1 = Vec3.add(capsulePos, halfAxis);

    const d0 = Vec3.dot(p0, worldNormal) - planeD;
    const d1 = Vec3.dot(p1, worldNormal) - planeD;

    const contacts: ContactPoint[] = [];
    let maxPenetration = 0;

    if (d0 < capsule.radius) {
      const penetration = capsule.radius - d0;
      maxPenetration = Math.max(maxPenetration, penetration);
      const contactPoint = Vec3.sub(p0, Vec3.scale(worldNormal, d0 - penetration * 0.5));
      contacts.push({
        position: contactPoint,
        localA: Vec3.sub(contactPoint, capsuleBody.position),
        localB: Vec3.sub(contactPoint, planeBody.position),
        normal: worldNormal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      });
    }

    if (d1 < capsule.radius) {
      const penetration = capsule.radius - d1;
      maxPenetration = Math.max(maxPenetration, penetration);
      const contactPoint = Vec3.sub(p1, Vec3.scale(worldNormal, d1 - penetration * 0.5));
      contacts.push({
        position: contactPoint,
        localA: Vec3.sub(contactPoint, capsuleBody.position),
        localB: Vec3.sub(contactPoint, planeBody.position),
        normal: worldNormal,
        normalForce: 0,
        frictionForce: { x: 0, y: 0, z: 0 }
      });
    }

    if (contacts.length === 0) {
      return null;
    }

    return {
      bodyA: capsuleBody.id,
      bodyB: planeBody.id,
      normal: worldNormal,
      penetration: maxPenetration,
      isTrigger: false,
      contacts
    };
  }

  /**
   * Find closest points between two line segments
   */
  private static closestPointsOnSegments(
    a0: Vector3, a1: Vector3,
    b0: Vector3, b1: Vector3
  ): { pointA: Vector3; pointB: Vector3 } {
    const d1 = Vec3.sub(a1, a0);
    const d2 = Vec3.sub(b1, b0);
    const r = Vec3.sub(a0, b0);

    const a = Vec3.dot(d1, d1);
    const e = Vec3.dot(d2, d2);
    const f = Vec3.dot(d2, r);

    let s: number;
    let t: number;

    if (a <= 1e-6 && e <= 1e-6) {
      // Both segments are points
      return { pointA: a0, pointB: b0 };
    }

    if (a <= 1e-6) {
      // First segment is a point
      s = 0;
      t = Math.max(0, Math.min(1, f / e));
    } else {
      const c = Vec3.dot(d1, r);
      if (e <= 1e-6) {
        // Second segment is a point
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else {
        // General case
        const b = Vec3.dot(d1, d2);
        const denom = a * e - b * b;

        if (denom !== 0) {
          s = Math.max(0, Math.min(1, (b * f - c * e) / denom));
        } else {
          s = 0;
        }

        t = (b * s + f) / e;

        if (t < 0) {
          t = 0;
          s = Math.max(0, Math.min(1, -c / a));
        } else if (t > 1) {
          t = 1;
          s = Math.max(0, Math.min(1, (b - c) / a));
        }
      }
    }

    return {
      pointA: Vec3.add(a0, Vec3.scale(d1, s)),
      pointB: Vec3.add(b0, Vec3.scale(d2, t))
    };
  }
}

// ============================================================================
// Contact Solver - Impulse-based collision resolution
// ============================================================================

export class ContactSolver {
  private velocityIterations: number = 8;
  private positionIterations: number = 3;
  private baumgarte: number = 0.2; // Position correction factor
  private slop: number = 0.005; // Penetration allowance

  constructor(options?: {
    velocityIterations?: number;
    positionIterations?: number;
    baumgarte?: number;
    slop?: number;
  }) {
    if (options?.velocityIterations) this.velocityIterations = options.velocityIterations;
    if (options?.positionIterations) this.positionIterations = options.positionIterations;
    if (options?.baumgarte) this.baumgarte = options.baumgarte;
    if (options?.slop) this.slop = options.slop;
  }

  /**
   * Solve all contacts for velocity and position
   */
  solve(
    bodies: Map<string, CollisionBody>,
    manifolds: ContactManifold[],
    dt: number
  ): void {
    // Skip triggers
    const physicalManifolds = manifolds.filter(m => !m.isTrigger);

    // Pre-calculate contact data
    const contacts = this.prepareContacts(bodies, physicalManifolds);

    // Velocity solving
    for (let i = 0; i < this.velocityIterations; i++) {
      this.solveVelocities(bodies, contacts);
    }

    // Position solving
    for (let i = 0; i < this.positionIterations; i++) {
      this.solvePositions(bodies, physicalManifolds);
    }
  }

  private prepareContacts(
    bodies: Map<string, CollisionBody>,
    manifolds: ContactManifold[]
  ): PreparedContact[] {
    const contacts: PreparedContact[] = [];

    for (const manifold of manifolds) {
      const bodyA = bodies.get(manifold.bodyA);
      const bodyB = bodies.get(manifold.bodyB);
      if (!bodyA || !bodyB) continue;

      for (const contact of manifold.contacts) {
        const rA = contact.localA;
        const rB = contact.localB;
        const n = manifold.normal;

        // Calculate effective mass
        const rnA = Vec3.cross(rA, n);
        const rnB = Vec3.cross(rB, n);

        const kNormal = bodyA.invMass + bodyB.invMass +
          Vec3.dot(rnA, Mat3.multiplyVector(bodyA.invInertia, rnA)) +
          Vec3.dot(rnB, Mat3.multiplyVector(bodyB.invInertia, rnB));

        // Calculate friction tangents
        const dv = this.getRelativeVelocity(bodyA, bodyB, rA, rB);
        const vn = Vec3.dot(dv, n);
        let tangent = Vec3.sub(dv, Vec3.scale(n, vn));
        const tangentLen = Vec3.length(tangent);

        if (tangentLen > 1e-6) {
          tangent = Vec3.scale(tangent, 1 / tangentLen);
        } else {
          // Generate arbitrary tangent
          if (Math.abs(n.x) < 0.9) {
            tangent = Vec3.normalize(Vec3.cross(n, { x: 1, y: 0, z: 0 }));
          } else {
            tangent = Vec3.normalize(Vec3.cross(n, { x: 0, y: 1, z: 0 }));
          }
        }

        const bitangent = Vec3.cross(n, tangent);

        // Friction effective mass
        const rtA = Vec3.cross(rA, tangent);
        const rtB = Vec3.cross(rB, tangent);
        const kTangent = bodyA.invMass + bodyB.invMass +
          Vec3.dot(rtA, Mat3.multiplyVector(bodyA.invInertia, rtA)) +
          Vec3.dot(rtB, Mat3.multiplyVector(bodyB.invInertia, rtB));

        const rbA = Vec3.cross(rA, bitangent);
        const rbB = Vec3.cross(rB, bitangent);
        const kBitangent = bodyA.invMass + bodyB.invMass +
          Vec3.dot(rbA, Mat3.multiplyVector(bodyA.invInertia, rbA)) +
          Vec3.dot(rbB, Mat3.multiplyVector(bodyB.invInertia, rbB));

        // Restitution
        const restitution = Math.min(bodyA.restitution, bodyB.restitution);
        const friction = Math.sqrt(bodyA.friction * bodyB.friction);

        contacts.push({
          bodyA: manifold.bodyA,
          bodyB: manifold.bodyB,
          rA,
          rB,
          normal: n,
          tangent,
          bitangent,
          normalMass: kNormal > 0 ? 1 / kNormal : 0,
          tangentMass: kTangent > 0 ? 1 / kTangent : 0,
          bitangentMass: kBitangent > 0 ? 1 / kBitangent : 0,
          restitution,
          friction,
          velocityBias: restitution * Math.min(0, vn + 1), // Threshold
          normalImpulse: 0,
          tangentImpulse: 0,
          bitangentImpulse: 0
        });
      }
    }

    return contacts;
  }

  private solveVelocities(
    bodies: Map<string, CollisionBody>,
    contacts: PreparedContact[]
  ): void {
    for (const contact of contacts) {
      const bodyA = bodies.get(contact.bodyA);
      const bodyB = bodies.get(contact.bodyB);
      if (!bodyA || !bodyB) continue;

      // Get relative velocity
      const dv = this.getRelativeVelocity(bodyA, bodyB, contact.rA, contact.rB);

      // Normal impulse
      const vn = Vec3.dot(dv, contact.normal);
      let lambda = contact.normalMass * (-vn + contact.velocityBias);

      // Clamp accumulated impulse
      const oldImpulse = contact.normalImpulse;
      contact.normalImpulse = Math.max(0, oldImpulse + lambda);
      lambda = contact.normalImpulse - oldImpulse;

      // Apply normal impulse
      const impulse = Vec3.scale(contact.normal, lambda);
      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, impulse);

      // Friction impulse
      const maxFriction = contact.friction * contact.normalImpulse;

      // Tangent
      const vt = Vec3.dot(dv, contact.tangent);
      let lambdaT = contact.tangentMass * (-vt);

      const oldTangent = contact.tangentImpulse;
      contact.tangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldTangent + lambdaT));
      lambdaT = contact.tangentImpulse - oldTangent;

      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, Vec3.scale(contact.tangent, lambdaT));

      // Bitangent
      const vb = Vec3.dot(dv, contact.bitangent);
      let lambdaB = contact.bitangentMass * (-vb);

      const oldBitangent = contact.bitangentImpulse;
      contact.bitangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldBitangent + lambdaB));
      lambdaB = contact.bitangentImpulse - oldBitangent;

      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, Vec3.scale(contact.bitangent, lambdaB));
    }
  }

  private solvePositions(
    bodies: Map<string, CollisionBody>,
    manifolds: ContactManifold[]
  ): void {
    for (const manifold of manifolds) {
      const bodyA = bodies.get(manifold.bodyA);
      const bodyB = bodies.get(manifold.bodyB);
      if (!bodyA || !bodyB) continue;

      for (const contact of manifold.contacts) {
        // Recalculate penetration
        const worldA = Vec3.add(bodyA.position, Quat.rotateVector(bodyA.rotation, contact.localA));
        const worldB = Vec3.add(bodyB.position, Quat.rotateVector(bodyB.rotation, contact.localB));
        const separation = Vec3.dot(Vec3.sub(worldB, worldA), manifold.normal);

        // Baumgarte stabilization
        const correction = Math.max(0, -separation - this.slop) * this.baumgarte;

        if (correction > 0) {
          const totalInvMass = bodyA.invMass + bodyB.invMass;
          if (totalInvMass > 0) {
            const correctionVec = Vec3.scale(manifold.normal, correction / totalInvMass);

            if (!bodyA.isStatic && !bodyA.isKinematic) {
              bodyA.position = Vec3.sub(bodyA.position, Vec3.scale(correctionVec, bodyA.invMass));
            }
            if (!bodyB.isStatic && !bodyB.isKinematic) {
              bodyB.position = Vec3.add(bodyB.position, Vec3.scale(correctionVec, bodyB.invMass));
            }
          }
        }
      }
    }
  }

  private getRelativeVelocity(
    bodyA: CollisionBody,
    bodyB: CollisionBody,
    rA: Vector3,
    rB: Vector3
  ): Vector3 {
    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB));
    return Vec3.sub(velB, velA);
  }

  private applyImpulse(
    bodyA: CollisionBody,
    bodyB: CollisionBody,
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

    if (!bodyB.isStatic && !bodyB.isKinematic) {
      bodyB.velocity = Vec3.add(bodyB.velocity, Vec3.scale(impulse, bodyB.invMass));
      bodyB.angularVelocity = Vec3.add(
        bodyB.angularVelocity,
        Mat3.multiplyVector(bodyB.invInertia, Vec3.cross(rB, impulse))
      );
    }
  }
}

interface PreparedContact {
  bodyA: string;
  bodyB: string;
  rA: Vector3;
  rB: Vector3;
  normal: Vector3;
  tangent: Vector3;
  bitangent: Vector3;
  normalMass: number;
  tangentMass: number;
  bitangentMass: number;
  restitution: number;
  friction: number;
  velocityBias: number;
  normalImpulse: number;
  tangentImpulse: number;
  bitangentImpulse: number;
}

// ============================================================================
// Main Collision System
// ============================================================================

export interface CollisionSystemConfig {
  broadPhase?: 'sap' | 'spatial-hash';
  cellSize?: number; // For spatial hash
  velocityIterations?: number;
  positionIterations?: number;
  continuousCollisionDetection?: boolean;
}

export class CollisionSystem {
  private broadPhase: BroadPhase;
  private solver: ContactSolver;
  private bodies: Map<string, CollisionBody> = new Map();
  private activeManifolds: Map<string, ContactManifold> = new Map();
  private ccd: boolean;

  // Callbacks
  private onCollisionStart: ((info: CollisionInfo) => void)[] = [];
  private onCollisionStay: ((info: CollisionInfo) => void)[] = [];
  private onCollisionEnd: ((info: CollisionInfo) => void)[] = [];
  private onTriggerEnter: ((info: CollisionInfo) => void)[] = [];
  private onTriggerExit: ((info: CollisionInfo) => void)[] = [];

  constructor(config: CollisionSystemConfig = {}) {
    if (config.broadPhase === 'spatial-hash') {
      this.broadPhase = new SpatialHashGrid(config.cellSize || 10);
    } else {
      this.broadPhase = new SweepAndPrune();
    }

    this.solver = new ContactSolver({
      velocityIterations: config.velocityIterations,
      positionIterations: config.positionIterations
    });

    this.ccd = config.continuousCollisionDetection ?? false;
  }

  addBody(body: CollisionBody): void {
    this.bodies.set(body.id, body);
    this.broadPhase.insert(body);
  }

  removeBody(id: string): void {
    this.bodies.delete(id);
    this.broadPhase.remove(id);

    // Clean up manifolds
    for (const [key, manifold] of this.activeManifolds) {
      if (manifold.bodyA === id || manifold.bodyB === id) {
        this.activeManifolds.delete(key);
      }
    }
  }

  updateBody(body: CollisionBody): void {
    this.bodies.set(body.id, body);
    this.broadPhase.update(body);
  }

  /**
   * Main collision detection and resolution step
   */
  step(dt: number): CollisionInfo[] {
    // Get broad phase pairs
    const pairs = this.broadPhase.queryPairs();

    // Narrow phase collision detection
    const newManifolds = new Map<string, ContactManifold>();
    const collisions: CollisionInfo[] = [];

    for (const pair of pairs) {
      const bodyA = this.bodies.get(pair.bodyA);
      const bodyB = this.bodies.get(pair.bodyB);
      if (!bodyA || !bodyB) continue;

      // Skip static-static pairs
      if (bodyA.isStatic && bodyB.isStatic) continue;

      // Skip sleeping pairs
      if (bodyA.isSleeping && bodyB.isSleeping) continue;

      const manifold = NarrowPhase.testCollision(bodyA, bodyB);
      if (manifold) {
        const key = this.manifoldKey(pair.bodyA, pair.bodyB);
        newManifolds.set(key, manifold);

        // Create collision info
        const info = this.manifoldToCollisionInfo(manifold, bodyA, bodyB);
        collisions.push(info);

        // Fire callbacks
        if (!this.activeManifolds.has(key)) {
          if (manifold.isTrigger) {
            this.onTriggerEnter.forEach(cb => cb(info));
          } else {
            this.onCollisionStart.forEach(cb => cb(info));
          }
        } else {
          if (!manifold.isTrigger) {
            this.onCollisionStay.forEach(cb => cb(info));
          }
        }
      }
    }

    // Check for ended collisions
    for (const [key, manifold] of this.activeManifolds) {
      if (!newManifolds.has(key)) {
        const bodyA = this.bodies.get(manifold.bodyA);
        const bodyB = this.bodies.get(manifold.bodyB);
        if (bodyA && bodyB) {
          const info = this.manifoldToCollisionInfo(manifold, bodyA, bodyB);
          if (manifold.isTrigger) {
            this.onTriggerExit.forEach(cb => cb(info));
          } else {
            this.onCollisionEnd.forEach(cb => cb(info));
          }
        }
      }
    }

    this.activeManifolds = newManifolds;

    // Solve contacts
    this.solver.solve(this.bodies, Array.from(newManifolds.values()), dt);

    return collisions;
  }

  private manifoldKey(a: string, b: string): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
  }

  private manifoldToCollisionInfo(
    manifold: ContactManifold,
    bodyA: CollisionBody,
    bodyB: CollisionBody
  ): CollisionInfo {
    const relVel = Vec3.sub(bodyB.velocity, bodyA.velocity);

    return {
      objectA: manifold.bodyA,
      objectB: manifold.bodyB,
      contactPoints: manifold.contacts,
      normal: manifold.normal,
      penetrationDepth: manifold.penetration,
      impulse: { x: 0, y: 0, z: 0 }, // Calculated during solving
      relativeVelocity: relVel
    };
  }

  // Query methods
  raycast(
    origin: Vector3,
    direction: Vector3,
    maxDistance: number,
    options?: { layerMask?: number; ignoreTriggers?: boolean }
  ): RaycastHit[] {
    const normalizedDir = Vec3.normalize(direction);
    const candidates = this.broadPhase.queryRay(origin, normalizedDir, maxDistance);
    const hits: RaycastHit[] = [];

    for (const id of candidates) {
      const body = this.bodies.get(id);
      if (!body) continue;

      if (options?.layerMask !== undefined && (body.collisionGroup & options.layerMask) === 0) {
        continue;
      }

      if (options?.ignoreTriggers && body.collider.isTrigger) {
        continue;
      }

      const hit = this.raycastBody(origin, normalizedDir, maxDistance, body);
      if (hit) {
        hits.push(hit);
      }
    }

    // Sort by distance
    hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }

  private raycastBody(
    origin: Vector3,
    direction: Vector3,
    maxDistance: number,
    body: CollisionBody
  ): RaycastHit | null {
    const collider = body.collider;
    const pos = Vec3.add(body.position, Quat.rotateVector(body.rotation, collider.offset));

    if (collider.type === 'sphere') {
      return this.raycastSphere(origin, direction, maxDistance, pos, (collider as SphereCollider).radius, body.id);
    } else if (collider.type === 'box') {
      const box = collider as BoxCollider;
      const rot = Quat.multiply(body.rotation, collider.rotation);
      return this.raycastBox(origin, direction, maxDistance, pos, rot, box.halfExtents, body.id);
    } else if (collider.type === 'plane') {
      const plane = collider as PlaneCollider;
      const rot = Quat.multiply(body.rotation, collider.rotation);
      return this.raycastPlane(origin, direction, maxDistance, pos, rot, plane, body.id);
    }

    return null;
  }

  private raycastSphere(
    origin: Vector3,
    direction: Vector3,
    maxDistance: number,
    center: Vector3,
    radius: number,
    objectId: string
  ): RaycastHit | null {
    const oc = Vec3.sub(origin, center);
    const a = Vec3.dot(direction, direction);
    const b = 2 * Vec3.dot(oc, direction);
    const c = Vec3.dot(oc, oc) - radius * radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return null;

    const t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t < 0 || t > maxDistance) return null;

    const point = Vec3.add(origin, Vec3.scale(direction, t));
    const normal = Vec3.normalize(Vec3.sub(point, center));

    return {
      objectId,
      point,
      normal,
      distance: t,
      triangleIndex: -1,
      uv: { x: 0, y: 0 }
    };
  }

  private raycastBox(
    origin: Vector3,
    direction: Vector3,
    maxDistance: number,
    center: Vector3,
    rotation: Quaternion,
    halfExtents: Vector3,
    objectId: string
  ): RaycastHit | null {
    // Transform ray to box local space
    const invRot = Quat.conjugate(rotation);
    const localOrigin = Quat.rotateVector(invRot, Vec3.sub(origin, center));
    const localDir = Quat.rotateVector(invRot, direction);

    const aabb: AABB = {
      min: Vec3.negate(halfExtents),
      max: halfExtents
    };

    const result = AABBUtils.rayIntersect(aabb, localOrigin, localDir);
    if (!result.hit || result.tMin > maxDistance) return null;

    const localPoint = Vec3.add(localOrigin, Vec3.scale(localDir, result.tMin));

    // Find hit face for normal
    let localNormal: Vector3 = { x: 0, y: 0, z: 0 };
    const epsilon = 0.001;

    if (Math.abs(localPoint.x - halfExtents.x) < epsilon) localNormal = { x: 1, y: 0, z: 0 };
    else if (Math.abs(localPoint.x + halfExtents.x) < epsilon) localNormal = { x: -1, y: 0, z: 0 };
    else if (Math.abs(localPoint.y - halfExtents.y) < epsilon) localNormal = { x: 0, y: 1, z: 0 };
    else if (Math.abs(localPoint.y + halfExtents.y) < epsilon) localNormal = { x: 0, y: -1, z: 0 };
    else if (Math.abs(localPoint.z - halfExtents.z) < epsilon) localNormal = { x: 0, y: 0, z: 1 };
    else if (Math.abs(localPoint.z + halfExtents.z) < epsilon) localNormal = { x: 0, y: 0, z: -1 };

    const point = Vec3.add(center, Quat.rotateVector(rotation, localPoint));
    const normal = Quat.rotateVector(rotation, localNormal);

    return {
      objectId,
      point,
      normal,
      distance: result.tMin,
      triangleIndex: -1,
      uv: { x: 0, y: 0 }
    };
  }

  private raycastPlane(
    origin: Vector3,
    direction: Vector3,
    maxDistance: number,
    position: Vector3,
    rotation: Quaternion,
    plane: PlaneCollider,
    objectId: string
  ): RaycastHit | null {
    const worldNormal = Quat.rotateVector(rotation, plane.normal);
    const denom = Vec3.dot(worldNormal, direction);

    if (Math.abs(denom) < 1e-6) return null;

    const planeD = Vec3.dot(position, worldNormal) + plane.distance;
    const t = (planeD - Vec3.dot(origin, worldNormal)) / denom;

    if (t < 0 || t > maxDistance) return null;

    const point = Vec3.add(origin, Vec3.scale(direction, t));

    return {
      objectId,
      point,
      normal: denom < 0 ? worldNormal : Vec3.negate(worldNormal),
      distance: t,
      triangleIndex: -1,
      uv: { x: 0, y: 0 }
    };
  }

  overlapSphere(center: Vector3, radius: number): string[] {
    return this.broadPhase.querySphere(center, radius);
  }

  overlapBox(center: Vector3, halfExtents: Vector3, rotation?: Quaternion): string[] {
    // Simplified: use AABB overlap
    const aabb = AABBUtils.fromCenterExtents(center, halfExtents);
    return this.broadPhase.queryAABB(aabb);
  }

  // Event registration
  addCollisionStartCallback(callback: (info: CollisionInfo) => void): void {
    this.onCollisionStart.push(callback);
  }

  addCollisionStayCallback(callback: (info: CollisionInfo) => void): void {
    this.onCollisionStay.push(callback);
  }

  addCollisionEndCallback(callback: (info: CollisionInfo) => void): void {
    this.onCollisionEnd.push(callback);
  }

  addTriggerEnterCallback(callback: (info: CollisionInfo) => void): void {
    this.onTriggerEnter.push(callback);
  }

  addTriggerExitCallback(callback: (info: CollisionInfo) => void): void {
    this.onTriggerExit.push(callback);
  }

  clear(): void {
    this.bodies.clear();
    this.activeManifolds.clear();
    this.broadPhase.clear();
  }
}

export default CollisionSystem;
