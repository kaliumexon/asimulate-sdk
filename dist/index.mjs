var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/math/index.ts
var Vec3, Vec2, Quat, Mat3, Mat4, MathUtils;
var init_math = __esm({
  "src/math/index.ts"() {
    Vec3 = {
      /**
       * Create a new Vector3
       */
      create(x = 0, y = 0, z = 0) {
        return { x, y, z };
      },
      /**
       * Create from array
       */
      fromArray(arr) {
        return { x: arr[0] ?? 0, y: arr[1] ?? 0, z: arr[2] ?? 0 };
      },
      /**
       * Convert to array
       */
      toArray(v) {
        return [v.x, v.y, v.z];
      },
      /**
       * Clone a vector
       */
      clone(v) {
        return { x: v.x, y: v.y, z: v.z };
      },
      /**
       * Copy values from source to target
       */
      copy(target, source) {
        target.x = source.x;
        target.y = source.y;
        target.z = source.z;
        return target;
      },
      /**
       * Set vector values
       */
      set(v, x, y, z) {
        v.x = x;
        v.y = y;
        v.z = z;
        return v;
      },
      /**
       * Add two vectors
       */
      add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
      },
      /**
       * Add vector b to vector a in place
       */
      addInPlace(a, b) {
        a.x += b.x;
        a.y += b.y;
        a.z += b.z;
        return a;
      },
      /**
       * Subtract vector b from vector a
       */
      sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
      },
      /**
       * Subtract in place
       */
      subInPlace(a, b) {
        a.x -= b.x;
        a.y -= b.y;
        a.z -= b.z;
        return a;
      },
      /**
       * Multiply vector by scalar
       */
      scale(v, s) {
        return { x: v.x * s, y: v.y * s, z: v.z * s };
      },
      /**
       * Scale in place
       */
      scaleInPlace(v, s) {
        v.x *= s;
        v.y *= s;
        v.z *= s;
        return v;
      },
      /**
       * Multiply component-wise
       */
      multiply(a, b) {
        return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
      },
      /**
       * Divide component-wise
       */
      divide(a, b) {
        return { x: a.x / b.x, y: a.y / b.y, z: a.z / b.z };
      },
      /**
       * Dot product
       */
      dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
      },
      /**
       * Cross product
       */
      cross(a, b) {
        return {
          x: a.y * b.z - a.z * b.y,
          y: a.z * b.x - a.x * b.z,
          z: a.x * b.y - a.y * b.x
        };
      },
      /**
       * Vector length (magnitude)
       */
      length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      },
      /**
       * Squared length (faster, avoids sqrt)
       */
      lengthSquared(v) {
        return v.x * v.x + v.y * v.y + v.z * v.z;
      },
      /**
       * Distance between two points
       */
      distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      },
      /**
       * Squared distance (faster)
       */
      distanceSquared(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return dx * dx + dy * dy + dz * dz;
      },
      /**
       * Normalize vector (make unit length)
       */
      normalize(v) {
        const len = Vec3.length(v);
        if (len === 0) return { x: 0, y: 0, z: 0 };
        return { x: v.x / len, y: v.y / len, z: v.z / len };
      },
      /**
       * Normalize in place
       */
      normalizeInPlace(v) {
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
      negate(v) {
        return { x: -v.x, y: -v.y, z: -v.z };
      },
      /**
       * Linear interpolation
       */
      lerp(a, b, t) {
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          z: a.z + (b.z - a.z) * t
        };
      },
      /**
       * Spherical linear interpolation
       */
      slerp(a, b, t) {
        const dot = Vec3.dot(Vec3.normalize(a), Vec3.normalize(b));
        const theta = Math.acos(Math.max(-1, Math.min(1, dot)));
        if (theta < 1e-4) {
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
      reflect(v, normal) {
        const d = 2 * Vec3.dot(v, normal);
        return Vec3.sub(v, Vec3.scale(normal, d));
      },
      /**
       * Project vector onto another
       */
      project(v, onto) {
        const d = Vec3.dot(onto, onto);
        if (d === 0) return Vec3.create();
        const scale = Vec3.dot(v, onto) / d;
        return Vec3.scale(onto, scale);
      },
      /**
       * Angle between two vectors (radians)
       */
      angle(a, b) {
        const d = Vec3.dot(Vec3.normalize(a), Vec3.normalize(b));
        return Math.acos(Math.max(-1, Math.min(1, d)));
      },
      /**
       * Clamp vector length
       */
      clampLength(v, minLen, maxLen) {
        const len = Vec3.length(v);
        if (len === 0) return Vec3.create();
        const clamped = Math.max(minLen, Math.min(maxLen, len));
        return Vec3.scale(Vec3.normalize(v), clamped);
      },
      /**
       * Component-wise minimum
       */
      min(a, b) {
        return {
          x: Math.min(a.x, b.x),
          y: Math.min(a.y, b.y),
          z: Math.min(a.z, b.z)
        };
      },
      /**
       * Component-wise maximum
       */
      max(a, b) {
        return {
          x: Math.max(a.x, b.x),
          y: Math.max(a.y, b.y),
          z: Math.max(a.z, b.z)
        };
      },
      /**
       * Check if vectors are approximately equal
       */
      equals(a, b, epsilon = 1e-6) {
        return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon && Math.abs(a.z - b.z) < epsilon;
      },
      /**
       * Check if vector is zero
       */
      isZero(v, epsilon = 1e-6) {
        return Vec3.lengthSquared(v) < epsilon * epsilon;
      },
      /**
       * Random unit vector
       */
      randomUnit() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return {
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.sin(phi) * Math.sin(theta),
          z: Math.cos(phi)
        };
      },
      /**
       * Random vector within bounds
       */
      random(min, max) {
        return {
          x: min.x + Math.random() * (max.x - min.x),
          y: min.y + Math.random() * (max.y - min.y),
          z: min.z + Math.random() * (max.z - min.z)
        };
      },
      // Common constants
      ZERO: Object.freeze({ x: 0, y: 0, z: 0 }),
      ONE: Object.freeze({ x: 1, y: 1, z: 1 }),
      UP: Object.freeze({ x: 0, y: 1, z: 0 }),
      DOWN: Object.freeze({ x: 0, y: -1, z: 0 }),
      RIGHT: Object.freeze({ x: 1, y: 0, z: 0 }),
      LEFT: Object.freeze({ x: -1, y: 0, z: 0 }),
      FORWARD: Object.freeze({ x: 0, y: 0, z: 1 }),
      BACK: Object.freeze({ x: 0, y: 0, z: -1 })
    };
    Vec2 = {
      create(x = 0, y = 0) {
        return { x, y };
      },
      fromArray(arr) {
        return { x: arr[0] ?? 0, y: arr[1] ?? 0 };
      },
      toArray(v) {
        return [v.x, v.y];
      },
      clone(v) {
        return { x: v.x, y: v.y };
      },
      add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
      },
      sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
      },
      scale(v, s) {
        return { x: v.x * s, y: v.y * s };
      },
      dot(a, b) {
        return a.x * b.x + a.y * b.y;
      },
      length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
      },
      normalize(v) {
        const len = Vec2.length(v);
        if (len === 0) return { x: 0, y: 0 };
        return { x: v.x / len, y: v.y / len };
      },
      perpendicular(v) {
        return { x: -v.y, y: v.x };
      },
      ZERO: Object.freeze({ x: 0, y: 0 }),
      ONE: Object.freeze({ x: 1, y: 1 })
    };
    Quat = {
      /**
       * Create identity quaternion
       */
      create(x = 0, y = 0, z = 0, w = 1) {
        return { x, y, z, w };
      },
      /**
       * Create identity quaternion
       */
      identity() {
        return { x: 0, y: 0, z: 0, w: 1 };
      },
      /**
       * Clone quaternion
       */
      clone(q) {
        return { x: q.x, y: q.y, z: q.z, w: q.w };
      },
      /**
       * Create from axis and angle (radians)
       */
      fromAxisAngle(axis, angle) {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        const normalized = Vec3.normalize(axis);
        return {
          x: normalized.x * s,
          y: normalized.y * s,
          z: normalized.z * s,
          w: Math.cos(halfAngle)
        };
      },
      /**
       * Create from Euler angles (radians, XYZ order)
       */
      fromEuler(x, y, z) {
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
          w: cx * cy * cz - sx * sy * sz
        };
      },
      /**
       * Convert to Euler angles (XYZ order)
       */
      toEuler(q) {
        const { x, y, z, w } = q;
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);
        const sinp = 2 * (w * y - z * x);
        let pitch;
        if (Math.abs(sinp) >= 1) {
          pitch = Math.sign(sinp) * (Math.PI / 2);
        } else {
          pitch = Math.asin(sinp);
        }
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const yaw = Math.atan2(siny_cosp, cosy_cosp);
        return { x: roll, y: pitch, z: yaw };
      },
      /**
       * Create rotation from one vector to another
       */
      fromTo(from, to) {
        const f = Vec3.normalize(from);
        const t = Vec3.normalize(to);
        const d = Vec3.dot(f, t);
        if (d >= 1 - 1e-6) {
          return Quat.identity();
        }
        if (d <= -1 + 1e-6) {
          let axis2 = Vec3.cross(Vec3.RIGHT, f);
          if (Vec3.lengthSquared(axis2) < 1e-6) {
            axis2 = Vec3.cross(Vec3.UP, f);
          }
          return Quat.fromAxisAngle(axis2, Math.PI);
        }
        const axis = Vec3.cross(f, t);
        const s = Math.sqrt((1 + d) * 2);
        const invS = 1 / s;
        return Quat.normalize({
          x: axis.x * invS,
          y: axis.y * invS,
          z: axis.z * invS,
          w: s * 0.5
        });
      },
      /**
       * Quaternion length
       */
      length(q) {
        return Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
      },
      /**
       * Normalize quaternion
       */
      normalize(q) {
        const len = Quat.length(q);
        if (len === 0) return Quat.identity();
        return {
          x: q.x / len,
          y: q.y / len,
          z: q.z / len,
          w: q.w / len
        };
      },
      /**
       * Quaternion conjugate (inverse for unit quaternions)
       */
      conjugate(q) {
        return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
      },
      /**
       * Quaternion inverse
       */
      inverse(q) {
        const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
        if (lenSq === 0) return Quat.identity();
        return {
          x: -q.x / lenSq,
          y: -q.y / lenSq,
          z: -q.z / lenSq,
          w: q.w / lenSq
        };
      },
      /**
       * Multiply two quaternions (combine rotations)
       */
      multiply(a, b) {
        return {
          x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
          y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
          z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
          w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
        };
      },
      /**
       * Rotate a vector by quaternion
       */
      rotateVector(q, v) {
        const qv = { x: v.x, y: v.y, z: v.z, w: 0 };
        const result = Quat.multiply(Quat.multiply(q, qv), Quat.conjugate(q));
        return { x: result.x, y: result.y, z: result.z };
      },
      /**
       * Spherical linear interpolation
       */
      slerp(a, b, t) {
        let dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
        let bx = b.x, by = b.y, bz = b.z, bw = b.w;
        if (dot < 0) {
          dot = -dot;
          bx = -bx;
          by = -by;
          bz = -bz;
          bw = -bw;
        }
        if (dot > 0.9995) {
          return Quat.normalize({
            x: a.x + (bx - a.x) * t,
            y: a.y + (by - a.y) * t,
            z: a.z + (bz - a.z) * t,
            w: a.w + (bw - a.w) * t
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
          w: a.w * wa + bw * wb
        };
      },
      /**
       * Get rotation axis
       */
      getAxis(q) {
        const s = Math.sqrt(1 - q.w * q.w);
        if (s < 1e-4) {
          return Vec3.UP;
        }
        return { x: q.x / s, y: q.y / s, z: q.z / s };
      },
      /**
       * Get rotation angle (radians)
       */
      getAngle(q) {
        return 2 * Math.acos(Math.max(-1, Math.min(1, q.w)));
      },
      /**
       * Convert to rotation matrix (3x3)
       */
      toMatrix3(q) {
        const { x, y, z, w } = q;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        return {
          elements: [
            1 - (yy + zz),
            xy - wz,
            xz + wy,
            xy + wz,
            1 - (xx + zz),
            yz - wx,
            xz - wy,
            yz + wx,
            1 - (xx + yy)
          ]
        };
      },
      /**
       * Create from rotation matrix
       */
      fromMatrix3(m) {
        const e = m.elements;
        const trace = e[0] + e[4] + e[8];
        if (trace > 0) {
          const s = 0.5 / Math.sqrt(trace + 1);
          return {
            x: (e[5] - e[7]) * s,
            y: (e[6] - e[2]) * s,
            z: (e[1] - e[3]) * s,
            w: 0.25 / s
          };
        } else if (e[0] > e[4] && e[0] > e[8]) {
          const s = 2 * Math.sqrt(1 + e[0] - e[4] - e[8]);
          return {
            x: 0.25 * s,
            y: (e[1] + e[3]) / s,
            z: (e[6] + e[2]) / s,
            w: (e[5] - e[7]) / s
          };
        } else if (e[4] > e[8]) {
          const s = 2 * Math.sqrt(1 + e[4] - e[0] - e[8]);
          return {
            x: (e[1] + e[3]) / s,
            y: 0.25 * s,
            z: (e[5] + e[7]) / s,
            w: (e[6] - e[2]) / s
          };
        } else {
          const s = 2 * Math.sqrt(1 + e[8] - e[0] - e[4]);
          return {
            x: (e[6] + e[2]) / s,
            y: (e[5] + e[7]) / s,
            z: 0.25 * s,
            w: (e[1] - e[3]) / s
          };
        }
      },
      /**
       * Check equality
       */
      equals(a, b, epsilon = 1e-6) {
        return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon && Math.abs(a.z - b.z) < epsilon && Math.abs(a.w - b.w) < epsilon;
      },
      IDENTITY: Object.freeze({ x: 0, y: 0, z: 0, w: 1 })
    };
    Mat3 = {
      /**
       * Create identity matrix
       */
      identity() {
        return {
          elements: [1, 0, 0, 0, 1, 0, 0, 0, 1]
        };
      },
      /**
       * Create zero matrix
       */
      zero() {
        return {
          elements: [0, 0, 0, 0, 0, 0, 0, 0, 0]
        };
      },
      /**
       * Clone matrix
       */
      clone(m) {
        return { elements: [...m.elements] };
      },
      /**
       * Create diagonal matrix
       */
      diagonal(x, y, z) {
        return {
          elements: [x, 0, 0, 0, y, 0, 0, 0, z]
        };
      },
      /**
       * Create from values (row-major)
       */
      fromValues(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        return {
          elements: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
        };
      },
      /**
       * Add two matrices
       */
      add(a, b) {
        const ae = a.elements;
        const be = b.elements;
        return {
          elements: [
            ae[0] + be[0],
            ae[1] + be[1],
            ae[2] + be[2],
            ae[3] + be[3],
            ae[4] + be[4],
            ae[5] + be[5],
            ae[6] + be[6],
            ae[7] + be[7],
            ae[8] + be[8]
          ]
        };
      },
      /**
       * Multiply by scalar
       */
      scale(m, s) {
        return {
          elements: m.elements.map((v) => v * s)
        };
      },
      /**
       * Multiply two matrices
       */
      multiply(a, b) {
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
            ae[6] * be[2] + ae[7] * be[5] + ae[8] * be[8]
          ]
        };
      },
      /**
       * Multiply matrix by vector
       */
      multiplyVector(m, v) {
        const e = m.elements;
        return {
          x: e[0] * v.x + e[1] * v.y + e[2] * v.z,
          y: e[3] * v.x + e[4] * v.y + e[5] * v.z,
          z: e[6] * v.x + e[7] * v.y + e[8] * v.z
        };
      },
      /**
       * Transpose matrix
       */
      transpose(m) {
        const e = m.elements;
        return {
          elements: [
            e[0],
            e[3],
            e[6],
            e[1],
            e[4],
            e[7],
            e[2],
            e[5],
            e[8]
          ]
        };
      },
      /**
       * Calculate determinant
       */
      determinant(m) {
        const e = m.elements;
        return e[0] * (e[4] * e[8] - e[5] * e[7]) - e[1] * (e[3] * e[8] - e[5] * e[6]) + e[2] * (e[3] * e[7] - e[4] * e[6]);
      },
      /**
       * Calculate inverse
       */
      inverse(m) {
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
            (e[0] * e[4] - e[1] * e[3]) * invDet
          ]
        };
      },
      /**
       * Create rotation matrix from axis and angle
       */
      fromAxisAngle(axis, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;
        const { x, y, z } = Vec3.normalize(axis);
        return {
          elements: [
            t * x * x + c,
            t * x * y - s * z,
            t * x * z + s * y,
            t * x * y + s * z,
            t * y * y + c,
            t * y * z - s * x,
            t * x * z - s * y,
            t * y * z + s * x,
            t * z * z + c
          ]
        };
      },
      /**
       * Create skew-symmetric matrix from vector (for cross product)
       */
      skew(v) {
        return {
          elements: [
            0,
            -v.z,
            v.y,
            v.z,
            0,
            -v.x,
            -v.y,
            v.x,
            0
          ]
        };
      }
    };
    Mat4 = {
      /**
       * Create identity matrix
       */
      identity() {
        return {
          elements: [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1
          ]
        };
      },
      /**
       * Clone matrix
       */
      clone(m) {
        return { elements: [...m.elements] };
      },
      /**
       * Create translation matrix
       */
      translation(x, y, z) {
        return {
          elements: [
            1,
            0,
            0,
            x,
            0,
            1,
            0,
            y,
            0,
            0,
            1,
            z,
            0,
            0,
            0,
            1
          ]
        };
      },
      /**
       * Create scale matrix
       */
      scaling(x, y, z) {
        return {
          elements: [
            x,
            0,
            0,
            0,
            0,
            y,
            0,
            0,
            0,
            0,
            z,
            0,
            0,
            0,
            0,
            1
          ]
        };
      },
      /**
       * Create rotation matrix from quaternion
       */
      fromQuaternion(q) {
        const m3 = Quat.toMatrix3(q);
        const e = m3.elements;
        return {
          elements: [
            e[0],
            e[1],
            e[2],
            0,
            e[3],
            e[4],
            e[5],
            0,
            e[6],
            e[7],
            e[8],
            0,
            0,
            0,
            0,
            1
          ]
        };
      },
      /**
       * Compose transformation matrix
       */
      compose(position, rotation, scale) {
        const m3 = Quat.toMatrix3(rotation);
        const e = m3.elements;
        return {
          elements: [
            e[0] * scale.x,
            e[1] * scale.y,
            e[2] * scale.z,
            position.x,
            e[3] * scale.x,
            e[4] * scale.y,
            e[5] * scale.z,
            position.y,
            e[6] * scale.x,
            e[7] * scale.y,
            e[8] * scale.z,
            position.z,
            0,
            0,
            0,
            1
          ]
        };
      },
      /**
       * Multiply two matrices
       */
      multiply(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            result[i * 4 + j] = ae[i * 4 + 0] * be[0 * 4 + j] + ae[i * 4 + 1] * be[1 * 4 + j] + ae[i * 4 + 2] * be[2 * 4 + j] + ae[i * 4 + 3] * be[3 * 4 + j];
          }
        }
        return { elements: result };
      },
      /**
       * Transform point by matrix
       */
      transformPoint(m, p) {
        const e = m.elements;
        const w = e[12] * p.x + e[13] * p.y + e[14] * p.z + e[15];
        return {
          x: (e[0] * p.x + e[1] * p.y + e[2] * p.z + e[3]) / w,
          y: (e[4] * p.x + e[5] * p.y + e[6] * p.z + e[7]) / w,
          z: (e[8] * p.x + e[9] * p.y + e[10] * p.z + e[11]) / w
        };
      },
      /**
       * Transform direction by matrix (ignores translation)
       */
      transformDirection(m, d) {
        const e = m.elements;
        return {
          x: e[0] * d.x + e[1] * d.y + e[2] * d.z,
          y: e[4] * d.x + e[5] * d.y + e[6] * d.z,
          z: e[8] * d.x + e[9] * d.y + e[10] * d.z
        };
      },
      /**
       * Calculate inverse
       */
      inverse(m) {
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
            (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv
          ]
        };
      }
    };
    MathUtils = {
      /**
       * Convert degrees to radians
       */
      degToRad(degrees) {
        return degrees * (Math.PI / 180);
      },
      /**
       * Convert radians to degrees
       */
      radToDeg(radians) {
        return radians * (180 / Math.PI);
      },
      /**
       * Clamp value between min and max
       */
      clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      },
      /**
       * Linear interpolation
       */
      lerp(a, b, t) {
        return a + (b - a) * t;
      },
      /**
       * Smooth step interpolation
       */
      smoothstep(a, b, t) {
        const x = MathUtils.clamp((t - a) / (b - a), 0, 1);
        return x * x * (3 - 2 * x);
      },
      /**
       * Map value from one range to another
       */
      mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
      },
      /**
       * Check if two numbers are approximately equal
       */
      approxEqual(a, b, epsilon = 1e-6) {
        return Math.abs(a - b) < epsilon;
      },
      /**
       * Calculate sign with zero handling
       */
      sign(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
      },
      /**
       * Modulo that handles negative numbers correctly
       */
      mod(n, m) {
        return (n % m + m) % m;
      },
      /**
       * Random number in range
       */
      randomRange(min, max) {
        return min + Math.random() * (max - min);
      },
      /**
       * Random integer in range (inclusive)
       */
      randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      /**
       * Gaussian random number
       */
      randomGaussian(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      },
      // Constants
      PI: Math.PI,
      TWO_PI: Math.PI * 2,
      HALF_PI: Math.PI / 2,
      EPSILON: 1e-6,
      DEG2RAD: Math.PI / 180,
      RAD2DEG: 180 / Math.PI
    };
  }
});

// src/constraints/ConstraintSolver.ts
var ConstraintSolver_exports = {};
__export(ConstraintSolver_exports, {
  BallConstraint: () => BallConstraint,
  ConstraintFactory: () => ConstraintFactory,
  ConstraintSolver: () => ConstraintSolver,
  DistanceConstraint: () => DistanceConstraint,
  FixedConstraint: () => FixedConstraint,
  HingeConstraint: () => HingeConstraint,
  SliderConstraint: () => SliderConstraint,
  SpringConstraint: () => SpringConstraint,
  default: () => ConstraintSolver_default
});
var FixedConstraint, HingeConstraint, BallConstraint, DistanceConstraint, SpringConstraint, SliderConstraint, ConstraintSolver, ConstraintFactory, ConstraintSolver_default;
var init_ConstraintSolver = __esm({
  "src/constraints/ConstraintSolver.ts"() {
    init_math();
    FixedConstraint = class {
      constructor(config) {
        this.type = "fixed";
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.effectiveMass = Mat3.identity();
        this.angularMass = Mat3.identity();
        this.positionBias = { x: 0, y: 0, z: 0 };
        this.angularBias = { x: 0, y: 0, z: 0 };
        this.baumgarte = 0.2;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
        if (config.breakTorque !== void 0) this.breakTorque = config.breakTorque;
        this.initialRelativeRotation = { x: 0, y: 0, z: 0, w: 1 };
      }
      setInitialState(bodyA, bodyB) {
        if (bodyB) {
          this.initialRelativeRotation = Quat.multiply(
            Quat.conjugate(bodyA.rotation),
            bodyB.rotation
          );
        } else {
          this.initialRelativeRotation = Quat.conjugate(bodyA.rotation);
        }
      }
      prepare(bodyA, bodyB, dt) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        let rB;
        if (bodyB) {
          rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
          worldAnchorB = Vec3.add(bodyB.position, rB);
        } else {
          rB = { x: 0, y: 0, z: 0 };
          worldAnchorB = this.anchorB;
        }
        const positionError = Vec3.sub(worldAnchorB, worldAnchorA);
        this.positionBias = Vec3.scale(positionError, this.baumgarte / dt);
        const currentRelativeRot = bodyB ? Quat.multiply(Quat.conjugate(bodyA.rotation), bodyB.rotation) : Quat.conjugate(bodyA.rotation);
        const errorQuat = Quat.multiply(currentRelativeRot, Quat.conjugate(this.initialRelativeRotation));
        this.angularBias = Vec3.scale({ x: errorQuat.x * 2, y: errorQuat.y * 2, z: errorQuat.z * 2 }, this.baumgarte / dt);
        const skewA = Mat3.skew(rA);
        const skewB = Mat3.skew(rB);
        let K = Mat3.identity();
        K = Mat3.scale(K, bodyA.invMass);
        const IA = Mat3.multiply(Mat3.multiply(skewA, bodyA.invInertia), Mat3.transpose(skewA));
        K = Mat3.add(K, IA);
        if (bodyB) {
          K = Mat3.scale(K, 1);
          K[0] += bodyB.invMass;
          K[4] += bodyB.invMass;
          K[8] += bodyB.invMass;
          const IB = Mat3.multiply(Mat3.multiply(skewB, bodyB.invInertia), Mat3.transpose(skewB));
          K = Mat3.add(K, IB);
        }
        this.effectiveMass = Mat3.inverse(K) || Mat3.identity();
        let angularK = bodyA.invInertia;
        if (bodyB) {
          angularK = Mat3.add(angularK, bodyB.invInertia);
        }
        this.angularMass = Mat3.inverse(angularK) || Mat3.identity();
      }
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        let velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
        let velB;
        let rB;
        if (bodyB) {
          rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
          velB = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB));
        } else {
          rB = { x: 0, y: 0, z: 0 };
          velB = { x: 0, y: 0, z: 0 };
        }
        const relVel = Vec3.sub(velB, velA);
        const Cdot = Vec3.add(relVel, this.positionBias);
        const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));
        this.applyImpulse(bodyA, bodyB, rA, rB, impulse);
        const angVelA = bodyA.angularVelocity;
        const angVelB = bodyB ? bodyB.angularVelocity : { x: 0, y: 0, z: 0 };
        const relAngVel = Vec3.sub(angVelB, angVelA);
        const angCdot = Vec3.add(relAngVel, this.angularBias);
        const angularImpulse = Mat3.multiplyVector(this.angularMass, Vec3.negate(angCdot));
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
        this.reactionForce = Vec3.add(this.reactionForce, impulse);
        this.reactionTorque = Vec3.add(this.reactionTorque, angularImpulse);
        this.checkBreak();
      }
      solvePosition(bodyA, bodyB) {
      }
      applyImpulse(bodyA, bodyB, rA, rB, impulse) {
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
      checkBreak() {
        const forceMag = Vec3.length(this.reactionForce);
        const torqueMag = Vec3.length(this.reactionTorque);
        if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
          this.isBroken = true;
        }
      }
      getState() {
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: 0,
          currentDistance: 0,
          isBroken: this.isBroken
        };
      }
    };
    HingeConstraint = class {
      constructor(config) {
        this.type = "hinge";
        // Local to bodyA
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        // Limits
        this.lowerLimit = -Math.PI;
        this.upperLimit = Math.PI;
        this.limitsEnabled = false;
        // Motor
        this.motorEnabled = false;
        this.motorTargetVelocity = 0;
        this.motorMaxTorque = 0;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.currentAngle = 0;
        this.effectiveMass = Mat3.identity();
        this.angularMass = 0;
        this.motorMass = 0;
        this.positionBias = { x: 0, y: 0, z: 0 };
        this.baumgarte = 0.2;
        this.initialAngle = 0;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        this.axis = Vec3.normalize(config.axis);
        if (config.lowerLimit !== void 0) this.lowerLimit = config.lowerLimit;
        if (config.upperLimit !== void 0) this.upperLimit = config.upperLimit;
        if (config.limitsEnabled !== void 0) this.limitsEnabled = config.limitsEnabled;
        if (config.motorEnabled !== void 0) this.motorEnabled = config.motorEnabled;
        if (config.motorTargetVelocity !== void 0) this.motorTargetVelocity = config.motorTargetVelocity;
        if (config.motorMaxTorque !== void 0) this.motorMaxTorque = config.motorMaxTorque;
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
        if (config.breakTorque !== void 0) this.breakTorque = config.breakTorque;
      }
      setInitialState(bodyA, bodyB) {
        this.initialAngle = this.calculateAngle(bodyA, bodyB);
      }
      calculateAngle(bodyA, bodyB) {
        const worldAxisA = Quat.rotateVector(bodyA.rotation, this.axis);
        let refA;
        if (Math.abs(this.axis.y) < 0.9) {
          refA = Vec3.normalize(Vec3.cross(this.axis, { x: 0, y: 1, z: 0 }));
        } else {
          refA = Vec3.normalize(Vec3.cross(this.axis, { x: 1, y: 0, z: 0 }));
        }
        const worldRefA = Quat.rotateVector(bodyA.rotation, refA);
        const worldRefB = bodyB ? Quat.rotateVector(bodyB.rotation, refA) : refA;
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
      prepare(bodyA, bodyB, dt) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        let rB;
        if (bodyB) {
          rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
          worldAnchorB = Vec3.add(bodyB.position, rB);
        } else {
          rB = { x: 0, y: 0, z: 0 };
          worldAnchorB = this.anchorB;
        }
        const positionError = Vec3.sub(worldAnchorB, worldAnchorA);
        this.positionBias = Vec3.scale(positionError, this.baumgarte / dt);
        this.currentAngle = this.calculateAngle(bodyA, bodyB) - this.initialAngle;
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
        const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);
        const iA = Vec3.dot(worldAxis, Mat3.multiplyVector(bodyA.invInertia, worldAxis));
        const iB = bodyB ? Vec3.dot(worldAxis, Mat3.multiplyVector(bodyB.invInertia, worldAxis)) : 0;
        this.angularMass = iA + iB > 0 ? 1 / (iA + iB) : 0;
        this.motorMass = this.angularMass;
      }
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const rB = bodyB ? Quat.rotateVector(bodyB.rotation, this.anchorB) : { x: 0, y: 0, z: 0 };
        const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
        const velB = bodyB ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB)) : { x: 0, y: 0, z: 0 };
        const relVel = Vec3.sub(velB, velA);
        const Cdot = Vec3.add(relVel, this.positionBias);
        const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));
        this.applyImpulse(bodyA, bodyB, rA, rB, impulse);
        this.reactionForce = Vec3.add(this.reactionForce, impulse);
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
        if (this.limitsEnabled) {
          const angVelA = Vec3.dot(bodyA.angularVelocity, worldAxis);
          const angVelB = bodyB ? Vec3.dot(bodyB.angularVelocity, worldAxis) : 0;
          const relAngVel = angVelB - angVelA;
          if (this.currentAngle <= this.lowerLimit) {
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
      solvePosition(bodyA, bodyB) {
      }
      applyImpulse(bodyA, bodyB, rA, rB, impulse) {
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
      checkBreak() {
        const forceMag = Vec3.length(this.reactionForce);
        const torqueMag = Vec3.length(this.reactionTorque);
        if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
          this.isBroken = true;
        }
      }
      getState() {
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: this.currentAngle,
          currentDistance: 0,
          isBroken: this.isBroken
        };
      }
    };
    BallConstraint = class {
      constructor(config) {
        this.type = "ball";
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.effectiveMass = Mat3.identity();
        this.positionBias = { x: 0, y: 0, z: 0 };
        this.baumgarte = 0.2;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
        if (config.breakTorque !== void 0) this.breakTorque = config.breakTorque;
      }
      prepare(bodyA, bodyB, dt) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        let rB;
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
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const rB = bodyB ? Quat.rotateVector(bodyB.rotation, this.anchorB) : { x: 0, y: 0, z: 0 };
        const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
        const velB = bodyB ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB)) : { x: 0, y: 0, z: 0 };
        const relVel = Vec3.sub(velB, velA);
        const Cdot = Vec3.add(relVel, this.positionBias);
        const impulse = Mat3.multiplyVector(this.effectiveMass, Vec3.negate(Cdot));
        this.applyImpulse(bodyA, bodyB, rA, rB, impulse);
        this.reactionForce = Vec3.add(this.reactionForce, impulse);
        this.checkBreak();
      }
      solvePosition(bodyA, bodyB) {
      }
      applyImpulse(bodyA, bodyB, rA, rB, impulse) {
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
      checkBreak() {
        if (Vec3.length(this.reactionForce) > this.breakForce) {
          this.isBroken = true;
        }
      }
      getState() {
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: 0,
          currentDistance: 0,
          isBroken: this.isBroken
        };
      }
    };
    DistanceConstraint = class {
      constructor(config) {
        this.type = "distance";
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.effectiveMass = 0;
        this.bias = 0;
        this.axis = { x: 0, y: 1, z: 0 };
        this.baumgarte = 0.2;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        this.distance = config.distance;
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
      }
      prepare(bodyA, bodyB, dt) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        let rB;
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
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const rB = bodyB ? Quat.rotateVector(bodyB.rotation, this.anchorB) : { x: 0, y: 0, z: 0 };
        const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
        const velB = bodyB ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB)) : { x: 0, y: 0, z: 0 };
        const relVel = Vec3.sub(velB, velA);
        const Cdot = Vec3.dot(relVel, this.axis) + this.bias;
        const lambda = -this.effectiveMass * Cdot;
        const impulse = Vec3.scale(this.axis, lambda);
        this.applyImpulse(bodyA, bodyB, rA, rB, impulse);
        this.reactionForce = Vec3.add(this.reactionForce, impulse);
        this.checkBreak();
      }
      solvePosition(bodyA, bodyB) {
      }
      applyImpulse(bodyA, bodyB, rA, rB, impulse) {
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
      checkBreak() {
        if (Vec3.length(this.reactionForce) > this.breakForce) {
          this.isBroken = true;
        }
      }
      getState() {
        const rA = this.anchorA;
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: 0,
          currentDistance: this.distance,
          // Would calculate actual distance
          isBroken: this.isBroken
        };
      }
    };
    SpringConstraint = class {
      constructor(config) {
        this.type = "spring";
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.currentLength = 0;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        this.restLength = config.restLength;
        this.stiffness = config.stiffness;
        this.damping = config.damping;
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
      }
      prepare(bodyA, bodyB, dt) {
      }
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        let rB;
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
        const displacement = this.currentLength - this.restLength;
        const springForce = this.stiffness * displacement;
        const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
        const velB = bodyB ? Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB)) : { x: 0, y: 0, z: 0 };
        const relVel = Vec3.dot(Vec3.sub(velB, velA), axis);
        const dampingForce = this.damping * relVel;
        const totalForce = springForce + dampingForce;
        const impulse = Vec3.scale(axis, totalForce);
        this.applyForce(bodyA, bodyB, rA, rB, impulse);
        this.reactionForce = impulse;
        this.checkBreak();
      }
      solvePosition(bodyA, bodyB) {
      }
      applyForce(bodyA, bodyB, rA, rB, force) {
        if (!bodyA.isStatic && !bodyA.isKinematic) {
          bodyA.velocity = Vec3.add(bodyA.velocity, Vec3.scale(force, bodyA.invMass * 0.016));
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
      checkBreak() {
        if (Vec3.length(this.reactionForce) > this.breakForce) {
          this.isBroken = true;
        }
      }
      getState() {
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: 0,
          currentDistance: this.currentLength,
          isBroken: this.isBroken
        };
      }
    };
    SliderConstraint = class {
      constructor(config) {
        this.type = "slider";
        this.enabled = true;
        this.breakForce = Infinity;
        this.breakTorque = Infinity;
        this.isBroken = false;
        // Limits
        this.lowerLimit = -Infinity;
        this.upperLimit = Infinity;
        this.limitsEnabled = false;
        // Motor
        this.motorEnabled = false;
        this.motorTargetVelocity = 0;
        this.motorMaxForce = 0;
        this.reactionForce = { x: 0, y: 0, z: 0 };
        this.reactionTorque = { x: 0, y: 0, z: 0 };
        this.currentPosition = 0;
        this.effectiveMass = 0;
        this.baumgarte = 0.2;
        this.id = config.id;
        this.bodyA = config.bodyA;
        this.bodyB = config.bodyB;
        this.anchorA = { ...config.anchorA };
        this.anchorB = { ...config.anchorB };
        this.axis = Vec3.normalize(config.axis);
        if (config.lowerLimit !== void 0) this.lowerLimit = config.lowerLimit;
        if (config.upperLimit !== void 0) this.upperLimit = config.upperLimit;
        if (config.limitsEnabled !== void 0) this.limitsEnabled = config.limitsEnabled;
        if (config.motorEnabled !== void 0) this.motorEnabled = config.motorEnabled;
        if (config.motorTargetVelocity !== void 0) this.motorTargetVelocity = config.motorTargetVelocity;
        if (config.motorMaxForce !== void 0) this.motorMaxForce = config.motorMaxForce;
        if (config.breakForce !== void 0) this.breakForce = config.breakForce;
        if (config.breakTorque !== void 0) this.breakTorque = config.breakTorque;
      }
      prepare(bodyA, bodyB, dt) {
        if (!this.enabled || this.isBroken) return;
        const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);
        const rA = Quat.rotateVector(bodyA.rotation, this.anchorA);
        const worldAnchorA = Vec3.add(bodyA.position, rA);
        let worldAnchorB;
        if (bodyB) {
          const rB = Quat.rotateVector(bodyB.rotation, this.anchorB);
          worldAnchorB = Vec3.add(bodyB.position, rB);
        } else {
          worldAnchorB = this.anchorB;
        }
        const delta = Vec3.sub(worldAnchorB, worldAnchorA);
        this.currentPosition = Vec3.dot(delta, worldAxis);
        let K = bodyA.invMass;
        if (bodyB) {
          K += bodyB.invMass;
        }
        this.effectiveMass = K > 0 ? 1 / K : 0;
      }
      solve(bodyA, bodyB) {
        if (!this.enabled || this.isBroken) return;
        const worldAxis = Quat.rotateVector(bodyA.rotation, this.axis);
        if (this.motorEnabled) {
          const relVel = bodyB ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis) : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);
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
        if (this.limitsEnabled) {
          if (this.currentPosition <= this.lowerLimit) {
            const relVel = bodyB ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis) : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);
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
            const relVel = bodyB ? Vec3.dot(Vec3.sub(bodyB.velocity, bodyA.velocity), worldAxis) : Vec3.dot(Vec3.negate(bodyA.velocity), worldAxis);
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
      solvePosition(bodyA, bodyB) {
      }
      checkBreak() {
        const forceMag = Vec3.length(this.reactionForce);
        const torqueMag = Vec3.length(this.reactionTorque);
        if (forceMag > this.breakForce || torqueMag > this.breakTorque) {
          this.isBroken = true;
        }
      }
      getState() {
        return {
          constraintId: this.id,
          reactionForce: { ...this.reactionForce },
          reactionTorque: { ...this.reactionTorque },
          currentAngle: 0,
          currentDistance: this.currentPosition,
          isBroken: this.isBroken
        };
      }
    };
    ConstraintSolver = class {
      constructor(options) {
        this.constraints = /* @__PURE__ */ new Map();
        this.velocityIterations = 8;
        this.positionIterations = 3;
        if (options?.velocityIterations) this.velocityIterations = options.velocityIterations;
        if (options?.positionIterations) this.positionIterations = options.positionIterations;
      }
      addConstraint(constraint) {
        this.constraints.set(constraint.id, constraint);
      }
      removeConstraint(id) {
        this.constraints.delete(id);
      }
      getConstraint(id) {
        return this.constraints.get(id);
      }
      solve(bodies, dt) {
        const states = [];
        for (const [id, constraint] of this.constraints) {
          if (constraint.isBroken) {
            this.constraints.delete(id);
          }
        }
        for (const constraint of this.constraints.values()) {
          if (!constraint.enabled || constraint.isBroken) continue;
          const bodyA = bodies.get(constraint.bodyA);
          const bodyB = constraint.bodyB === "world" ? null : bodies.get(constraint.bodyB);
          if (!bodyA) continue;
          constraint.reactionForce = { x: 0, y: 0, z: 0 };
          constraint.reactionTorque = { x: 0, y: 0, z: 0 };
          constraint.prepare(bodyA, bodyB, dt);
        }
        for (let i = 0; i < this.velocityIterations; i++) {
          for (const constraint of this.constraints.values()) {
            if (!constraint.enabled || constraint.isBroken) continue;
            const bodyA = bodies.get(constraint.bodyA);
            const bodyB = constraint.bodyB === "world" ? null : bodies.get(constraint.bodyB);
            if (!bodyA) continue;
            constraint.solve(bodyA, bodyB);
          }
        }
        for (let i = 0; i < this.positionIterations; i++) {
          for (const constraint of this.constraints.values()) {
            if (!constraint.enabled || constraint.isBroken) continue;
            const bodyA = bodies.get(constraint.bodyA);
            const bodyB = constraint.bodyB === "world" ? null : bodies.get(constraint.bodyB);
            if (!bodyA) continue;
            constraint.solvePosition(bodyA, bodyB);
          }
        }
        for (const constraint of this.constraints.values()) {
          states.push(constraint.getState());
        }
        return states;
      }
      clear() {
        this.constraints.clear();
      }
      getConstraints() {
        return Array.from(this.constraints.values());
      }
    };
    ConstraintFactory = class {
      static create(config) {
        switch (config.type) {
          case "fixed":
            return new FixedConstraint({
              id: config.id || `fixed_${Date.now()}`,
              bodyA: config.bodyA,
              bodyB: config.bodyB,
              anchorA: config.anchorA,
              anchorB: config.anchorB,
              breakForce: config.breakForce,
              breakTorque: config.breakTorque
            });
          case "hinge":
            return new HingeConstraint({
              id: config.id || `hinge_${Date.now()}`,
              bodyA: config.bodyA,
              bodyB: config.bodyB,
              anchorA: config.anchorA,
              anchorB: config.anchorB,
              axis: config.axis || { x: 0, y: 0, z: 1 },
              lowerLimit: config.limits?.min,
              upperLimit: config.limits?.max,
              limitsEnabled: config.limits !== void 0,
              breakForce: config.breakForce,
              breakTorque: config.breakTorque
            });
          case "ball":
            return new BallConstraint({
              id: config.id || `ball_${Date.now()}`,
              bodyA: config.bodyA,
              bodyB: config.bodyB,
              anchorA: config.anchorA,
              anchorB: config.anchorB,
              breakForce: config.breakForce,
              breakTorque: config.breakTorque
            });
          case "distance":
            return new DistanceConstraint({
              id: config.id || `distance_${Date.now()}`,
              bodyA: config.bodyA,
              bodyB: config.bodyB,
              anchorA: config.anchorA,
              anchorB: config.anchorB,
              distance: Vec3.length(Vec3.sub(config.anchorB, config.anchorA)),
              breakForce: config.breakForce
            });
          case "spring":
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
          case "slider":
            return new SliderConstraint({
              id: config.id || `slider_${Date.now()}`,
              bodyA: config.bodyA,
              bodyB: config.bodyB,
              anchorA: config.anchorA,
              anchorB: config.anchorB,
              axis: config.axis || { x: 1, y: 0, z: 0 },
              lowerLimit: config.limits?.min,
              upperLimit: config.limits?.max,
              limitsEnabled: config.limits !== void 0,
              breakForce: config.breakForce,
              breakTorque: config.breakTorque
            });
          default:
            throw new Error(`Unknown constraint type: ${config.type}`);
        }
      }
    };
    ConstraintSolver_default = ConstraintSolver;
  }
});

// src/index.ts
init_math();

// src/core/Engine.ts
init_math();

// src/core/PhysicsObject.ts
init_math();
var DEFAULT_MATERIAL = {
  friction: 0.5,
  staticFriction: 0.6,
  restitution: 0.3,
  rollingResistance: 0.01
};
function calculateInertiaTensor(type, config, mass) {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;
  switch (type) {
    case "sphere": {
      const i = 2 / 5 * mass * radius * radius;
      return Mat3.diagonal(i, i, i);
    }
    case "box": {
      const ix = 1 / 12 * mass * (height * height + depth * depth);
      const iy = 1 / 12 * mass * (width * width + depth * depth);
      const iz = 1 / 12 * mass * (width * width + height * height);
      return Mat3.diagonal(ix, iy, iz);
    }
    case "cylinder": {
      const ix = 1 / 12 * mass * (3 * radius * radius + height * height);
      const iy = 1 / 2 * mass * radius * radius;
      const iz = ix;
      return Mat3.diagonal(ix, iy, iz);
    }
    case "capsule": {
      const cylinderMass = mass * (height / (height + 4 / 3 * radius));
      const sphereMass = mass - cylinderMass;
      const cylIx = 1 / 12 * cylinderMass * (3 * radius * radius + height * height);
      const cylIy = 1 / 2 * cylinderMass * radius * radius;
      const sphI = 2 / 5 * sphereMass * radius * radius;
      const sphOffset = (height / 2 + radius) * (height / 2 + radius);
      const ix = cylIx + 2 * (sphI + sphereMass * sphOffset / 2);
      const iy = cylIy + 2 * sphI;
      const iz = ix;
      return Mat3.diagonal(ix, iy, iz);
    }
    case "cone": {
      const ix = 3 / 20 * mass * radius * radius + 3 / 80 * mass * height * height;
      const iy = 3 / 10 * mass * radius * radius;
      const iz = ix;
      return Mat3.diagonal(ix, iy, iz);
    }
    default: {
      const avgSize = Math.cbrt(width * height * depth);
      const i = 2 / 5 * mass * avgSize * avgSize;
      return Mat3.diagonal(i, i, i);
    }
  }
}
function calculateVolume(type, config) {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;
  switch (type) {
    case "sphere":
      return 4 / 3 * Math.PI * radius * radius * radius;
    case "box":
      return width * height * depth;
    case "cylinder":
      return Math.PI * radius * radius * height;
    case "capsule":
      return Math.PI * radius * radius * height + 4 / 3 * Math.PI * radius * radius * radius;
    case "cone":
      return 1 / 3 * Math.PI * radius * radius * height;
    default:
      return width * height * depth;
  }
}
function calculateBoundingVolume(type, config, scale) {
  const { radius = 1, width = 1, height = 1, depth = 1 } = config;
  switch (type) {
    case "sphere":
      return {
        type: "sphere",
        center: Vec3.ZERO,
        radius: radius * Math.max(scale.x, scale.y, scale.z)
      };
    default:
      return {
        type: "box",
        center: Vec3.ZERO,
        halfExtents: {
          x: width / 2 * scale.x,
          y: height / 2 * scale.y,
          z: depth / 2 * scale.z
        }
      };
  }
}
function calculateCrossSectionArea(type, config) {
  const { radius = 1, width = 1, height = 1 } = config;
  switch (type) {
    case "sphere":
      return Math.PI * radius * radius;
    case "box":
      return width * height;
    // front face
    case "cylinder":
      return Math.PI * radius * radius;
    default:
      return width * height;
  }
}
var PhysicsObject = class _PhysicsObject {
  constructor(id, config) {
    // Internal state
    this.sleepTime = 0;
    this._accumulatedForce = Vec3.create();
    this._accumulatedTorque = Vec3.create();
    this.id = id;
    this.name = config.name ?? id;
    this.type = config.type;
    this._initialState = { ...config };
    this.radius = config.radius ?? 1;
    this.width = config.width ?? 1;
    this.height = config.height ?? 1;
    this.depth = config.depth ?? 1;
    this.length = config.length ?? 1;
    this.position = this._parseVector3(config.position) ?? Vec3.create();
    this.rotation = this._parseQuaternion(config.rotation) ?? Quat.identity();
    this.scale = this._parseVector3(config.scale) ?? Vec3.create(1, 1, 1);
    this._volume = calculateVolume(config.type, config);
    if (config.mass !== void 0) {
      this._mass = config.mass;
    } else if (config.density !== void 0) {
      this._mass = config.density * this._volume;
    } else {
      this._mass = 1;
    }
    this.isStatic = config.isStatic ?? false;
    this._inverseMass = this.isStatic ? 0 : 1 / this._mass;
    this.centerOfMass = config.centerOfMass ?? Vec3.create();
    if (config.inertiaTensor) {
      this.inertiaTensor = config.inertiaTensor;
    } else {
      this.inertiaTensor = calculateInertiaTensor(config.type, config, this._mass);
    }
    this._inverseInertiaTensor = this.isStatic ? Mat3.zero() : Mat3.inverse(this.inertiaTensor) ?? Mat3.identity();
    this.material = { ...DEFAULT_MATERIAL, ...config.material };
    this.velocity = this._parseVector3(config.velocity) ?? Vec3.create();
    this.angularVelocity = this._parseVector3(config.angularVelocity) ?? Vec3.create();
    this.linearDamping = config.linearDamping ?? 0.01;
    this.angularDamping = config.angularDamping ?? 0.05;
    this.dragCoefficient = config.dragCoefficient ?? 0.47;
    this.liftCoefficient = config.liftCoefficient ?? 0;
    this.crossSectionArea = config.crossSectionArea ?? calculateCrossSectionArea(config.type, config);
    this.isKinematic = config.isKinematic ?? false;
    this.isTrigger = config.isTrigger ?? false;
    this.isSleeping = false;
    this.collisionGroup = config.collisionGroup ?? 1;
    this.collisionMask = config.collisionMask ?? 4294967295;
    this.charge = config.charge ?? 0;
    this.temperature = config.temperature ?? 293.15;
    this.customData = config.customData ?? {};
    this._boundingVolume = calculateBoundingVolume(config.type, config, this.scale);
  }
  // ============================================================================
  // GETTERS
  // ============================================================================
  get mass() {
    return this._mass;
  }
  set mass(value) {
    this._mass = value;
    this._inverseMass = this.isStatic ? 0 : 1 / value;
    this.inertiaTensor = calculateInertiaTensor(this.type, this._initialState, value);
    this._inverseInertiaTensor = this.isStatic ? Mat3.zero() : Mat3.inverse(this.inertiaTensor) ?? Mat3.identity();
  }
  get inverseMass() {
    return this._inverseMass;
  }
  get inverseInertiaTensor() {
    return this._inverseInertiaTensor;
  }
  get volume() {
    return this._volume;
  }
  get kineticEnergy() {
    const linearKE = 0.5 * this._mass * Vec3.lengthSquared(this.velocity);
    const Iw = Mat3.multiplyVector(this.inertiaTensor, this.angularVelocity);
    const rotationalKE = 0.5 * Vec3.dot(this.angularVelocity, Iw);
    return linearKE + rotationalKE;
  }
  get momentum() {
    return Vec3.scale(this.velocity, this._mass);
  }
  get angularMomentum() {
    return Mat3.multiplyVector(this.inertiaTensor, this.angularVelocity);
  }
  get boundingBox() {
    return this._boundingVolume;
  }
  // ============================================================================
  // FORCE APPLICATION
  // ============================================================================
  applyForce(force, point) {
    if (this.isStatic) return;
    this.wakeUp();
    this._accumulatedForce = Vec3.add(this._accumulatedForce, force);
    if (point) {
      const worldPoint = this.localToWorld(point);
      const r = Vec3.sub(worldPoint, this.position);
      const torque = Vec3.cross(r, force);
      this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
    }
  }
  applyImpulse(impulse, point) {
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
  applyTorque(torque) {
    if (this.isStatic) return;
    this.wakeUp();
    this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
  }
  accumulateForce(force) {
    this._accumulatedForce = Vec3.add(this._accumulatedForce, force);
  }
  accumulateTorque(torque) {
    this._accumulatedTorque = Vec3.add(this._accumulatedTorque, torque);
  }
  clearAccumulatedForces() {
    this._accumulatedForce = Vec3.create();
    this._accumulatedTorque = Vec3.create();
  }
  getAccumulatedForces() {
    return {
      force: Vec3.clone(this._accumulatedForce),
      torque: Vec3.clone(this._accumulatedTorque)
    };
  }
  // ============================================================================
  // TRANSFORM METHODS
  // ============================================================================
  setPosition(position) {
    this.position = Vec3.clone(position);
    this.wakeUp();
  }
  setRotation(rotation) {
    this.rotation = Quat.clone(rotation);
    this.wakeUp();
  }
  setVelocity(velocity) {
    this.velocity = Vec3.clone(velocity);
    this.wakeUp();
  }
  setAngularVelocity(angularVelocity) {
    this.angularVelocity = Vec3.clone(angularVelocity);
    this.wakeUp();
  }
  localToWorld(localPoint) {
    const scaled = Vec3.multiply(localPoint, this.scale);
    const rotated = Quat.rotateVector(this.rotation, scaled);
    return Vec3.add(this.position, rotated);
  }
  worldToLocal(worldPoint) {
    const translated = Vec3.sub(worldPoint, this.position);
    const rotated = Quat.rotateVector(Quat.conjugate(this.rotation), translated);
    return Vec3.divide(rotated, this.scale);
  }
  getForward() {
    return Quat.rotateVector(this.rotation, Vec3.FORWARD);
  }
  getUp() {
    return Quat.rotateVector(this.rotation, Vec3.UP);
  }
  getRight() {
    return Quat.rotateVector(this.rotation, Vec3.RIGHT);
  }
  // ============================================================================
  // SLEEP STATE
  // ============================================================================
  sleep() {
    if (this.isStatic) return;
    this.isSleeping = true;
    this.velocity = Vec3.create();
    this.angularVelocity = Vec3.create();
  }
  wakeUp() {
    if (this.isStatic) return;
    this.isSleeping = false;
    this.sleepTime = 0;
  }
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  getState(timestamp) {
    const acceleration = this.isStatic ? Vec3.ZERO : Vec3.scale(this._accumulatedForce, this._inverseMass);
    const angularAcceleration = this.isStatic ? Vec3.ZERO : Mat3.multiplyVector(this._inverseInertiaTensor, this._accumulatedTorque);
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
      potentialEnergy: 0,
      // Calculated by engine with gravity
      totalEnergy: this.kineticEnergy,
      momentum: this.momentum,
      angularMomentum: this.angularMomentum
    };
  }
  restoreState(state) {
    this.position = Vec3.clone(state.position);
    this.rotation = Quat.clone(state.rotation);
    this.velocity = Vec3.clone(state.velocity);
    this.angularVelocity = Vec3.clone(state.angularVelocity);
  }
  reset() {
    this.position = this._parseVector3(this._initialState.position) ?? Vec3.create();
    this.rotation = this._parseQuaternion(this._initialState.rotation) ?? Quat.identity();
    this.velocity = this._parseVector3(this._initialState.velocity) ?? Vec3.create();
    this.angularVelocity = this._parseVector3(this._initialState.angularVelocity) ?? Vec3.create();
    this.clearAccumulatedForces();
    this.wakeUp();
  }
  clone() {
    return new _PhysicsObject(`${this.id}_clone`, this.toJSON());
  }
  toJSON() {
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
      customData: { ...this.customData }
    };
  }
  // ============================================================================
  // COLLISION HELPERS
  // ============================================================================
  /**
   * Get closest point on this object to given point
   */
  closestPoint(point) {
    const localPoint = this.worldToLocal(point);
    let closestLocal;
    switch (this.type) {
      case "sphere": {
        const dist = Vec3.length(localPoint);
        if (dist === 0) {
          closestLocal = Vec3.create(this.radius, 0, 0);
        } else {
          closestLocal = Vec3.scale(Vec3.normalize(localPoint), this.radius);
        }
        break;
      }
      case "box": {
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const halfD = this.depth / 2;
        closestLocal = {
          x: Math.max(-halfW, Math.min(halfW, localPoint.x)),
          y: Math.max(-halfH, Math.min(halfH, localPoint.y)),
          z: Math.max(-halfD, Math.min(halfD, localPoint.z))
        };
        break;
      }
      case "cylinder": {
        const halfH = this.height / 2;
        const { x, y, z } = localPoint;
        const radialDist = Math.sqrt(x * x + z * z);
        if (radialDist <= this.radius && Math.abs(y) <= halfH) {
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
        closestLocal = localPoint;
    }
    return this.localToWorld(closestLocal);
  }
  /**
   * Check if point is inside this object
   */
  containsPoint(point) {
    const local = this.worldToLocal(point);
    switch (this.type) {
      case "sphere":
        return Vec3.lengthSquared(local) <= this.radius * this.radius;
      case "box": {
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const halfD = this.depth / 2;
        return Math.abs(local.x) <= halfW && Math.abs(local.y) <= halfH && Math.abs(local.z) <= halfD;
      }
      case "cylinder": {
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
  _parseVector3(value) {
    if (!value) return void 0;
    if (Array.isArray(value)) {
      return Vec3.fromArray(value);
    }
    return value;
  }
  _parseQuaternion(value) {
    if (!value) return void 0;
    if (Array.isArray(value)) {
      return { x: value[0], y: value[1], z: value[2], w: value[3] };
    }
    return value;
  }
};

// src/forces/ForceSystem.ts
init_math();
function noise3D(x, y, z, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453;
  return n - Math.floor(n);
}
var ForceSystem = class {
  constructor() {
    this._forces = /* @__PURE__ */ new Map();
    this._forceRecords = /* @__PURE__ */ new Map();
  }
  /**
   * Add a force configuration
   */
  addForce(id, config) {
    this._forces.set(id, {
      ...config,
      id,
      enabled: config.enabled ?? true
    });
  }
  /**
   * Remove a force
   */
  removeForce(id) {
    return this._forces.delete(id);
  }
  /**
   * Get a force configuration
   */
  getForce(id) {
    return this._forces.get(id);
  }
  /**
   * Get all forces
   */
  getForces() {
    return new Map(this._forces);
  }
  /**
   * Remove all forces targeting a specific object
   */
  removeForcesForObject(objectId) {
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
  clear() {
    this._forces.clear();
    this._forceRecords.clear();
  }
  /**
   * Apply all forces to objects
   */
  applyForces(objects, time, dt) {
    this._forceRecords.clear();
    for (const [forceId, config] of this._forces) {
      if (!config.enabled) continue;
      if (config.startTime !== void 0 && time < config.startTime) continue;
      if (config.duration !== void 0 && config.startTime !== void 0) {
        if (time > config.startTime + config.duration) continue;
      }
      const targets = this._getTargetObjects(config, objects);
      for (const obj of targets) {
        const appliedForce = this._calculateForce(config, obj, objects, time, dt);
        if (appliedForce) {
          obj.applyForce(appliedForce.force, appliedForce.applicationPoint);
          if (!this._forceRecords.has(obj.id)) {
            this._forceRecords.set(obj.id, []);
          }
          this._forceRecords.get(obj.id).push({
            ...appliedForce,
            sourceId: forceId
          });
        }
      }
    }
  }
  /**
   * Get recorded forces for an object at current time
   */
  getForceRecord(objectId, timestamp) {
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
      netTorque
    };
  }
  _getTargetObjects(config, objects) {
    if (!config.target || config.target === "all") {
      return Array.from(objects.values()).filter((o) => !o.isStatic);
    }
    if (typeof config.target === "string") {
      const obj = objects.get(config.target);
      return obj && !obj.isStatic ? [obj] : [];
    }
    return config.target.map((id) => objects.get(id)).filter((o) => o !== void 0 && !o.isStatic);
  }
  _calculateForce(config, obj, objects, time, dt) {
    switch (config.type) {
      case "constant":
        return this._applyConstantForce(config, obj);
      case "impulse":
        return this._applyImpulse(config, obj, time);
      case "torque":
        return this._applyTorqueForce(config, obj);
      case "spring":
        return this._applySpringForce(config, obj, objects);
      case "attractor":
        return this._applyAttractorForce(config, obj);
      case "repulsor":
        return this._applyRepulsorForce(config, obj);
      case "thruster":
        return this._applyThrusterForce(config, obj);
      case "explosion":
        return this._applyExplosionForce(config, obj, time);
      case "force-field":
        return this._applyForceField(config, obj, time);
      case "vortex-field":
        return this._applyVortexField(config, obj);
      case "noise-field":
        return this._applyNoiseField(config, obj, time);
      default:
        return null;
    }
  }
  _applyConstantForce(config, obj) {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;
    if (!direction) return null;
    const force = Vec3.scale(Vec3.normalize(direction), magnitude);
    const point = this._parseVector3(config.point) ?? Vec3.ZERO;
    return {
      type: "constant",
      sourceId: null,
      force,
      applicationPoint: obj.localToWorld(point),
      torque: Vec3.ZERO
    };
  }
  _applyImpulse(config, obj, time) {
    const startTime = config.startTime ?? 0;
    if (Math.abs(time - startTime) > 1e-3) return null;
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;
    if (!direction) return null;
    const impulse = Vec3.scale(Vec3.normalize(direction), magnitude);
    const point = this._parseVector3(config.point);
    obj.applyImpulse(impulse, point);
    return {
      type: "impulse",
      sourceId: null,
      force: impulse,
      applicationPoint: point ? obj.localToWorld(point) : obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyTorqueForce(config, obj) {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1;
    if (!direction) return null;
    const torque = Vec3.scale(Vec3.normalize(direction), magnitude);
    obj.applyTorque(torque);
    return {
      type: "torque",
      sourceId: null,
      force: Vec3.ZERO,
      applicationPoint: obj.position,
      torque
    };
  }
  _applySpringForce(config, obj, objects) {
    const anchorA = this._parseVector3(config.anchorA) ?? Vec3.ZERO;
    let anchorB = this._parseVector3(config.anchorB);
    if (config.target && typeof config.target === "string") {
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
    const stretch = distance - restLength;
    const normalizedDir = distance > 0 ? Vec3.scale(direction, 1 / distance) : Vec3.ZERO;
    let forceMag = stiffness * stretch;
    const relVelocity = Vec3.dot(obj.velocity, normalizedDir);
    forceMag += damping * relVelocity;
    const force = Vec3.scale(normalizedDir, forceMag);
    return {
      type: "spring",
      sourceId: null,
      force,
      applicationPoint: pointA,
      torque: Vec3.ZERO
    };
  }
  _applyAttractorForce(config, obj) {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 100;
    const maxDistance = config.maxDistance ?? Infinity;
    const direction = Vec3.sub(center, obj.position);
    const distance = Vec3.length(direction);
    if (distance > maxDistance || distance < 1e-3) return null;
    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude;
    forceMag *= this._calculateFalloff(config, distance);
    const force = Vec3.scale(normalizedDir, forceMag);
    return {
      type: "attractor",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyRepulsorForce(config, obj) {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 100;
    const maxDistance = config.maxDistance ?? Infinity;
    const direction = Vec3.sub(obj.position, center);
    const distance = Vec3.length(direction);
    if (distance > maxDistance || distance < 1e-3) return null;
    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude;
    forceMag *= this._calculateFalloff(config, distance);
    const force = Vec3.scale(normalizedDir, forceMag);
    return {
      type: "repulsor",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyThrusterForce(config, obj) {
    const direction = this._parseVector3(config.direction);
    const magnitude = config.magnitude ?? 1e3;
    const point = this._parseVector3(config.point) ?? Vec3.ZERO;
    if (!direction) return null;
    const worldDir = obj.localToWorld(direction);
    const localDir = Vec3.sub(worldDir, obj.position);
    const force = Vec3.scale(Vec3.normalize(localDir), magnitude);
    const applicationPoint = obj.localToWorld(point);
    return {
      type: "thruster",
      sourceId: null,
      force,
      applicationPoint,
      torque: Vec3.ZERO
    };
  }
  _applyExplosionForce(config, obj, time) {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const magnitude = config.magnitude ?? 1e4;
    const maxDistance = config.maxDistance ?? 10;
    const startTime = config.startTime ?? 0;
    const duration = config.duration ?? 0.1;
    if (time < startTime || time > startTime + duration) return null;
    const direction = Vec3.sub(obj.position, center);
    const distance = Vec3.length(direction);
    if (distance > maxDistance || distance < 1e-3) return null;
    const timeFactor = 1 - (time - startTime) / duration;
    const normalizedDir = Vec3.scale(direction, 1 / distance);
    let forceMag = magnitude * timeFactor;
    forceMag *= Math.pow(1 - distance / maxDistance, 2);
    const force = Vec3.scale(normalizedDir, forceMag);
    return {
      type: "explosion",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyForceField(config, obj, time) {
    if (!config.fieldFunction) return null;
    const force = config.fieldFunction(obj.position, obj.velocity, time);
    return {
      type: "force-field",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyVortexField(config, obj) {
    const center = this._parseVector3(config.center) ?? Vec3.ZERO;
    const axis = Vec3.normalize(this._parseVector3(config.axis) ?? Vec3.UP);
    const tangentialStrength = config.tangentialStrength ?? 100;
    const radialStrength = config.radialStrength ?? -10;
    const maxDistance = config.maxDistance ?? Infinity;
    const toObj = Vec3.sub(obj.position, center);
    const alongAxis = Vec3.scale(axis, Vec3.dot(toObj, axis));
    const radial = Vec3.sub(toObj, alongAxis);
    const distance = Vec3.length(radial);
    if (distance > maxDistance || distance < 1e-3) return null;
    const radialNorm = Vec3.scale(radial, 1 / distance);
    const tangential = Vec3.cross(axis, radialNorm);
    const tangentForce = Vec3.scale(tangential, tangentialStrength);
    const radialForce = Vec3.scale(radialNorm, radialStrength);
    const force = Vec3.add(tangentForce, radialForce);
    return {
      type: "vortex-field",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _applyNoiseField(config, obj, time) {
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
      type: "noise-field",
      sourceId: null,
      force,
      applicationPoint: obj.position,
      torque: Vec3.ZERO
    };
  }
  _calculateFalloff(config, distance) {
    const maxDistance = config.maxDistance ?? Infinity;
    switch (config.falloff) {
      case "none":
        return 1;
      case "linear":
        return Math.max(0, 1 - distance / maxDistance);
      case "quadratic":
        return Math.max(0, Math.pow(1 - distance / maxDistance, 2));
      case "custom":
        return config.falloffFunction?.(distance) ?? 1;
      default:
        return 1;
    }
  }
  _parseVector3(value) {
    if (!value) return void 0;
    if (Array.isArray(value)) {
      return Vec3.fromArray(value);
    }
    return value;
  }
};

// src/core/Engine.ts
init_ConstraintSolver();

// src/collision/CollisionSystem.ts
init_math();
var AABBUtils = {
  create(min = { x: 0, y: 0, z: 0 }, max = { x: 0, y: 0, z: 0 }) {
    return { min: { ...min }, max: { ...max } };
  },
  fromCenterExtents(center, halfExtents) {
    return {
      min: Vec3.sub(center, halfExtents),
      max: Vec3.add(center, halfExtents)
    };
  },
  fromPoints(points) {
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
  center(aabb) {
    return {
      x: (aabb.min.x + aabb.max.x) * 0.5,
      y: (aabb.min.y + aabb.max.y) * 0.5,
      z: (aabb.min.z + aabb.max.z) * 0.5
    };
  },
  extents(aabb) {
    return {
      x: (aabb.max.x - aabb.min.x) * 0.5,
      y: (aabb.max.y - aabb.min.y) * 0.5,
      z: (aabb.max.z - aabb.min.z) * 0.5
    };
  },
  size(aabb) {
    return Vec3.sub(aabb.max, aabb.min);
  },
  volume(aabb) {
    const s = AABBUtils.size(aabb);
    return s.x * s.y * s.z;
  },
  surfaceArea(aabb) {
    const s = AABBUtils.size(aabb);
    return 2 * (s.x * s.y + s.y * s.z + s.z * s.x);
  },
  intersects(a, b) {
    return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.y <= b.max.y && a.max.y >= b.min.y && a.min.z <= b.max.z && a.max.z >= b.min.z;
  },
  contains(aabb, point) {
    return point.x >= aabb.min.x && point.x <= aabb.max.x && point.y >= aabb.min.y && point.y <= aabb.max.y && point.z >= aabb.min.z && point.z <= aabb.max.z;
  },
  containsAABB(outer, inner) {
    return outer.min.x <= inner.min.x && outer.max.x >= inner.max.x && outer.min.y <= inner.min.y && outer.max.y >= inner.max.y && outer.min.z <= inner.min.z && outer.max.z >= inner.max.z;
  },
  merge(a, b) {
    return {
      min: Vec3.min(a.min, b.min),
      max: Vec3.max(a.max, b.max)
    };
  },
  expand(aabb, amount) {
    return {
      min: { x: aabb.min.x - amount, y: aabb.min.y - amount, z: aabb.min.z - amount },
      max: { x: aabb.max.x + amount, y: aabb.max.y + amount, z: aabb.max.z + amount }
    };
  },
  expandByVelocity(aabb, velocity, dt) {
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
  closestPoint(aabb, point) {
    return {
      x: Math.max(aabb.min.x, Math.min(point.x, aabb.max.x)),
      y: Math.max(aabb.min.y, Math.min(point.y, aabb.max.y)),
      z: Math.max(aabb.min.z, Math.min(point.z, aabb.max.z))
    };
  },
  rayIntersect(aabb, origin, direction) {
    let tMin = -Infinity;
    let tMax = Infinity;
    const axes = ["x", "y", "z"];
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
var SweepAndPrune = class {
  constructor() {
    this.bodies = /* @__PURE__ */ new Map();
    this.xAxis = [];
    this.dirty = true;
  }
  insert(body) {
    this.bodies.set(body.id, body);
    this.xAxis.push(
      { id: body.id, value: body.aabb.min.x, isMin: true },
      { id: body.id, value: body.aabb.max.x, isMin: false }
    );
    this.dirty = true;
  }
  remove(id) {
    this.bodies.delete(id);
    this.xAxis = this.xAxis.filter((e) => e.id !== id);
    this.dirty = true;
  }
  update(body) {
    this.bodies.set(body.id, body);
    for (const endpoint of this.xAxis) {
      if (endpoint.id === body.id) {
        endpoint.value = endpoint.isMin ? body.aabb.min.x : body.aabb.max.x;
      }
    }
    this.dirty = true;
  }
  queryPairs() {
    if (this.dirty) {
      this.xAxis.sort((a, b) => a.value - b.value);
      this.dirty = false;
    }
    const pairs = [];
    const active = /* @__PURE__ */ new Set();
    for (const endpoint of this.xAxis) {
      if (endpoint.isMin) {
        const bodyA = this.bodies.get(endpoint.id);
        if (!bodyA) continue;
        for (const otherId of active) {
          const bodyB = this.bodies.get(otherId);
          if (!bodyB) continue;
          if ((bodyA.collisionGroup & bodyB.collisionMask) === 0 || (bodyB.collisionGroup & bodyA.collisionMask) === 0) {
            continue;
          }
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
  queryAABB(aabb) {
    const results = [];
    for (const [id, body] of this.bodies) {
      if (AABBUtils.intersects(aabb, body.aabb)) {
        results.push(id);
      }
    }
    return results;
  }
  queryRay(origin, direction, maxDistance) {
    const results = [];
    const normalizedDir = Vec3.normalize(direction);
    for (const [id, body] of this.bodies) {
      const result = AABBUtils.rayIntersect(body.aabb, origin, normalizedDir);
      if (result.hit && result.tMin <= maxDistance) {
        results.push(id);
      }
    }
    return results;
  }
  querySphere(center, radius) {
    const results = [];
    const sphereAABB = AABBUtils.fromCenterExtents(center, { x: radius, y: radius, z: radius });
    for (const [id, body] of this.bodies) {
      if (AABBUtils.intersects(sphereAABB, body.aabb)) {
        const closest = AABBUtils.closestPoint(body.aabb, center);
        const distSq = Vec3.lengthSq(Vec3.sub(closest, center));
        if (distSq <= radius * radius) {
          results.push(id);
        }
      }
    }
    return results;
  }
  clear() {
    this.bodies.clear();
    this.xAxis = [];
    this.dirty = true;
  }
};
var SpatialHashGrid = class {
  constructor(cellSize = 10) {
    this.cells = /* @__PURE__ */ new Map();
    this.bodies = /* @__PURE__ */ new Map();
    this.bodyToCells = /* @__PURE__ */ new Map();
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
  }
  hashPosition(x, y, z) {
    const ix = Math.floor(x * this.invCellSize);
    const iy = Math.floor(y * this.invCellSize);
    const iz = Math.floor(z * this.invCellSize);
    return `${ix},${iy},${iz}`;
  }
  getCellsForAABB(aabb) {
    const cells = [];
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
  insert(body) {
    this.bodies.set(body.id, body);
    const cells = this.getCellsForAABB(body.aabb);
    this.bodyToCells.set(body.id, cells);
    for (const cell of cells) {
      if (!this.cells.has(cell)) {
        this.cells.set(cell, /* @__PURE__ */ new Set());
      }
      this.cells.get(cell).add(body.id);
    }
  }
  remove(id) {
    const cells = this.bodyToCells.get(id);
    if (cells) {
      for (const cell of cells) {
        this.cells.get(cell)?.delete(id);
      }
    }
    this.bodyToCells.delete(id);
    this.bodies.delete(id);
  }
  update(body) {
    this.remove(body.id);
    this.insert(body);
  }
  queryPairs() {
    const pairs = [];
    const checked = /* @__PURE__ */ new Set();
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
          if ((bodyA.collisionGroup & bodyB.collisionMask) === 0 || (bodyB.collisionGroup & bodyA.collisionMask) === 0) {
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
  queryAABB(aabb) {
    const cells = this.getCellsForAABB(aabb);
    const results = /* @__PURE__ */ new Set();
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
  queryRay(origin, direction, maxDistance) {
    const normalizedDir = Vec3.normalize(direction);
    const results = /* @__PURE__ */ new Set();
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
  querySphere(center, radius) {
    const aabb = AABBUtils.fromCenterExtents(center, { x: radius, y: radius, z: radius });
    const candidates = this.queryAABB(aabb);
    const results = [];
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
  clear() {
    this.cells.clear();
    this.bodies.clear();
    this.bodyToCells.clear();
  }
};
var NarrowPhase = class {
  /**
   * Test collision between two bodies and generate contact manifold
   */
  static testCollision(bodyA, bodyB) {
    const typeA = bodyA.collider.type;
    const typeB = bodyB.collider.type;
    const posA = Vec3.add(bodyA.position, Quat.rotateVector(bodyA.rotation, bodyA.collider.offset));
    const posB = Vec3.add(bodyB.position, Quat.rotateVector(bodyB.rotation, bodyB.collider.offset));
    const rotA = Quat.multiply(bodyA.rotation, bodyA.collider.rotation);
    const rotB = Quat.multiply(bodyB.rotation, bodyB.collider.rotation);
    let result = null;
    if (typeA === "sphere" && typeB === "sphere") {
      result = this.sphereVsSphere(bodyA, bodyB, posA, posB);
    } else if (typeA === "sphere" && typeB === "box") {
      result = this.sphereVsBox(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === "box" && typeB === "sphere") {
      result = this.sphereVsBox(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === "sphere" && typeB === "plane") {
      result = this.sphereVsPlane(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === "plane" && typeB === "sphere") {
      result = this.sphereVsPlane(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === "box" && typeB === "box") {
      result = this.boxVsBox(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === "box" && typeB === "plane") {
      result = this.boxVsPlane(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === "plane" && typeB === "box") {
      result = this.boxVsPlane(bodyB, bodyA, posB, posA, rotB, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === "sphere" && typeB === "capsule") {
      result = this.sphereVsCapsule(bodyA, bodyB, posA, posB, rotB);
    } else if (typeA === "capsule" && typeB === "sphere") {
      result = this.sphereVsCapsule(bodyB, bodyA, posB, posA, rotA);
      if (result) {
        result = this.flipManifold(result);
      }
    } else if (typeA === "capsule" && typeB === "capsule") {
      result = this.capsuleVsCapsule(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === "capsule" && typeB === "plane") {
      result = this.capsuleVsPlane(bodyA, bodyB, posA, posB, rotA, rotB);
    } else if (typeA === "plane" && typeB === "capsule") {
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
  static flipManifold(manifold) {
    return {
      ...manifold,
      bodyA: manifold.bodyB,
      bodyB: manifold.bodyA,
      normal: Vec3.negate(manifold.normal),
      contacts: manifold.contacts.map((c) => ({
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
  static sphereVsSphere(bodyA, bodyB, posA, posB) {
    const colliderA = bodyA.collider;
    const colliderB = bodyB.collider;
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
  static sphereVsBox(sphereBody, boxBody, spherePos, boxPos, boxRot) {
    const sphere = sphereBody.collider;
    const box = boxBody.collider;
    const invBoxRot = Quat.conjugate(boxRot);
    const localSpherePos = Quat.rotateVector(invBoxRot, Vec3.sub(spherePos, boxPos));
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
    let localNormal;
    let penetration;
    if (dist > 1e-6) {
      localNormal = Vec3.scale(diff, 1 / dist);
      penetration = sphere.radius - dist;
    } else {
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
  static sphereVsPlane(sphereBody, planeBody, spherePos, planePos, planeRot) {
    const sphere = sphereBody.collider;
    const plane = planeBody.collider;
    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
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
  static boxVsBox(bodyA, bodyB, posA, posB, rotA, rotB) {
    const boxA = bodyA.collider;
    const boxB = bodyB.collider;
    const matA = Quat.toMatrix3(rotA);
    const matB = Quat.toMatrix3(rotB);
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
    let minAxis = { x: 0, y: 1, z: 0 };
    const testAxis = (axis) => {
      const len = Vec3.length(axis);
      if (len < 1e-6) return true;
      const normalizedAxis = Vec3.scale(axis, 1 / len);
      let radiusA = 0;
      let radiusB = 0;
      for (let i = 0; i < 3; i++) {
        radiusA += extentsA[i] * Math.abs(Vec3.dot(axesA[i], normalizedAxis));
        radiusB += extentsB[i] * Math.abs(Vec3.dot(axesB[i], normalizedAxis));
      }
      const distance = Math.abs(Vec3.dot(diff, normalizedAxis));
      const penetration = radiusA + radiusB - distance;
      if (penetration < 0) return false;
      if (penetration < minPenetration) {
        minPenetration = penetration;
        minAxis = Vec3.dot(diff, normalizedAxis) < 0 ? Vec3.negate(normalizedAxis) : normalizedAxis;
      }
      return true;
    };
    for (const axis of axesA) {
      if (!testAxis(axis)) return null;
    }
    for (const axis of axesB) {
      if (!testAxis(axis)) return null;
    }
    for (const aAxis of axesA) {
      for (const bAxis of axesB) {
        if (!testAxis(Vec3.cross(aAxis, bAxis))) return null;
      }
    }
    const contacts = this.generateBoxBoxContacts(
      posA,
      rotA,
      boxA.halfExtents,
      posB,
      rotB,
      boxB.halfExtents,
      minAxis,
      minPenetration
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
  static generateBoxBoxContacts(posA, rotA, extentsA, posB, rotB, extentsB, normal, penetration) {
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
  static boxVsPlane(boxBody, planeBody, boxPos, planePos, boxRot, planeRot) {
    const box = boxBody.collider;
    const plane = planeBody.collider;
    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
    const planeD = Vec3.dot(planePos, worldNormal) + plane.distance;
    const vertices = [];
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
    const contacts = [];
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
  static sphereVsCapsule(sphereBody, capsuleBody, spherePos, capsulePos, capsuleRot) {
    const sphere = sphereBody.collider;
    const capsule = capsuleBody.collider;
    const axis = Quat.rotateVector(capsuleRot, { x: 0, y: 1, z: 0 });
    const halfAxis = Vec3.scale(axis, capsule.halfHeight);
    const p0 = Vec3.sub(capsulePos, halfAxis);
    const p1 = Vec3.add(capsulePos, halfAxis);
    const d = Vec3.sub(p1, p0);
    const t = Math.max(0, Math.min(1, Vec3.dot(Vec3.sub(spherePos, p0), d) / Vec3.lengthSq(d)));
    const closest = Vec3.add(p0, Vec3.scale(d, t));
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
  static capsuleVsCapsule(bodyA, bodyB, posA, posB, rotA, rotB) {
    const capsuleA = bodyA.collider;
    const capsuleB = bodyB.collider;
    const axisA = Quat.rotateVector(rotA, { x: 0, y: 1, z: 0 });
    const axisB = Quat.rotateVector(rotB, { x: 0, y: 1, z: 0 });
    const a0 = Vec3.sub(posA, Vec3.scale(axisA, capsuleA.halfHeight));
    const a1 = Vec3.add(posA, Vec3.scale(axisA, capsuleA.halfHeight));
    const b0 = Vec3.sub(posB, Vec3.scale(axisB, capsuleB.halfHeight));
    const b1 = Vec3.add(posB, Vec3.scale(axisB, capsuleB.halfHeight));
    const { pointA, pointB } = this.closestPointsOnSegments(a0, a1, b0, b1);
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
  static capsuleVsPlane(capsuleBody, planeBody, capsulePos, planePos, capsuleRot, planeRot) {
    const capsule = capsuleBody.collider;
    const plane = planeBody.collider;
    const worldNormal = Quat.rotateVector(planeRot, plane.normal);
    const planeD = Vec3.dot(planePos, worldNormal) + plane.distance;
    const axis = Quat.rotateVector(capsuleRot, { x: 0, y: 1, z: 0 });
    const halfAxis = Vec3.scale(axis, capsule.halfHeight);
    const p0 = Vec3.sub(capsulePos, halfAxis);
    const p1 = Vec3.add(capsulePos, halfAxis);
    const d0 = Vec3.dot(p0, worldNormal) - planeD;
    const d1 = Vec3.dot(p1, worldNormal) - planeD;
    const contacts = [];
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
  static closestPointsOnSegments(a0, a1, b0, b1) {
    const d1 = Vec3.sub(a1, a0);
    const d2 = Vec3.sub(b1, b0);
    const r = Vec3.sub(a0, b0);
    const a = Vec3.dot(d1, d1);
    const e = Vec3.dot(d2, d2);
    const f = Vec3.dot(d2, r);
    let s;
    let t;
    if (a <= 1e-6 && e <= 1e-6) {
      return { pointA: a0, pointB: b0 };
    }
    if (a <= 1e-6) {
      s = 0;
      t = Math.max(0, Math.min(1, f / e));
    } else {
      const c = Vec3.dot(d1, r);
      if (e <= 1e-6) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else {
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
};
var ContactSolver = class {
  // Penetration allowance
  constructor(options) {
    this.velocityIterations = 8;
    this.positionIterations = 3;
    this.baumgarte = 0.2;
    // Position correction factor
    this.slop = 5e-3;
    if (options?.velocityIterations) this.velocityIterations = options.velocityIterations;
    if (options?.positionIterations) this.positionIterations = options.positionIterations;
    if (options?.baumgarte) this.baumgarte = options.baumgarte;
    if (options?.slop) this.slop = options.slop;
  }
  /**
   * Solve all contacts for velocity and position
   */
  solve(bodies, manifolds, dt) {
    const physicalManifolds = manifolds.filter((m) => !m.isTrigger);
    const contacts = this.prepareContacts(bodies, physicalManifolds);
    for (let i = 0; i < this.velocityIterations; i++) {
      this.solveVelocities(bodies, contacts);
    }
    for (let i = 0; i < this.positionIterations; i++) {
      this.solvePositions(bodies, physicalManifolds);
    }
  }
  prepareContacts(bodies, manifolds) {
    const contacts = [];
    for (const manifold of manifolds) {
      const bodyA = bodies.get(manifold.bodyA);
      const bodyB = bodies.get(manifold.bodyB);
      if (!bodyA || !bodyB) continue;
      for (const contact of manifold.contacts) {
        const rA = contact.localA;
        const rB = contact.localB;
        const n = manifold.normal;
        const rnA = Vec3.cross(rA, n);
        const rnB = Vec3.cross(rB, n);
        const kNormal = bodyA.invMass + bodyB.invMass + Vec3.dot(rnA, Mat3.multiplyVector(bodyA.invInertia, rnA)) + Vec3.dot(rnB, Mat3.multiplyVector(bodyB.invInertia, rnB));
        const dv = this.getRelativeVelocity(bodyA, bodyB, rA, rB);
        const vn = Vec3.dot(dv, n);
        let tangent = Vec3.sub(dv, Vec3.scale(n, vn));
        const tangentLen = Vec3.length(tangent);
        if (tangentLen > 1e-6) {
          tangent = Vec3.scale(tangent, 1 / tangentLen);
        } else {
          if (Math.abs(n.x) < 0.9) {
            tangent = Vec3.normalize(Vec3.cross(n, { x: 1, y: 0, z: 0 }));
          } else {
            tangent = Vec3.normalize(Vec3.cross(n, { x: 0, y: 1, z: 0 }));
          }
        }
        const bitangent = Vec3.cross(n, tangent);
        const rtA = Vec3.cross(rA, tangent);
        const rtB = Vec3.cross(rB, tangent);
        const kTangent = bodyA.invMass + bodyB.invMass + Vec3.dot(rtA, Mat3.multiplyVector(bodyA.invInertia, rtA)) + Vec3.dot(rtB, Mat3.multiplyVector(bodyB.invInertia, rtB));
        const rbA = Vec3.cross(rA, bitangent);
        const rbB = Vec3.cross(rB, bitangent);
        const kBitangent = bodyA.invMass + bodyB.invMass + Vec3.dot(rbA, Mat3.multiplyVector(bodyA.invInertia, rbA)) + Vec3.dot(rbB, Mat3.multiplyVector(bodyB.invInertia, rbB));
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
          velocityBias: restitution * Math.min(0, vn + 1),
          // Threshold
          normalImpulse: 0,
          tangentImpulse: 0,
          bitangentImpulse: 0
        });
      }
    }
    return contacts;
  }
  solveVelocities(bodies, contacts) {
    for (const contact of contacts) {
      const bodyA = bodies.get(contact.bodyA);
      const bodyB = bodies.get(contact.bodyB);
      if (!bodyA || !bodyB) continue;
      const dv = this.getRelativeVelocity(bodyA, bodyB, contact.rA, contact.rB);
      const vn = Vec3.dot(dv, contact.normal);
      let lambda = contact.normalMass * (-vn + contact.velocityBias);
      const oldImpulse = contact.normalImpulse;
      contact.normalImpulse = Math.max(0, oldImpulse + lambda);
      lambda = contact.normalImpulse - oldImpulse;
      const impulse = Vec3.scale(contact.normal, lambda);
      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, impulse);
      const maxFriction = contact.friction * contact.normalImpulse;
      const vt = Vec3.dot(dv, contact.tangent);
      let lambdaT = contact.tangentMass * -vt;
      const oldTangent = contact.tangentImpulse;
      contact.tangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldTangent + lambdaT));
      lambdaT = contact.tangentImpulse - oldTangent;
      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, Vec3.scale(contact.tangent, lambdaT));
      const vb = Vec3.dot(dv, contact.bitangent);
      let lambdaB = contact.bitangentMass * -vb;
      const oldBitangent = contact.bitangentImpulse;
      contact.bitangentImpulse = Math.max(-maxFriction, Math.min(maxFriction, oldBitangent + lambdaB));
      lambdaB = contact.bitangentImpulse - oldBitangent;
      this.applyImpulse(bodyA, bodyB, contact.rA, contact.rB, Vec3.scale(contact.bitangent, lambdaB));
    }
  }
  solvePositions(bodies, manifolds) {
    for (const manifold of manifolds) {
      const bodyA = bodies.get(manifold.bodyA);
      const bodyB = bodies.get(manifold.bodyB);
      if (!bodyA || !bodyB) continue;
      for (const contact of manifold.contacts) {
        const worldA = Vec3.add(bodyA.position, Quat.rotateVector(bodyA.rotation, contact.localA));
        const worldB = Vec3.add(bodyB.position, Quat.rotateVector(bodyB.rotation, contact.localB));
        const separation = Vec3.dot(Vec3.sub(worldB, worldA), manifold.normal);
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
  getRelativeVelocity(bodyA, bodyB, rA, rB) {
    const velA = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rA));
    const velB = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rB));
    return Vec3.sub(velB, velA);
  }
  applyImpulse(bodyA, bodyB, rA, rB, impulse) {
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
};
var CollisionSystem = class {
  constructor(config = {}) {
    this.bodies = /* @__PURE__ */ new Map();
    this.activeManifolds = /* @__PURE__ */ new Map();
    // Callbacks
    this.onCollisionStart = [];
    this.onCollisionStay = [];
    this.onCollisionEnd = [];
    this.onTriggerEnter = [];
    this.onTriggerExit = [];
    if (config.broadPhase === "spatial-hash") {
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
  addBody(body) {
    this.bodies.set(body.id, body);
    this.broadPhase.insert(body);
  }
  removeBody(id) {
    this.bodies.delete(id);
    this.broadPhase.remove(id);
    for (const [key, manifold] of this.activeManifolds) {
      if (manifold.bodyA === id || manifold.bodyB === id) {
        this.activeManifolds.delete(key);
      }
    }
  }
  updateBody(body) {
    this.bodies.set(body.id, body);
    this.broadPhase.update(body);
  }
  /**
   * Main collision detection and resolution step
   */
  step(dt) {
    const pairs = this.broadPhase.queryPairs();
    const newManifolds = /* @__PURE__ */ new Map();
    const collisions = [];
    for (const pair of pairs) {
      const bodyA = this.bodies.get(pair.bodyA);
      const bodyB = this.bodies.get(pair.bodyB);
      if (!bodyA || !bodyB) continue;
      if (bodyA.isStatic && bodyB.isStatic) continue;
      if (bodyA.isSleeping && bodyB.isSleeping) continue;
      const manifold = NarrowPhase.testCollision(bodyA, bodyB);
      if (manifold) {
        const key = this.manifoldKey(pair.bodyA, pair.bodyB);
        newManifolds.set(key, manifold);
        const info = this.manifoldToCollisionInfo(manifold, bodyA, bodyB);
        collisions.push(info);
        if (!this.activeManifolds.has(key)) {
          if (manifold.isTrigger) {
            this.onTriggerEnter.forEach((cb) => cb(info));
          } else {
            this.onCollisionStart.forEach((cb) => cb(info));
          }
        } else {
          if (!manifold.isTrigger) {
            this.onCollisionStay.forEach((cb) => cb(info));
          }
        }
      }
    }
    for (const [key, manifold] of this.activeManifolds) {
      if (!newManifolds.has(key)) {
        const bodyA = this.bodies.get(manifold.bodyA);
        const bodyB = this.bodies.get(manifold.bodyB);
        if (bodyA && bodyB) {
          const info = this.manifoldToCollisionInfo(manifold, bodyA, bodyB);
          if (manifold.isTrigger) {
            this.onTriggerExit.forEach((cb) => cb(info));
          } else {
            this.onCollisionEnd.forEach((cb) => cb(info));
          }
        }
      }
    }
    this.activeManifolds = newManifolds;
    this.solver.solve(this.bodies, Array.from(newManifolds.values()), dt);
    return collisions;
  }
  manifoldKey(a, b) {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
  }
  manifoldToCollisionInfo(manifold, bodyA, bodyB) {
    const relVel = Vec3.sub(bodyB.velocity, bodyA.velocity);
    return {
      objectA: manifold.bodyA,
      objectB: manifold.bodyB,
      contactPoints: manifold.contacts,
      normal: manifold.normal,
      penetrationDepth: manifold.penetration,
      impulse: { x: 0, y: 0, z: 0 },
      // Calculated during solving
      relativeVelocity: relVel
    };
  }
  // Query methods
  raycast(origin, direction, maxDistance, options) {
    const normalizedDir = Vec3.normalize(direction);
    const candidates = this.broadPhase.queryRay(origin, normalizedDir, maxDistance);
    const hits = [];
    for (const id of candidates) {
      const body = this.bodies.get(id);
      if (!body) continue;
      if (options?.layerMask !== void 0 && (body.collisionGroup & options.layerMask) === 0) {
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
    hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }
  raycastBody(origin, direction, maxDistance, body) {
    const collider = body.collider;
    const pos = Vec3.add(body.position, Quat.rotateVector(body.rotation, collider.offset));
    if (collider.type === "sphere") {
      return this.raycastSphere(origin, direction, maxDistance, pos, collider.radius, body.id);
    } else if (collider.type === "box") {
      const box = collider;
      const rot = Quat.multiply(body.rotation, collider.rotation);
      return this.raycastBox(origin, direction, maxDistance, pos, rot, box.halfExtents, body.id);
    } else if (collider.type === "plane") {
      const plane = collider;
      const rot = Quat.multiply(body.rotation, collider.rotation);
      return this.raycastPlane(origin, direction, maxDistance, pos, rot, plane, body.id);
    }
    return null;
  }
  raycastSphere(origin, direction, maxDistance, center, radius, objectId) {
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
  raycastBox(origin, direction, maxDistance, center, rotation, halfExtents, objectId) {
    const invRot = Quat.conjugate(rotation);
    const localOrigin = Quat.rotateVector(invRot, Vec3.sub(origin, center));
    const localDir = Quat.rotateVector(invRot, direction);
    const aabb = {
      min: Vec3.negate(halfExtents),
      max: halfExtents
    };
    const result = AABBUtils.rayIntersect(aabb, localOrigin, localDir);
    if (!result.hit || result.tMin > maxDistance) return null;
    const localPoint = Vec3.add(localOrigin, Vec3.scale(localDir, result.tMin));
    let localNormal = { x: 0, y: 0, z: 0 };
    const epsilon = 1e-3;
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
  raycastPlane(origin, direction, maxDistance, position, rotation, plane, objectId) {
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
  overlapSphere(center, radius) {
    return this.broadPhase.querySphere(center, radius);
  }
  overlapBox(center, halfExtents, rotation) {
    const aabb = AABBUtils.fromCenterExtents(center, halfExtents);
    return this.broadPhase.queryAABB(aabb);
  }
  // Event registration
  addCollisionStartCallback(callback) {
    this.onCollisionStart.push(callback);
  }
  addCollisionStayCallback(callback) {
    this.onCollisionStay.push(callback);
  }
  addCollisionEndCallback(callback) {
    this.onCollisionEnd.push(callback);
  }
  addTriggerEnterCallback(callback) {
    this.onTriggerEnter.push(callback);
  }
  addTriggerExitCallback(callback) {
    this.onTriggerExit.push(callback);
  }
  clear() {
    this.bodies.clear();
    this.activeManifolds.clear();
    this.broadPhase.clear();
  }
};

// src/environment/Environment.ts
init_math();
var EnvironmentPresets = {
  earth: {
    gravity: { x: 0, y: -9.81, z: 0 },
    airDensity: 1.225,
    airViscosity: 181e-7,
    temperature: 293.15,
    pressure: 101325
  },
  moon: {
    gravity: { x: 0, y: -1.62, z: 0 },
    airDensity: 0,
    airViscosity: 0,
    temperature: 250,
    pressure: 0
  },
  mars: {
    gravity: { x: 0, y: -3.72, z: 0 },
    airDensity: 0.02,
    airViscosity: 12e-6,
    temperature: 210,
    pressure: 636
  },
  jupiter: {
    gravity: { x: 0, y: -24.79, z: 0 },
    airDensity: 0.16,
    airViscosity: 0,
    temperature: 165,
    pressure: 1e5
  },
  space: {
    gravity: { x: 0, y: 0, z: 0 },
    airDensity: 0,
    airViscosity: 0,
    temperature: 2.7,
    // cosmic background
    pressure: 0
  },
  underwater: {
    gravity: { x: 0, y: -9.81, z: 0 },
    airDensity: 1e3,
    // water density
    airViscosity: 1002e-6,
    temperature: 288.15,
    pressure: 202650
    // ~2 atm at 10m depth
  },
  custom: {}
};
var PRESETS = EnvironmentPresets;
var Environment = class {
  constructor(config = {}) {
    this._gravityField = null;
    this._windFunction = null;
    this._magneticField = null;
    this._electricField = null;
    this._fluidFields = [];
    this._config = this._createDefaultConfig();
    this.configure(config);
  }
  _createDefaultConfig() {
    return {
      preset: "earth",
      gravity: Vec3.create(0, -9.81, 0),
      airDensity: 1.225,
      airViscosity: 181e-7,
      temperature: 293.15,
      pressure: 101325,
      wind: Vec3.ZERO,
      fluidFields: [],
      magneticField: Vec3.ZERO,
      electricField: Vec3.ZERO,
      bounds: { type: "none" },
      boundaryBehavior: "reflect",
      boundaryCallback: () => {
      }
    };
  }
  /**
   * Configure the environment
   */
  configure(config) {
    if (config.preset && config.preset !== "custom") {
      const preset = PRESETS[config.preset];
      Object.assign(this._config, preset);
    }
    if (config.gravity !== void 0) {
      if (typeof config.gravity === "number") {
        this._config.gravity = Vec3.create(0, config.gravity, 0);
        this._gravityField = null;
      } else if ("type" in config.gravity) {
        this._gravityField = config.gravity;
        this._config.gravity = Vec3.ZERO;
      } else {
        this._config.gravity = config.gravity;
        this._gravityField = null;
      }
    }
    if (config.airDensity !== void 0) this._config.airDensity = config.airDensity;
    if (config.airViscosity !== void 0) this._config.airViscosity = config.airViscosity;
    if (config.temperature !== void 0) this._config.temperature = config.temperature;
    if (config.pressure !== void 0) this._config.pressure = config.pressure;
    if (config.wind !== void 0) {
      if (typeof config.wind === "function") {
        this._windFunction = config.wind;
        this._config.wind = Vec3.ZERO;
      } else {
        this._config.wind = config.wind;
        this._windFunction = null;
      }
    }
    if (config.fluidFields) {
      this._fluidFields = config.fluidFields;
    }
    if (config.magneticField !== void 0) {
      if (typeof config.magneticField === "function") {
        this._magneticField = config.magneticField;
        this._config.magneticField = Vec3.ZERO;
      } else {
        this._config.magneticField = config.magneticField;
        this._magneticField = null;
      }
    }
    if (config.electricField !== void 0) {
      if (typeof config.electricField === "function") {
        this._electricField = config.electricField;
        this._config.electricField = Vec3.ZERO;
      } else {
        this._config.electricField = config.electricField;
        this._electricField = null;
      }
    }
    if (config.bounds !== void 0) this._config.bounds = config.bounds;
    if (config.boundaryBehavior !== void 0) this._config.boundaryBehavior = config.boundaryBehavior;
    if (config.boundaryCallback !== void 0) this._config.boundaryCallback = config.boundaryCallback;
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this._config };
  }
  get config() {
    return this._config;
  }
  /**
   * Get gravity at a specific position
   */
  getGravity(position) {
    if (this._gravityField) {
      switch (this._gravityField.type) {
        case "constant":
          return this._gravityField.value ?? Vec3.ZERO;
        case "radial": {
          const center = this._gravityField.center ?? Vec3.ZERO;
          const strength = this._gravityField.strength ?? 9.81;
          const dir = Vec3.sub(center, position);
          const distSq = Vec3.lengthSquared(dir);
          if (distSq < 1e-4) return Vec3.ZERO;
          const dist = Math.sqrt(distSq);
          return Vec3.scale(Vec3.normalize(dir), strength / distSq * dist);
        }
        case "custom":
          return this._gravityField.customFn?.(position) ?? Vec3.ZERO;
      }
    }
    return this._config.gravity;
  }
  /**
   * Get wind at a specific position and time
   */
  getWind(position, time) {
    if (this._windFunction) {
      return this._windFunction(position, time);
    }
    return this._config.wind;
  }
  /**
   * Get magnetic field at position
   */
  getMagneticField(position, time) {
    if (this._magneticField) {
      return this._magneticField(position, time);
    }
    return this._config.magneticField;
  }
  /**
   * Get electric field at position
   */
  getElectricField(position, time) {
    if (this._electricField) {
      return this._electricField(position, time);
    }
    return this._config.electricField;
  }
  /**
   * Calculate air drag force on an object
   */
  calculateDrag(object, dt) {
    const airDensity = this._config.airDensity;
    if (airDensity === 0) return Vec3.ZERO;
    const velocity = object.velocity;
    const speed = Vec3.length(velocity);
    if (speed < 1e-4) return Vec3.ZERO;
    const dragMagnitude = 0.5 * airDensity * speed * speed * object.dragCoefficient * object.crossSectionArea;
    const dragDirection = Vec3.negate(Vec3.normalize(velocity));
    return Vec3.scale(dragDirection, dragMagnitude);
  }
  /**
   * Calculate buoyancy force on an object
   */
  calculateBuoyancy(object) {
    for (const field of this._fluidFields) {
      if (this._isInBounds(object.position, field.bounds)) {
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
  calculateLorentzForce(object, time) {
    if (object.charge === 0) return Vec3.ZERO;
    const E = this.getElectricField(object.position, time);
    const B = this.getMagneticField(object.position, time);
    const electricForce = Vec3.scale(E, object.charge);
    const magneticForce = Vec3.scale(Vec3.cross(object.velocity, B), object.charge);
    return Vec3.add(electricForce, magneticForce);
  }
  /**
   * Apply boundary conditions to objects
   */
  applyBoundaries(objects) {
    const bounds = this._config.bounds;
    if (!bounds || bounds.type === "none") return;
    for (const obj of objects.values()) {
      if (obj.isStatic) continue;
      const outOfBounds = this._checkBounds(obj.position, bounds);
      if (outOfBounds) {
        this._handleBoundary(obj, bounds, this._config.boundaryBehavior);
      }
    }
  }
  _isInBounds(position, bounds) {
    switch (bounds.type) {
      case "box": {
        const center = bounds.center ?? Vec3.ZERO;
        const half = bounds.halfExtents ?? Vec3.ONE;
        const rel = Vec3.sub(position, center);
        return Math.abs(rel.x) <= half.x && Math.abs(rel.y) <= half.y && Math.abs(rel.z) <= half.z;
      }
      case "sphere": {
        const center = bounds.center ?? Vec3.ZERO;
        const radius = bounds.radius ?? 1;
        return Vec3.distanceSquared(position, center) <= radius * radius;
      }
      default:
        return true;
    }
  }
  _checkBounds(position, bounds) {
    switch (bounds.type) {
      case "box": {
        const center = bounds.center ?? Vec3.ZERO;
        const half = bounds.halfExtents ?? Vec3.ONE;
        const rel = Vec3.sub(position, center);
        if (Math.abs(rel.x) > half.x || Math.abs(rel.y) > half.y || Math.abs(rel.z) > half.z) {
          return {
            x: Math.abs(rel.x) > half.x ? Math.sign(rel.x) : 0,
            y: Math.abs(rel.y) > half.y ? Math.sign(rel.y) : 0,
            z: Math.abs(rel.z) > half.z ? Math.sign(rel.z) : 0
          };
        }
        return null;
      }
      case "sphere": {
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
  _handleBoundary(obj, bounds, behavior) {
    switch (behavior) {
      case "reflect": {
        const outDir = this._checkBounds(obj.position, bounds);
        if (!outDir) return;
        if (outDir.x !== 0) {
          obj.velocity.x *= -1;
          if (bounds.type === "box") {
            const half = bounds.halfExtents?.x ?? 1;
            obj.position.x = (bounds.center?.x ?? 0) + half * Math.sign(outDir.x);
          }
        }
        if (outDir.y !== 0) {
          obj.velocity.y *= -1;
          if (bounds.type === "box") {
            const half = bounds.halfExtents?.y ?? 1;
            obj.position.y = (bounds.center?.y ?? 0) + half * Math.sign(outDir.y);
          }
        }
        if (outDir.z !== 0) {
          obj.velocity.z *= -1;
          if (bounds.type === "box") {
            const half = bounds.halfExtents?.z ?? 1;
            obj.position.z = (bounds.center?.z ?? 0) + half * Math.sign(outDir.z);
          }
        }
        obj.velocity = Vec3.scale(obj.velocity, obj.material.restitution);
        break;
      }
      case "wrap": {
        const center = bounds.center ?? Vec3.ZERO;
        if (bounds.type === "box") {
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
        } else if (bounds.type === "sphere") {
          const radius = bounds.radius ?? 1;
          const dir = Vec3.normalize(Vec3.sub(obj.position, center));
          obj.position = Vec3.add(center, Vec3.scale(dir, -radius + 0.01));
        }
        break;
      }
      case "destroy":
        obj.customData._markedForRemoval = true;
        break;
      case "custom":
        this._config.boundaryCallback?.(obj, bounds);
        break;
    }
  }
};

// src/core/Engine.ts
var integrators = {
  /**
   * Euler integration (simplest, least accurate)
   */
  euler: (obj, dt, forces, torques) => {
    if (obj.isStatic || obj.isKinematic) return;
    const acceleration = Vec3.scale(forces, obj.inverseMass);
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));
    obj.position = Vec3.add(obj.position, Vec3.scale(obj.velocity, dt));
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  },
  /**
   * Velocity Verlet integration (good balance of speed and accuracy)
   */
  verlet: (obj, dt, forces, torques) => {
    if (obj.isStatic || obj.isKinematic) return;
    const halfDt = dt * 0.5;
    const acceleration = Vec3.scale(forces, obj.inverseMass);
    obj.position = Vec3.add(
      obj.position,
      Vec3.add(
        Vec3.scale(obj.velocity, dt),
        Vec3.scale(acceleration, halfDt * dt)
      )
    );
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
  },
  /**
   * Runge-Kutta 4 integration (most accurate, more expensive)
   */
  "runge-kutta-4": (obj, dt, forces, torques) => {
    if (obj.isStatic || obj.isKinematic) return;
    const mass = obj.inverseMass;
    const a = Vec3.scale(forces, mass);
    const k1v = Vec3.scale(a, dt);
    const k1p = Vec3.scale(obj.velocity, dt);
    const k2v = Vec3.scale(a, dt);
    const k2p = Vec3.scale(Vec3.add(obj.velocity, Vec3.scale(k1v, 0.5)), dt);
    const k3v = Vec3.scale(a, dt);
    const k3p = Vec3.scale(Vec3.add(obj.velocity, Vec3.scale(k2v, 0.5)), dt);
    const k4v = Vec3.scale(a, dt);
    const k4p = Vec3.scale(Vec3.add(obj.velocity, k3v), dt);
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
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  },
  /**
   * Symplectic Euler (energy-conserving)
   */
  symplectic: (obj, dt, forces, torques) => {
    if (obj.isStatic || obj.isKinematic) return;
    const acceleration = Vec3.scale(forces, obj.inverseMass);
    obj.velocity = Vec3.add(obj.velocity, Vec3.scale(acceleration, dt));
    obj.position = Vec3.add(obj.position, Vec3.scale(obj.velocity, dt));
    const invInertia = obj.inverseInertiaTensor;
    const angularAccel = Mat3.multiplyVector(invInertia, torques);
    obj.angularVelocity = Vec3.add(obj.angularVelocity, Vec3.scale(angularAccel, dt));
    const w = obj.angularVelocity;
    const q = obj.rotation;
    const spin = {
      x: 0.5 * dt * w.x,
      y: 0.5 * dt * w.y,
      z: 0.5 * dt * w.z,
      w: 0
    };
    obj.rotation = Quat.normalize(Quat.multiply(spin, q));
  }
};
var Engine = class {
  constructor(config = {}) {
    // State
    this._time = 0;
    this._deltaTime = 0;
    this._isRunning = false;
    this._isPaused = false;
    this._accumulator = 0;
    // Objects
    this._objects = /* @__PURE__ */ new Map();
    this._objectIdCounter = 0;
    this._forceIdCounter = 0;
    this._constraintIdCounter = 0;
    // Events
    this._eventListeners = /* @__PURE__ */ new Map();
    this._collisionStartCallbacks = /* @__PURE__ */ new Set();
    this._collisionStayCallbacks = /* @__PURE__ */ new Set();
    this._collisionEndCallbacks = /* @__PURE__ */ new Set();
    this._triggerEnterCallbacks = /* @__PURE__ */ new Set();
    this._triggerExitCallbacks = /* @__PURE__ */ new Set();
    // Animation frame
    this._animationFrameId = null;
    this._lastFrameTime = 0;
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    this._runLoop = () => {
      if (!this._isRunning) return;
      const now = performance.now();
      const frameTime = Math.min((now - this._lastFrameTime) / 1e3, 0.25);
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
    this._config = {
      precision: config.precision ?? "medium",
      integrator: config.integrator ?? "verlet",
      timeStep: config.timeStep ?? 1 / 60,
      maxSubSteps: config.maxSubSteps ?? 10,
      enableMultithreading: config.enableMultithreading ?? false,
      deterministicMode: config.deterministicMode ?? true,
      sleepThreshold: config.sleepThreshold ?? 0.01,
      sleepTimeThreshold: config.sleepTimeThreshold ?? 0.5
    };
    this._precision = this._config.precision;
    this._integrator = this._config.integrator;
    this._timeStep = this._config.timeStep;
    this._maxSubSteps = this._config.maxSubSteps;
    this._environment = new Environment();
    this._forceSystem = new ForceSystem();
    this._collisionSystem = new CollisionSystem();
    this._constraintSolver = new ConstraintSolver();
    this._applyPrecisionSettings();
  }
  // ============================================================================
  // GETTERS
  // ============================================================================
  get time() {
    return this._time;
  }
  get currentTime() {
    return this._time;
  }
  get deltaTime() {
    return this._deltaTime;
  }
  get isRunning() {
    return this._isRunning;
  }
  get isPaused() {
    return this._isPaused;
  }
  get objectCount() {
    return this._objects.size;
  }
  get config() {
    return { ...this._config };
  }
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  _applyPrecisionSettings() {
    switch (this._precision) {
      case "low":
        this._timeStep = Math.max(this._timeStep, 1 / 30);
        this._maxSubSteps = Math.min(this._maxSubSteps, 4);
        break;
      case "medium":
        this._timeStep = Math.max(this._timeStep, 1 / 60);
        this._maxSubSteps = Math.min(this._maxSubSteps, 8);
        break;
      case "high":
        this._timeStep = Math.min(this._timeStep, 1 / 120);
        this._maxSubSteps = Math.max(this._maxSubSteps, 10);
        break;
      case "scientific":
        this._timeStep = Math.min(this._timeStep, 1 / 240);
        this._maxSubSteps = Math.max(this._maxSubSteps, 20);
        break;
    }
  }
  setPrecision(precision) {
    this._precision = precision;
    this._config.precision = precision;
    this._applyPrecisionSettings();
  }
  setIntegrator(integrator) {
    this._integrator = integrator;
    this._config.integrator = integrator;
  }
  setTimeStep(timeStep) {
    this._timeStep = timeStep;
    this._config.timeStep = timeStep;
  }
  // ============================================================================
  // OBJECT MANAGEMENT
  // ============================================================================
  addObject(config) {
    const id = config.id ?? `obj_${++this._objectIdCounter}`;
    if (this._objects.has(id)) {
      throw new Error(`Object with id "${id}" already exists`);
    }
    const obj = new PhysicsObject(id, config);
    this._objects.set(id, obj);
    this._emitEvent("objectAdded", { objectId: id });
    return obj;
  }
  removeObject(id) {
    const obj = this._objects.get(id);
    if (!obj) return false;
    for (const constraint of this._constraintSolver.getConstraints()) {
      if (constraint.bodyA === id || constraint.bodyB === id) {
        this._constraintSolver.removeConstraint(constraint.id);
      }
    }
    this._forceSystem.removeForcesForObject(id);
    this._objects.delete(id);
    this._emitEvent("objectRemoved", { objectId: id });
    return true;
  }
  getObject(id) {
    return this._objects.get(id);
  }
  getAllObjects() {
    return Array.from(this._objects.values());
  }
  // ============================================================================
  // FORCE MANAGEMENT
  // ============================================================================
  addForce(config) {
    const id = config.id ?? `force_${++this._forceIdCounter}`;
    this._forceSystem.addForce(id, config);
    return id;
  }
  removeForce(id) {
    return this._forceSystem.removeForce(id);
  }
  getForce(id) {
    return this._forceSystem.getForce(id);
  }
  // ============================================================================
  // CONSTRAINT MANAGEMENT
  // ============================================================================
  addConstraint(config) {
    const id = config.id ?? `constraint_${++this._constraintIdCounter}`;
    const constraintConfig = { ...config, id };
    const { ConstraintFactory: ConstraintFactory2 } = (init_ConstraintSolver(), __toCommonJS(ConstraintSolver_exports));
    const constraint = ConstraintFactory2.create(constraintConfig);
    this._constraintSolver.addConstraint(constraint);
    return id;
  }
  removeConstraint(id) {
    const constraint = this._constraintSolver.getConstraint(id);
    if (!constraint) return false;
    this._constraintSolver.removeConstraint(id);
    return true;
  }
  getConstraint(id) {
    const constraint = this._constraintSolver.getConstraint(id);
    if (!constraint) return void 0;
    return {
      id: constraint.id,
      type: constraint.type,
      bodyA: constraint.bodyA,
      bodyB: constraint.bodyB,
      anchorA: constraint.anchorA,
      anchorB: constraint.anchorB
    };
  }
  // ============================================================================
  // ENVIRONMENT
  // ============================================================================
  setEnvironment(config) {
    this._environment.configure(config);
  }
  getEnvironment() {
    return this._environment.getConfig();
  }
  // ============================================================================
  // SIMULATION CONTROL
  // ============================================================================
  /**
   * Perform a single physics step
   */
  step(dt) {
    const timeStep = dt ?? this._timeStep;
    this._deltaTime = timeStep;
    this._clearObjectForces();
    this._applyEnvironmentForces(timeStep);
    this._forceSystem.applyForces(this._objects, this._time, timeStep);
    this._integrate(timeStep);
    const constraintBodies = /* @__PURE__ */ new Map();
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
        isKinematic: obj.isKinematic
      });
    }
    this._constraintSolver.solve(constraintBodies, timeStep);
    this._applyDamping(timeStep);
    this._updateSleepStates(timeStep);
    this._environment.applyBoundaries(this._objects);
    this._time += timeStep;
    this._emitEvent("step", { time: this._time, dt: timeStep });
  }
  /**
   * Start continuous simulation
   */
  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._isPaused = false;
    this._lastFrameTime = performance.now();
    this._emitEvent("start", {});
    this._runLoop();
  }
  /**
   * Stop simulation
   */
  stop() {
    if (!this._isRunning) return;
    this._isRunning = false;
    this._isPaused = false;
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    this._emitEvent("stop", {});
  }
  /**
   * Pause simulation
   */
  pause() {
    if (!this._isRunning || this._isPaused) return;
    this._isPaused = true;
    this._emitEvent("pause", {});
  }
  /**
   * Resume simulation
   */
  resume() {
    if (!this._isPaused) return;
    this._isPaused = false;
    this._lastFrameTime = performance.now();
    this._emitEvent("resume", {});
  }
  /**
   * Run simulation for specified duration
   */
  async run(options) {
    const { duration, onProgress } = options;
    const startTime = this._time;
    const endTime = startTime + duration;
    while (this._time < endTime) {
      this.step();
      if (onProgress) {
        const progress = (this._time - startTime) / duration;
        onProgress(Math.min(1, progress));
      }
      if (Math.floor(this._time * 60) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }
  /**
   * Seek to specific time
   */
  seek(time, snapshot) {
    if (snapshot) {
      this.restoreSnapshot(snapshot);
    }
    while (this._time < time) {
      this.step();
    }
  }
  /**
   * Rewind simulation (requires snapshots)
   */
  rewind(time, snapshots) {
    let nearestSnapshot;
    for (const snapshot of snapshots) {
      if (snapshot.timestamp <= time) {
        if (!nearestSnapshot || snapshot.timestamp > nearestSnapshot.timestamp) {
          nearestSnapshot = snapshot;
        }
      }
    }
    if (nearestSnapshot) {
      this.restoreSnapshot(nearestSnapshot);
      while (this._time < time) {
        this.step();
      }
    }
  }
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  createSnapshot() {
    const objectStates = /* @__PURE__ */ new Map();
    for (const [id, obj] of this._objects) {
      objectStates.set(id, obj.getState(this._time));
    }
    const constraintStates = /* @__PURE__ */ new Map();
    for (const constraint of this._constraintSolver.getConstraints()) {
      constraintStates.set(constraint.id, constraint.getState());
    }
    return {
      timestamp: this._time,
      objects: objectStates,
      constraints: constraintStates,
      forces: new Map(this._forceSystem.getForces()),
      worldStats: this.getWorldStats()
    };
  }
  restoreSnapshot(snapshot) {
    this._time = snapshot.timestamp;
    for (const [id, state] of snapshot.objects) {
      const obj = this._objects.get(id);
      if (obj) {
        obj.restoreState(state);
      }
    }
  }
  reset() {
    this._time = 0;
    this._accumulator = 0;
    for (const obj of this._objects.values()) {
      obj.reset();
    }
    this._emitEvent("reset", {});
  }
  clear() {
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
  getWorldStats() {
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
      contactPairs: 0,
      // CollisionSystem doesn't track this directly
      stepTime: this._deltaTime * 1e3
    };
  }
  // ============================================================================
  // QUERIES
  // ============================================================================
  raycast(origin, direction, options = {}) {
    return this._collisionSystem.raycast(
      origin,
      Vec3.normalize(direction),
      options.maxDistance ?? Infinity,
      { layerMask: options.layerMask, ignoreTriggers: options.ignoreTriggers }
    );
  }
  sphereCast(origin, radius, direction, maxDistance = Infinity) {
    return this.raycast(origin, direction, { maxDistance });
  }
  boxCast(origin, halfExtents, direction, maxDistance = Infinity) {
    return this.raycast(origin, direction, { maxDistance });
  }
  overlapSphere(center, radius) {
    const ids = this._collisionSystem.overlapSphere(center, radius);
    return ids.map((id) => this._objects.get(id)).filter((obj) => obj !== void 0);
  }
  overlapBox(center, halfExtents, rotation) {
    const ids = this._collisionSystem.overlapBox(center, halfExtents, rotation);
    return ids.map((id) => this._objects.get(id)).filter((obj) => obj !== void 0);
  }
  closestPoint(point, objectId) {
    const obj = this._objects.get(objectId);
    if (!obj) return point;
    return obj.closestPoint(point);
  }
  distanceBetween(objectA, objectB) {
    const a = this._objects.get(objectA);
    const b = this._objects.get(objectB);
    if (!a || !b) {
      return { distance: Infinity, pointA: Vec3.ZERO, pointB: Vec3.ZERO };
    }
    const pointA = a.position;
    const pointB = b.position;
    const distance = Vec3.distance(pointA, pointB);
    return { distance, pointA, pointB };
  }
  // ============================================================================
  // EVENTS
  // ============================================================================
  onCollisionStart(callback) {
    this._collisionStartCallbacks.add(callback);
    return () => this._collisionStartCallbacks.delete(callback);
  }
  onCollisionStay(callback) {
    this._collisionStayCallbacks.add(callback);
    return () => this._collisionStayCallbacks.delete(callback);
  }
  onCollisionEnd(callback) {
    this._collisionEndCallbacks.add(callback);
    return () => this._collisionEndCallbacks.delete(callback);
  }
  onTriggerEnter(callback) {
    this._triggerEnterCallbacks.add(callback);
    return () => this._triggerEnterCallbacks.delete(callback);
  }
  onTriggerExit(callback) {
    this._triggerExitCallbacks.add(callback);
    return () => this._triggerExitCallbacks.delete(callback);
  }
  on(event, callback) {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, /* @__PURE__ */ new Set());
    }
    this._eventListeners.get(event).add(callback);
    return () => this._eventListeners.get(event)?.delete(callback);
  }
  _emitEvent(type, data) {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      const event = { type, timestamp: this._time, data };
      for (const listener of listeners) {
        listener(event);
      }
    }
  }
  _clearObjectForces() {
    for (const obj of this._objects.values()) {
      obj.clearAccumulatedForces();
    }
  }
  _applyEnvironmentForces(dt) {
    for (const obj of this._objects.values()) {
      if (obj.isStatic || obj.isSleeping) continue;
      const gravity = this._environment.getGravity(obj.position);
      const gravityForce = Vec3.scale(gravity, obj.mass);
      obj.accumulateForce(gravityForce);
      const drag = this._environment.calculateDrag(obj, dt);
      obj.accumulateForce(drag);
      const buoyancy = this._environment.calculateBuoyancy(obj);
      obj.accumulateForce(buoyancy);
      const wind = this._environment.getWind(obj.position, this._time);
      if (!Vec3.isZero(wind)) {
        const relativeVelocity = Vec3.sub(wind, obj.velocity);
        const windForce = Vec3.scale(
          relativeVelocity,
          0.5 * this._environment.config.airDensity * obj.dragCoefficient * obj.crossSectionArea
        );
        obj.accumulateForce(windForce);
      }
    }
  }
  _integrate(dt) {
    const integrate = integrators[this._integrator];
    for (const obj of this._objects.values()) {
      if (obj.isSleeping) continue;
      const { force, torque } = obj.getAccumulatedForces();
      integrate(obj, dt, force, torque);
    }
  }
  _resolveCollisions(collisions, dt) {
    for (const collision of collisions) {
      const objA = this._objects.get(collision.objectA);
      const objB = this._objects.get(collision.objectB);
      if (!objA || !objB) continue;
      if (objA.isTrigger || objB.isTrigger) {
        for (const callback of this._triggerEnterCallbacks) {
          callback(collision.objectA, collision.objectB);
        }
        continue;
      }
      for (const callback of this._collisionStartCallbacks) {
        callback(collision);
      }
    }
  }
  _applyDamping(dt) {
    for (const obj of this._objects.values()) {
      if (obj.isStatic || obj.isSleeping) continue;
      const linearDamping = Math.pow(1 - obj.linearDamping, dt);
      obj.velocity = Vec3.scale(obj.velocity, linearDamping);
      const angularDamping = Math.pow(1 - obj.angularDamping, dt);
      obj.angularVelocity = Vec3.scale(obj.angularVelocity, angularDamping);
    }
  }
  _updateSleepStates(dt) {
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
};

// src/index.ts
init_ConstraintSolver();

// src/recorder/Recorder.ts
var DEFAULT_CONFIG = {
  recordObjects: true,
  recordForces: true,
  recordCollisions: true,
  recordConstraints: true,
  recordStats: true,
  maxFrames: 0,
  interval: 1,
  compression: 0,
  objectFilter: []
};
var Recorder = class {
  constructor(config = {}) {
    this.frames = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = 0;
    this.frameCount = 0;
    this.stepCounter = 0;
    // Playback state
    this.playbackIndex = 0;
    this.playbackSpeed = 1;
    this.isPlaying = false;
    this.playbackDirection = 1;
    // Markers for important events
    this.markers = /* @__PURE__ */ new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Start recording
   */
  start() {
    if (this.isRecording) return;
    this.isRecording = true;
    this.isPaused = false;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.stepCounter = 0;
  }
  /**
   * Stop recording
   */
  stop() {
    this.isRecording = false;
    this.isPaused = false;
  }
  /**
   * Pause recording
   */
  pause() {
    if (!this.isRecording) return;
    this.isPaused = true;
  }
  /**
   * Resume recording
   */
  resume() {
    if (!this.isRecording) return;
    this.isPaused = false;
  }
  /**
   * Record a frame
   */
  recordFrame(time, deltaTime, objects, forces, collisions, constraints, stats) {
    if (!this.isRecording || this.isPaused) return;
    this.stepCounter++;
    if (this.stepCounter % this.config.interval !== 0) return;
    let filteredObjects = objects;
    if (this.config.objectFilter.length > 0) {
      filteredObjects = /* @__PURE__ */ new Map();
      for (const id of this.config.objectFilter) {
        const state = objects.get(id);
        if (state) filteredObjects.set(id, state);
      }
    }
    const frame = {
      time,
      deltaTime,
      objects: this.config.recordObjects ? new Map(filteredObjects) : /* @__PURE__ */ new Map(),
      forces: this.config.recordForces ? [...forces] : [],
      collisions: this.config.recordCollisions ? [...collisions] : [],
      constraints: this.config.recordConstraints ? [...constraints] : [],
      stats: this.config.recordStats ? { ...stats } : {}
    };
    this.frames.push(frame);
    this.frameCount++;
    if (this.config.maxFrames > 0 && this.frames.length > this.config.maxFrames) {
      this.frames.shift();
    }
  }
  /**
   * Add a marker at current frame
   */
  addMarker(name, description = "") {
    this.markers.set(name, {
      frame: this.frames.length - 1,
      description
    });
  }
  /**
   * Get marker by name
   */
  getMarker(name) {
    return this.markers.get(name);
  }
  /**
   * Get all markers
   */
  getMarkers() {
    return new Map(this.markers);
  }
  /**
   * Clear all recorded data
   */
  clear() {
    this.frames = [];
    this.markers.clear();
    this.frameCount = 0;
    this.stepCounter = 0;
    this.playbackIndex = 0;
  }
  /**
   * Get frame at specific index
   */
  getFrame(index) {
    return this.frames[index];
  }
  /**
   * Get frame at specific time
   */
  getFrameAtTime(time) {
    let left = 0;
    let right = this.frames.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.frames[mid].time < time) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return this.frames[left];
  }
  /**
   * Get interpolated state at exact time
   */
  getInterpolatedFrame(time) {
    if (this.frames.length === 0) return void 0;
    if (time <= this.frames[0].time) return this.frames[0];
    if (time >= this.frames[this.frames.length - 1].time) {
      return this.frames[this.frames.length - 1];
    }
    let i = 0;
    while (i < this.frames.length - 1 && this.frames[i + 1].time < time) {
      i++;
    }
    const frame1 = this.frames[i];
    const frame2 = this.frames[i + 1];
    const t = (time - frame1.time) / (frame2.time - frame1.time);
    const interpolatedObjects = /* @__PURE__ */ new Map();
    for (const [id, state1] of frame1.objects) {
      const state2 = frame2.objects.get(id);
      if (state2) {
        interpolatedObjects.set(id, this.interpolateState(state1, state2, t));
      }
    }
    return {
      time,
      deltaTime: frame1.deltaTime,
      objects: interpolatedObjects,
      forces: frame1.forces,
      collisions: frame1.collisions,
      constraints: frame1.constraints,
      stats: frame1.stats
    };
  }
  interpolateState(s1, s2, t) {
    return {
      id: s1.id,
      position: {
        x: s1.position.x + (s2.position.x - s1.position.x) * t,
        y: s1.position.y + (s2.position.y - s1.position.y) * t,
        z: s1.position.z + (s2.position.z - s1.position.z) * t
      },
      rotation: this.slerpQuaternion(s1.rotation, s2.rotation, t),
      velocity: {
        x: s1.velocity.x + (s2.velocity.x - s1.velocity.x) * t,
        y: s1.velocity.y + (s2.velocity.y - s1.velocity.y) * t,
        z: s1.velocity.z + (s2.velocity.z - s1.velocity.z) * t
      },
      angularVelocity: {
        x: s1.angularVelocity.x + (s2.angularVelocity.x - s1.angularVelocity.x) * t,
        y: s1.angularVelocity.y + (s2.angularVelocity.y - s1.angularVelocity.y) * t,
        z: s1.angularVelocity.z + (s2.angularVelocity.z - s1.angularVelocity.z) * t
      },
      scale: {
        x: s1.scale.x + (s2.scale.x - s1.scale.x) * t,
        y: s1.scale.y + (s2.scale.y - s1.scale.y) * t,
        z: s1.scale.z + (s2.scale.z - s1.scale.z) * t
      },
      isAwake: s1.isAwake || s2.isAwake,
      isTrigger: s1.isTrigger
    };
  }
  slerpQuaternion(q1, q2, t) {
    let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    let q2Sign = 1;
    if (dot < 0) {
      dot = -dot;
      q2Sign = -1;
    }
    let scale0, scale1;
    if (dot > 0.9995) {
      scale0 = 1 - t;
      scale1 = t;
    } else {
      const omega = Math.acos(dot);
      const sinOmega = Math.sin(omega);
      scale0 = Math.sin((1 - t) * omega) / sinOmega;
      scale1 = Math.sin(t * omega) / sinOmega;
    }
    return {
      x: scale0 * q1.x + scale1 * q2Sign * q2.x,
      y: scale0 * q1.y + scale1 * q2Sign * q2.y,
      z: scale0 * q1.z + scale1 * q2Sign * q2.z,
      w: scale0 * q1.w + scale1 * q2Sign * q2.w
    };
  }
  /**
   * Get frames in time range
   */
  getFrameRange(startTime, endTime) {
    return this.frames.filter((f) => f.time >= startTime && f.time <= endTime);
  }
  /**
   * Get object trajectory (positions over time)
   */
  getTrajectory(objectId) {
    const trajectory = [];
    for (const frame of this.frames) {
      const state = frame.objects.get(objectId);
      if (state) {
        trajectory.push({
          time: frame.time,
          position: { ...state.position }
        });
      }
    }
    return trajectory;
  }
  /**
   * Get object property over time
   */
  getPropertyTimeSeries(objectId, extractor) {
    const series = [];
    for (const frame of this.frames) {
      const state = frame.objects.get(objectId);
      if (state) {
        series.push({
          time: frame.time,
          value: extractor(state)
        });
      }
    }
    return series;
  }
  // ==================== Playback ====================
  /**
   * Start playback
   */
  startPlayback(speed = 1) {
    this.isPlaying = true;
    this.playbackSpeed = speed;
    this.playbackDirection = speed >= 0 ? 1 : -1;
  }
  /**
   * Stop playback
   */
  stopPlayback() {
    this.isPlaying = false;
  }
  /**
   * Pause playback
   */
  pausePlayback() {
    this.isPlaying = false;
  }
  /**
   * Resume playback
   */
  resumePlayback() {
    this.isPlaying = true;
  }
  /**
   * Seek to specific frame
   */
  seekToFrame(index) {
    this.playbackIndex = Math.max(0, Math.min(index, this.frames.length - 1));
  }
  /**
   * Seek to specific time
   */
  seekToTime(time) {
    for (let i = 0; i < this.frames.length; i++) {
      if (this.frames[i].time >= time) {
        this.playbackIndex = i;
        return;
      }
    }
    this.playbackIndex = this.frames.length - 1;
  }
  /**
   * Seek to marker
   */
  seekToMarker(name) {
    const marker = this.markers.get(name);
    if (marker) {
      this.playbackIndex = marker.frame;
      return true;
    }
    return false;
  }
  /**
   * Step forward/backward
   */
  step(direction = 1) {
    this.playbackIndex += direction;
    this.playbackIndex = Math.max(0, Math.min(this.playbackIndex, this.frames.length - 1));
    return this.frames[this.playbackIndex];
  }
  /**
   * Get current playback frame
   */
  getCurrentFrame() {
    return this.frames[this.playbackIndex];
  }
  /**
   * Advance playback (call each frame during playback)
   */
  advancePlayback(deltaTime) {
    if (!this.isPlaying || this.frames.length === 0) return void 0;
    const timeAdvance = deltaTime * Math.abs(this.playbackSpeed);
    const currentTime = this.frames[this.playbackIndex]?.time ?? 0;
    const targetTime = currentTime + timeAdvance * this.playbackDirection;
    this.seekToTime(targetTime);
    return this.frames[this.playbackIndex];
  }
  /**
   * Get playback state
   */
  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentFrame: this.playbackIndex,
      totalFrames: this.frames.length,
      currentTime: this.frames[this.playbackIndex]?.time ?? 0,
      totalTime: this.frames.length > 0 ? this.frames[this.frames.length - 1].time - this.frames[0].time : 0,
      speed: this.playbackSpeed,
      direction: this.playbackDirection
    };
  }
  // ==================== Serialization ====================
  /**
   * Export recording data
   */
  export() {
    return {
      version: "1.0",
      config: { ...this.config },
      frames: this.frames.map((f) => ({
        time: f.time,
        deltaTime: f.deltaTime,
        objects: Array.from(f.objects.entries()),
        forces: f.forces,
        collisions: f.collisions,
        constraints: f.constraints,
        stats: f.stats
      })),
      markers: Array.from(this.markers.entries()),
      metadata: {
        frameCount: this.frames.length,
        duration: this.frames.length > 0 ? this.frames[this.frames.length - 1].time - this.frames[0].time : 0,
        recordedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  /**
   * Import recording data
   */
  import(data) {
    this.clear();
    this.config = { ...DEFAULT_CONFIG, ...data.config };
    this.frames = data.frames.map((f) => ({
      time: f.time,
      deltaTime: f.deltaTime,
      objects: new Map(f.objects),
      forces: f.forces,
      collisions: f.collisions,
      constraints: f.constraints,
      stats: f.stats
    }));
    this.markers = new Map(data.markers);
    this.frameCount = this.frames.length;
  }
  /**
   * Serialize to JSON string
   */
  toJSON() {
    return JSON.stringify(this.export());
  }
  /**
   * Load from JSON string
   */
  fromJSON(json) {
    const data = JSON.parse(json);
    this.import(data);
  }
  // ==================== Getters ====================
  get recording() {
    return this.isRecording;
  }
  get paused() {
    return this.isPaused;
  }
  get playing() {
    return this.isPlaying;
  }
  get frameIndex() {
    return this.playbackIndex;
  }
  get totalFrames() {
    return this.frames.length;
  }
  get duration() {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].time - this.frames[0].time;
  }
  get startTimeStamp() {
    return this.frames[0]?.time ?? 0;
  }
  get endTimeStamp() {
    return this.frames[this.frames.length - 1]?.time ?? 0;
  }
};

// src/analysis/Analysis.ts
var Analysis = class {
  // ==================== Statistics ====================
  /**
   * Calculate basic statistics for a data series
   */
  static statistics(data) {
    if (data.length === 0) {
      return {
        count: 0,
        mean: 0,
        std: 0,
        min: 0,
        max: 0,
        median: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0,
        sum: 0,
        range: 0
      };
    }
    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const squaredDiffs = data.map((x) => (x - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(variance);
    const cubedDiffs = data.map((x) => ((x - mean) / std) ** 3);
    const skewness = std > 0 ? cubedDiffs.reduce((a, b) => a + b, 0) / n : 0;
    const fourthDiffs = data.map((x) => ((x - mean) / std) ** 4);
    const kurtosis = std > 0 ? fourthDiffs.reduce((a, b) => a + b, 0) / n - 3 : 0;
    return {
      count: n,
      mean,
      std,
      min,
      max,
      median,
      variance,
      skewness,
      kurtosis,
      sum,
      range
    };
  }
  /**
   * Calculate percentile
   */
  static percentile(data, p) {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const index = p / 100 * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
  /**
   * Calculate quartiles
   */
  static quartiles(data) {
    const q1 = this.percentile(data, 25);
    const q2 = this.percentile(data, 50);
    const q3 = this.percentile(data, 75);
    return { q1, q2, q3, iqr: q3 - q1 };
  }
  /**
   * Detect outliers using IQR method
   */
  static detectOutliers(data, threshold = 1.5) {
    const { q1, q3, iqr } = this.quartiles(data);
    const lower = q1 - threshold * iqr;
    const upper = q3 + threshold * iqr;
    return data.filter((x) => x < lower || x > upper);
  }
  // ==================== Time Series ====================
  /**
   * Create time series from data
   */
  static createTimeSeries(times, values, name = "series") {
    if (times.length !== values.length) {
      throw new Error("Times and values must have same length");
    }
    return {
      name,
      times,
      values,
      statistics: this.statistics(values)
    };
  }
  /**
   * Resample time series to uniform intervals
   */
  static resample(series, interval) {
    if (series.times.length === 0) return series;
    const startTime = series.times[0];
    const endTime = series.times[series.times.length - 1];
    const newTimes = [];
    const newValues = [];
    for (let t = startTime; t <= endTime; t += interval) {
      newTimes.push(t);
      newValues.push(this.interpolate(series, t));
    }
    return this.createTimeSeries(newTimes, newValues, series.name);
  }
  /**
   * Interpolate value at specific time
   */
  static interpolate(series, time) {
    const { times, values } = series;
    if (time <= times[0]) return values[0];
    if (time >= times[times.length - 1]) return values[values.length - 1];
    let left = 0;
    let right = times.length - 1;
    while (right - left > 1) {
      const mid = Math.floor((left + right) / 2);
      if (times[mid] <= time) {
        left = mid;
      } else {
        right = mid;
      }
    }
    const t = (time - times[left]) / (times[right] - times[left]);
    return values[left] + t * (values[right] - values[left]);
  }
  /**
   * Calculate derivative of time series
   */
  static derivative(series) {
    const { times, values } = series;
    if (times.length < 2) {
      return this.createTimeSeries([], [], `d${series.name}/dt`);
    }
    const newTimes = [];
    const newValues = [];
    for (let i = 0; i < times.length - 1; i++) {
      const dt = times[i + 1] - times[i];
      const dv = values[i + 1] - values[i];
      newTimes.push((times[i] + times[i + 1]) / 2);
      newValues.push(dv / dt);
    }
    return this.createTimeSeries(newTimes, newValues, `d${series.name}/dt`);
  }
  /**
   * Calculate integral of time series
   */
  static integral(series) {
    const { times, values } = series;
    if (times.length === 0) {
      return this.createTimeSeries([], [], `\u222B${series.name}dt`);
    }
    const newTimes = [...times];
    const newValues = [0];
    for (let i = 1; i < times.length; i++) {
      const dt = times[i] - times[i - 1];
      const avgValue = (values[i] + values[i - 1]) / 2;
      newValues.push(newValues[i - 1] + avgValue * dt);
    }
    return this.createTimeSeries(newTimes, newValues, `\u222B${series.name}dt`);
  }
  /**
   * Moving average filter
   */
  static movingAverage(series, windowSize) {
    const { times, values } = series;
    if (windowSize < 1 || values.length < windowSize) {
      return series;
    }
    const newValues = [];
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= windowSize) {
        sum -= values[i - windowSize];
      }
      const count = Math.min(i + 1, windowSize);
      newValues.push(sum / count);
    }
    return this.createTimeSeries(times, newValues, `${series.name}_ma${windowSize}`);
  }
  /**
   * Exponential moving average
   */
  static exponentialMovingAverage(series, alpha) {
    const { times, values } = series;
    if (values.length === 0) return series;
    const newValues = [values[0]];
    for (let i = 1; i < values.length; i++) {
      newValues.push(alpha * values[i] + (1 - alpha) * newValues[i - 1]);
    }
    return this.createTimeSeries(times, newValues, `${series.name}_ema`);
  }
  /**
   * Low-pass filter (Butterworth-style)
   */
  static lowPassFilter(series, cutoffFreq) {
    const { times, values } = series;
    if (values.length < 2) return series;
    const dt = (times[times.length - 1] - times[0]) / (times.length - 1);
    const rc = 1 / (2 * Math.PI * cutoffFreq);
    const alpha = dt / (rc + dt);
    const newValues = [values[0]];
    for (let i = 1; i < values.length; i++) {
      newValues.push(newValues[i - 1] + alpha * (values[i] - newValues[i - 1]));
    }
    return this.createTimeSeries(times, newValues, `${series.name}_lpf`);
  }
  /**
   * High-pass filter
   */
  static highPassFilter(series, cutoffFreq) {
    const lowPassed = this.lowPassFilter(series, cutoffFreq);
    const newValues = series.values.map((v, i) => v - lowPassed.values[i]);
    return this.createTimeSeries(series.times, newValues, `${series.name}_hpf`);
  }
  // ==================== Peak Detection ====================
  /**
   * Find peaks in data
   */
  static findPeaks(series, options = {}) {
    const { times, values } = series;
    const peaks = [];
    const minHeight = options.minHeight ?? -Infinity;
    const minProminence = options.minProminence ?? 0;
    const minDistance = options.minDistance ?? 1;
    const threshold = options.threshold ?? 0;
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        if (values[i] >= minHeight) {
          const prominence = this.calculateProminence(values, i);
          if (prominence >= minProminence) {
            const width = this.calculatePeakWidth(values, i, values[i] - prominence / 2);
            peaks.push({
              index: i,
              time: times[i],
              value: values[i],
              prominence,
              width
            });
          }
        }
      }
    }
    if (minDistance > 1) {
      const filtered = [];
      peaks.sort((a, b) => b.value - a.value);
      for (const peak of peaks) {
        const tooClose = filtered.some((p) => Math.abs(p.index - peak.index) < minDistance);
        if (!tooClose) {
          filtered.push(peak);
        }
      }
      return filtered.sort((a, b) => a.index - b.index);
    }
    return peaks;
  }
  /**
   * Find valleys (local minima)
   */
  static findValleys(series, options = {}) {
    const invertedValues = series.values.map((v) => -v);
    const invertedSeries = this.createTimeSeries(series.times, invertedValues, series.name);
    const peaks = this.findPeaks(invertedSeries, options);
    return peaks.map((p) => ({
      ...p,
      value: -p.value
    }));
  }
  static calculateProminence(values, peakIndex) {
    const peakValue = values[peakIndex];
    let leftMin = peakValue;
    for (let i = peakIndex - 1; i >= 0; i--) {
      if (values[i] > peakValue) break;
      leftMin = Math.min(leftMin, values[i]);
    }
    let rightMin = peakValue;
    for (let i = peakIndex + 1; i < values.length; i++) {
      if (values[i] > peakValue) break;
      rightMin = Math.min(rightMin, values[i]);
    }
    return peakValue - Math.max(leftMin, rightMin);
  }
  static calculatePeakWidth(values, peakIndex, heightThreshold) {
    let left = peakIndex;
    let right = peakIndex;
    while (left > 0 && values[left] > heightThreshold) left--;
    while (right < values.length - 1 && values[right] > heightThreshold) right++;
    return right - left;
  }
  // ==================== Frequency Analysis ====================
  /**
   * Compute FFT of time series
   */
  static fft(series) {
    const { times, values } = series;
    const n = Math.pow(2, Math.ceil(Math.log2(values.length)));
    const paddedValues = [...values];
    while (paddedValues.length < n) {
      paddedValues.push(0);
    }
    const { real, imag } = this.computeFFT(paddedValues);
    const dt = (times[times.length - 1] - times[0]) / (times.length - 1);
    const sampleRate = 1 / dt;
    const frequencies = [];
    const magnitudes = [];
    const phases = [];
    const halfN = n / 2;
    for (let i = 0; i <= halfN; i++) {
      frequencies.push(i * sampleRate / n);
      magnitudes.push(Math.sqrt(real[i] ** 2 + imag[i] ** 2) / n);
      phases.push(Math.atan2(imag[i], real[i]));
    }
    let maxMag = 0;
    let dominantIndex = 0;
    for (let i = 1; i < magnitudes.length; i++) {
      if (magnitudes[i] > maxMag) {
        maxMag = magnitudes[i];
        dominantIndex = i;
      }
    }
    return {
      frequencies,
      magnitudes,
      phases,
      dominantFrequency: frequencies[dominantIndex],
      dominantMagnitude: magnitudes[dominantIndex],
      sampleRate
    };
  }
  static computeFFT(values) {
    const n = values.length;
    if (n <= 1) {
      return { real: [...values], imag: new Array(n).fill(0) };
    }
    const real = new Array(n).fill(0);
    const imag = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let j = 0;
      let temp = i;
      for (let k = 0; k < Math.log2(n); k++) {
        j = j << 1 | temp & 1;
        temp >>= 1;
      }
      real[j] = values[i];
    }
    for (let size = 2; size <= n; size *= 2) {
      const halfSize = size / 2;
      const step = 2 * Math.PI / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0; j < halfSize; j++) {
          const angle = -step * j;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const idx1 = i + j;
          const idx2 = i + j + halfSize;
          const tReal = cos * real[idx2] - sin * imag[idx2];
          const tImag = sin * real[idx2] + cos * imag[idx2];
          real[idx2] = real[idx1] - tReal;
          imag[idx2] = imag[idx1] - tImag;
          real[idx1] = real[idx1] + tReal;
          imag[idx1] = imag[idx1] + tImag;
        }
      }
    }
    return { real, imag };
  }
  /**
   * Power spectral density
   */
  static powerSpectralDensity(series) {
    const spectrum = this.fft(series);
    spectrum.magnitudes = spectrum.magnitudes.map((m) => m * m);
    return spectrum;
  }
  // ==================== Correlation ====================
  /**
   * Cross-correlation between two series
   */
  static crossCorrelation(series1, series2) {
    const v1 = series1.values;
    const v2 = series2.values;
    const n = Math.min(v1.length, v2.length);
    const mean1 = v1.reduce((a, b) => a + b, 0) / n;
    const mean2 = v2.reduce((a, b) => a + b, 0) / n;
    const std1 = Math.sqrt(v1.reduce((a, x) => a + (x - mean1) ** 2, 0) / n);
    const std2 = Math.sqrt(v2.reduce((a, x) => a + (x - mean2) ** 2, 0) / n);
    const results = [];
    const maxLag = Math.floor(n / 2);
    for (let lag = -maxLag; lag <= maxLag; lag++) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < n; i++) {
        const j = i + lag;
        if (j >= 0 && j < n) {
          sum += (v1[i] - mean1) * (v2[j] - mean2);
          count++;
        }
      }
      const correlation = count > 0 ? sum / (count * std1 * std2) : 0;
      const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
      const se = 1 / Math.sqrt(count - 3);
      const pValue = 2 * (1 - this.normalCDF(Math.abs(z) / se));
      results.push({ correlation, lag, pValue });
    }
    return results;
  }
  /**
   * Auto-correlation
   */
  static autoCorrelation(series) {
    return this.crossCorrelation(series, series);
  }
  /**
   * Pearson correlation coefficient
   */
  static pearsonCorrelation(series1, series2) {
    const v1 = series1.values;
    const v2 = series2.values;
    const n = Math.min(v1.length, v2.length);
    const mean1 = v1.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const mean2 = v2.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den1 = 0;
    let den2 = 0;
    for (let i = 0; i < n; i++) {
      const d1 = v1[i] - mean1;
      const d2 = v2[i] - mean2;
      num += d1 * d2;
      den1 += d1 * d1;
      den2 += d2 * d2;
    }
    return num / Math.sqrt(den1 * den2);
  }
  static normalCDF(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
  }
  // ==================== Trend Analysis ====================
  /**
   * Linear regression / trend analysis
   */
  static linearTrend(series) {
    const { times, values } = series;
    const n = times.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, rSquared: 0, trend: "stable" };
    }
    const sumX = times.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = times.reduce((acc, x, i) => acc + x * values[i], 0);
    const sumX2 = times.reduce((a, x) => a + x * x, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;
    const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
    const intercept = meanY - slope * meanX;
    const predicted = times.map((t) => slope * t + intercept);
    const ssRes = values.reduce((acc, y, i) => acc + (y - predicted[i]) ** 2, 0);
    const ssTot = values.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
    const rSquared = 1 - ssRes / ssTot;
    const threshold = 1e-3;
    let trend;
    if (slope > threshold) {
      trend = "increasing";
    } else if (slope < -threshold) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }
    return { slope, intercept, rSquared, trend };
  }
  /**
   * Polynomial fit
   */
  static polynomialFit(series, degree) {
    const { times, values } = series;
    const n = times.length;
    if (n <= degree) {
      throw new Error("Not enough data points for polynomial degree");
    }
    const X = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j <= degree; j++) {
        row.push(Math.pow(times[i], j));
      }
      X.push(row);
    }
    const XT = this.transpose(X);
    const XTX = this.matmul(XT, X);
    const XTy = this.matvec(XT, values);
    return this.solve(XTX, XTy);
  }
  static transpose(A) {
    const rows = A.length;
    const cols = A[0].length;
    const result = [];
    for (let j = 0; j < cols; j++) {
      const row = [];
      for (let i = 0; i < rows; i++) {
        row.push(A[i][j]);
      }
      result.push(row);
    }
    return result;
  }
  static matmul(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result = [];
    for (let i = 0; i < rowsA; i++) {
      const row = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        row.push(sum);
      }
      result.push(row);
    }
    return result;
  }
  static matvec(A, v) {
    return A.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }
  static solve(A, b) {
    const n = A.length;
    const aug = A.map((row, i) => [...row, b[i]]);
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
      for (let k = i + 1; k < n; k++) {
        const factor = aug[k][i] / aug[i][i];
        for (let j = i; j <= n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= aug[i][j] * x[j];
      }
      x[i] /= aug[i][i];
    }
    return x;
  }
  // ==================== Vector Analysis ====================
  /**
   * Analyze 3D trajectory
   */
  static analyzeTrajectory(positions) {
    if (positions.length < 2) {
      return {
        totalDistance: 0,
        displacement: { x: 0, y: 0, z: 0 },
        averageSpeed: 0,
        maxSpeed: 0,
        curvature: []
      };
    }
    let totalDistance = 0;
    const speeds = [];
    const curvature = [];
    for (let i = 1; i < positions.length; i++) {
      const p1 = positions[i - 1].position;
      const p2 = positions[i].position;
      const dt = positions[i].time - positions[i - 1].time;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      totalDistance += distance;
      speeds.push(dt > 0 ? distance / dt : 0);
    }
    for (let i = 1; i < positions.length - 1; i++) {
      const p0 = positions[i - 1].position;
      const p1 = positions[i].position;
      const p2 = positions[i + 1].position;
      const a = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2 + (p1.z - p0.z) ** 2);
      const b = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2);
      const c = Math.sqrt((p2.x - p0.x) ** 2 + (p2.y - p0.y) ** 2 + (p2.z - p0.z) ** 2);
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      const k = 4 * area / (a * b * c);
      curvature.push(isFinite(k) ? k : 0);
    }
    const first = positions[0].position;
    const last = positions[positions.length - 1].position;
    const displacement = {
      x: last.x - first.x,
      y: last.y - first.y,
      z: last.z - first.z
    };
    const totalTime = positions[positions.length - 1].time - positions[0].time;
    return {
      totalDistance,
      displacement,
      averageSpeed: totalTime > 0 ? totalDistance / totalTime : 0,
      maxSpeed: Math.max(...speeds),
      curvature
    };
  }
};

// src/export/Exporter.ts
var DEFAULT_CSV_OPTIONS = {
  delimiter: ",",
  includeHeaders: true,
  precision: 6
};
var DEFAULT_JSON_OPTIONS = {
  pretty: true,
  includeMetadata: true
};
var DEFAULT_GLTF_OPTIONS = {
  binary: false,
  includeAnimations: true,
  frameInterval: 1
};
var DEFAULT_CHART_OPTIONS = {
  type: "line",
  width: 800,
  height: 600,
  title: "Simulation Data",
  xLabel: "Time (s)",
  yLabel: "Value",
  theme: "light"
};
var Exporter = class {
  /**
   * Export recording to specified format
   */
  static export(data, format, options = {}) {
    switch (format) {
      case "json":
        return this.exportJSON(data, { ...DEFAULT_JSON_OPTIONS, ...options });
      case "csv":
        return this.exportCSV(data, { ...DEFAULT_CSV_OPTIONS, ...options });
      case "gltf":
        return this.exportGLTF(data, { ...DEFAULT_GLTF_OPTIONS, ...options });
      case "parquet":
        return this.exportParquet(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  /**
   * Export to JSON
   */
  static exportJSON(data, options) {
    const exportData = options.includeMetadata ? data : {
      frames: data.frames,
      markers: data.markers
    };
    const jsonString = options.pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
    return {
      format: "json",
      data: jsonString,
      filename: "simulation.json",
      mimeType: "application/json",
      size: new Blob([jsonString]).size
    };
  }
  /**
   * Export to CSV
   */
  static exportCSV(data, options) {
    const { delimiter, includeHeaders, objectIds, properties, precision } = options;
    const lines = [];
    const allObjectIds = /* @__PURE__ */ new Set();
    for (const frame of data.frames) {
      for (const [id] of frame.objects) {
        if (!objectIds || objectIds.includes(id)) {
          allObjectIds.add(id);
        }
      }
    }
    const props = properties || [
      "position.x",
      "position.y",
      "position.z",
      "velocity.x",
      "velocity.y",
      "velocity.z",
      "rotation.x",
      "rotation.y",
      "rotation.z",
      "rotation.w"
    ];
    if (includeHeaders) {
      const headers = ["time"];
      for (const id of allObjectIds) {
        for (const prop of props) {
          headers.push(`${id}_${prop}`);
        }
      }
      lines.push(headers.join(delimiter));
    }
    for (const frame of data.frames) {
      const row = [frame.time.toFixed(precision)];
      for (const id of allObjectIds) {
        const state = frame.objects.find(([oid]) => oid === id);
        for (const prop of props) {
          if (state) {
            const value = this.getNestedProperty(state[1], prop);
            row.push(typeof value === "number" ? value.toFixed(precision) : String(value ?? ""));
          } else {
            row.push("");
          }
        }
      }
      lines.push(row.join(delimiter));
    }
    const csvString = lines.join("\n");
    return {
      format: "csv",
      data: csvString,
      filename: "simulation.csv",
      mimeType: "text/csv",
      size: new Blob([csvString]).size
    };
  }
  static getNestedProperty(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
  /**
   * Export to glTF format (3D model with animations)
   */
  static exportGLTF(data, options) {
    const gltf = {
      asset: {
        version: "2.0",
        generator: "ASIMULATE SDK"
      },
      scene: 0,
      scenes: [{ nodes: [] }],
      nodes: [],
      meshes: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
      animations: []
    };
    const objectIds = /* @__PURE__ */ new Set();
    for (const frame of data.frames) {
      for (const [id] of frame.objects) {
        objectIds.add(id);
      }
    }
    let nodeIndex = 0;
    const nodeMap = /* @__PURE__ */ new Map();
    for (const id of objectIds) {
      const firstState = this.findFirstState(data.frames, id);
      if (firstState) {
        gltf.nodes.push({
          name: id,
          translation: [firstState.position.x, firstState.position.y, firstState.position.z],
          rotation: [firstState.rotation.x, firstState.rotation.y, firstState.rotation.z, firstState.rotation.w],
          scale: [firstState.scale.x, firstState.scale.y, firstState.scale.z],
          mesh: nodeIndex
          // Placeholder - would need actual mesh data
        });
        gltf.scenes[0].nodes.push(nodeIndex);
        nodeMap.set(id, nodeIndex);
        nodeIndex++;
      }
    }
    if (options.includeAnimations && data.frames.length > 1) {
      const sampledFrames = data.frames.filter((_, i) => i % options.frameInterval === 0);
      for (const [id, nodeIdx] of nodeMap) {
        const times = [];
        const translations = [];
        const rotations = [];
        const scales = [];
        for (const frame of sampledFrames) {
          const state = frame.objects.find(([oid]) => oid === id);
          if (state) {
            times.push(frame.time);
            translations.push(state[1].position.x, state[1].position.y, state[1].position.z);
            rotations.push(state[1].rotation.x, state[1].rotation.y, state[1].rotation.z, state[1].rotation.w);
            scales.push(state[1].scale.x, state[1].scale.y, state[1].scale.z);
          }
        }
        if (times.length > 0) {
          const animationIndex = gltf.animations.length;
          gltf.animations.push({
            name: `${id}_animation`,
            channels: [
              { sampler: animationIndex * 3, target: { node: nodeIdx, path: "translation" } },
              { sampler: animationIndex * 3 + 1, target: { node: nodeIdx, path: "rotation" } },
              { sampler: animationIndex * 3 + 2, target: { node: nodeIdx, path: "scale" } }
            ],
            samplers: [
              { input: gltf.accessors.length, interpolation: "LINEAR", output: gltf.accessors.length + 1 },
              { input: gltf.accessors.length, interpolation: "LINEAR", output: gltf.accessors.length + 2 },
              { input: gltf.accessors.length, interpolation: "LINEAR", output: gltf.accessors.length + 3 }
            ]
          });
          gltf.accessors.push(
            { bufferView: 0, componentType: 5126, count: times.length, type: "SCALAR", min: [times[0]], max: [times[times.length - 1]] },
            { bufferView: 1, componentType: 5126, count: times.length, type: "VEC3" },
            { bufferView: 2, componentType: 5126, count: times.length, type: "VEC4" },
            { bufferView: 3, componentType: 5126, count: times.length, type: "VEC3" }
          );
        }
      }
    }
    const jsonString = JSON.stringify(gltf, null, 2);
    const extension = options.binary ? "glb" : "gltf";
    return {
      format: "gltf",
      data: jsonString,
      filename: `simulation.${extension}`,
      mimeType: options.binary ? "model/gltf-binary" : "model/gltf+json",
      size: new Blob([jsonString]).size
    };
  }
  static findFirstState(frames, objectId) {
    for (const frame of frames) {
      const state = frame.objects.find(([id]) => id === objectId);
      if (state) return state[1];
    }
    return void 0;
  }
  /**
   * Export to Parquet format (columnar data)
   */
  static exportParquet(data) {
    const header = {
      magic: "PAR1",
      version: 2,
      schema: {
        fields: [
          { name: "time", type: "DOUBLE" },
          { name: "object_id", type: "STRING" },
          { name: "position_x", type: "DOUBLE" },
          { name: "position_y", type: "DOUBLE" },
          { name: "position_z", type: "DOUBLE" },
          { name: "velocity_x", type: "DOUBLE" },
          { name: "velocity_y", type: "DOUBLE" },
          { name: "velocity_z", type: "DOUBLE" }
        ]
      }
    };
    const rows = [];
    for (const frame of data.frames) {
      for (const [id, state] of frame.objects) {
        rows.push({
          time: frame.time,
          object_id: id,
          position_x: state.position.x,
          position_y: state.position.y,
          position_z: state.position.z,
          velocity_x: state.velocity.x,
          velocity_y: state.velocity.y,
          velocity_z: state.velocity.z
        });
      }
    }
    const jsonString = JSON.stringify({ header, rows });
    return {
      format: "parquet",
      data: jsonString,
      filename: "simulation.parquet",
      mimeType: "application/vnd.apache.parquet",
      size: new Blob([jsonString]).size
    };
  }
  /**
   * Export time series to chart (SVG)
   */
  static exportChart(series, options = {}) {
    const opts = { ...DEFAULT_CHART_OPTIONS, ...options };
    const { width, height, title, xLabel, yLabel, theme, type } = opts;
    const padding = { top: 50, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const s of series) {
      for (const t of s.times) {
        minX = Math.min(minX, t);
        maxX = Math.max(maxX, t);
      }
      for (const v of s.values) {
        minY = Math.min(minY, v);
        maxY = Math.max(maxY, v);
      }
    }
    const yPadding = (maxY - minY) * 0.1;
    minY -= yPadding;
    maxY += yPadding;
    const scaleX = (x) => padding.left + (x - minX) / (maxX - minX) * chartWidth;
    const scaleY = (y) => padding.top + chartHeight - (y - minY) / (maxY - minY) * chartHeight;
    const colors = ["#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#9333ea", "#0891b2"];
    const bgColor = theme === "dark" ? "#1f2937" : "#ffffff";
    const textColor = theme === "dark" ? "#f3f4f6" : "#1f2937";
    const gridColor = theme === "dark" ? "#374151" : "#e5e7eb";
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" fill="${textColor}" font-size="16" font-weight="bold">${title}</text>
  
  <!-- Grid lines -->
  <g stroke="${gridColor}" stroke-width="1">`;
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padding.top + chartHeight / yTicks * i;
      const value = maxY - (maxY - minY) / yTicks * i;
      svg += `
    <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"/>`;
      svg += `
    <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" fill="${textColor}" font-size="11">${value.toFixed(2)}</text>`;
    }
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = padding.left + chartWidth / xTicks * i;
      const value = minX + (maxX - minX) / xTicks * i;
      svg += `
    <line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}"/>`;
      svg += `
    <text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" fill="${textColor}" font-size="11">${value.toFixed(2)}</text>`;
    }
    svg += `
  </g>
  
  <!-- Axes -->
  <g stroke="${textColor}" stroke-width="2">
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}"/>
    <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"/>
  </g>
  
  <!-- Axis labels -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="${textColor}" font-size="12">${xLabel}</text>
  <text x="15" y="${height / 2}" text-anchor="middle" fill="${textColor}" font-size="12" transform="rotate(-90, 15, ${height / 2})">${yLabel}</text>`;
    for (let s = 0; s < series.length; s++) {
      const { name, times, values } = series[s];
      const color = colors[s % colors.length];
      if (type === "line" || type === "area") {
        let pathD = "";
        for (let i = 0; i < times.length; i++) {
          const x = scaleX(times[i]);
          const y = scaleY(values[i]);
          pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }
        if (type === "area") {
          const areaPath = pathD + ` L ${scaleX(times[times.length - 1])} ${scaleY(minY)} L ${scaleX(times[0])} ${scaleY(minY)} Z`;
          svg += `
  <path d="${areaPath}" fill="${color}" fill-opacity="0.2"/>`;
        }
        svg += `
  <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>`;
      } else if (type === "scatter") {
        for (let i = 0; i < times.length; i++) {
          const x = scaleX(times[i]);
          const y = scaleY(values[i]);
          svg += `
  <circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
        }
      }
      const legendX = padding.left + 20;
      const legendY = padding.top + 20 + s * 20;
      svg += `
  <rect x="${legendX}" y="${legendY - 8}" width="16" height="3" fill="${color}"/>`;
      svg += `
  <text x="${legendX + 22}" y="${legendY}" fill="${textColor}" font-size="11">${name}</text>`;
    }
    svg += "\n</svg>";
    return {
      format: "chart",
      data: svg,
      filename: "chart.svg",
      mimeType: "image/svg+xml",
      size: new Blob([svg]).size
    };
  }
  /**
   * Export trajectory to path data
   */
  static exportTrajectory(positions, format = "svg") {
    if (format === "svg") {
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const p of positions) {
        minX = Math.min(minX, p.position.x);
        maxX = Math.max(maxX, p.position.x);
        minZ = Math.min(minZ, p.position.z);
        maxZ = Math.max(maxZ, p.position.z);
      }
      const padding = 50;
      const scale = 500 / Math.max(maxX - minX, maxZ - minZ, 1);
      const width = (maxX - minX) * scale + padding * 2;
      const height = (maxZ - minZ) * scale + padding * 2;
      let pathD = "";
      for (let i = 0; i < positions.length; i++) {
        const x = (positions[i].position.x - minX) * scale + padding;
        const y = (positions[i].position.z - minZ) * scale + padding;
        pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#f8fafc"/>
  <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="2"/>
  <circle cx="${(positions[0].position.x - minX) * scale + padding}" cy="${(positions[0].position.z - minZ) * scale + padding}" r="5" fill="#16a34a"/>
  <circle cx="${(positions[positions.length - 1].position.x - minX) * scale + padding}" cy="${(positions[positions.length - 1].position.z - minZ) * scale + padding}" r="5" fill="#dc2626"/>
</svg>`;
      return {
        format: "chart",
        data: svg,
        filename: "trajectory.svg",
        mimeType: "image/svg+xml",
        size: new Blob([svg]).size
      };
    } else if (format === "geojson") {
      const geojson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: positions.map((p) => [p.position.x, p.position.z, p.position.y])
        },
        properties: {
          times: positions.map((p) => p.time)
        }
      };
      const jsonString = JSON.stringify(geojson, null, 2);
      return {
        format: "json",
        data: jsonString,
        filename: "trajectory.geojson",
        mimeType: "application/geo+json",
        size: new Blob([jsonString]).size
      };
    } else {
      const lines = ["time,x,y,z"];
      for (const p of positions) {
        lines.push(`${p.time},${p.position.x},${p.position.y},${p.position.z}`);
      }
      const csvString = lines.join("\n");
      return {
        format: "csv",
        data: csvString,
        filename: "trajectory.csv",
        mimeType: "text/csv",
        size: new Blob([csvString]).size
      };
    }
  }
};

// src/import/Importer.ts
var Importer = class {
  /**
   * Import from various formats
   */
  static async import(data, format) {
    switch (format) {
      case "obj":
        return this.parseOBJ(data);
      case "gltf":
      case "glb":
        return this.parseGLTF(data);
      case "stl":
        return this.parseSTL(data);
      case "fbx":
        return { success: false, errors: ["FBX format requires external library"], warnings: [] };
      case "json":
        return this.parseJSON(data);
      case "csv":
        return this.parseCSV(data);
      default:
        return { success: false, errors: [`Unsupported format: ${format}`], warnings: [] };
    }
  }
  /**
   * Parse OBJ file format
   */
  static parseOBJ(objString) {
    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const errors = [];
    const warnings = [];
    const vertexPositions = [];
    const vertexNormals = [];
    const vertexUVs = [];
    const lines = objString.split("\n");
    let currentName = "default";
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim();
      if (!line || line.startsWith("#")) continue;
      const parts = line.split(/\s+/);
      const cmd = parts[0];
      try {
        switch (cmd) {
          case "o":
          case "g":
            currentName = parts[1] || "unnamed";
            break;
          case "v":
            vertexPositions.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;
          case "vn":
            vertexNormals.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;
          case "vt":
            vertexUVs.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]) || 0
            ]);
            break;
          case "f":
            const faceIndices = parts.slice(1).map((part) => {
              const [vIdx, vtIdx, vnIdx] = part.split("/").map((s) => s ? parseInt(s) - 1 : -1);
              return { vIdx, vtIdx, vnIdx };
            });
            for (let i = 1; i < faceIndices.length - 1; i++) {
              for (const idx of [0, i, i + 1]) {
                const { vIdx, vtIdx, vnIdx } = faceIndices[idx];
                if (vIdx >= 0 && vIdx < vertexPositions.length) {
                  vertices.push(...vertexPositions[vIdx]);
                }
                if (vnIdx >= 0 && vnIdx < vertexNormals.length) {
                  normals.push(...vertexNormals[vnIdx]);
                }
                if (vtIdx >= 0 && vtIdx < vertexUVs.length) {
                  uvs.push(...vertexUVs[vtIdx]);
                }
                indices.push(indices.length);
              }
            }
            break;
          case "mtllib":
          case "usemtl":
            warnings.push(`Material references not fully supported: ${line}`);
            break;
        }
      } catch (e) {
        errors.push(`Error parsing line ${lineNum + 1}: ${line}`);
      }
    }
    if (vertices.length === 0) {
      return { success: false, errors: ["No vertices found in OBJ file"], warnings };
    }
    const boundingBox = this.calculateBoundingBox(vertices);
    const center = {
      x: (boundingBox.min.x + boundingBox.max.x) / 2,
      y: (boundingBox.min.y + boundingBox.max.y) / 2,
      z: (boundingBox.min.z + boundingBox.max.z) / 2
    };
    const volume = (boundingBox.max.x - boundingBox.min.x) * (boundingBox.max.y - boundingBox.min.y) * (boundingBox.max.z - boundingBox.min.z);
    const meshData = {
      vertices: new Float32Array(vertices),
      indices: new Uint32Array(indices),
      normals: normals.length > 0 ? new Float32Array(normals) : void 0,
      uvs: uvs.length > 0 ? new Float32Array(uvs) : void 0,
      boundingBox,
      center,
      volume
    };
    return {
      success: true,
      data: {
        name: currentName,
        meshes: [meshData],
        nodes: [{
          name: currentName,
          meshIndex: 0,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          children: []
        }],
        materials: []
      },
      errors,
      warnings
    };
  }
  /**
   * Parse glTF/GLB format
   */
  static parseGLTF(data) {
    const errors = [];
    const warnings = [];
    try {
      let gltf;
      let buffers = [];
      if (typeof data === "string") {
        gltf = JSON.parse(data);
      } else {
        const view = new DataView(data);
        const magic = view.getUint32(0, true);
        if (magic !== 1179937895) {
          return { success: false, errors: ["Invalid GLB magic number"], warnings };
        }
        const version = view.getUint32(4, true);
        if (version !== 2) {
          warnings.push(`GLB version ${version} may not be fully supported`);
        }
        let offset = 12;
        while (offset < data.byteLength) {
          const chunkLength = view.getUint32(offset, true);
          const chunkType = view.getUint32(offset + 4, true);
          const chunkData = data.slice(offset + 8, offset + 8 + chunkLength);
          if (chunkType === 1313821514) {
            const decoder = new TextDecoder();
            gltf = JSON.parse(decoder.decode(chunkData));
          } else if (chunkType === 5130562) {
            buffers.push(chunkData);
          }
          offset += 8 + chunkLength;
        }
      }
      if (!gltf) {
        return { success: false, errors: ["Failed to parse glTF data"], warnings };
      }
      const meshes = [];
      for (const mesh of gltf.meshes || []) {
        for (const primitive of mesh.primitives || []) {
          const positions = this.getAccessorData(gltf, primitive.attributes?.POSITION, buffers);
          const indices = this.getAccessorData(gltf, primitive.indices, buffers);
          const normals = this.getAccessorData(gltf, primitive.attributes?.NORMAL, buffers);
          if (positions) {
            const boundingBox = this.calculateBoundingBox(Array.from(positions));
            const center = {
              x: (boundingBox.min.x + boundingBox.max.x) / 2,
              y: (boundingBox.min.y + boundingBox.max.y) / 2,
              z: (boundingBox.min.z + boundingBox.max.z) / 2
            };
            meshes.push({
              vertices: positions,
              indices: indices || new Uint32Array(0),
              normals: normals || void 0,
              boundingBox,
              center,
              volume: this.estimateMeshVolume(positions, indices)
            });
          }
        }
      }
      const nodes = (gltf.nodes || []).map((node, i) => ({
        name: node.name || `node_${i}`,
        meshIndex: node.mesh,
        position: node.translation ? { x: node.translation[0], y: node.translation[1], z: node.translation[2] } : { x: 0, y: 0, z: 0 },
        rotation: node.rotation ? { x: node.rotation[0], y: node.rotation[1], z: node.rotation[2], w: node.rotation[3] } : { x: 0, y: 0, z: 0, w: 1 },
        scale: node.scale ? { x: node.scale[0], y: node.scale[1], z: node.scale[2] } : { x: 1, y: 1, z: 1 },
        children: node.children || []
      }));
      const materials = (gltf.materials || []).map((mat, i) => ({
        name: mat.name || `material_${i}`,
        color: mat.pbrMetallicRoughness?.baseColorFactor ? { r: mat.pbrMetallicRoughness.baseColorFactor[0], g: mat.pbrMetallicRoughness.baseColorFactor[1], b: mat.pbrMetallicRoughness.baseColorFactor[2], a: mat.pbrMetallicRoughness.baseColorFactor[3] } : void 0,
        roughness: mat.pbrMetallicRoughness?.roughnessFactor,
        metallic: mat.pbrMetallicRoughness?.metallicFactor
      }));
      return {
        success: true,
        data: {
          name: gltf.asset?.extras?.name || "model",
          meshes,
          nodes,
          materials
        },
        errors,
        warnings
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse glTF: ${e}`], warnings };
    }
  }
  static getAccessorData(gltf, accessorIndex, buffers) {
    if (accessorIndex === void 0) return null;
    const accessor = gltf.accessors?.[accessorIndex];
    if (!accessor) return null;
    const bufferView = gltf.bufferViews?.[accessor.bufferView];
    if (!bufferView) return null;
    const buffer = buffers[bufferView.buffer] || null;
    if (!buffer) {
      const bufferDef = gltf.buffers?.[bufferView.buffer];
      if (bufferDef?.uri?.startsWith("data:")) {
        const base64 = bufferDef.uri.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        buffers[bufferView.buffer] = bytes.buffer;
      }
    }
    const finalBuffer = buffers[bufferView.buffer];
    if (!finalBuffer) return null;
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const componentTypes = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    };
    const TypedArray = componentTypes[accessor.componentType];
    if (!TypedArray) return null;
    const typeComponents = {
      "SCALAR": 1,
      "VEC2": 2,
      "VEC3": 3,
      "VEC4": 4,
      "MAT2": 4,
      "MAT3": 9,
      "MAT4": 16
    };
    const components = typeComponents[accessor.type] || 1;
    const count = accessor.count * components;
    return new TypedArray(finalBuffer, byteOffset, count);
  }
  /**
   * Parse STL format (ASCII and Binary)
   */
  static parseSTL(data) {
    const errors = [];
    const warnings = [];
    try {
      let vertices = [];
      let normals = [];
      if (typeof data === "string") {
        const lines = data.split("\n");
        let currentNormal = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("facet normal")) {
            const parts = trimmed.split(/\s+/);
            currentNormal = [parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4])];
          } else if (trimmed.startsWith("vertex")) {
            const parts = trimmed.split(/\s+/);
            vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
            normals.push(...currentNormal);
          }
        }
      } else {
        const view = new DataView(data);
        const numTriangles = view.getUint32(80, true);
        let offset = 84;
        for (let i = 0; i < numTriangles; i++) {
          const nx = view.getFloat32(offset, true);
          const ny = view.getFloat32(offset + 4, true);
          const nz = view.getFloat32(offset + 8, true);
          offset += 12;
          for (let v = 0; v < 3; v++) {
            vertices.push(
              view.getFloat32(offset, true),
              view.getFloat32(offset + 4, true),
              view.getFloat32(offset + 8, true)
            );
            normals.push(nx, ny, nz);
            offset += 12;
          }
          offset += 2;
        }
      }
      if (vertices.length === 0) {
        return { success: false, errors: ["No vertices found in STL file"], warnings };
      }
      const indices = new Uint32Array(vertices.length / 3);
      for (let i = 0; i < indices.length; i++) {
        indices[i] = i;
      }
      const boundingBox = this.calculateBoundingBox(vertices);
      const center = {
        x: (boundingBox.min.x + boundingBox.max.x) / 2,
        y: (boundingBox.min.y + boundingBox.max.y) / 2,
        z: (boundingBox.min.z + boundingBox.max.z) / 2
      };
      return {
        success: true,
        data: {
          name: "stl_model",
          meshes: [{
            vertices: new Float32Array(vertices),
            indices,
            normals: new Float32Array(normals),
            boundingBox,
            center,
            volume: this.estimateMeshVolume(new Float32Array(vertices), indices)
          }],
          nodes: [{
            name: "root",
            meshIndex: 0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            children: []
          }],
          materials: []
        },
        errors,
        warnings
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse STL: ${e}`], warnings };
    }
  }
  /**
   * Parse JSON recording data
   */
  static parseJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.frames || !Array.isArray(data.frames)) {
        return { success: false, errors: ["Invalid recording format: missing frames array"], warnings: [] };
      }
      return {
        success: true,
        data,
        errors: [],
        warnings: []
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse JSON: ${e}`], warnings: [] };
    }
  }
  /**
   * Parse CSV data into object configs
   */
  static parseCSV(csvString) {
    const errors = [];
    const warnings = [];
    const objects = [];
    try {
      const lines = csvString.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        return { success: false, errors: ["CSV must have header and at least one data row"], warnings };
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((h, j) => {
          row[h] = values[j] || "";
        });
        try {
          const config = {
            type: row.type || "sphere",
            position: {
              x: parseFloat(row.x || row.position_x || "0"),
              y: parseFloat(row.y || row.position_y || "0"),
              z: parseFloat(row.z || row.position_z || "0")
            },
            mass: parseFloat(row.mass || "1"),
            radius: row.radius ? parseFloat(row.radius) : void 0,
            width: row.width ? parseFloat(row.width) : void 0,
            height: row.height ? parseFloat(row.height) : void 0,
            depth: row.depth ? parseFloat(row.depth) : void 0
          };
          objects.push(config);
        } catch (e) {
          warnings.push(`Error parsing row ${i + 1}`);
        }
      }
      return { success: true, data: objects, errors, warnings };
    } catch (e) {
      return { success: false, errors: [`Failed to parse CSV: ${e}`], warnings };
    }
  }
  /**
   * Calculate bounding box from vertex array
   */
  static calculateBoundingBox(vertices) {
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    for (let i = 0; i < vertices.length; i += 3) {
      min.x = Math.min(min.x, vertices[i]);
      min.y = Math.min(min.y, vertices[i + 1]);
      min.z = Math.min(min.z, vertices[i + 2]);
      max.x = Math.max(max.x, vertices[i]);
      max.y = Math.max(max.y, vertices[i + 1]);
      max.z = Math.max(max.z, vertices[i + 2]);
    }
    return { min, max };
  }
  /**
   * Estimate mesh volume using signed tetrahedra
   */
  static estimateMeshVolume(vertices, indices) {
    if (!indices || indices.length < 3) {
      const bb = this.calculateBoundingBox(Array.from(vertices));
      return (bb.max.x - bb.min.x) * (bb.max.y - bb.min.y) * (bb.max.z - bb.min.z);
    }
    let volume = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      const v0 = { x: vertices[i0], y: vertices[i0 + 1], z: vertices[i0 + 2] };
      const v1 = { x: vertices[i1], y: vertices[i1 + 1], z: vertices[i1 + 2] };
      const v2 = { x: vertices[i2], y: vertices[i2 + 1], z: vertices[i2 + 2] };
      volume += (v0.x * (v1.y * v2.z - v2.y * v1.z) - v1.x * (v0.y * v2.z - v2.y * v0.z) + v2.x * (v0.y * v1.z - v1.y * v0.z)) / 6;
    }
    return Math.abs(volume);
  }
  /**
   * Convert imported model to physics object configs
   */
  static modelToPhysicsObjects(model, options = {}) {
    const configs = [];
    const density = options.density ?? 1;
    const friction = options.friction ?? 0.5;
    const restitution = options.restitution ?? 0.3;
    for (const node of model.nodes) {
      if (node.meshIndex !== void 0 && node.meshIndex < model.meshes.length) {
        const mesh = model.meshes[node.meshIndex];
        const mass = mesh.volume * density;
        configs.push({
          type: "mesh",
          position: node.position,
          rotation: node.rotation,
          scale: node.scale,
          mass,
          friction,
          restitution,
          meshData: {
            vertices: Array.from(mesh.vertices),
            indices: Array.from(mesh.indices),
            normals: mesh.normals ? Array.from(mesh.normals) : void 0
          }
        });
      }
    }
    return configs;
  }
};

// src/visualization/Visualizer.ts
init_math();
var DEFAULT_RENDER_OPTIONS = {
  showBoundingBoxes: false,
  showVelocities: false,
  showForces: false,
  showContacts: false,
  showConstraints: false,
  showTrajectories: false,
  showGrid: true,
  showAxes: true,
  showStats: true,
  wireframe: false,
  shadows: true,
  velocityScale: 0.1,
  forceScale: 0.01,
  gridSize: 20,
  gridDivisions: 20
};
var DEFAULT_CAMERA = {
  position: { x: 10, y: 10, z: 10 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  fov: 60,
  near: 0.1,
  far: 1e3,
  orthographic: false,
  orthoSize: 10
};
var Canvas2DRenderer = class {
  constructor() {
    this.camera = DEFAULT_CAMERA;
    this.objects = /* @__PURE__ */ new Map();
    this.lights = /* @__PURE__ */ new Map();
    this.debugLines = [];
    this.debugPoints = [];
  }
  async initialize(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;
  }
  dispose() {
    this.objects.clear();
    this.lights.clear();
    this.debugLines = [];
    this.debugPoints = [];
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  setCamera(camera) {
    this.camera = camera;
  }
  addLight(config) {
    const id = `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.lights.set(id, config);
    return id;
  }
  removeLight(id) {
    this.lights.delete(id);
  }
  addObject(id, type, params, material) {
    this.objects.set(id, { type, params, material });
  }
  removeObject(id) {
    this.objects.delete(id);
  }
  updateObject(id, state) {
    const obj = this.objects.get(id);
    if (obj) {
      obj.state = state;
    }
  }
  drawLine(start, end, color, width = 1) {
    this.debugLines.push({ start, end, color, width });
  }
  drawPoint(position, color, size = 5) {
    this.debugPoints.push({ position, color, size });
  }
  drawBox(min, max, color) {
    const corners = [
      { x: min.x, y: min.y, z: min.z },
      { x: max.x, y: min.y, z: min.z },
      { x: max.x, y: min.y, z: max.z },
      { x: min.x, y: min.y, z: max.z },
      { x: min.x, y: max.y, z: min.z },
      { x: max.x, y: max.y, z: min.z },
      { x: max.x, y: max.y, z: max.z },
      { x: min.x, y: max.y, z: max.z }
    ];
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      // Bottom
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      // Top
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7]
      // Verticals
    ];
    for (const [i, j] of edges) {
      this.drawLine(corners[i], corners[j], color);
    }
  }
  drawSphere(center, radius, color) {
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle1 = i / segments * Math.PI * 2;
      const angle2 = (i + 1) / segments * Math.PI * 2;
      this.drawLine(
        { x: center.x + Math.cos(angle1) * radius, y: center.y, z: center.z + Math.sin(angle1) * radius },
        { x: center.x + Math.cos(angle2) * radius, y: center.y, z: center.z + Math.sin(angle2) * radius },
        color
      );
    }
  }
  clearDebugDrawings() {
    this.debugLines = [];
    this.debugPoints = [];
  }
  render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);
    const scale = Math.min(width, height) / (this.camera.orthoSize * 2);
    const offsetX = width / 2;
    const offsetY = height / 2;
    const project = (p) => ({
      x: offsetX + p.x * scale,
      y: offsetY - p.z * scale
      // Flip Z for screen coords
    });
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    const gridSize = 10;
    for (let i = -gridSize; i <= gridSize; i++) {
      const p12 = project({ x: i, y: 0, z: -gridSize });
      const p22 = project({ x: i, y: 0, z: gridSize });
      ctx.beginPath();
      ctx.moveTo(p12.x, p12.y);
      ctx.lineTo(p22.x, p22.y);
      ctx.stroke();
      const p3 = project({ x: -gridSize, y: 0, z: i });
      const p4 = project({ x: gridSize, y: 0, z: i });
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff4444";
    let p1 = project({ x: 0, y: 0, z: 0 });
    let p2 = project({ x: 2, y: 0, z: 0 });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.strokeStyle = "#4444ff";
    p2 = project({ x: 0, y: 0, z: 2 });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    for (const [id, obj] of this.objects) {
      const state = obj.state;
      if (!state) continue;
      const color = obj.material?.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
      ctx.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, ${color.a})`;
      ctx.strokeStyle = `rgb(${Math.floor(color.r * 255 * 0.7)}, ${Math.floor(color.g * 255 * 0.7)}, ${Math.floor(color.b * 255 * 0.7)})`;
      ctx.lineWidth = 2;
      const pos = project(state.position);
      if (obj.type === "sphere") {
        const radius = (obj.params.radius || 1) * scale;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (obj.type === "box") {
        const hw = (obj.params.width || 1) * scale / 2;
        const hd = (obj.params.depth || 1) * scale / 2;
        ctx.fillRect(pos.x - hw, pos.y - hd, hw * 2, hd * 2);
        ctx.strokeRect(pos.x - hw, pos.y - hd, hw * 2, hd * 2);
      } else {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText(id.substring(0, 8), pos.x + 10, pos.y - 10);
    }
    for (const line of this.debugLines) {
      const p12 = project(line.start);
      const p22 = project(line.end);
      ctx.strokeStyle = `rgb(${Math.floor(line.color.r * 255)}, ${Math.floor(line.color.g * 255)}, ${Math.floor(line.color.b * 255)})`;
      ctx.lineWidth = line.width;
      ctx.beginPath();
      ctx.moveTo(p12.x, p12.y);
      ctx.lineTo(p22.x, p22.y);
      ctx.stroke();
    }
    for (const point of this.debugPoints) {
      const p = project(point.position);
      ctx.fillStyle = `rgb(${Math.floor(point.color.r * 255)}, ${Math.floor(point.color.g * 255)}, ${Math.floor(point.color.b * 255)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, point.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
var Visualizer = class {
  constructor(renderer) {
    this.trajectories = /* @__PURE__ */ new Map();
    this.maxTrajectoryPoints = 500;
    this.animationFrameId = null;
    this.renderer = renderer || new Canvas2DRenderer();
    this.options = { ...DEFAULT_RENDER_OPTIONS };
    this.camera = { ...DEFAULT_CAMERA };
  }
  /**
   * Initialize the visualizer
   */
  async initialize(canvas) {
    await this.renderer.initialize(canvas);
    this.renderer.setCamera(this.camera);
    this.renderer.addLight({
      type: "directional",
      direction: { x: -1, y: -2, z: -1 },
      color: { r: 1, g: 1, b: 1 },
      intensity: 1,
      castShadow: true
    });
    this.renderer.addLight({
      type: "ambient",
      color: { r: 0.3, g: 0.3, b: 0.4 },
      intensity: 1
    });
  }
  /**
   * Dispose of resources
   */
  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
    this.trajectories.clear();
  }
  /**
   * Set render options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }
  /**
   * Get current render options
   */
  getOptions() {
    return { ...this.options };
  }
  /**
   * Set camera configuration
   */
  setCamera(config) {
    this.camera = { ...this.camera, ...config };
    this.renderer.setCamera(this.camera);
  }
  /**
   * Get camera configuration
   */
  getCamera() {
    return { ...this.camera };
  }
  /**
   * Resize the renderer
   */
  resize(width, height) {
    this.renderer.resize(width, height);
  }
  /**
   * Add a physics object to the visualization
   */
  addObject(id, type, params, material) {
    this.renderer.addObject(id, type, params, material);
    this.trajectories.set(id, []);
  }
  /**
   * Remove a physics object
   */
  removeObject(id) {
    this.renderer.removeObject(id);
    this.trajectories.delete(id);
  }
  /**
   * Update object states
   */
  updateObjects(states) {
    for (const [id, state] of states) {
      this.renderer.updateObject(id, state);
      if (this.options.showTrajectories) {
        const trajectory = this.trajectories.get(id);
        if (trajectory) {
          trajectory.push({ ...state.position });
          if (trajectory.length > this.maxTrajectoryPoints) {
            trajectory.shift();
          }
        }
      }
    }
  }
  /**
   * Draw debug information
   */
  drawDebug(states, forces, contacts, constraints) {
    this.renderer.clearDebugDrawings();
    if (this.options.showVelocities) {
      for (const [id, state] of states) {
        const end = Vec3.add(state.position, Vec3.scale(state.velocity, this.options.velocityScale));
        this.renderer.drawLine(state.position, end, { r: 0, g: 1, b: 0 }, 2);
      }
    }
    if (this.options.showForces && forces) {
      for (const [id, forceList] of forces) {
        for (const { force, point } of forceList) {
          const end = Vec3.add(point, Vec3.scale(force, this.options.forceScale));
          this.renderer.drawLine(point, end, { r: 1, g: 0.5, b: 0 }, 2);
        }
      }
    }
    if (this.options.showContacts && contacts) {
      for (const contact of contacts) {
        this.renderer.drawPoint(contact.position, { r: 1, g: 0, b: 0 }, 5);
        const normalEnd = Vec3.add(contact.position, Vec3.scale(contact.normal, 0.5));
        this.renderer.drawLine(contact.position, normalEnd, { r: 1, g: 1, b: 0 }, 1);
      }
    }
    if (this.options.showConstraints && constraints) {
      for (const constraint of constraints) {
        const stateA = states.get(constraint.objectA);
        const stateB = states.get(constraint.objectB);
        if (stateA && stateB) {
          const worldA = Vec3.add(stateA.position, constraint.anchorA);
          const worldB = Vec3.add(stateB.position, constraint.anchorB);
          this.renderer.drawLine(worldA, worldB, { r: 0.5, g: 0.5, b: 1 }, 1);
        }
      }
    }
    if (this.options.showTrajectories) {
      for (const [id, trajectory] of this.trajectories) {
        if (trajectory.length > 1) {
          for (let i = 1; i < trajectory.length; i++) {
            const alpha = i / trajectory.length;
            this.renderer.drawLine(
              trajectory[i - 1],
              trajectory[i],
              { r: alpha, g: alpha * 0.5, b: 1 - alpha },
              1
            );
          }
        }
      }
    }
    if (this.options.showBoundingBoxes) {
      for (const [id, state] of states) {
        const size = 0.5;
        const min = Vec3.sub(state.position, { x: size, y: size, z: size });
        const max = Vec3.add(state.position, { x: size, y: size, z: size });
        this.renderer.drawBox(min, max, { r: 1, g: 1, b: 0 });
      }
    }
  }
  /**
   * Clear all trajectories
   */
  clearTrajectories() {
    for (const trajectory of this.trajectories.values()) {
      trajectory.length = 0;
    }
  }
  /**
   * Render a single frame
   */
  render() {
    this.renderer.render();
  }
  /**
   * Start animation loop
   */
  startLoop(updateCallback) {
    const loop = () => {
      if (updateCallback) {
        updateCallback();
      }
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
  /**
   * Stop animation loop
   */
  stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  /**
   * Take screenshot
   */
  screenshot() {
    return null;
  }
  /**
   * Orbit camera around target
   */
  orbitCamera(deltaX, deltaY) {
    const offset = Vec3.sub(this.camera.position, this.camera.target);
    const distance = Vec3.length(offset);
    let theta = Math.atan2(offset.x, offset.z);
    let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / distance)));
    theta -= deltaX * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi + deltaY * 0.01));
    this.camera.position = {
      x: this.camera.target.x + distance * Math.sin(phi) * Math.sin(theta),
      y: this.camera.target.y + distance * Math.cos(phi),
      z: this.camera.target.z + distance * Math.sin(phi) * Math.cos(theta)
    };
    this.renderer.setCamera(this.camera);
  }
  /**
   * Zoom camera
   */
  zoomCamera(delta) {
    const offset = Vec3.sub(this.camera.position, this.camera.target);
    const distance = Vec3.length(offset);
    const newDistance = Math.max(1, distance * (1 + delta * 0.1));
    const direction = Vec3.normalize(offset);
    this.camera.position = Vec3.add(this.camera.target, Vec3.scale(direction, newDistance));
    this.renderer.setCamera(this.camera);
  }
  /**
   * Pan camera
   */
  panCamera(deltaX, deltaY) {
    const forward = Vec3.normalize(Vec3.sub(this.camera.target, this.camera.position));
    const right = Vec3.normalize(Vec3.cross(forward, this.camera.up));
    const up = Vec3.cross(right, forward);
    const pan = Vec3.add(Vec3.scale(right, -deltaX * 0.01), Vec3.scale(up, deltaY * 0.01));
    this.camera.position = Vec3.add(this.camera.position, pan);
    this.camera.target = Vec3.add(this.camera.target, pan);
    this.renderer.setCamera(this.camera);
  }
  /**
   * Focus on object
   */
  focusOn(position, distance = 10) {
    const offset = Vec3.sub(this.camera.position, this.camera.target);
    const direction = Vec3.normalize(offset);
    this.camera.target = { ...position };
    this.camera.position = Vec3.add(position, Vec3.scale(direction, distance));
    this.renderer.setCamera(this.camera);
  }
  /**
   * Set predefined view
   */
  setView(view) {
    const distance = 15;
    switch (view) {
      case "top":
        this.camera.position = { x: 0, y: distance, z: 1e-3 };
        this.camera.up = { x: 0, y: 0, z: -1 };
        break;
      case "front":
        this.camera.position = { x: 0, y: 0, z: distance };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
      case "side":
        this.camera.position = { x: distance, y: 0, z: 0 };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
      case "isometric":
        this.camera.position = { x: distance * 0.577, y: distance * 0.577, z: distance * 0.577 };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
    }
    this.camera.target = { x: 0, y: 0, z: 0 };
    this.renderer.setCamera(this.camera);
  }
};

// src/scripting/ScriptManager.ts
init_math();
var ScriptManager = class {
  constructor() {
    this.scripts = /* @__PURE__ */ new Map();
    this.globalScripts = /* @__PURE__ */ new Map();
    this.scriptRegistry = /* @__PURE__ */ new Map();
    this.initialized = /* @__PURE__ */ new Set();
  }
  /**
   * Register a script type for later instantiation
   */
  registerScript(name, factory) {
    this.scriptRegistry.set(name, factory);
  }
  /**
   * Attach a script to an object
   */
  attachScript(objectId, scriptName, initialState) {
    const factory = this.scriptRegistry.get(scriptName);
    if (!factory) {
      console.warn(`Script "${scriptName}" not registered`);
      return false;
    }
    const definition = factory();
    const script = {
      definition,
      state: { ...definition.state, ...initialState },
      enabled: true
    };
    if (!this.scripts.has(objectId)) {
      this.scripts.set(objectId, /* @__PURE__ */ new Map());
    }
    this.scripts.get(objectId).set(scriptName, script);
    return true;
  }
  /**
   * Attach a script definition directly
   */
  attachScriptDirect(objectId, definition) {
    const script = {
      definition,
      state: { ...definition.state },
      enabled: true
    };
    if (!this.scripts.has(objectId)) {
      this.scripts.set(objectId, /* @__PURE__ */ new Map());
    }
    this.scripts.get(objectId).set(definition.name, script);
  }
  /**
   * Detach a script from an object
   */
  detachScript(objectId, scriptName) {
    const objectScripts = this.scripts.get(objectId);
    if (!objectScripts) return false;
    return objectScripts.delete(scriptName);
  }
  /**
   * Detach all scripts from an object
   */
  detachAllScripts(objectId) {
    this.scripts.delete(objectId);
    this.initialized.delete(objectId);
  }
  /**
   * Enable/disable a script
   */
  setScriptEnabled(objectId, scriptName, enabled) {
    const script = this.scripts.get(objectId)?.get(scriptName);
    if (script) {
      script.enabled = enabled;
    }
  }
  /**
   * Get script state
   */
  getScriptState(objectId, scriptName) {
    return this.scripts.get(objectId)?.get(scriptName)?.state;
  }
  /**
   * Set script state
   */
  setScriptState(objectId, scriptName, state) {
    const script = this.scripts.get(objectId)?.get(scriptName);
    if (script) {
      script.state = { ...script.state, ...state };
    }
  }
  /**
   * Add a global script (runs for all objects)
   */
  addGlobalScript(definition) {
    this.globalScripts.set(definition.name, {
      definition,
      state: { ...definition.state },
      enabled: true
    });
  }
  /**
   * Remove a global script
   */
  removeGlobalScript(name) {
    this.globalScripts.delete(name);
  }
  /**
   * Initialize scripts for an object
   */
  initScripts(objectId, object, world) {
    if (this.initialized.has(objectId)) return;
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onInit) {
          try {
            script.definition.callbacks.onInit(ctx);
          } catch (e) {
            console.error(`Error in ${name}.onInit:`, e);
          }
        }
      }
    }
    this.initialized.add(objectId);
  }
  /**
   * Run pre-update callbacks
   */
  runPreUpdate(objects, world, deltaTime) {
    const time = world.currentTime;
    for (const [objectId, object] of objects) {
      this.initScripts(objectId, object, world);
      const ctx = { object, world, time, deltaTime };
      const objectScripts = this.scripts.get(objectId);
      if (objectScripts) {
        for (const [name, script] of objectScripts) {
          if (script.enabled && script.definition.callbacks.onPreUpdate) {
            try {
              script.definition.callbacks.onPreUpdate(ctx);
            } catch (e) {
              console.error(`Error in ${name}.onPreUpdate:`, e);
            }
          }
        }
      }
      for (const [name, script] of this.globalScripts) {
        if (script.enabled && script.definition.callbacks.onPreUpdate) {
          try {
            script.definition.callbacks.onPreUpdate(ctx);
          } catch (e) {
            console.error(`Error in global ${name}.onPreUpdate:`, e);
          }
        }
      }
    }
  }
  /**
   * Run post-update callbacks
   */
  runPostUpdate(objects, world, deltaTime) {
    const time = world.currentTime;
    for (const [objectId, object] of objects) {
      const ctx = { object, world, time, deltaTime };
      const objectScripts = this.scripts.get(objectId);
      if (objectScripts) {
        for (const [name, script] of objectScripts) {
          if (script.enabled && script.definition.callbacks.onPostUpdate) {
            try {
              script.definition.callbacks.onPostUpdate(ctx);
            } catch (e) {
              console.error(`Error in ${name}.onPostUpdate:`, e);
            }
          }
        }
      }
      for (const [name, script] of this.globalScripts) {
        if (script.enabled && script.definition.callbacks.onPostUpdate) {
          try {
            script.definition.callbacks.onPostUpdate(ctx);
          } catch (e) {
            console.error(`Error in global ${name}.onPostUpdate:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle collision enter event
   */
  onCollisionEnter(objectId, object, world, collision) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onCollisionEnter) {
          try {
            script.definition.callbacks.onCollisionEnter(ctx, collision);
          } catch (e) {
            console.error(`Error in ${name}.onCollisionEnter:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle collision stay event
   */
  onCollisionStay(objectId, object, world, collision) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onCollisionStay) {
          try {
            script.definition.callbacks.onCollisionStay(ctx, collision);
          } catch (e) {
            console.error(`Error in ${name}.onCollisionStay:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle collision exit event
   */
  onCollisionExit(objectId, object, world, otherId) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onCollisionExit) {
          try {
            script.definition.callbacks.onCollisionExit(ctx, otherId);
          } catch (e) {
            console.error(`Error in ${name}.onCollisionExit:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle trigger enter event
   */
  onTriggerEnter(objectId, object, world, triggerId) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onTriggerEnter) {
          try {
            script.definition.callbacks.onTriggerEnter(ctx, triggerId);
          } catch (e) {
            console.error(`Error in ${name}.onTriggerEnter:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle trigger exit event
   */
  onTriggerExit(objectId, object, world, triggerId) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onTriggerExit) {
          try {
            script.definition.callbacks.onTriggerExit(ctx, triggerId);
          } catch (e) {
            console.error(`Error in ${name}.onTriggerExit:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle object destruction
   */
  onDestroy(objectId, object, world) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.definition.callbacks.onDestroy) {
          try {
            script.definition.callbacks.onDestroy(ctx);
          } catch (e) {
            console.error(`Error in ${name}.onDestroy:`, e);
          }
        }
      }
    }
    this.detachAllScripts(objectId);
  }
  /**
   * Handle wake event
   */
  onWake(objectId, object, world) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onWake) {
          try {
            script.definition.callbacks.onWake(ctx);
          } catch (e) {
            console.error(`Error in ${name}.onWake:`, e);
          }
        }
      }
    }
  }
  /**
   * Handle sleep event
   */
  onSleep(objectId, object, world) {
    const ctx = {
      object,
      world,
      time: world.currentTime,
      deltaTime: 0
    };
    const objectScripts = this.scripts.get(objectId);
    if (objectScripts) {
      for (const [name, script] of objectScripts) {
        if (script.enabled && script.definition.callbacks.onSleep) {
          try {
            script.definition.callbacks.onSleep(ctx);
          } catch (e) {
            console.error(`Error in ${name}.onSleep:`, e);
          }
        }
      }
    }
  }
  /**
   * Clear all scripts
   */
  clear() {
    this.scripts.clear();
    this.globalScripts.clear();
    this.initialized.clear();
  }
};
var OscillatorScript = () => ({
  name: "oscillator",
  state: {
    axis: { x: 0, y: 1, z: 0 },
    amplitude: 1,
    frequency: 1,
    phase: 0,
    startPosition: null
  },
  callbacks: {
    onInit: (ctx) => {
      const state = ctx.scriptState;
      if (!state) return;
      state.startPosition = { ...ctx.object.position };
    },
    onPreUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state?.startPosition) return;
      const offset = Math.sin(ctx.time * state.frequency * Math.PI * 2 + state.phase) * state.amplitude;
      ctx.object.position = Vec3.add(state.startPosition, Vec3.scale(state.axis, offset));
    }
  }
});
var RotatorScript = () => ({
  name: "rotator",
  state: {
    axis: { x: 0, y: 1, z: 0 },
    speed: 1
    // radians per second
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state) return;
      ctx.object.angularVelocity = Vec3.scale(state.axis, state.speed);
    }
  }
});
var FollowScript = () => ({
  name: "follow",
  state: {
    targetId: "",
    speed: 5,
    offset: { x: 0, y: 0, z: 0 },
    smoothing: 0.1
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state?.targetId) return;
      const target = ctx.world.getObject(state.targetId);
      if (!target) return;
      const targetPos = Vec3.add(target.position, state.offset);
      const diff = Vec3.sub(targetPos, ctx.object.position);
      const direction = Vec3.normalize(diff);
      const distance = Vec3.length(diff);
      if (distance > 0.01) {
        const moveSpeed = Math.min(distance * state.smoothing * 60, state.speed);
        ctx.object.velocity = Vec3.scale(direction, moveSpeed);
      } else {
        ctx.object.velocity = { x: 0, y: 0, z: 0 };
      }
    }
  }
});
var LookAtScript = () => ({
  name: "lookAt",
  state: {
    targetId: "",
    upAxis: { x: 0, y: 1, z: 0 }
  },
  callbacks: {
    onPostUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state?.targetId) return;
      const target = ctx.world.getObject(state.targetId);
      if (!target) return;
      const forward = Vec3.normalize(Vec3.sub(target.position, ctx.object.position));
      const right = Vec3.normalize(Vec3.cross(state.upAxis, forward));
      const up = Vec3.cross(forward, right);
      const trace = right.x + up.y + forward.z;
      if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1);
        ctx.object.rotation = {
          w: 0.25 / s,
          x: (up.z - forward.y) * s,
          y: (forward.x - right.z) * s,
          z: (right.y - up.x) * s
        };
      }
    }
  }
});
var BoundsScript = () => ({
  name: "bounds",
  state: {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
    behavior: "clamp"
  },
  callbacks: {
    onPostUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state) return;
      const pos = ctx.object.position;
      const vel = ctx.object.velocity;
      if (state.behavior === "clamp") {
        pos.x = Math.max(state.min.x, Math.min(state.max.x, pos.x));
        pos.y = Math.max(state.min.y, Math.min(state.max.y, pos.y));
        pos.z = Math.max(state.min.z, Math.min(state.max.z, pos.z));
      } else if (state.behavior === "wrap") {
        const size = Vec3.sub(state.max, state.min);
        if (pos.x < state.min.x) pos.x += size.x;
        if (pos.x > state.max.x) pos.x -= size.x;
        if (pos.y < state.min.y) pos.y += size.y;
        if (pos.y > state.max.y) pos.y -= size.y;
        if (pos.z < state.min.z) pos.z += size.z;
        if (pos.z > state.max.z) pos.z -= size.z;
      } else if (state.behavior === "bounce") {
        if (pos.x < state.min.x || pos.x > state.max.x) vel.x *= -1;
        if (pos.y < state.min.y || pos.y > state.max.y) vel.y *= -1;
        if (pos.z < state.min.z || pos.z > state.max.z) vel.z *= -1;
        pos.x = Math.max(state.min.x, Math.min(state.max.x, pos.x));
        pos.y = Math.max(state.min.y, Math.min(state.max.y, pos.y));
        pos.z = Math.max(state.min.z, Math.min(state.max.z, pos.z));
      }
    }
  }
});
var TimerScript = () => ({
  name: "timer",
  state: {
    delay: 1,
    repeat: false,
    elapsed: 0,
    triggered: false,
    onTrigger: null
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = ctx.scriptState;
      if (!state || state.triggered && !state.repeat) return;
      state.elapsed += ctx.deltaTime;
      if (state.elapsed >= state.delay) {
        if (state.onTrigger) {
          state.onTrigger(ctx);
        }
        if (state.repeat) {
          state.elapsed = 0;
        } else {
          state.triggered = true;
        }
      }
    }
  }
});
var BuiltinScripts = {
  Oscillator: OscillatorScript,
  Rotator: RotatorScript,
  Follow: FollowScript,
  LookAt: LookAtScript,
  Bounds: BoundsScript,
  Timer: TimerScript
};

// src/index.ts
init_ConstraintSolver();
function createWorld(config) {
  const envConfig = typeof config?.environment === "string" ? EnvironmentPresets[config.environment] : config?.environment;
  const engine = new Engine(config);
  const environment = new Environment(envConfig);
  const forceSystem = new ForceSystem();
  const collisionSystem = new CollisionSystem();
  const constraintSolver = new ConstraintSolver();
  const recorder = new Recorder();
  const analysis = new Analysis();
  const exporter = new Exporter();
  const importer = new Importer();
  const scriptManager = new ScriptManager();
  return {
    engine,
    environment,
    forceSystem,
    collisionSystem,
    constraintSolver,
    recorder,
    analysis,
    exporter,
    importer,
    scriptManager,
    /**
     * Run simulation step with all systems
     */
    step(dt) {
      const deltaTime = dt ?? engine.config.timeStep;
      engine.step(deltaTime);
      return { deltaTime };
    },
    /**
     * Run simulation for specified duration
     */
    simulate(duration, dt) {
      const deltaTime = dt ?? engine.config.timeStep;
      const steps = Math.ceil(duration / deltaTime);
      for (let i = 0; i < steps; i++) {
        this.step(deltaTime);
      }
      return { steps };
    }
  };
}
var VERSION = "1.0.0";
var index_default = {
  Engine,
  Environment,
  EnvironmentPresets,
  ForceSystem,
  CollisionSystem,
  ConstraintSolver,
  Recorder,
  Analysis,
  Exporter,
  Importer,
  Visualizer,
  ScriptManager,
  BuiltinScripts,
  createWorld,
  VERSION
};
export {
  Analysis,
  BuiltinScripts,
  CollisionSystem,
  ConstraintSolver,
  Engine,
  Environment,
  EnvironmentPresets,
  Exporter,
  ForceSystem,
  Importer,
  Mat3,
  Mat4,
  MathUtils,
  PhysicsObject,
  Quat,
  Recorder,
  ScriptManager,
  VERSION,
  Vec2,
  Vec3,
  Visualizer,
  createWorld,
  index_default as default
};
