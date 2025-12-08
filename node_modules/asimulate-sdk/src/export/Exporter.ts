/**
 * ASIMULATE SDK - Export Module
 * Export simulation data in various formats
 */

import { 
  RecordingData, 
  ExportFormat,
  ExportOptions,
  ObjectState,
  Vector3
} from '../types';
import { RecordingFrame } from '../recorder/Recorder';

export interface ExportResult {
  format: ExportFormat;
  data: string | Uint8Array | Blob;
  filename: string;
  mimeType: string;
  size: number;
}

export interface CSVExportOptions {
  delimiter: string;
  includeHeaders: boolean;
  objectIds?: string[];
  properties?: string[];
  precision: number;
}

export interface JSONExportOptions {
  pretty: boolean;
  includeMetadata: boolean;
}

export interface GLTFExportOptions {
  binary: boolean;
  includeAnimations: boolean;
  frameInterval: number;
}

export interface ChartExportOptions {
  type: 'line' | 'scatter' | 'area' | 'bar';
  width: number;
  height: number;
  title: string;
  xLabel: string;
  yLabel: string;
  theme: 'light' | 'dark';
}

const DEFAULT_CSV_OPTIONS: CSVExportOptions = {
  delimiter: ',',
  includeHeaders: true,
  precision: 6
};

const DEFAULT_JSON_OPTIONS: JSONExportOptions = {
  pretty: true,
  includeMetadata: true
};

const DEFAULT_GLTF_OPTIONS: GLTFExportOptions = {
  binary: false,
  includeAnimations: true,
  frameInterval: 1
};

const DEFAULT_CHART_OPTIONS: ChartExportOptions = {
  type: 'line',
  width: 800,
  height: 600,
  title: 'Simulation Data',
  xLabel: 'Time (s)',
  yLabel: 'Value',
  theme: 'light'
};

export class Exporter {
  
  /**
   * Export recording to specified format
   */
  static export(
    data: RecordingData,
    format: ExportFormat,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    switch (format) {
      case 'json':
        return this.exportJSON(data, { ...DEFAULT_JSON_OPTIONS, ...options });
      case 'csv':
        return this.exportCSV(data, { ...DEFAULT_CSV_OPTIONS, ...options });
      case 'gltf':
        return this.exportGLTF(data, { ...DEFAULT_GLTF_OPTIONS, ...options });
      case 'parquet':
        return this.exportParquet(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to JSON
   */
  static exportJSON(data: RecordingData, options: JSONExportOptions): ExportResult {
    const exportData = options.includeMetadata ? data : {
      frames: data.frames,
      markers: data.markers
    };

    const jsonString = options.pretty 
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData);

    return {
      format: 'json',
      data: jsonString,
      filename: 'simulation.json',
      mimeType: 'application/json',
      size: new Blob([jsonString]).size
    };
  }

  /**
   * Export to CSV
   */
  static exportCSV(data: RecordingData, options: CSVExportOptions): ExportResult {
    const { delimiter, includeHeaders, objectIds, properties, precision } = options;
    const lines: string[] = [];

    // Get all unique object IDs
    const allObjectIds = new Set<string>();
    for (const frame of data.frames) {
      for (const [id] of frame.objects) {
        if (!objectIds || objectIds.includes(id)) {
          allObjectIds.add(id);
        }
      }
    }

    // Default properties if not specified
    const props = properties || [
      'position.x', 'position.y', 'position.z',
      'velocity.x', 'velocity.y', 'velocity.z',
      'rotation.x', 'rotation.y', 'rotation.z', 'rotation.w'
    ];

    // Header
    if (includeHeaders) {
      const headers = ['time'];
      for (const id of allObjectIds) {
        for (const prop of props) {
          headers.push(`${id}_${prop}`);
        }
      }
      lines.push(headers.join(delimiter));
    }

    // Data rows
    for (const frame of data.frames) {
      const row: string[] = [frame.time.toFixed(precision)];
      
      for (const id of allObjectIds) {
        const state = (frame.objects as [string, ObjectState][]).find(([oid]) => oid === id);
        
        for (const prop of props) {
          if (state) {
            const value = this.getNestedProperty(state[1], prop);
            row.push(typeof value === 'number' ? value.toFixed(precision) : String(value ?? ''));
          } else {
            row.push('');
          }
        }
      }
      
      lines.push(row.join(delimiter));
    }

    const csvString = lines.join('\n');

    return {
      format: 'csv',
      data: csvString,
      filename: 'simulation.csv',
      mimeType: 'text/csv',
      size: new Blob([csvString]).size
    };
  }

  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Export to glTF format (3D model with animations)
   */
  static exportGLTF(data: RecordingData, options: GLTFExportOptions): ExportResult {
    const gltf: any = {
      asset: {
        version: '2.0',
        generator: 'ASIMULATE SDK'
      },
      scene: 0,
      scenes: [{ nodes: [] as number[] }],
      nodes: [],
      meshes: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
      animations: []
    };

    // Collect unique objects
    const objectIds = new Set<string>();
    for (const frame of data.frames) {
      for (const [id] of frame.objects) {
        objectIds.add(id);
      }
    }

    // Create nodes for each object
    let nodeIndex = 0;
    const nodeMap = new Map<string, number>();
    
    for (const id of objectIds) {
      const firstState = this.findFirstState(data.frames, id);
      if (firstState) {
        gltf.nodes.push({
          name: id,
          translation: [firstState.position.x, firstState.position.y, firstState.position.z],
          rotation: [firstState.rotation.x, firstState.rotation.y, firstState.rotation.z, firstState.rotation.w],
          scale: [firstState.scale.x, firstState.scale.y, firstState.scale.z],
          mesh: nodeIndex // Placeholder - would need actual mesh data
        });
        gltf.scenes[0].nodes.push(nodeIndex);
        nodeMap.set(id, nodeIndex);
        nodeIndex++;
      }
    }

    // Create animations if requested
    if (options.includeAnimations && data.frames.length > 1) {
      const sampledFrames = data.frames.filter((_, i) => i % options.frameInterval === 0);
      
      for (const [id, nodeIdx] of nodeMap) {
        const times: number[] = [];
        const translations: number[] = [];
        const rotations: number[] = [];
        const scales: number[] = [];

        for (const frame of sampledFrames) {
          const state = (frame.objects as [string, ObjectState][]).find(([oid]) => oid === id);
          if (state) {
            times.push(frame.time);
            translations.push(state[1].position.x, state[1].position.y, state[1].position.z);
            rotations.push(state[1].rotation.x, state[1].rotation.y, state[1].rotation.z, state[1].rotation.w);
            scales.push(state[1].scale.x, state[1].scale.y, state[1].scale.z);
          }
        }

        if (times.length > 0) {
          // Add animation channels and samplers
          const animationIndex = gltf.animations.length;
          gltf.animations.push({
            name: `${id}_animation`,
            channels: [
              { sampler: animationIndex * 3, target: { node: nodeIdx, path: 'translation' } },
              { sampler: animationIndex * 3 + 1, target: { node: nodeIdx, path: 'rotation' } },
              { sampler: animationIndex * 3 + 2, target: { node: nodeIdx, path: 'scale' } }
            ],
            samplers: [
              { input: gltf.accessors.length, interpolation: 'LINEAR', output: gltf.accessors.length + 1 },
              { input: gltf.accessors.length, interpolation: 'LINEAR', output: gltf.accessors.length + 2 },
              { input: gltf.accessors.length, interpolation: 'LINEAR', output: gltf.accessors.length + 3 }
            ]
          });

          // Add accessors for animation data
          gltf.accessors.push(
            { bufferView: 0, componentType: 5126, count: times.length, type: 'SCALAR', min: [times[0]], max: [times[times.length - 1]] },
            { bufferView: 1, componentType: 5126, count: times.length, type: 'VEC3' },
            { bufferView: 2, componentType: 5126, count: times.length, type: 'VEC4' },
            { bufferView: 3, componentType: 5126, count: times.length, type: 'VEC3' }
          );
        }
      }
    }

    const jsonString = JSON.stringify(gltf, null, 2);
    const extension = options.binary ? 'glb' : 'gltf';

    return {
      format: 'gltf',
      data: jsonString,
      filename: `simulation.${extension}`,
      mimeType: options.binary ? 'model/gltf-binary' : 'model/gltf+json',
      size: new Blob([jsonString]).size
    };
  }

  private static findFirstState(
    frames: any[],
    objectId: string
  ): ObjectState | undefined {
    for (const frame of frames) {
      const state = (frame.objects as [string, ObjectState][]).find(([id]) => id === objectId);
      if (state) return state[1];
    }
    return undefined;
  }

  /**
   * Export to Parquet format (columnar data)
   */
  static exportParquet(data: RecordingData): ExportResult {
    // Parquet is a binary format - this is a simplified placeholder
    // In production, you'd use a library like parquetjs
    
    const header = {
      magic: 'PAR1',
      version: 2,
      schema: {
        fields: [
          { name: 'time', type: 'DOUBLE' },
          { name: 'object_id', type: 'STRING' },
          { name: 'position_x', type: 'DOUBLE' },
          { name: 'position_y', type: 'DOUBLE' },
          { name: 'position_z', type: 'DOUBLE' },
          { name: 'velocity_x', type: 'DOUBLE' },
          { name: 'velocity_y', type: 'DOUBLE' },
          { name: 'velocity_z', type: 'DOUBLE' }
        ]
      }
    };

    // Flatten data for columnar storage
    const rows: any[] = [];
    for (const frame of data.frames) {
      for (const [id, state] of frame.objects as [string, ObjectState][]) {
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

    // Simplified JSON representation (actual parquet would be binary)
    const jsonString = JSON.stringify({ header, rows });

    return {
      format: 'parquet',
      data: jsonString,
      filename: 'simulation.parquet',
      mimeType: 'application/vnd.apache.parquet',
      size: new Blob([jsonString]).size
    };
  }

  /**
   * Export time series to chart (SVG)
   */
  static exportChart(
    series: Array<{ name: string; times: number[]; values: number[] }>,
    options: Partial<ChartExportOptions> = {}
  ): ExportResult {
    const opts = { ...DEFAULT_CHART_OPTIONS, ...options };
    const { width, height, title, xLabel, yLabel, theme, type } = opts;

    const padding = { top: 50, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find data bounds
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

    // Add padding to Y range
    const yPadding = (maxY - minY) * 0.1;
    minY -= yPadding;
    maxY += yPadding;

    // Scale functions
    const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * chartWidth;
    const scaleY = (y: number) => padding.top + chartHeight - ((y - minY) / (maxY - minY)) * chartHeight;

    // Colors
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2'];
    const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff';
    const textColor = theme === 'dark' ? '#f3f4f6' : '#1f2937';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" fill="${textColor}" font-size="16" font-weight="bold">${title}</text>
  
  <!-- Grid lines -->
  <g stroke="${gridColor}" stroke-width="1">`;

    // Y grid lines
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padding.top + (chartHeight / yTicks) * i;
      const value = maxY - ((maxY - minY) / yTicks) * i;
      svg += `\n    <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}"/>`;
      svg += `\n    <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" fill="${textColor}" font-size="11">${value.toFixed(2)}</text>`;
    }

    // X grid lines
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = padding.left + (chartWidth / xTicks) * i;
      const value = minX + ((maxX - minX) / xTicks) * i;
      svg += `\n    <line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}"/>`;
      svg += `\n    <text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" fill="${textColor}" font-size="11">${value.toFixed(2)}</text>`;
    }

    svg += `\n  </g>
  
  <!-- Axes -->
  <g stroke="${textColor}" stroke-width="2">
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}"/>
    <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}"/>
  </g>
  
  <!-- Axis labels -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="${textColor}" font-size="12">${xLabel}</text>
  <text x="15" y="${height / 2}" text-anchor="middle" fill="${textColor}" font-size="12" transform="rotate(-90, 15, ${height / 2})">${yLabel}</text>`;

    // Draw data series
    for (let s = 0; s < series.length; s++) {
      const { name, times, values } = series[s];
      const color = colors[s % colors.length];

      if (type === 'line' || type === 'area') {
        let pathD = '';
        for (let i = 0; i < times.length; i++) {
          const x = scaleX(times[i]);
          const y = scaleY(values[i]);
          pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }

        if (type === 'area') {
          const areaPath = pathD + ` L ${scaleX(times[times.length - 1])} ${scaleY(minY)} L ${scaleX(times[0])} ${scaleY(minY)} Z`;
          svg += `\n  <path d="${areaPath}" fill="${color}" fill-opacity="0.2"/>`;
        }
        svg += `\n  <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>`;
      } else if (type === 'scatter') {
        for (let i = 0; i < times.length; i++) {
          const x = scaleX(times[i]);
          const y = scaleY(values[i]);
          svg += `\n  <circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
        }
      }

      // Legend
      const legendX = padding.left + 20;
      const legendY = padding.top + 20 + s * 20;
      svg += `\n  <rect x="${legendX}" y="${legendY - 8}" width="16" height="3" fill="${color}"/>`;
      svg += `\n  <text x="${legendX + 22}" y="${legendY}" fill="${textColor}" font-size="11">${name}</text>`;
    }

    svg += '\n</svg>';

    return {
      format: 'chart',
      data: svg,
      filename: 'chart.svg',
      mimeType: 'image/svg+xml',
      size: new Blob([svg]).size
    };
  }

  /**
   * Export trajectory to path data
   */
  static exportTrajectory(
    positions: Array<{ time: number; position: Vector3 }>,
    format: 'svg' | 'geojson' | 'csv' = 'svg'
  ): ExportResult {
    if (format === 'svg') {
      // Project 3D to 2D (XZ plane as top-down view)
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

      let pathD = '';
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
        format: 'chart',
        data: svg,
        filename: 'trajectory.svg',
        mimeType: 'image/svg+xml',
        size: new Blob([svg]).size
      };
    } else if (format === 'geojson') {
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: positions.map(p => [p.position.x, p.position.z, p.position.y])
        },
        properties: {
          times: positions.map(p => p.time)
        }
      };

      const jsonString = JSON.stringify(geojson, null, 2);
      return {
        format: 'json',
        data: jsonString,
        filename: 'trajectory.geojson',
        mimeType: 'application/geo+json',
        size: new Blob([jsonString]).size
      };
    } else {
      const lines = ['time,x,y,z'];
      for (const p of positions) {
        lines.push(`${p.time},${p.position.x},${p.position.y},${p.position.z}`);
      }
      const csvString = lines.join('\n');
      return {
        format: 'csv',
        data: csvString,
        filename: 'trajectory.csv',
        mimeType: 'text/csv',
        size: new Blob([csvString]).size
      };
    }
  }
}

export default Exporter;
