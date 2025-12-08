/**
 * Example: Basic Falling Ball Simulation
 * 
 * Demonstrates basic physics setup with gravity and collision
 */

import { createWorld, PhysicsObject } from 'asimulate-sdk';

// Create world with Earth environment
const world = createWorld({ 
  environment: 'Earth',
  fixedTimeStep: 1/60,
  integrator: 'verlet'
});

// Create a bouncing ball
const ball = new PhysicsObject({
  id: 'ball',
  shape: { type: 'sphere', radius: 0.5 },
  position: { x: 0, y: 10, z: 0 },
  velocity: { x: 2, y: 0, z: 0 },
  mass: 1,
  material: {
    friction: 0.3,
    restitution: 0.8  // Bouncy!
  }
});

// Create ground plane
const ground = new PhysicsObject({
  id: 'ground',
  shape: { type: 'box', halfExtents: { x: 20, y: 0.5, z: 20 } },
  position: { x: 0, y: -0.5, z: 0 },
  isStatic: true,
  material: {
    friction: 0.5,
    restitution: 0.5
  }
});

// Add objects to engine
world.engine.addObject(ball);
world.engine.addObject(ground);

// Listen for collisions
world.engine.on('collision', (event) => {
  console.log(`Collision: ${event.bodyA} <-> ${event.bodyB}`);
  console.log(`  Impact velocity: ${event.relativeVelocity.toFixed(2)} m/s`);
});

// Start recording
world.recorder.startRecording(world.engine);

// Simulate 5 seconds
console.log('Starting simulation...');
console.log(`Initial position: y = ${ball.position.y.toFixed(2)}m`);

const result = world.simulate(5);

console.log(`\nSimulation complete!`);
console.log(`Steps: ${result.steps}`);
console.log(`Collisions: ${result.contacts.length}`);
console.log(`Final position: y = ${ball.position.y.toFixed(2)}m`);

// Stop recording and analyze
world.recorder.stopRecording();
const recording = world.recorder.getRecording();

// Extract position over time
const positions = world.recorder.extractPropertyTimeSeries(recording, 'ball', 'position.y');
const velocities = world.recorder.extractPropertyTimeSeries(recording, 'ball', 'velocity.y');

// Analyze trajectory
const stats = world.analysis.statistics(positions.map(p => p.value));
console.log(`\nPosition statistics:`);
console.log(`  Mean: ${stats.mean.toFixed(2)}m`);
console.log(`  Max: ${stats.max.toFixed(2)}m`);
console.log(`  Min: ${stats.min.toFixed(2)}m`);

// Export to JSON
const json = world.exporter.toJSON(recording, { pretty: true });
console.log(`\nRecording exported: ${json.length} bytes`);
