/**
 * Example: Double Pendulum with Constraints
 * 
 * Demonstrates constraint system with ball joints
 */

import { 
  Engine, 
  PhysicsObject, 
  ConstraintSolver,
  Environment,
  EnvironmentPresets,
  Recorder,
  Analysis
} from 'asimulate-sdk';

// Setup
const engine = new Engine({ 
  integrator: 'rk4',
  fixedTimeStep: 1/120  // Higher precision for pendulum
});

const environment = new Environment(EnvironmentPresets.Earth);
const constraintSolver = new ConstraintSolver({ iterations: 20 });
const recorder = new Recorder({ captureVelocities: true });

// Fixed anchor point
const anchor = new PhysicsObject({
  id: 'anchor',
  shape: { type: 'sphere', radius: 0.1 },
  position: { x: 0, y: 5, z: 0 },
  isStatic: true
});

// First pendulum mass
const mass1 = new PhysicsObject({
  id: 'mass1',
  shape: { type: 'sphere', radius: 0.3 },
  position: { x: 2, y: 5, z: 0 },  // Start displaced
  mass: 1
});

// Second pendulum mass
const mass2 = new PhysicsObject({
  id: 'mass2',
  shape: { type: 'sphere', radius: 0.3 },
  position: { x: 4, y: 5, z: 0 },  // Further displaced
  mass: 1
});

engine.addObject(anchor);
engine.addObject(mass1);
engine.addObject(mass2);

// Connect with distance constraints (rope-like behavior)
constraintSolver.addConstraint({
  id: 'rope1',
  type: 'distance',
  bodyA: 'anchor',
  bodyB: 'mass1',
  distance: 2,
  stiffness: 1,
  damping: 0
});

constraintSolver.addConstraint({
  id: 'rope2',
  type: 'distance',
  bodyA: 'mass1',
  bodyB: 'mass2',
  distance: 2,
  stiffness: 1,
  damping: 0
});

// Simulation loop
console.log('Simulating double pendulum...');
recorder.startRecording(engine);

const duration = 10;  // 10 seconds
const dt = engine.config.fixedTimeStep;
const steps = Math.ceil(duration / dt);

for (let i = 0; i < steps; i++) {
  const objects = engine.getObjects();
  
  // Apply gravity
  for (const obj of objects) {
    if (!obj.isStatic) {
      environment.applyForces(obj, dt);
    }
  }
  
  // Step physics
  engine.step(dt);
  
  // Solve constraints
  constraintSolver.solve(objects, dt);
  
  // Capture frame
  recorder.captureFrame(engine);
}

recorder.stopRecording();
const recording = recorder.getRecording();

console.log(`Simulation complete: ${recording.frames.length} frames`);

// Analyze chaotic motion
const analysis = new Analysis();

const x1 = recorder.extractPropertyTimeSeries(recording, 'mass1', 'position.x');
const y1 = recorder.extractPropertyTimeSeries(recording, 'mass1', 'position.y');
const x2 = recorder.extractPropertyTimeSeries(recording, 'mass2', 'position.x');
const y2 = recorder.extractPropertyTimeSeries(recording, 'mass2', 'position.y');

// Calculate energy (should be roughly conserved)
const energy: number[] = [];
for (let i = 0; i < x1.length; i++) {
  const v1 = recording.frames[i].objects.find(o => o.id === 'mass1')!;
  const v2 = recording.frames[i].objects.find(o => o.id === 'mass2')!;
  
  // Kinetic energy
  const ke1 = 0.5 * 1 * (v1.velocity!.x**2 + v1.velocity!.y**2 + v1.velocity!.z**2);
  const ke2 = 0.5 * 1 * (v2.velocity!.x**2 + v2.velocity!.y**2 + v2.velocity!.z**2);
  
  // Potential energy (relative to y=0)
  const pe1 = 1 * 9.81 * v1.position.y;
  const pe2 = 1 * 9.81 * v2.position.y;
  
  energy.push(ke1 + ke2 + pe1 + pe2);
}

const energyStats = analysis.statistics(energy);
console.log(`\nEnergy analysis:`);
console.log(`  Initial: ${energy[0].toFixed(2)} J`);
console.log(`  Final: ${energy[energy.length-1].toFixed(2)} J`);
console.log(`  Mean: ${energyStats.mean.toFixed(2)} J`);
console.log(`  Std Dev: ${energyStats.std.toFixed(4)} J (energy conservation)`);

// Frequency analysis of mass2 motion
const fft = analysis.fft(y2.map(p => p.value));
console.log(`\nFrequency components: ${fft.length}`);

// Trajectory analysis
const positions1 = x1.map((x, i) => ({ x: x.value, y: y1[i].value, z: 0 }));
const trajectory = analysis.trajectoryAnalysis(positions1);
console.log(`\nMass 1 trajectory:`);
console.log(`  Total distance: ${trajectory.totalDistance.toFixed(2)}m`);
console.log(`  Average speed: ${trajectory.averageSpeed.toFixed(2)} m/s`);
