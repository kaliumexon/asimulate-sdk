/**
 * ASIMULATE SDK - Advanced Physics Simulation Library
 * 
 * A comprehensive TypeScript library for physics simulation,
 * recording, analysis, and visualization.
 * 
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================
export * from './types';

// ============================================================================
// Math Utilities
// ============================================================================
export * from './math';

// ============================================================================
// Core Engine
// ============================================================================
export { Engine } from './core/Engine';
export { PhysicsObject } from './core/PhysicsObject';

// ============================================================================
// Environment
// ============================================================================
export { Environment, EnvironmentPresets } from './environment/Environment';

// ============================================================================
// Forces
// ============================================================================
export { ForceSystem } from './forces/ForceSystem';

// ============================================================================
// Collision Detection
// ============================================================================
export { CollisionSystem } from './collision/CollisionSystem';

// ============================================================================
// Constraints
// ============================================================================
export { ConstraintSolver } from './constraints/ConstraintSolver';

// ============================================================================
// Recording & Playback
// ============================================================================
export { Recorder } from './recorder/Recorder';

// ============================================================================
// Analysis
// ============================================================================
export { Analysis } from './analysis/Analysis';

// ============================================================================
// Import / Export
// ============================================================================
export { Exporter } from './export/Exporter';
export { Importer } from './import/Importer';

// ============================================================================
// Visualization
// ============================================================================
export { Visualizer } from './visualization/Visualizer';

// ============================================================================
// Scripting
// ============================================================================
export { ScriptManager, BuiltinScripts } from './scripting/ScriptManager';

// ============================================================================
// Convenience Factory
// ============================================================================
import { Engine } from './core/Engine';
import { Environment, EnvironmentPresets } from './environment/Environment';
import { ForceSystem } from './forces/ForceSystem';
import { CollisionSystem } from './collision/CollisionSystem';
import { ConstraintSolver } from './constraints/ConstraintSolver';
import { Recorder } from './recorder/Recorder';
import { Analysis } from './analysis/Analysis';
import { Exporter } from './export/Exporter';
import { Importer } from './import/Importer';
import { Visualizer } from './visualization/Visualizer';
import { ScriptManager, BuiltinScripts } from './scripting/ScriptManager';
import type { EngineConfig, EnvironmentConfig } from './types';

/**
 * Create a complete simulation world with all systems initialized
 */
export function createWorld(config?: Partial<EngineConfig & { environment?: Partial<EnvironmentConfig> | string }>) {
  const envConfig = typeof config?.environment === 'string' 
    ? EnvironmentPresets[config.environment as keyof typeof EnvironmentPresets]
    : config?.environment;
    
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
    step(dt?: number) {
      const deltaTime = dt ?? engine.config.timeStep;
      
      // Step physics engine
      engine.step(deltaTime);
      
      return { deltaTime };
    },
    
    /**
     * Run simulation for specified duration
     */
    simulate(duration: number, dt?: number) {
      const deltaTime = dt ?? engine.config.timeStep;
      const steps = Math.ceil(duration / deltaTime);
      
      for (let i = 0; i < steps; i++) {
        this.step(deltaTime);
      }
      
      return { steps };
    }
  };
}

/**
 * SDK Version
 */
export const VERSION = '1.0.0';

/**
 * Default export
 */
export default {
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
