/**
 * ASIMULATE SDK - Math Utilities
 * Vector, Quaternion, and Matrix operations for physics simulation
 */

import type { Vector3, Vector2, Quaternion, Matrix3, Matrix4 } from '../types';

// ============================================================================
// VECTOR3 OPERATIONS
// ============================================================================

export const Vec3 = {
  /**
   * Create a new Vector3
   */
  create(x = 0, y = 0, z = 0): Vector3 {
    return { x, y, z };
  },

  /**
   * Create from array
   */
  fromArray(arr: number[] | [number, number, number]): Vector3 {
    return { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 };
  },

  /**
   * Convert to array
   */
  toArray(v: Vector3): [number, number, number] {
    return [v.x, v.y, v.z];
  },

  /**
   * Clone a vector
   */
  clone(v: Vector3): Vector3 {
    return { x: v.x, y: v.y, z: v.z };
  },

  /**
   * Copy values from source to target
   */
  copy(target: Vector3, source: Vector3): Vector3 {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
    return target;
  },

  /**
   * Set vector values
   */
  set(v: Vector3, x: number, y: number, z: number): Vector3 {
    v.x = x;
    v.y = y;
    v.z = z;
    return v;
  },

  /**
   * Add two vectors
   */
  add(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  /**
   * Add vector b to vector a in place
   */
  addInPlace(a: Vector3, b: Vector3): Vector3 {
    a.x += b.x;
    a.y += b.y;
    a.z += b.z;
    return a;
  },

  /**
   * Subtract vector b from vector a
   */
  sub(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  /**
   * Subtract in place
   */
  subInPlace(a: Vector3, b: Vector3): Vector3 {
    a.x -= b.x;
    a.y -= b.y;
    a.z -= b.z;
    return a;
  },

  /**
   * Multiply vector by scalar
   */
  scale(v: Vector3, s: number): Vector3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },

  /**
   * Scale in place
   */
  scaleInPlace(v: Vector3, s: number): Vector3 {
    v.x *= s;
    v.y *= s;
    v.z *= s;
    return v;
  },

  /**
   * Multiply component-wise
   */
  multiply(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
  },

  /**
   * Divide component-wise
   */
  divide(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x / b.x, y: a.y / b.y, z: a.z / b.z };
  },

  /**
   * Dot product
   */
  dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  /**
   * Cross product
   */
  cross(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  /**
   * Vector length (magnitude)
   */
  length(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  /**
   * Squared length (faster, avoids sqrt)
   */
  lengthSquared(v: Vector3): number {
    return v.x * v.x + v.y * v.y + v.z * v.z;
  },

  /**
   * Distance between two points
   */
  distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Squared distance (faster)
   */
  distanceSquared(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  },

  /**
   * Normalize vector (make unit length)
   */
  normalize(v: Vector3): Vector3 {
    const len = Vec3.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  },

  /**
   * Normalize in place
   */
  normalizeInPlace(v: Vector3): Vector3 {
    const len = Vec3.length(v);
    if (len > 0) {
      v.x /= len;
      v.y /= len;
      v.z /= len;
    }
    return v;
  },

  /**
   * Negate vector
   */
  negate(v: Vector3): Vector3 {
    return { x: -v.x, y: -v.y, z: -v.z };
  },

  /**
   * Linear interpolation
   */
  lerp(a: Vector3, b: Vector3, t: number): Vector3 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  },

  /**
   * Spherical linear interpolation
   */
  slerp(a: Vector3, b: Vector3, t: number): Vector3 {
    const dot = Vec3.dot(Vec3.normalize(a), Vec3.normalize(b));
    const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
    
    if (theta < 0.0001) {
      return Vec3.lerp(a, b, t);
    }
    
    const sinTheta = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;
    
    return Vec3.add(Vec3.scale(a, wa), Vec3.scale(b, wb));
  },

  /**
   * Reflect vector across normal
   */
  reflect(v: Vector3, normal: Vector3): Vector3 {
    const d = 2 * Vec3.dot(v, normal);
    return Vec3.sub(v, Vec3.scale(normal, d));
  },

  /**
   * Project vector onto another
   */
  project(v: Vector3, onto: Vector3): Vector3 {
    const d = Vec3.dot(onto, onto);
    if (d === 0) return Vec3.create();
    const scale = Vec3.dot(v, onto) / d;
    return Vec3.scale(onto, scale);
  },

  /**
   * Angle between two vectors (radians)
   */
  angle(a: Vector3, b: Vector3): number {
    const d = Vec3.dot(Vec3.normalize(a), Vec3.normalize(b));
    return Math.acos(Math.max(-1, Math.min(1, d)));
  },

  /**
   * Clamp vector length
   */
  clampLength(v: Vector3, minLen: number, maxLen: number): Vector3 {
    const len = Vec3.length(v);
    if (len === 0) return Vec3.create();
    const clamped = Math.max(minLen, Math.min(maxLen, len));
    return Vec3.scale(Vec3.normalize(v), clamped);
  },

  /**
   * Component-wise minimum
   */
  min(a: Vector3, b: Vector3): Vector3 {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      z: Math.min(a.z, b.z),
    };
  },

  /**
   * Component-wise maximum
   */
  max(a: Vector3, b: Vector3): Vector3 {
    return {
      x: Math.max(a.x, b.x),
      y: Math.max(a.y, b.y),
      z: Math.max(a.z, b.z),
    };
  },

  /**
   * Check if vectors are approximately equal
   */
  equals(a: Vector3, b: Vector3, epsilon = 1e-6): boolean {
    return (
      Math.abs(a.x - b.x) < epsilon &&
      Math.abs(a.y - b.y) < epsilon &&
      Math.abs(a.z - b.z) < epsilon
    );
  },

  /**
   * Check if vector is zero
   */
  isZero(v: Vector3, epsilon = 1e-6): boolean {
    return Vec3.lengthSquared(v) < epsilon * epsilon;
  },

  /**
   * Random unit vector
   */
  randomUnit(): Vector3 {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return {
      x: Math.sin(phi) * Math.cos(theta),
      y: Math.sin(phi) * Math.sin(theta),
      z: Math.cos(phi),
    };
  },

  /**
   * Random vector within bounds
   */
  random(min: Vector3, max: Vector3): Vector3 {
    return {
      x: min.x + Math.random() * (max.x - min.x),
      y: min.y + Math.random() * (max.y - min.y),
      z: min.z + Math.random() * (max.z - min.z),
    };
  },

  // Common constants
  ZERO: Object.freeze({ x: 0, y: 0, z: 0 }) as Vector3,
  ONE: Object.freeze({ x: 1, y: 1, z: 1 }) as Vector3,
  UP: Object.freeze({ x: 0, y: 1, z: 0 }) as Vector3,
  DOWN: Object.freeze({ x: 0, y: -1, z: 0 }) as Vector3,
  RIGHT: Object.freeze({ x: 1, y: 0, z: 0 }) as Vector3,
  LEFT: Object.freeze({ x: -1, y: 0, z: 0 }) as Vector3,
  FORWARD: Object.freeze({ x: 0, y: 0, z: 1 }) as Vector3,
  BACK: Object.freeze({ x: 0, y: 0, z: -1 }) as Vector3,
};

// ============================================================================
// VECTOR2 OPERATIONS
// ============================================================================

export const Vec2 = {
  create(x = 0, y = 0): Vector2 {
    return { x, y };
  },

  fromArray(arr: number[]): Vector2 {
    return { x: arr[0] ?? 0, y: arr[1] ?? 0 };
  },

  toArray(v: Vector2): [number, number] {
    return [v.x, v.y];
  },

  clone(v: Vector2): Vector2 {
    return { x: v.x, y: v.y };
  },

  add(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  sub(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  scale(v: Vector2, s: number): Vector2 {
    return { x: v.x * s, y: v.y * s };
  },

  dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  },

  length(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  normalize(v: Vector2): Vector2 {
    const len = Vec2.length(v);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  },

  perpendicular(v: Vector2): Vector2 {
    return { x: -v.y, y: v.x };
  },

  ZERO: Object.freeze({ x: 0, y: 0 }) as Vector2,
  ONE: Object.freeze({ x: 1, y: 1 }) as Vector2,
};

// ============================================================================
// QUATERNION OPERATIONS
// ============================================================================

export const Quat = {
  /**
   * Create identity quaternion
   */
  create(x = 0, y = 0, z = 0, w = 1): Quaternion {
    return { x, y, z, w };
  },

  /**
   * Create identity quaternion
   */
  identity(): Quaternion {
    return { x: 0, y: 0, z: 0, w: 1 };
  },

  /**
   * Clone quaternion
   */
  clone(q: Quaternion): Quaternion {
    return { x: q.x, y: q.y, z: q.z, w: q.w };
  },

  /**
   * Create from axis and angle (radians)
   */
  fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    const normalized = Vec3.normalize(axis);
    return {
      x: normalized.x * s,
      y: normalized.y * s,
      z: normalized.z * s,
      w: Math.cos(halfAngle),
    };
  },

  /**
   * Create from Euler angles (radians, XYZ order)
   */
  fromEuler(x: number, y: number, z: number): Quaternion {
    const cx = Math.cos(x / 2);
    const cy = Math.cos(y / 2);
    const cz = Math.cos(z / 2);
    const sx = Math.sin(x / 2);
    const sy = Math.sin(y / 2);
    const sz = Math.sin(z / 2);

    return {
      x: sx * cy * cz + cx * sy * sz,
      y: cx * sy * cz - sx * cy * sz,
      z: cx * cy * sz + sx * sy * cz,
      w: cx * cy * cz - sx * sy * sz,
    };
  },

  /**
   * Convert to Euler angles (XYZ order)
   */
  toEuler(q: Quaternion): Vector3 {
    const { x, y, z, w } = q;

    // Roll (x-axis rotation)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (y-axis rotation)
    const sinp = 2 * (w * y - z * x);
    let pitch: number;
    if (Math.abs(sinp) >= 1) {
      pitch = Math.sign(sinp) * (Math.PI / 2);
    } else {
      pitch = Math.asin(sinp);
    }

    // Yaw (z-axis rotation)
    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return { x: roll, y: pitch, z: yaw };
  },

  /**
   * Create rotation from one vector to another
   */
  fromTo(from: Vector3, to: Vector3): Quaternion {
    const f = Vec3.normalize(from);
    const t = Vec3.normalize(to);
    const d = Vec3.dot(f, t);

    if (d >= 1 - 1e-6) {
      return Quat.identity();
    }

    if (d <= -1 + 1e-6) {
      // Vectors are opposite, find perpendicular axis
      let axis = Vec3.cross(Vec3.RIGHT, f);
      if (Vec3.lengthSquared(axis) < 1e-6) {
        axis = Vec3.cross(Vec3.UP, f);
      }
      return Quat.fromAxisAngle(axis, Math.PI);
    }

    const axis = Vec3.cross(f, t);
    const s = Math.sqrt((1 + d) * 2);
    const invS = 1 / s;

    return Quat.normalize({
      x: axis.x * invS,
      y: axis.y * invS,
      z: axis.z * invS,
      w: s * 0.5,
    });
  },

  /**
   * Quaternion length
   */
  length(q: Quaternion): number {
    return Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  },

  /**
   * Normalize quaternion
   */
  normalize(q: Quaternion): Quaternion {
    const len = Quat.length(q);
    if (len === 0) return Quat.identity();
    return {
      x: q.x / len,
      y: q.y / len,
      z: q.z / len,
      w: q.w / len,
    };
  },

  /**
   * Quaternion conjugate (inverse for unit quaternions)
   */
  conjugate(q: Quaternion): Quaternion {
    return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
  },

  /**
   * Quaternion inverse
   */
  inverse(q: Quaternion): Quaternion {
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    if (lenSq === 0) return Quat.identity();
    return {
      x: -q.x / lenSq,
      y: -q.y / lenSq,
      z: -q.z / lenSq,
      w: q.w / lenSq,
    };
  },

  /**
   * Multiply two quaternions (combine rotations)
   */
  multiply(a: Quaternion, b: Quaternion): Quaternion {
    return {
      x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
      y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
      z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
      w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    };
  },

  /**
   * Rotate a vector by quaternion
   */
  rotateVector(q: Quaternion, v: Vector3): Vector3 {
    const qv: Quaternion = { x: v.x, y: v.y, z: v.z, w: 0 };
    const result = Quat.multiply(Quat.multiply(q, qv), Quat.conjugate(q));
    return { x: result.x, y: result.y, z: result.z };
  },

  /**
   * Spherical linear interpolation
   */
  slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

    // If dot is negative, negate one quaternion
    let bx = b.x, by = b.y, bz = b.z, bw = b.w;
    if (dot < 0) {
      dot = -dot;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }

    // Use linear interpolation for close quaternions
    if (dot > 0.9995) {
      return Quat.normalize({
        x: a.x + (bx - a.x) * t,
        y: a.y + (by - a.y) * t,
        z: a.z + (bz - a.z) * t,
        w: a.w + (bw - a.w) * t,
      });
    }

    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;

    return {
      x: a.x * wa + bx * wb,
      y: a.y * wa + by * wb,
      z: a.z * wa + bz * wb,
      w: a.w * wa + bw * wb,
    };
  },

  /**
   * Get rotation axis
   */
  getAxis(q: Quaternion): Vector3 {
    const s = Math.sqrt(1 - q.w * q.w);
    if (s < 0.0001) {
      return Vec3.UP;
    }
    return { x: q.x / s, y: q.y / s, z: q.z / s };
  },

  /**
   * Get rotation angle (radians)
   */
  getAngle(q: Quaternion): number {
    return 2 * Math.acos(Math.max(-1, Math.min(1, q.w)));
  },

  /**
   * Convert to rotation matrix (3x3)
   */
  toMatrix3(q: Quaternion): Matrix3 {
    const { x, y, z, w } = q;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    return {
      elements: [
        1 - (yy + zz), xy - wz, xz + wy,
        xy + wz, 1 - (xx + zz), yz - wx,
        xz - wy, yz + wx, 1 - (xx + yy),
      ],
    };
  },

  /**
   * Create from rotation matrix
   */
  fromMatrix3(m: Matrix3): Quaternion {
    const e = m.elements;
    const trace = e[0] + e[4] + e[8];

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1);
      return {
        x: (e[5] - e[7]) * s,
        y: (e[6] - e[2]) * s,
        z: (e[1] - e[3]) * s,
        w: 0.25 / s,
      };
    } else if (e[0] > e[4] && e[0] > e[8]) {
      const s = 2 * Math.sqrt(1 + e[0] - e[4] - e[8]);
      return {
        x: 0.25 * s,
        y: (e[1] + e[3]) / s,
        z: (e[6] + e[2]) / s,
        w: (e[5] - e[7]) / s,
      };
    } else if (e[4] > e[8]) {
      const s = 2 * Math.sqrt(1 + e[4] - e[0] - e[8]);
      return {
        x: (e[1] + e[3]) / s,
        y: 0.25 * s,
        z: (e[5] + e[7]) / s,
        w: (e[6] - e[2]) / s,
      };
    } else {
      const s = 2 * Math.sqrt(1 + e[8] - e[0] - e[4]);
      return {
        x: (e[6] + e[2]) / s,
        y: (e[5] + e[7]) / s,
        z: 0.25 * s,
        w: (e[1] - e[3]) / s,
      };
    }
  },

  /**
   * Check equality
   */
  equals(a: Quaternion, b: Quaternion, epsilon = 1e-6): boolean {
    return (
      Math.abs(a.x - b.x) < epsilon &&
      Math.abs(a.y - b.y) < epsilon &&
      Math.abs(a.z - b.z) < epsilon &&
      Math.abs(a.w - b.w) < epsilon
    );
  },

  IDENTITY: Object.freeze({ x: 0, y: 0, z: 0, w: 1 }) as Quaternion,
};

// ============================================================================
// MATRIX3 OPERATIONS (3x3 Matrix)
// ============================================================================

export const Mat3 = {
  /**
   * Create identity matrix
   */
  identity(): Matrix3 {
    return {
      elements: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };
  },

  /**
   * Create zero matrix
   */
  zero(): Matrix3 {
    return {
      elements: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
  },

  /**
   * Clone matrix
   */
  clone(m: Matrix3): Matrix3 {
    return { elements: [...m.elements] };
  },

  /**
   * Create diagonal matrix
   */
  diagonal(x: number, y: number, z: number): Matrix3 {
    return {
      elements: [x, 0, 0, 0, y, 0, 0, 0, z],
    };
  },

  /**
   * Create from values (row-major)
   */
  fromValues(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number
  ): Matrix3 {
    return {
      elements: [m00, m01, m02, m10, m11, m12, m20, m21, m22],
    };
  },

  /**
   * Add two matrices
   */
  add(a: Matrix3, b: Matrix3): Matrix3 {
    const ae = a.elements;
    const be = b.elements;
    return {
      elements: [
        ae[0] + be[0], ae[1] + be[1], ae[2] + be[2],
        ae[3] + be[3], ae[4] + be[4], ae[5] + be[5],
        ae[6] + be[6], ae[7] + be[7], ae[8] + be[8],
      ],
    };
  },

  /**
   * Multiply by scalar
   */
  scale(m: Matrix3, s: number): Matrix3 {
    return {
      elements: m.elements.map(v => v * s),
    };
  },

  /**
   * Multiply two matrices
   */
  multiply(a: Matrix3, b: Matrix3): Matrix3 {
    const ae = a.elements;
    const be = b.elements;

    return {
      elements: [
        ae[0] * be[0] + ae[1] * be[3] + ae[2] * be[6],
        ae[0] * be[1] + ae[1] * be[4] + ae[2] * be[7],
        ae[0] * be[2] + ae[1] * be[5] + ae[2] * be[8],

        ae[3] * be[0] + ae[4] * be[3] + ae[5] * be[6],
        ae[3] * be[1] + ae[4] * be[4] + ae[5] * be[7],
        ae[3] * be[2] + ae[4] * be[5] + ae[5] * be[8],

        ae[6] * be[0] + ae[7] * be[3] + ae[8] * be[6],
        ae[6] * be[1] + ae[7] * be[4] + ae[8] * be[7],
        ae[6] * be[2] + ae[7] * be[5] + ae[8] * be[8],
      ],
    };
  },

  /**
   * Multiply matrix by vector
   */
  multiplyVector(m: Matrix3, v: Vector3): Vector3 {
    const e = m.elements;
    return {
      x: e[0] * v.x + e[1] * v.y + e[2] * v.z,
      y: e[3] * v.x + e[4] * v.y + e[5] * v.z,
      z: e[6] * v.x + e[7] * v.y + e[8] * v.z,
    };
  },

  /**
   * Transpose matrix
   */
  transpose(m: Matrix3): Matrix3 {
    const e = m.elements;
    return {
      elements: [
        e[0], e[3], e[6],
        e[1], e[4], e[7],
        e[2], e[5], e[8],
      ],
    };
  },

  /**
   * Calculate determinant
   */
  determinant(m: Matrix3): number {
    const e = m.elements;
    return (
      e[0] * (e[4] * e[8] - e[5] * e[7]) -
      e[1] * (e[3] * e[8] - e[5] * e[6]) +
      e[2] * (e[3] * e[7] - e[4] * e[6])
    );
  },

  /**
   * Calculate inverse
   */
  inverse(m: Matrix3): Matrix3 | null {
    const det = Mat3.determinant(m);
    if (Math.abs(det) < 1e-10) return null;

    const e = m.elements;
    const invDet = 1 / det;

    return {
      elements: [
        (e[4] * e[8] - e[5] * e[7]) * invDet,
        (e[2] * e[7] - e[1] * e[8]) * invDet,
        (e[1] * e[5] - e[2] * e[4]) * invDet,
        (e[5] * e[6] - e[3] * e[8]) * invDet,
        (e[0] * e[8] - e[2] * e[6]) * invDet,
        (e[2] * e[3] - e[0] * e[5]) * invDet,
        (e[3] * e[7] - e[4] * e[6]) * invDet,
        (e[1] * e[6] - e[0] * e[7]) * invDet,
        (e[0] * e[4] - e[1] * e[3]) * invDet,
      ],
    };
  },

  /**
   * Create rotation matrix from axis and angle
   */
  fromAxisAngle(axis: Vector3, angle: number): Matrix3 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const { x, y, z } = Vec3.normalize(axis);

    return {
      elements: [
        t * x * x + c,     t * x * y - s * z, t * x * z + s * y,
        t * x * y + s * z, t * y * y + c,     t * y * z - s * x,
        t * x * z - s * y, t * y * z + s * x, t * z * z + c,
      ],
    };
  },

  /**
   * Create skew-symmetric matrix from vector (for cross product)
   */
  skew(v: Vector3): Matrix3 {
    return {
      elements: [
        0, -v.z, v.y,
        v.z, 0, -v.x,
        -v.y, v.x, 0,
      ],
    };
  },
};

// ============================================================================
// MATRIX4 OPERATIONS (4x4 Matrix)
// ============================================================================

export const Mat4 = {
  /**
   * Create identity matrix
   */
  identity(): Matrix4 {
    return {
      elements: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ],
    };
  },

  /**
   * Clone matrix
   */
  clone(m: Matrix4): Matrix4 {
    return { elements: [...m.elements] };
  },

  /**
   * Create translation matrix
   */
  translation(x: number, y: number, z: number): Matrix4 {
    return {
      elements: [
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1,
      ],
    };
  },

  /**
   * Create scale matrix
   */
  scaling(x: number, y: number, z: number): Matrix4 {
    return {
      elements: [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
      ],
    };
  },

  /**
   * Create rotation matrix from quaternion
   */
  fromQuaternion(q: Quaternion): Matrix4 {
    const m3 = Quat.toMatrix3(q);
    const e = m3.elements;
    return {
      elements: [
        e[0], e[1], e[2], 0,
        e[3], e[4], e[5], 0,
        e[6], e[7], e[8], 0,
        0, 0, 0, 1,
      ],
    };
  },

  /**
   * Compose transformation matrix
   */
  compose(position: Vector3, rotation: Quaternion, scale: Vector3): Matrix4 {
    const m3 = Quat.toMatrix3(rotation);
    const e = m3.elements;

    return {
      elements: [
        e[0] * scale.x, e[1] * scale.y, e[2] * scale.z, position.x,
        e[3] * scale.x, e[4] * scale.y, e[5] * scale.z, position.y,
        e[6] * scale.x, e[7] * scale.y, e[8] * scale.z, position.z,
        0, 0, 0, 1,
      ],
    };
  },

  /**
   * Multiply two matrices
   */
  multiply(a: Matrix4, b: Matrix4): Matrix4 {
    const ae = a.elements;
    const be = b.elements;
    const result = new Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] =
          ae[i * 4 + 0] * be[0 * 4 + j] +
          ae[i * 4 + 1] * be[1 * 4 + j] +
          ae[i * 4 + 2] * be[2 * 4 + j] +
          ae[i * 4 + 3] * be[3 * 4 + j];
      }
    }

    return { elements: result };
  },

  /**
   * Transform point by matrix
   */
  transformPoint(m: Matrix4, p: Vector3): Vector3 {
    const e = m.elements;
    const w = e[12] * p.x + e[13] * p.y + e[14] * p.z + e[15];
    return {
      x: (e[0] * p.x + e[1] * p.y + e[2] * p.z + e[3]) / w,
      y: (e[4] * p.x + e[5] * p.y + e[6] * p.z + e[7]) / w,
      z: (e[8] * p.x + e[9] * p.y + e[10] * p.z + e[11]) / w,
    };
  },

  /**
   * Transform direction by matrix (ignores translation)
   */
  transformDirection(m: Matrix4, d: Vector3): Vector3 {
    const e = m.elements;
    return {
      x: e[0] * d.x + e[1] * d.y + e[2] * d.z,
      y: e[4] * d.x + e[5] * d.y + e[6] * d.z,
      z: e[8] * d.x + e[9] * d.y + e[10] * d.z,
    };
  },

  /**
   * Calculate inverse
   */
  inverse(m: Matrix4): Matrix4 | null {
    const e = m.elements;
    const n11 = e[0], n12 = e[1], n13 = e[2], n14 = e[3];
    const n21 = e[4], n22 = e[5], n23 = e[6], n24 = e[7];
    const n31 = e[8], n32 = e[9], n33 = e[10], n34 = e[11];
    const n41 = e[12], n42 = e[13], n43 = e[14], n44 = e[15];

    const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
    const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
    const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
    const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (Math.abs(det) < 1e-10) return null;

    const detInv = 1 / det;

    return {
      elements: [
        t11 * detInv,
        t12 * detInv,
        t13 * detInv,
        t14 * detInv,
        (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv,
        (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv,
        (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv,
        (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv,
        (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv,
        (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv,
        (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv,
        (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv,
        (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv,
        (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv,
        (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv,
        (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv,
      ],
    };
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const MathUtils = {
  /**
   * Convert degrees to radians
   */
  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   */
  radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  },

  /**
   * Clamp value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Linear interpolation
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * Smooth step interpolation
   */
  smoothstep(a: number, b: number, t: number): number {
    const x = MathUtils.clamp((t - a) / (b - a), 0, 1);
    return x * x * (3 - 2 * x);
  },

  /**
   * Map value from one range to another
   */
  mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  },

  /**
   * Check if two numbers are approximately equal
   */
  approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
    return Math.abs(a - b) < epsilon;
  },

  /**
   * Calculate sign with zero handling
   */
  sign(x: number): number {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  },

  /**
   * Modulo that handles negative numbers correctly
   */
  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  },

  /**
   * Random number in range
   */
  randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  },

  /**
   * Random integer in range (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Gaussian random number
   */
  randomGaussian(mean = 0, stdDev = 1): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  },

  // Constants
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  EPSILON: 1e-6,
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
};
