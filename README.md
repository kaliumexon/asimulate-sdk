# ASIMULATE SDK

> 🚀 **$ASIM just launched!** — [CA: `hGs7JdzuB2bnfRR5v5zrZ5DBEK22n1hwg7HHG87pump`](https://pump.fun/hGs7JdzuB2bnfRR5v5zrZ5DBEK22n1hwg7HHG87pump) | [Dexscreener](https://dexscreener.com/solana/hGs7JdzuB2bnfRR5v5zrZ5DBEK22n1hwg7HHG87pump)

**Advanced Physics Simulation Library** — A full-featured TypeScript SDK for physics simulations, recording, analysis, and visualization.

## Features

- 🎯 **Physics Engine** — 4 integrators (Euler, Verlet, RK4, Symplectic), deterministic mode
- 💥 **Collisions** — Broad-phase (AABB sweep-and-prune), Narrow-phase (sphere, box, capsule, mesh)
- 🔗 **Constraints** — Fixed, Hinge, Ball, Slider, Piston, Distance, Spring, Rope, Gear, Motor
- 🌍 **Environment** — Presets (Earth, Moon, Mars, Jupiter, Space, Underwater), wind, fluids, EM fields
- 💨 **Forces** — Constant, Spring, Attractor, Thruster, Explosion, Vortex, Force Field, Noise Field
- 📹 **Recording** — Frame-by-frame capture, markers, interpolation, playback
- 📊 **Analysis** — Statistics, FFT, correlation, filters, trends, trajectories
- 📤 **Export** — JSON, CSV, glTF/GLB, Parquet, SVG charts
- 📥 **Import** — OBJ, glTF/GLB, STL, JSON, CSV
- 🎨 **Visualization** — Canvas2D renderer, debug mode, camera, lighting
- 📜 **Scripts** — Behavioral scripts with lifecycle hooks

## Installation

```bash
npm install asimulate-sdk
```

## Quick Start

```typescript
import { createWorld, PhysicsObject } from 'asimulate-sdk';

// Create a world with Earth preset
const world = createWorld({ environment: 'Earth' });

// Add a sphere
const sphere = new PhysicsObject({
  id: 'ball',
  shape: { type: 'sphere', radius: 0.5 },
  position: { x: 0, y: 10, z: 0 },
  mass: 1
});
world.engine.addObject(sphere);

// Add a floor
const floor = new PhysicsObject({
  id: 'floor',
  shape: { type: 'box', halfExtents: { x: 10, y: 0.1, z: 10 } },
  position: { x: 0, y: 0, z: 0 },
  isStatic: true
});
world.engine.addObject(floor);

// Simulate for 5 seconds
world.simulate(5);

console.log('Ball position:', sphere.position);
```

## Usage Examples

### Physics Engine

```typescript
import { Engine, PhysicsObject } from 'asimulate-sdk';

const engine = new Engine({
  gravity: { x: 0, y: -9.81, z: 0 },
  integrator: 'rk4',
  fixedTimeStep: 1/60,
  enableSleeping: true
});

// Add an object
const box = new PhysicsObject({
  id: 'box1',
  shape: { type: 'box', halfExtents: { x: 1, y: 1, z: 1 } },
  mass: 5,
  material: { friction: 0.5, restitution: 0.3 }
});

engine.addObject(box);
engine.step(1/60);
```

### Environment

```typescript
import { Environment, EnvironmentPresets } from 'asimulate-sdk';

// Use Mars preset
const mars = new Environment(EnvironmentPresets.Mars);

// Or custom environment
const custom = new Environment({
  gravity: { mode: 'uniform', value: { x: 0, y: -5, z: 0 } },
  wind: { velocity: { x: 10, y: 0, z: 0 }, turbulence: 0.3 },
  fluid: { density: 1.225, viscosity: 1.8e-5 }
});

// Apply forces to an object
custom.applyForces(object, deltaTime);
```

### Forces

```typescript
import { ForceSystem } from 'asimulate-sdk';

const forces = new ForceSystem();

// Constant force
forces.addForce({
  id: 'wind',
  type: 'constant',
  value: { x: 5, y: 0, z: 0 }
});

// Spring between objects
forces.addForce({
  id: 'spring1',
  type: 'spring',
  targetA: 'obj1',
  targetB: 'obj2',
  stiffness: 100,
  damping: 5,
  restLength: 2
});

// Attractor
forces.addForce({
  id: 'gravity_well',
  type: 'attractor',
  position: { x: 0, y: 0, z: 0 },
  strength: 1000,
  falloff: 'inverse-square'
});

forces.applyForces(objects, time, deltaTime);
```

### Constraints

```typescript
import { ConstraintSolver } from 'asimulate-sdk';

const solver = new ConstraintSolver({ iterations: 10 });

// Hinge
solver.addConstraint({
  id: 'hinge1',
  type: 'hinge',
  bodyA: 'arm',
  bodyB: 'body',
  pivotA: { x: 0, y: 0, z: -1 },
  pivotB: { x: 0, y: 0, z: 1 },
  axis: { x: 1, y: 0, z: 0 },
  limits: { min: -Math.PI/2, max: Math.PI/2 }
});

// Motor
solver.addConstraint({
  id: 'motor1',
  type: 'motor',
  bodyA: 'wheel',
  bodyB: 'chassis',
  axis: { x: 1, y: 0, z: 0 },
  targetVelocity: 10,
  maxForce: 100
});

solver.solve(objects, deltaTime);
```

### Recording and Playback

```typescript
import { Recorder } from 'asimulate-sdk';

const recorder = new Recorder({
  captureVelocities: true,
  captureForces: true
});

// Start recording
recorder.startRecording(engine);

// ... simulation ...

// Stop and get data
recorder.stopRecording();
const recording = recorder.getRecording();

// Playback
recorder.loadRecording(recording);
recorder.play();
recorder.seek(2.5); // Jump to 2.5 seconds
```

### Data Analysis

```typescript
import { Analysis } from 'asimulate-sdk';

const analysis = new Analysis();

// Statistics
const stats = analysis.statistics(velocityData);
console.log(stats.mean, stats.std, stats.median);

// FFT analysis
const spectrum = analysis.fft(signalData);
const psd = analysis.powerSpectralDensity(signalData, sampleRate);

// Correlation
const correlation = analysis.crossCorrelation(signal1, signal2);

// Trajectory analysis
const trajectory = analysis.trajectoryAnalysis(positions);
console.log(trajectory.totalDistance, trajectory.averageSpeed);
```

### Export

```typescript
import { Exporter } from 'asimulate-sdk';

const exporter = new Exporter();

// JSON
const json = exporter.toJSON(recording, { pretty: true });

// CSV
const csv = exporter.toCSV(recording, {
  properties: ['position', 'velocity'],
  precision: 4
});

// glTF for 3D editors
const gltf = exporter.toGLTF(objects, recording);

// SVG chart
const svg = exporter.toSVGChart(data, {
  type: 'line',
  width: 800,
  height: 400,
  theme: 'dark'
});
```

### Import

```typescript
import { Importer } from 'asimulate-sdk';

const importer = new Importer();

// Import OBJ
const objMesh = importer.parseOBJ(objString);
const physicsObj = importer.meshToPhysicsObject(objMesh, {
  id: 'imported',
  mass: 10
});

// Import glTF
const gltfData = importer.parseGLTF(gltfJson);

// Import recording
const recording = importer.importRecording(jsonString);
```

### Visualization

```typescript
import { Visualizer } from 'asimulate-sdk';

const visualizer = new Visualizer(canvas, {
  background: '#1a1a2e',
  showGrid: true,
  gridSize: 20
});

// Debug mode
visualizer.setDebugOptions({
  showBoundingBoxes: true,
  showVelocities: true,
  showForces: true,
  showContacts: true
});

// Camera
visualizer.camera.orbit(0.1, 0);
visualizer.camera.setView('front');
visualizer.camera.focus(targetObject);

// Animation
visualizer.startAnimation(engine, (dt) => {
  world.step(dt);
});
```

### Behavioral Scripts

```typescript
import { ScriptManager, BuiltinScripts, PhysicsObject } from 'asimulate-sdk';

const scripts = new ScriptManager();

// Built-in oscillator script
scripts.attachScript(object, 'oscillator', BuiltinScripts.Oscillator, {
  axis: 'y',
  amplitude: 2,
  frequency: 0.5
});

// Custom script
scripts.registerScript('followMouse', {
  onInit(obj, state) {
    state.speed = 5;
  },
  onPreUpdate(obj, dt, engine, state) {
    const target = state.mousePosition;
    if (target) {
      const dir = Vec3.normalize(Vec3.sub(target, obj.position));
      obj.velocity = Vec3.scale(dir, state.speed);
    }
  }
});
```

## API Reference

### Engine

| Method | Description |
|--------|-------------|
| `addObject(obj)` | Add a physics object |
| `removeObject(id)` | Remove an object |
| `step(dt)` | Simulation step |
| `getObjects()` | Get all objects |
| `query(options)` | Search for objects |
| `on(event, handler)` | Subscribe to events |

### PhysicsObject

| Property | Type | Description |
|----------|------|-------------|
| `position` | `Vec3` | Position |
| `velocity` | `Vec3` | Linear velocity |
| `rotation` | `Quat` | Orientation |
| `angularVelocity` | `Vec3` | Angular velocity |
| `mass` | `number` | Mass |
| `isStatic` | `boolean` | Static object |

### Environment Presets

| Preset | Gravity | Description |
|--------|---------|-------------|
| `Earth` | 9.81 m/s² | Earth conditions |
| `Moon` | 1.62 m/s² | Lunar conditions |
| `Mars` | 3.71 m/s² | Martian conditions |
| `Jupiter` | 24.79 m/s² | Jupiter |
| `Space` | 0 | Zero gravity |
| `Underwater` | 9.81 m/s² | Underwater environment with viscosity |

## Architecture

```
asimulate-sdk/
├── src/
│   ├── types/          # TypeScript types
│   ├── math/           # Vectors, quaternions, matrices
│   ├── core/           # Engine, PhysicsObject
│   ├── environment/    # Environment, gravity, medium
│   ├── forces/         # Force system
│   ├── collision/      # Collision detection
│   ├── constraints/    # Constraints and joints
│   ├── recorder/       # Recording and playback
│   ├── analysis/       # Data analysis
│   ├── export/         # Format export
│   ├── import/         # Model import
│   ├── visualization/  # Rendering
│   └── scripting/      # Behavioral scripts
```

## License

MIT License

## Authors

ASIMULATE Team
