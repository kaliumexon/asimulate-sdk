/**
 * ASIMULATE SDK - Recorder Module
 * Recording and playback system for physics simulations
 */

import { 
  ObjectState, 
  ForceRecord, 
  CollisionRecord, 
  ConstraintState, 
  WorldStats,
  RecordingOptions,
  RecordingData,
  PlaybackState
} from '../types';

export interface RecordingFrame {
  time: number;
  deltaTime: number;
  objects: Map<string, ObjectState>;
  forces: ForceRecord[];
  collisions: CollisionRecord[];
  constraints: ConstraintState[];
  stats: WorldStats;
}

export interface RecorderConfig {
  /** Record object states */
  recordObjects: boolean;
  /** Record applied forces */
  recordForces: boolean;
  /** Record collision events */
  recordCollisions: boolean;
  /** Record constraint states */
  recordConstraints: boolean;
  /** Record world statistics */
  recordStats: boolean;
  /** Maximum frames to store (0 = unlimited) */
  maxFrames: number;
  /** Recording interval (record every N steps) */
  interval: number;
  /** Compression level (0-9) */
  compression: number;
  /** Object IDs to record (empty = all) */
  objectFilter: string[];
}

const DEFAULT_CONFIG: RecorderConfig = {
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

export class Recorder {
  private frames: RecordingFrame[] = [];
  private config: RecorderConfig;
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private frameCount: number = 0;
  private stepCounter: number = 0;

  // Playback state
  private playbackIndex: number = 0;
  private playbackSpeed: number = 1;
  private isPlaying: boolean = false;
  private playbackDirection: 1 | -1 = 1;

  // Markers for important events
  private markers: Map<string, { frame: number; description: string }> = new Map();

  constructor(config: Partial<RecorderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start recording
   */
  start(): void {
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
  stop(): void {
    this.isRecording = false;
    this.isPaused = false;
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (!this.isRecording) return;
    this.isPaused = true;
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (!this.isRecording) return;
    this.isPaused = false;
  }

  /**
   * Record a frame
   */
  recordFrame(
    time: number,
    deltaTime: number,
    objects: Map<string, ObjectState>,
    forces: ForceRecord[],
    collisions: CollisionRecord[],
    constraints: ConstraintState[],
    stats: WorldStats
  ): void {
    if (!this.isRecording || this.isPaused) return;

    this.stepCounter++;
    if (this.stepCounter % this.config.interval !== 0) return;

    // Filter objects if needed
    let filteredObjects = objects;
    if (this.config.objectFilter.length > 0) {
      filteredObjects = new Map();
      for (const id of this.config.objectFilter) {
        const state = objects.get(id);
        if (state) filteredObjects.set(id, state);
      }
    }

    const frame: RecordingFrame = {
      time,
      deltaTime,
      objects: this.config.recordObjects ? new Map(filteredObjects) : new Map(),
      forces: this.config.recordForces ? [...forces] : [],
      collisions: this.config.recordCollisions ? [...collisions] : [],
      constraints: this.config.recordConstraints ? [...constraints] : [],
      stats: this.config.recordStats ? { ...stats } : {} as WorldStats
    };

    this.frames.push(frame);
    this.frameCount++;

    // Enforce max frames limit
    if (this.config.maxFrames > 0 && this.frames.length > this.config.maxFrames) {
      this.frames.shift();
    }
  }

  /**
   * Add a marker at current frame
   */
  addMarker(name: string, description: string = ''): void {
    this.markers.set(name, {
      frame: this.frames.length - 1,
      description
    });
  }

  /**
   * Get marker by name
   */
  getMarker(name: string): { frame: number; description: string } | undefined {
    return this.markers.get(name);
  }

  /**
   * Get all markers
   */
  getMarkers(): Map<string, { frame: number; description: string }> {
    return new Map(this.markers);
  }

  /**
   * Clear all recorded data
   */
  clear(): void {
    this.frames = [];
    this.markers.clear();
    this.frameCount = 0;
    this.stepCounter = 0;
    this.playbackIndex = 0;
  }

  /**
   * Get frame at specific index
   */
  getFrame(index: number): RecordingFrame | undefined {
    return this.frames[index];
  }

  /**
   * Get frame at specific time
   */
  getFrameAtTime(time: number): RecordingFrame | undefined {
    // Binary search for closest frame
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
  getInterpolatedFrame(time: number): RecordingFrame | undefined {
    if (this.frames.length === 0) return undefined;
    if (time <= this.frames[0].time) return this.frames[0];
    if (time >= this.frames[this.frames.length - 1].time) {
      return this.frames[this.frames.length - 1];
    }

    // Find surrounding frames
    let i = 0;
    while (i < this.frames.length - 1 && this.frames[i + 1].time < time) {
      i++;
    }

    const frame1 = this.frames[i];
    const frame2 = this.frames[i + 1];
    const t = (time - frame1.time) / (frame2.time - frame1.time);

    // Interpolate object states
    const interpolatedObjects = new Map<string, ObjectState>();
    
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

  private interpolateState(s1: ObjectState, s2: ObjectState, t: number): ObjectState {
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

  private slerpQuaternion(
    q1: { x: number; y: number; z: number; w: number },
    q2: { x: number; y: number; z: number; w: number },
    t: number
  ): { x: number; y: number; z: number; w: number } {
    let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    
    let q2Sign = 1;
    if (dot < 0) {
      dot = -dot;
      q2Sign = -1;
    }

    let scale0: number, scale1: number;
    
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
  getFrameRange(startTime: number, endTime: number): RecordingFrame[] {
    return this.frames.filter(f => f.time >= startTime && f.time <= endTime);
  }

  /**
   * Get object trajectory (positions over time)
   */
  getTrajectory(objectId: string): Array<{ time: number; position: { x: number; y: number; z: number } }> {
    const trajectory: Array<{ time: number; position: { x: number; y: number; z: number } }> = [];

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
  getPropertyTimeSeries(
    objectId: string,
    extractor: (state: ObjectState) => number
  ): Array<{ time: number; value: number }> {
    const series: Array<{ time: number; value: number }> = [];

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
  startPlayback(speed: number = 1): void {
    this.isPlaying = true;
    this.playbackSpeed = speed;
    this.playbackDirection = speed >= 0 ? 1 : -1;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this.isPlaying = false;
  }

  /**
   * Pause playback
   */
  pausePlayback(): void {
    this.isPlaying = false;
  }

  /**
   * Resume playback
   */
  resumePlayback(): void {
    this.isPlaying = true;
  }

  /**
   * Seek to specific frame
   */
  seekToFrame(index: number): void {
    this.playbackIndex = Math.max(0, Math.min(index, this.frames.length - 1));
  }

  /**
   * Seek to specific time
   */
  seekToTime(time: number): void {
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
  seekToMarker(name: string): boolean {
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
  step(direction: 1 | -1 = 1): RecordingFrame | undefined {
    this.playbackIndex += direction;
    this.playbackIndex = Math.max(0, Math.min(this.playbackIndex, this.frames.length - 1));
    return this.frames[this.playbackIndex];
  }

  /**
   * Get current playback frame
   */
  getCurrentFrame(): RecordingFrame | undefined {
    return this.frames[this.playbackIndex];
  }

  /**
   * Advance playback (call each frame during playback)
   */
  advancePlayback(deltaTime: number): RecordingFrame | undefined {
    if (!this.isPlaying || this.frames.length === 0) return undefined;

    const timeAdvance = deltaTime * Math.abs(this.playbackSpeed);
    const currentTime = this.frames[this.playbackIndex]?.time ?? 0;
    const targetTime = currentTime + timeAdvance * this.playbackDirection;

    this.seekToTime(targetTime);
    return this.frames[this.playbackIndex];
  }

  /**
   * Get playback state
   */
  getPlaybackState(): PlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentFrame: this.playbackIndex,
      totalFrames: this.frames.length,
      currentTime: this.frames[this.playbackIndex]?.time ?? 0,
      totalTime: this.frames.length > 0 
        ? this.frames[this.frames.length - 1].time - this.frames[0].time 
        : 0,
      speed: this.playbackSpeed,
      direction: this.playbackDirection
    };
  }

  // ==================== Serialization ====================

  /**
   * Export recording data
   */
  export(): RecordingData {
    return {
      version: '1.0',
      config: { ...this.config },
      frames: this.frames.map(f => ({
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
        duration: this.frames.length > 0 
          ? this.frames[this.frames.length - 1].time - this.frames[0].time 
          : 0,
        recordedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Import recording data
   */
  import(data: RecordingData): void {
    this.clear();
    this.config = { ...DEFAULT_CONFIG, ...data.config };
    
    this.frames = data.frames.map(f => ({
      time: f.time,
      deltaTime: f.deltaTime,
      objects: new Map(f.objects as [string, ObjectState][]),
      forces: f.forces,
      collisions: f.collisions,
      constraints: f.constraints,
      stats: f.stats
    }));

    this.markers = new Map(data.markers as [string, { frame: number; description: string }][]);
    this.frameCount = this.frames.length;
  }

  /**
   * Serialize to JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.export());
  }

  /**
   * Load from JSON string
   */
  fromJSON(json: string): void {
    const data = JSON.parse(json) as RecordingData;
    this.import(data);
  }

  // ==================== Getters ====================

  get recording(): boolean {
    return this.isRecording;
  }

  get paused(): boolean {
    return this.isPaused;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get frameIndex(): number {
    return this.playbackIndex;
  }

  get totalFrames(): number {
    return this.frames.length;
  }

  get duration(): number {
    if (this.frames.length === 0) return 0;
    return this.frames[this.frames.length - 1].time - this.frames[0].time;
  }

  get startTimeStamp(): number {
    return this.frames[0]?.time ?? 0;
  }

  get endTimeStamp(): number {
    return this.frames[this.frames.length - 1]?.time ?? 0;
  }
}

export default Recorder;
