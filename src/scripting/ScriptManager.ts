/**
 * ASIMULATE SDK - Scripting Module
 * Behavior scripts with lifecycle hooks for physics objects
 */

import { 
  SimObject, 
  World, 
  Vector3, 
  CollisionInfo 
} from '../types';
import { Vec3 } from '../math';

export interface ScriptContext {
  object: SimObject;
  world: World;
  time: number;
  deltaTime: number;
}

export interface ScriptCallbacks {
  /** Called once when script is attached */
  onInit?: (ctx: ScriptContext) => void;
  
  /** Called every physics step before integration */
  onPreUpdate?: (ctx: ScriptContext) => void;
  
  /** Called every physics step after integration */
  onPostUpdate?: (ctx: ScriptContext) => void;
  
  /** Called on fixed time intervals */
  onFixedUpdate?: (ctx: ScriptContext) => void;
  
  /** Called when collision starts */
  onCollisionEnter?: (ctx: ScriptContext, collision: CollisionInfo) => void;
  
  /** Called while collision continues */
  onCollisionStay?: (ctx: ScriptContext, collision: CollisionInfo) => void;
  
  /** Called when collision ends */
  onCollisionExit?: (ctx: ScriptContext, otherId: string) => void;
  
  /** Called when entering a trigger volume */
  onTriggerEnter?: (ctx: ScriptContext, triggerId: string) => void;
  
  /** Called when exiting a trigger volume */
  onTriggerExit?: (ctx: ScriptContext, triggerId: string) => void;
  
  /** Called when object is about to be destroyed */
  onDestroy?: (ctx: ScriptContext) => void;
  
  /** Called when object wakes from sleep */
  onWake?: (ctx: ScriptContext) => void;
  
  /** Called when object goes to sleep */
  onSleep?: (ctx: ScriptContext) => void;
}

export interface ScriptDefinition {
  name: string;
  callbacks: ScriptCallbacks;
  state?: Record<string, any>;
}

export interface AttachedScript {
  definition: ScriptDefinition;
  state: Record<string, any>;
  enabled: boolean;
}

/**
 * Script class for creating reusable behaviors
 */
export abstract class Script implements ScriptCallbacks {
  protected state: Record<string, any> = {};
  
  onInit?(ctx: ScriptContext): void;
  onPreUpdate?(ctx: ScriptContext): void;
  onPostUpdate?(ctx: ScriptContext): void;
  onFixedUpdate?(ctx: ScriptContext): void;
  onCollisionEnter?(ctx: ScriptContext, collision: CollisionInfo): void;
  onCollisionStay?(ctx: ScriptContext, collision: CollisionInfo): void;
  onCollisionExit?(ctx: ScriptContext, otherId: string): void;
  onTriggerEnter?(ctx: ScriptContext, triggerId: string): void;
  onTriggerExit?(ctx: ScriptContext, triggerId: string): void;
  onDestroy?(ctx: ScriptContext): void;
  onWake?(ctx: ScriptContext): void;
  onSleep?(ctx: ScriptContext): void;

  getState(): Record<string, any> {
    return { ...this.state };
  }

  setState(newState: Record<string, any>): void {
    this.state = { ...this.state, ...newState };
  }
}

/**
 * Script Manager - handles attaching and running scripts on objects
 */
export class ScriptManager {
  private scripts: Map<string, Map<string, AttachedScript>> = new Map();
  private globalScripts: Map<string, AttachedScript> = new Map();
  private scriptRegistry: Map<string, () => ScriptDefinition> = new Map();
  private initialized: Set<string> = new Set();

  /**
   * Register a script type for later instantiation
   */
  registerScript(name: string, factory: () => ScriptDefinition): void {
    this.scriptRegistry.set(name, factory);
  }

  /**
   * Attach a script to an object
   */
  attachScript(objectId: string, scriptName: string, initialState?: Record<string, any>): boolean {
    const factory = this.scriptRegistry.get(scriptName);
    if (!factory) {
      console.warn(`Script "${scriptName}" not registered`);
      return false;
    }

    const definition = factory();
    const script: AttachedScript = {
      definition,
      state: { ...definition.state, ...initialState },
      enabled: true
    };

    if (!this.scripts.has(objectId)) {
      this.scripts.set(objectId, new Map());
    }

    this.scripts.get(objectId)!.set(scriptName, script);
    return true;
  }

  /**
   * Attach a script definition directly
   */
  attachScriptDirect(objectId: string, definition: ScriptDefinition): void {
    const script: AttachedScript = {
      definition,
      state: { ...definition.state },
      enabled: true
    };

    if (!this.scripts.has(objectId)) {
      this.scripts.set(objectId, new Map());
    }

    this.scripts.get(objectId)!.set(definition.name, script);
  }

  /**
   * Detach a script from an object
   */
  detachScript(objectId: string, scriptName: string): boolean {
    const objectScripts = this.scripts.get(objectId);
    if (!objectScripts) return false;
    return objectScripts.delete(scriptName);
  }

  /**
   * Detach all scripts from an object
   */
  detachAllScripts(objectId: string): void {
    this.scripts.delete(objectId);
    this.initialized.delete(objectId);
  }

  /**
   * Enable/disable a script
   */
  setScriptEnabled(objectId: string, scriptName: string, enabled: boolean): void {
    const script = this.scripts.get(objectId)?.get(scriptName);
    if (script) {
      script.enabled = enabled;
    }
  }

  /**
   * Get script state
   */
  getScriptState(objectId: string, scriptName: string): Record<string, any> | undefined {
    return this.scripts.get(objectId)?.get(scriptName)?.state;
  }

  /**
   * Set script state
   */
  setScriptState(objectId: string, scriptName: string, state: Record<string, any>): void {
    const script = this.scripts.get(objectId)?.get(scriptName);
    if (script) {
      script.state = { ...script.state, ...state };
    }
  }

  /**
   * Add a global script (runs for all objects)
   */
  addGlobalScript(definition: ScriptDefinition): void {
    this.globalScripts.set(definition.name, {
      definition,
      state: { ...definition.state },
      enabled: true
    });
  }

  /**
   * Remove a global script
   */
  removeGlobalScript(name: string): void {
    this.globalScripts.delete(name);
  }

  /**
   * Initialize scripts for an object
   */
  initScripts(objectId: string, object: SimObject, world: World): void {
    if (this.initialized.has(objectId)) return;
    
    const ctx: ScriptContext = {
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
  runPreUpdate(objects: Map<string, SimObject>, world: World, deltaTime: number): void {
    const time = world.currentTime;

    for (const [objectId, object] of objects) {
      this.initScripts(objectId, object, world);

      const ctx: ScriptContext = { object, world, time, deltaTime };

      // Object scripts
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

      // Global scripts
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
  runPostUpdate(objects: Map<string, SimObject>, world: World, deltaTime: number): void {
    const time = world.currentTime;

    for (const [objectId, object] of objects) {
      const ctx: ScriptContext = { object, world, time, deltaTime };

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
  onCollisionEnter(objectId: string, object: SimObject, world: World, collision: CollisionInfo): void {
    const ctx: ScriptContext = {
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
  onCollisionStay(objectId: string, object: SimObject, world: World, collision: CollisionInfo): void {
    const ctx: ScriptContext = {
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
  onCollisionExit(objectId: string, object: SimObject, world: World, otherId: string): void {
    const ctx: ScriptContext = {
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
  onTriggerEnter(objectId: string, object: SimObject, world: World, triggerId: string): void {
    const ctx: ScriptContext = {
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
  onTriggerExit(objectId: string, object: SimObject, world: World, triggerId: string): void {
    const ctx: ScriptContext = {
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
  onDestroy(objectId: string, object: SimObject, world: World): void {
    const ctx: ScriptContext = {
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
  onWake(objectId: string, object: SimObject, world: World): void {
    const ctx: ScriptContext = {
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
  onSleep(objectId: string, object: SimObject, world: World): void {
    const ctx: ScriptContext = {
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
  clear(): void {
    this.scripts.clear();
    this.globalScripts.clear();
    this.initialized.clear();
  }
}

// ==================== Built-in Scripts ====================

/**
 * Oscillator script - makes object oscillate
 */
export const OscillatorScript = (): ScriptDefinition => ({
  name: 'oscillator',
  state: {
    axis: { x: 0, y: 1, z: 0 },
    amplitude: 1,
    frequency: 1,
    phase: 0,
    startPosition: null as Vector3 | null
  },
  callbacks: {
    onInit: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state) return;
      state.startPosition = { ...ctx.object.position };
    },
    onPreUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state?.startPosition) return;
      
      const offset = Math.sin(ctx.time * state.frequency * Math.PI * 2 + state.phase) * state.amplitude;
      ctx.object.position = Vec3.add(state.startPosition, Vec3.scale(state.axis, offset));
    }
  }
});

/**
 * Rotator script - continuously rotates object
 */
export const RotatorScript = (): ScriptDefinition => ({
  name: 'rotator',
  state: {
    axis: { x: 0, y: 1, z: 0 },
    speed: 1 // radians per second
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state) return;
      
      ctx.object.angularVelocity = Vec3.scale(state.axis, state.speed);
    }
  }
});

/**
 * Follow script - makes object follow a target
 */
export const FollowScript = (): ScriptDefinition => ({
  name: 'follow',
  state: {
    targetId: '',
    speed: 5,
    offset: { x: 0, y: 0, z: 0 },
    smoothing: 0.1
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
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

/**
 * LookAt script - makes object face a target
 */
export const LookAtScript = (): ScriptDefinition => ({
  name: 'lookAt',
  state: {
    targetId: '',
    upAxis: { x: 0, y: 1, z: 0 }
  },
  callbacks: {
    onPostUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state?.targetId) return;
      
      const target = ctx.world.getObject(state.targetId);
      if (!target) return;

      const forward = Vec3.normalize(Vec3.sub(target.position, ctx.object.position));
      const right = Vec3.normalize(Vec3.cross(state.upAxis, forward));
      const up = Vec3.cross(forward, right);

      // Convert to quaternion (simplified)
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

/**
 * Bounds script - keeps object within bounds
 */
export const BoundsScript = (): ScriptDefinition => ({
  name: 'bounds',
  state: {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
    behavior: 'clamp' as 'clamp' | 'wrap' | 'bounce'
  },
  callbacks: {
    onPostUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state) return;
      
      const pos = ctx.object.position;
      const vel = ctx.object.velocity;

      if (state.behavior === 'clamp') {
        pos.x = Math.max(state.min.x, Math.min(state.max.x, pos.x));
        pos.y = Math.max(state.min.y, Math.min(state.max.y, pos.y));
        pos.z = Math.max(state.min.z, Math.min(state.max.z, pos.z));
      } else if (state.behavior === 'wrap') {
        const size = Vec3.sub(state.max, state.min);
        if (pos.x < state.min.x) pos.x += size.x;
        if (pos.x > state.max.x) pos.x -= size.x;
        if (pos.y < state.min.y) pos.y += size.y;
        if (pos.y > state.max.y) pos.y -= size.y;
        if (pos.z < state.min.z) pos.z += size.z;
        if (pos.z > state.max.z) pos.z -= size.z;
      } else if (state.behavior === 'bounce') {
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

/**
 * Timer script - triggers callback after delay
 */
export const TimerScript = (): ScriptDefinition => ({
  name: 'timer',
  state: {
    delay: 1,
    repeat: false,
    elapsed: 0,
    triggered: false,
    onTrigger: null as ((ctx: ScriptContext) => void) | null
  },
  callbacks: {
    onPreUpdate: (ctx) => {
      const state = (ctx as any).scriptState;
      if (!state || (state.triggered && !state.repeat)) return;
      
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

/**
 * Collection of all built-in scripts
 */
export const BuiltinScripts = {
  Oscillator: OscillatorScript,
  Rotator: RotatorScript,
  Follow: FollowScript,
  LookAt: LookAtScript,
  Bounds: BoundsScript,
  Timer: TimerScript,
};

export default ScriptManager;
