/**
 * Example: Particle System with Force Fields
 * 
 * Demonstrates force system with attractors, vortices, and explosions
 */

import { 
  Engine, 
  PhysicsObject, 
  ForceSystem,
  Recorder,
  Exporter,
  Vec3
} from 'asimulate-sdk';

// Setup
const engine = new Engine({ 
  integrator: 'verlet',
  fixedTimeStep: 1/60,
  enableSleeping: false  // Keep all particles active
});

const forces = new ForceSystem();
const recorder = new Recorder();
const exporter = new Exporter();

// Create particle cloud
const particles: PhysicsObject[] = [];
const particleCount = 50;

for (let i = 0; i < particleCount; i++) {
  // Random position in sphere
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 5 + Math.random() * 3;
  
  const particle = new PhysicsObject({
    id: `particle_${i}`,
    shape: { type: 'sphere', radius: 0.1 },
    position: {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    },
    mass: 0.1 + Math.random() * 0.2,
    material: { friction: 0, restitution: 1 }
  });
  
  particles.push(particle);
  engine.addObject(particle);
}

console.log(`Created ${particleCount} particles`);

// Central attractor
forces.addForce({
  id: 'central_gravity',
  type: 'attractor',
  position: { x: 0, y: 0, z: 0 },
  strength: 50,
  falloff: 'inverse-square',
  minDistance: 1
});

// Vortex to make things spin
forces.addForce({
  id: 'vortex',
  type: 'vortex',
  position: { x: 0, y: 0, z: 0 },
  axis: { x: 0, y: 1, z: 0 },
  strength: 20,
  falloff: 'linear',
  maxDistance: 15
});

// Light damping
forces.addForce({
  id: 'damping',
  type: 'constant',
  value: { x: 0, y: 0, z: 0 },
  targets: particles.map(p => p.id),
  // Custom per-object force based on velocity
  applyCustom: (obj: PhysicsObject) => {
    return Vec3.scale(obj.velocity, -0.1 * obj.mass);
  }
});

// Simulation
console.log('Simulating particle dynamics...\n');
recorder.startRecording(engine);

const duration = 10;
const dt = engine.config.fixedTimeStep;

// Phase 1: Attraction and swirl (0-5s)
for (let t = 0; t < 5; t += dt) {
  forces.applyForces(particles, t, dt);
  engine.step(dt);
  recorder.captureFrame(engine);
}

console.log('Phase 1 complete: Particles attracted and swirling');

// Phase 2: Add explosion at t=5s
forces.addForce({
  id: 'explosion',
  type: 'explosion',
  position: { x: 0, y: 0, z: 0 },
  strength: 500,
  duration: 0.5,
  startTime: 5,
  falloff: 'inverse-square'
});

// Continue simulation (5-7s)
for (let t = 5; t < 7; t += dt) {
  forces.applyForces(particles, t, dt);
  engine.step(dt);
  recorder.captureFrame(engine);
}

console.log('Phase 2 complete: Explosion dispersed particles');

// Phase 3: Remove explosion, particles re-collect (7-10s)
forces.removeForce('explosion');

for (let t = 7; t < duration; t += dt) {
  forces.applyForces(particles, t, dt);
  engine.step(dt);
  recorder.captureFrame(engine);
}

console.log('Phase 3 complete: Particles re-collecting');

recorder.stopRecording();
const recording = recorder.getRecording();

// Analysis
console.log(`\nRecording: ${recording.frames.length} frames, ${recording.duration.toFixed(2)}s`);

// Calculate center of mass over time
const centerOfMass: { t: number, r: number }[] = [];

for (const frame of recording.frames) {
  let cx = 0, cy = 0, cz = 0, totalMass = 0;
  
  for (const obj of frame.objects) {
    const mass = 0.15;  // Average mass
    cx += obj.position.x * mass;
    cy += obj.position.y * mass;
    cz += obj.position.z * mass;
    totalMass += mass;
  }
  
  cx /= totalMass;
  cy /= totalMass;
  cz /= totalMass;
  
  const r = Math.sqrt(cx*cx + cy*cy + cz*cz);
  centerOfMass.push({ t: frame.time, r });
}

// Find expansion peak (explosion effect)
const maxExpansion = Math.max(...centerOfMass.map(c => c.r));
const peakTime = centerOfMass.find(c => c.r === maxExpansion)!.t;
console.log(`Peak expansion: ${maxExpansion.toFixed(2)}m at t=${peakTime.toFixed(2)}s`);

// Export trajectory data
const trajectoryCSV = exporter.trajectoryToCSV(recording, 'particle_0');
console.log(`\nTrajectory CSV exported: ${trajectoryCSV.split('\n').length} rows`);

// Export SVG chart of center of mass radius
const chartSVG = exporter.toSVGChart(
  centerOfMass.map(c => ({ x: c.t, y: c.r })),
  {
    type: 'line',
    width: 600,
    height: 300,
    theme: 'dark',
    xLabel: 'Time (s)',
    yLabel: 'CoM Radius (m)',
    title: 'Center of Mass Distance from Origin'
  }
);

console.log(`SVG chart generated: ${chartSVG.length} bytes`);
