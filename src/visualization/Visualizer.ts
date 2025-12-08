/**
 * ASIMULATE SDK - Visualization Module
 * Rendering and debug visualization for physics simulations
 */

import { 
  Vector3, 
  Quaternion,
  ObjectState,
  ContactPoint,
  CollisionInfo
} from '../types';
import { Vec3, Quat } from '../math';

export interface RenderOptions {
  showBoundingBoxes: boolean;
  showVelocities: boolean;
  showForces: boolean;
  showContacts: boolean;
  showConstraints: boolean;
  showTrajectories: boolean;
  showGrid: boolean;
  showAxes: boolean;
  showStats: boolean;
  wireframe: boolean;
  shadows: boolean;
  velocityScale: number;
  forceScale: number;
  gridSize: number;
  gridDivisions: number;
}

export interface CameraConfig {
  position: Vector3;
  target: Vector3;
  up: Vector3;
  fov: number;
  near: number;
  far: number;
  orthographic: boolean;
  orthoSize: number;
}

export interface LightConfig {
  type: 'directional' | 'point' | 'spot' | 'ambient';
  position?: Vector3;
  direction?: Vector3;
  color: { r: number; g: number; b: number };
  intensity: number;
  castShadow?: boolean;
}

export interface MaterialConfig {
  color: { r: number; g: number; b: number; a: number };
  metallic: number;
  roughness: number;
  emissive?: { r: number; g: number; b: number };
}

const DEFAULT_RENDER_OPTIONS: RenderOptions = {
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

const DEFAULT_CAMERA: CameraConfig = {
  position: { x: 10, y: 10, z: 10 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  fov: 60,
  near: 0.1,
  far: 1000,
  orthographic: false,
  orthoSize: 10
};

export interface RendererBackend {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  dispose(): void;
  resize(width: number, height: number): void;
  render(): void;
  setCamera(camera: CameraConfig): void;
  addLight(config: LightConfig): string;
  removeLight(id: string): void;
  addObject(id: string, type: string, params: Record<string, any>, material?: MaterialConfig): void;
  removeObject(id: string): void;
  updateObject(id: string, state: ObjectState): void;
  drawLine(start: Vector3, end: Vector3, color: { r: number; g: number; b: number }, width?: number): void;
  drawPoint(position: Vector3, color: { r: number; g: number; b: number }, size?: number): void;
  drawBox(min: Vector3, max: Vector3, color: { r: number; g: number; b: number }): void;
  drawSphere(center: Vector3, radius: number, color: { r: number; g: number; b: number }): void;
  clearDebugDrawings(): void;
}

/**
 * Canvas 2D Renderer (simple fallback)
 */
export class Canvas2DRenderer implements RendererBackend {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private camera: CameraConfig = DEFAULT_CAMERA;
  private objects: Map<string, { type: string; params: any; material?: MaterialConfig; state?: ObjectState }> = new Map();
  private lights: Map<string, LightConfig> = new Map();
  private debugLines: Array<{ start: Vector3; end: Vector3; color: any; width: number }> = [];
  private debugPoints: Array<{ position: Vector3; color: any; size: number }> = [];

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
  }

  dispose(): void {
    this.objects.clear();
    this.lights.clear();
    this.debugLines = [];
    this.debugPoints = [];
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  setCamera(camera: CameraConfig): void {
    this.camera = camera;
  }

  addLight(config: LightConfig): string {
    const id = `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.lights.set(id, config);
    return id;
  }

  removeLight(id: string): void {
    this.lights.delete(id);
  }

  addObject(id: string, type: string, params: Record<string, any>, material?: MaterialConfig): void {
    this.objects.set(id, { type, params, material });
  }

  removeObject(id: string): void {
    this.objects.delete(id);
  }

  updateObject(id: string, state: ObjectState): void {
    const obj = this.objects.get(id);
    if (obj) {
      obj.state = state;
    }
  }

  drawLine(start: Vector3, end: Vector3, color: { r: number; g: number; b: number }, width: number = 1): void {
    this.debugLines.push({ start, end, color, width });
  }

  drawPoint(position: Vector3, color: { r: number; g: number; b: number }, size: number = 5): void {
    this.debugPoints.push({ position, color, size });
  }

  drawBox(min: Vector3, max: Vector3, color: { r: number; g: number; b: number }): void {
    // Draw as wireframe lines
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
      [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
      [4, 5], [5, 6], [6, 7], [7, 4], // Top
      [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
    ];

    for (const [i, j] of edges) {
      this.drawLine(corners[i], corners[j], color);
    }
  }

  drawSphere(center: Vector3, radius: number, color: { r: number; g: number; b: number }): void {
    // Draw as circle from view direction
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      this.drawLine(
        { x: center.x + Math.cos(angle1) * radius, y: center.y, z: center.z + Math.sin(angle1) * radius },
        { x: center.x + Math.cos(angle2) * radius, y: center.y, z: center.z + Math.sin(angle2) * radius },
        color
      );
    }
  }

  clearDebugDrawings(): void {
    this.debugLines = [];
    this.debugPoints = [];
  }

  render(): void {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Simple orthographic projection looking down Y axis (top-down view)
    const scale = Math.min(width, height) / (this.camera.orthoSize * 2);
    const offsetX = width / 2;
    const offsetY = height / 2;

    const project = (p: Vector3) => ({
      x: offsetX + p.x * scale,
      y: offsetY - p.z * scale  // Flip Z for screen coords
    });

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    const gridSize = 10;
    for (let i = -gridSize; i <= gridSize; i++) {
      const p1 = project({ x: i, y: 0, z: -gridSize });
      const p2 = project({ x: i, y: 0, z: gridSize });
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project({ x: -gridSize, y: 0, z: i });
      const p4 = project({ x: gridSize, y: 0, z: i });
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }

    // Draw axes
    ctx.lineWidth = 2;
    // X axis (red)
    ctx.strokeStyle = '#ff4444';
    let p1 = project({ x: 0, y: 0, z: 0 });
    let p2 = project({ x: 2, y: 0, z: 0 });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Z axis (blue)
    ctx.strokeStyle = '#4444ff';
    p2 = project({ x: 0, y: 0, z: 2 });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Draw objects
    for (const [id, obj] of this.objects) {
      const state = obj.state;
      if (!state) continue;

      const color = obj.material?.color || { r: 0.5, g: 0.5, b: 0.5, a: 1 };
      ctx.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, ${color.a})`;
      ctx.strokeStyle = `rgb(${Math.floor(color.r * 255 * 0.7)}, ${Math.floor(color.g * 255 * 0.7)}, ${Math.floor(color.b * 255 * 0.7)})`;
      ctx.lineWidth = 2;

      const pos = project(state.position);

      if (obj.type === 'sphere') {
        const radius = (obj.params.radius || 1) * scale;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (obj.type === 'box') {
        const hw = (obj.params.width || 1) * scale / 2;
        const hd = (obj.params.depth || 1) * scale / 2;
        ctx.fillRect(pos.x - hw, pos.y - hd, hw * 2, hd * 2);
        ctx.strokeRect(pos.x - hw, pos.y - hd, hw * 2, hd * 2);
      } else {
        // Generic dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Object ID label
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(id.substring(0, 8), pos.x + 10, pos.y - 10);
    }

    // Draw debug lines
    for (const line of this.debugLines) {
      const p1 = project(line.start);
      const p2 = project(line.end);
      ctx.strokeStyle = `rgb(${Math.floor(line.color.r * 255)}, ${Math.floor(line.color.g * 255)}, ${Math.floor(line.color.b * 255)})`;
      ctx.lineWidth = line.width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Draw debug points
    for (const point of this.debugPoints) {
      const p = project(point.position);
      ctx.fillStyle = `rgb(${Math.floor(point.color.r * 255)}, ${Math.floor(point.color.g * 255)}, ${Math.floor(point.color.b * 255)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, point.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Main Visualizer class
 */
export class Visualizer {
  private renderer: RendererBackend;
  private options: RenderOptions;
  private camera: CameraConfig;
  private trajectories: Map<string, Vector3[]> = new Map();
  private maxTrajectoryPoints: number = 500;
  private animationFrameId: number | null = null;

  constructor(renderer?: RendererBackend) {
    this.renderer = renderer || new Canvas2DRenderer();
    this.options = { ...DEFAULT_RENDER_OPTIONS };
    this.camera = { ...DEFAULT_CAMERA };
  }

  /**
   * Initialize the visualizer
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    await this.renderer.initialize(canvas);
    this.renderer.setCamera(this.camera);
    
    // Add default lighting
    this.renderer.addLight({
      type: 'directional',
      direction: { x: -1, y: -2, z: -1 },
      color: { r: 1, g: 1, b: 1 },
      intensity: 1,
      castShadow: true
    });

    this.renderer.addLight({
      type: 'ambient',
      color: { r: 0.3, g: 0.3, b: 0.4 },
      intensity: 1
    });
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
    this.trajectories.clear();
  }

  /**
   * Set render options
   */
  setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current render options
   */
  getOptions(): RenderOptions {
    return { ...this.options };
  }

  /**
   * Set camera configuration
   */
  setCamera(config: Partial<CameraConfig>): void {
    this.camera = { ...this.camera, ...config };
    this.renderer.setCamera(this.camera);
  }

  /**
   * Get camera configuration
   */
  getCamera(): CameraConfig {
    return { ...this.camera };
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  /**
   * Add a physics object to the visualization
   */
  addObject(
    id: string,
    type: string,
    params: Record<string, any>,
    material?: MaterialConfig
  ): void {
    this.renderer.addObject(id, type, params, material);
    this.trajectories.set(id, []);
  }

  /**
   * Remove a physics object
   */
  removeObject(id: string): void {
    this.renderer.removeObject(id);
    this.trajectories.delete(id);
  }

  /**
   * Update object states
   */
  updateObjects(states: Map<string, ObjectState>): void {
    for (const [id, state] of states) {
      this.renderer.updateObject(id, state);
      
      // Track trajectory
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
  drawDebug(
    states: Map<string, ObjectState>,
    forces?: Map<string, { force: Vector3; point: Vector3 }[]>,
    contacts?: ContactPoint[],
    constraints?: Array<{ objectA: string; objectB: string; anchorA: Vector3; anchorB: Vector3 }>
  ): void {
    this.renderer.clearDebugDrawings();

    // Velocities
    if (this.options.showVelocities) {
      for (const [id, state] of states) {
        const end = Vec3.add(state.position, Vec3.scale(state.velocity, this.options.velocityScale));
        this.renderer.drawLine(state.position, end, { r: 0, g: 1, b: 0 }, 2);
      }
    }

    // Forces
    if (this.options.showForces && forces) {
      for (const [id, forceList] of forces) {
        for (const { force, point } of forceList) {
          const end = Vec3.add(point, Vec3.scale(force, this.options.forceScale));
          this.renderer.drawLine(point, end, { r: 1, g: 0.5, b: 0 }, 2);
        }
      }
    }

    // Contacts
    if (this.options.showContacts && contacts) {
      for (const contact of contacts) {
        this.renderer.drawPoint(contact.position, { r: 1, g: 0, b: 0 }, 5);
        const normalEnd = Vec3.add(contact.position, Vec3.scale(contact.normal, 0.5));
        this.renderer.drawLine(contact.position, normalEnd, { r: 1, g: 1, b: 0 }, 1);
      }
    }

    // Constraints
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

    // Trajectories
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

    // Bounding boxes
    if (this.options.showBoundingBoxes) {
      for (const [id, state] of states) {
        // Approximate bounding box (would need actual shape data)
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
  clearTrajectories(): void {
    for (const trajectory of this.trajectories.values()) {
      trajectory.length = 0;
    }
  }

  /**
   * Render a single frame
   */
  render(): void {
    this.renderer.render();
  }

  /**
   * Start animation loop
   */
  startLoop(updateCallback?: () => void): void {
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
  stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Take screenshot
   */
  screenshot(): string | null {
    // Would need access to canvas to get data URL
    return null;
  }

  /**
   * Orbit camera around target
   */
  orbitCamera(deltaX: number, deltaY: number): void {
    const offset = Vec3.sub(this.camera.position, this.camera.target);
    const distance = Vec3.length(offset);
    
    // Spherical coordinates
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
  zoomCamera(delta: number): void {
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
  panCamera(deltaX: number, deltaY: number): void {
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
  focusOn(position: Vector3, distance: number = 10): void {
    const offset = Vec3.sub(this.camera.position, this.camera.target);
    const direction = Vec3.normalize(offset);
    
    this.camera.target = { ...position };
    this.camera.position = Vec3.add(position, Vec3.scale(direction, distance));
    
    this.renderer.setCamera(this.camera);
  }

  /**
   * Set predefined view
   */
  setView(view: 'top' | 'front' | 'side' | 'isometric'): void {
    const distance = 15;
    
    switch (view) {
      case 'top':
        this.camera.position = { x: 0, y: distance, z: 0.001 };
        this.camera.up = { x: 0, y: 0, z: -1 };
        break;
      case 'front':
        this.camera.position = { x: 0, y: 0, z: distance };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
      case 'side':
        this.camera.position = { x: distance, y: 0, z: 0 };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
      case 'isometric':
        this.camera.position = { x: distance * 0.577, y: distance * 0.577, z: distance * 0.577 };
        this.camera.up = { x: 0, y: 1, z: 0 };
        break;
    }
    
    this.camera.target = { x: 0, y: 0, z: 0 };
    this.renderer.setCamera(this.camera);
  }
}

export default Visualizer;
