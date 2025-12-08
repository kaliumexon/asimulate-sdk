/**
 * ASIMULATE SDK - Core Type Definitions
 * Complete type system for physics simulation
 */

// ============================================================================
// MATH TYPES
// ============================================================================

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Matrix3 {
  elements: number[]; // 9 elements in row-major order
}

export interface Matrix4 {
  elements: number[]; // 16 elements in row-major order
}

// ============================================================================
// ENGINE TYPES
// ============================================================================

export type Precision = 'low' | 'medium' | 'high' | 'scientific';
export type Integrator = 'euler' | 'verlet' | 'runge-kutta-4' | 'symplectic';

export interface EngineConfig {
  precision?: Precision;
  integrator?: Integrator;
  timeStep?: number;
  maxSubSteps?: number;
  enableMultithreading?: boolean;
  deterministicMode?: boolean;
  sleepThreshold?: number;
  sleepTimeThreshold?: number;
}

export interface SimulationSnapshot {
  timestamp: number;
  objects: Map<string, ObjectState>;
  constraints: Map<string, ConstraintState>;
  forces: Map<string, ForceConfig>;
  worldStats: WorldStats;
}

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export type EnvironmentPreset = 
  | 'earth' 
  | 'moon' 
  | 'mars' 
  | 'jupiter' 
  | 'space' 
  | 'underwater' 
  | 'custom';

export type BoundaryBehavior = 'reflect' | 'wrap' | 'destroy' | 'custom';

export interface EnvironmentConfig {
  preset?: EnvironmentPreset;
  gravity?: Vector3 | number | GravityField;
  airDensity?: number;
  airViscosity?: number;
  temperature?: number;
  pressure?: number;
  wind?: Vector3 | WindFunction;
  fluidFields?: FluidField[];
  magneticField?: Vector3 | FieldFunction;
  electricField?: Vector3 | FieldFunction;
  bounds?: BoundingVolume;
  boundaryBehavior?: BoundaryBehavior;
  boundaryCallback?: (object: SimObject, boundary: BoundingVolume) => void;
}

export interface GravityField {
  type: 'constant' | 'radial' | 'custom';
  value?: Vector3;
  center?: Vector3;
  strength?: number;
  customFn?: (position: Vector3) => Vector3;
}

export type WindFunction = (position: Vector3, time: number) => Vector3;
export type FieldFunction = (position: Vector3, time: number) => Vector3;

export interface FluidField {
  id: string;
  bounds: BoundingVolume;
  density: number;
  viscosity: number;
  velocity?: Vector3 | FieldFunction;
}

export interface BoundingVolume {
  type: 'box' | 'sphere' | 'none';
  center?: Vector3;
  halfExtents?: Vector3; // for box
  radius?: number; // for sphere
}

// ============================================================================
// OBJECT TYPES
// ============================================================================

export type ObjectType = 
  // Primitives
  | 'sphere' 
  | 'box' 
  | 'cylinder' 
  | 'capsule' 
  | 'cone' 
  | 'plane' 
  | 'heightmap'
  // Complex
  | 'mesh'
  | 'convex-hull'
  | 'concave-decomposition'
  | 'compound'
  | 'soft-body'
  | 'rope'
  | 'cloth'
  | 'fluid'
  | 'particle-system'
  // Special
  | 'vehicle'
  | 'character'
  | 'projectile'
  | 'celestial';

export interface PhysicsMaterial {
  friction?: number;
  staticFriction?: number;
  restitution?: number;
  rollingResistance?: number;
}

export interface ObjectConfig {
  id?: string;
  name?: string;
  type: ObjectType;
  
  // Geometry parameters (type-specific)
  radius?: number;
  width?: number;
  height?: number;
  depth?: number;
  length?: number;
  segments?: number;
  vertices?: Vector3[];
  indices?: number[];
  heightmapData?: number[][];
  
  // Transform
  position?: Vector3 | [number, number, number];
  rotation?: Quaternion | [number, number, number, number];
  scale?: Vector3 | [number, number, number];
  
  // Physics
  mass?: number;
  density?: number;
  centerOfMass?: Vector3;
  inertiaTensor?: Matrix3;
  
  // Material
  material?: PhysicsMaterial;
  
  // Dynamics
  velocity?: Vector3 | [number, number, number];
  angularVelocity?: Vector3 | [number, number, number];
  linearDamping?: number;
  angularDamping?: number;
  
  // Aerodynamics
  dragCoefficient?: number;
  liftCoefficient?: number;
  crossSectionArea?: number;
  
  // State flags
  isStatic?: boolean;
  isKinematic?: boolean;
  isTrigger?: boolean;
  
  // Collision
  collisionGroup?: number;
  collisionMask?: number;
  
  // Additional properties
  charge?: number;
  temperature?: number;
  customData?: Record<string, unknown>;
  
  // Compound object
  children?: ObjectConfig[];
  
  // Soft body / Rope / Cloth specific
  stiffness?: number;
  damping?: number;
  particleCount?: number;
  fixedParticles?: number[];
}

export interface SimObject {
  readonly id: string;
  name: string;
  readonly type: ObjectType;
  
  // Transform
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  
  // Physics properties
  mass: number;
  readonly inverseMass: number;
  centerOfMass: Vector3;
  inertiaTensor: Matrix3;
  readonly inverseInertiaTensor: Matrix3;
  
  // Material
  material: PhysicsMaterial;
  
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
  
  // Computed properties
  readonly kineticEnergy: number;
  readonly momentum: Vector3;
  readonly angularMomentum: Vector3;
  readonly boundingBox: BoundingVolume;
  
  // Methods
  applyForce(force: Vector3, point?: Vector3): void;
  applyImpulse(impulse: Vector3, point?: Vector3): void;
  applyTorque(torque: Vector3): void;
  setPosition(position: Vector3): void;
  setRotation(rotation: Quaternion): void;
  setVelocity(velocity: Vector3): void;
  setAngularVelocity(angularVelocity: Vector3): void;
  localToWorld(localPoint: Vector3): Vector3;
  worldToLocal(worldPoint: Vector3): Vector3;
  getForward(): Vector3;
  getUp(): Vector3;
  getRight(): Vector3;
  sleep(): void;
  wakeUp(): void;
  clone(): SimObject;
  toJSON(): ObjectConfig;
}

export interface ObjectState {
  timestamp: number;
  objectId: string;
  
  // Kinematics
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  angularVelocity: Vector3;
  acceleration: Vector3;
  angularAcceleration: Vector3;
  
  // Energy
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  
  // Momentum
  momentum: Vector3;
  angularMomentum: Vector3;
}

// ============================================================================
// FORCE TYPES
// ============================================================================

export type ForceType = 
  // Global
  | 'gravity'
  | 'wind'
  | 'drag'
  | 'buoyancy'
  // Local
  | 'constant'
  | 'impulse'
  | 'torque'
  | 'spring'
  | 'attractor'
  | 'repulsor'
  | 'thruster'
  | 'explosion'
  // Fields
  | 'force-field'
  | 'vortex-field'
  | 'noise-field';

export type FalloffType = 'none' | 'linear' | 'quadratic' | 'custom';

export interface ForceConfig {
  id?: string;
  type: ForceType;
  
  // Target
  target?: string | string[] | 'all';
  
  // Force parameters
  magnitude?: number;
  direction?: Vector3 | [number, number, number];
  point?: Vector3 | [number, number, number]; // application point (local)
  
  // Spring specific
  anchorA?: Vector3;
  anchorB?: Vector3;
  restLength?: number;
  stiffness?: number;
  damping?: number;
  
  // Attractor/Repulsor/Explosion
  center?: Vector3;
  
  // Field specific
  fieldFunction?: (position: Vector3, velocity: Vector3, time: number) => Vector3;
  
  // Falloff
  falloff?: FalloffType;
  falloffFunction?: (distance: number) => number;
  maxDistance?: number;
  
  // Timing
  enabled?: boolean;
  startTime?: number;
  duration?: number;
  
  // Vortex specific
  axis?: Vector3;
  tangentialStrength?: number;
  radialStrength?: number;
  
  // Noise field specific
  frequency?: number;
  amplitude?: number;
  octaves?: number;
}

export interface AppliedForce {
  type: string;
  sourceId: string | null;
  force: Vector3;
  applicationPoint: Vector3;
  torque: Vector3;
}

export interface ForceRecord {
  timestamp: number;
  objectId: string;
  forces: AppliedForce[];
  netForce: Vector3;
  netTorque: Vector3;
}

// ============================================================================
// CONSTRAINT TYPES
// ============================================================================

export type ConstraintType = 
  | 'fixed'
  | 'hinge'
  | 'ball'
  | 'slider'
  | 'piston'
  | 'universal'
  | 'distance'
  | 'spring'
  | 'rope'
  | 'gear'
  | 'motor';

export interface ConstraintLimits {
  min?: number;
  max?: number;
}

export interface ConstraintConfig {
  id?: string;
  type: ConstraintType;
  
  bodyA: string;
  bodyB?: string; // 'world' or object ID, undefined = world
  
  anchorA?: Vector3 | [number, number, number];
  anchorB?: Vector3 | [number, number, number];
  
  axis?: Vector3 | [number, number, number];
  secondaryAxis?: Vector3; // for universal joint
  
  limits?: ConstraintLimits;
  
  stiffness?: number;
  damping?: number;
  
  breakForce?: number;
  breakTorque?: number;
  
  // Motor specific
  motorEnabled?: boolean;
  motorSpeed?: number;
  motorMaxForce?: number;
  
  // Gear specific
  gearRatio?: number;
  
  // Rope specific
  maxLength?: number;
}

export interface ConstraintState {
  constraintId: string;
  timestamp: number;
  reactionForce: Vector3;
  reactionTorque: Vector3;
  currentAngle?: number;
  currentDistance?: number;
  isBroken: boolean;
}

// ============================================================================
// COLLISION TYPES
// ============================================================================

export type CollisionDetectionMode = 'discrete' | 'continuous';

export interface ContactPoint {
  position: Vector3;
  localA: Vector3;
  localB: Vector3;
  normal: Vector3;
  normalForce: number;
  frictionForce: Vector3;
  penetrationDepth: number;
}

export interface CollisionInfo {
  objectA: string;
  objectB: string;
  contactPoints: ContactPoint[];
  normal: Vector3;
  penetrationDepth: number;
  impulse: Vector3;
  relativeVelocity: Vector3;
}

export interface CollisionRecord {
  timestamp: number;
  type: 'start' | 'stay' | 'end';
  objectA: string;
  objectB: string;
  contactPoints: ContactPoint[];
  totalImpulse: Vector3;
  totalNormalImpulse: number;
  totalFrictionImpulse: Vector3;
  energyLost: number;
}

export type CollisionCallback = (info: CollisionInfo) => void;
export type TriggerCallback = (objectA: string, objectB: string) => void;

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface RaycastHit {
  objectId: string;
  point: Vector3;
  normal: Vector3;
  distance: number;
  triangleIndex?: number;
  uv?: Vector2;
}

export interface RaycastOptions {
  maxDistance?: number;
  layerMask?: number;
  ignoreTriggers?: boolean;
  ignoreBackfaces?: boolean;
  sortByDistance?: boolean;
}

export interface OverlapResult {
  objectId: string;
  penetrationDepth: number;
  separationVector: Vector3;
}

// ============================================================================
// RECORDER TYPES
// ============================================================================

export interface RecorderConfig {
  recordStates?: boolean;
  recordForces?: boolean;
  recordCollisions?: boolean;
  recordConstraints?: boolean;
  recordWorldStats?: boolean;
  sampleRate?: number; // samples per second
  objectFilter?: string[]; // specific object IDs to record
  maxDuration?: number; // max recording duration in seconds
  bufferSize?: number; // max entries in memory
}

export interface WorldStats {
  timestamp: number;
  totalKineticEnergy: number;
  totalPotentialEnergy: number;
  totalEnergy: number;
  totalMomentum: Vector3;
  totalAngularMomentum: Vector3;
  activeObjects: number;
  sleepingObjects: number;
  contactPairs: number;
  stepTime: number;
}

export interface RecordedData {
  startTime: number;
  endTime: number;
  duration: number;
  sampleRate: number;
  objectStates: Map<string, ObjectState[]>;
  forceRecords: Map<string, ForceRecord[]>;
  collisionRecords: CollisionRecord[];
  constraintRecords: Map<string, ConstraintState[]>;
  worldStats: WorldStats[];
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface TimeSeriesPoint {
  time: number;
  value: number;
}

export interface TimeSeries {
  objectId: string;
  property: string;
  points: TimeSeriesPoint[];
}

export interface PeakResult {
  time: number;
  value: number;
  type: 'max' | 'min';
}

export interface ComparisonResult {
  objectA: string;
  objectB: string;
  property: string;
  correlation: number;
  meanDifference: number;
  maxDifference: number;
  divergencePoints: TimeSeriesPoint[];
}

export interface FrequencyComponent {
  frequency: number;
  amplitude: number;
  phase: number;
}

export interface FrequencySpectrum {
  dominantFrequency: number;
  components: FrequencyComponent[];
  powerSpectralDensity: number[];
}

export interface Statistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  sum: number;
  count: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'parquet' | 'gltf' | 'video' | 'chart';

export interface CSVExportOptions {
  objects?: string[];
  properties?: string[];
  delimiter?: string;
  includeHeaders?: boolean;
  timestampFormat?: 'seconds' | 'milliseconds' | 'iso';
}

export interface GLTFExportOptions {
  includeAnimation?: boolean;
  sampleRate?: number;
  embedTextures?: boolean;
  binary?: boolean; // .glb format
}

export interface VideoExportOptions {
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  quality?: number;
  startTime?: number;
  endTime?: number;
}

export interface ChartExportOptions {
  type?: 'line' | 'scatter' | 'bar';
  width?: number;
  height?: number;
  format?: 'svg' | 'png';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  colors?: string[];
}

// ============================================================================
// IMPORT TYPES
// ============================================================================

export type ImportFormat = 'obj' | 'gltf' | 'glb' | 'fbx' | 'stl' | 'dae' | '3ds' | 'ply';

export type ColliderGenerationType = 'mesh' | 'convex' | 'box' | 'sphere' | 'auto';

export interface ImportOptions {
  scale?: number;
  centerGeometry?: boolean;
  computeNormals?: boolean;
  generateCollider?: ColliderGenerationType;
  decompose?: boolean; // decompose concave to convex parts
  mass?: number | 'auto';
  material?: PhysicsMaterial;
  position?: Vector3;
  rotation?: Quaternion;
}

export interface ImportedModel {
  object: SimObject;
  meshData: MeshData;
  materials: MaterialData[];
  animations?: AnimationData[];
}

export interface MeshData {
  vertices: Float32Array;
  normals: Float32Array;
  uvs?: Float32Array;
  indices: Uint32Array;
  boundingBox: BoundingVolume;
}

export interface MaterialData {
  name: string;
  color?: Vector3;
  texture?: string;
  metalness?: number;
  roughness?: number;
}

export interface AnimationData {
  name: string;
  duration: number;
  tracks: AnimationTrack[];
}

export interface AnimationTrack {
  property: string;
  times: number[];
  values: number[];
  interpolation: 'linear' | 'step' | 'cubic';
}

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export type RenderMode = 
  | 'solid'
  | 'wireframe'
  | 'collision-shapes'
  | 'forces'
  | 'velocities'
  | 'trajectories'
  | 'contact-points'
  | 'center-of-mass'
  | 'bounding-boxes';

export interface RendererConfig {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  antialias?: boolean;
  backgroundColor?: string;
  shadowsEnabled?: boolean;
  renderMode?: RenderMode;
  debugOverlays?: DebugOverlay[];
}

export type DebugOverlay = 
  | 'fps'
  | 'step-time'
  | 'object-count'
  | 'energy-graph'
  | 'force-magnitudes';

// ============================================================================
// SCRIPT TYPES
// ============================================================================

export interface ScriptConfig {
  target: string | string[];
  onInit?: (world: World) => void;
  onBeforeStep?: (dt: number) => void;
  onAfterStep?: (dt: number) => void;
  onCollision?: (info: CollisionInfo) => void;
  onDestroy?: () => void;
}

export interface ScriptContext {
  object: SimObject;
  world: World;
  time: number;
  deltaTime: number;
  
  // Helper methods
  applyForce(name: string, config: Partial<ForceConfig>): void;
  removeForce(name: string): void;
  getObject(id: string): SimObject | undefined;
  raycast(direction: Vector3, maxDistance?: number): RaycastHit | null;
  destroy(): void;
}

// ============================================================================
// WORLD / ENGINE INTERFACE
// ============================================================================

export interface World {
  readonly time: number;
  readonly currentTime: number;
  readonly deltaTime: number;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly objectCount: number;
  
  // Object management
  addObject(config: ObjectConfig): SimObject;
  removeObject(id: string): boolean;
  getObject(id: string): SimObject | undefined;
  getAllObjects(): SimObject[];
  
  // Force management
  addForce(config: ForceConfig): string;
  removeForce(id: string): boolean;
  getForce(id: string): ForceConfig | undefined;
  
  // Constraint management
  addConstraint(config: ConstraintConfig): string;
  removeConstraint(id: string): boolean;
  getConstraint(id: string): ConstraintConfig | undefined;
  
  // Environment
  setEnvironment(config: EnvironmentConfig): void;
  getEnvironment(): EnvironmentConfig;
  
  // Queries
  raycast(origin: Vector3, direction: Vector3, options?: RaycastOptions): RaycastHit[];
  sphereCast(origin: Vector3, radius: number, direction: Vector3, maxDistance?: number): RaycastHit[];
  boxCast(origin: Vector3, halfExtents: Vector3, direction: Vector3, maxDistance?: number): RaycastHit[];
  overlapSphere(center: Vector3, radius: number): SimObject[];
  overlapBox(center: Vector3, halfExtents: Vector3, rotation?: Quaternion): SimObject[];
  closestPoint(point: Vector3, objectId: string): Vector3;
  distanceBetween(objectA: string, objectB: string): { distance: number; pointA: Vector3; pointB: Vector3 };
  
  // Events
  onCollisionStart(callback: CollisionCallback): () => void;
  onCollisionStay(callback: CollisionCallback): () => void;
  onCollisionEnd(callback: CollisionCallback): () => void;
  onTriggerEnter(callback: TriggerCallback): () => void;
  onTriggerExit(callback: TriggerCallback): () => void;
  
  // Simulation control
  step(dt?: number): void;
  
  // State
  createSnapshot(): SimulationSnapshot;
  restoreSnapshot(snapshot: SimulationSnapshot): void;
  reset(): void;
  clear(): void;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type EngineEvent = 
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'step'
  | 'reset'
  | 'objectAdded'
  | 'objectRemoved'
  | 'constraintBroken';

export interface EngineEventData {
  type: EngineEvent;
  timestamp: number;
  data?: unknown;
}

export type EngineEventCallback = (event: EngineEventData) => void;
