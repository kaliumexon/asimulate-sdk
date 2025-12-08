/**
 * ASIMULATE SDK - Import Module
 * Import 3D models, recording data, and external formats
 */

import { 
  Vector3, 
  Quaternion,
  ObjectConfig,
  RecordingData,
  ImportFormat
} from '../types';

export interface MeshData {
  vertices: Float32Array;
  indices: Uint32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
  boundingBox: {
    min: Vector3;
    max: Vector3;
  };
  center: Vector3;
  volume: number;
}

export interface ImportedModel {
  name: string;
  meshes: MeshData[];
  nodes: Array<{
    name: string;
    meshIndex?: number;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    children: number[];
  }>;
  materials: Array<{
    name: string;
    color?: { r: number; g: number; b: number; a: number };
    roughness?: number;
    metallic?: number;
  }>;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

export class Importer {

  /**
   * Import from various formats
   */
  static async import(
    data: string | ArrayBuffer,
    format: ImportFormat
  ): Promise<ParseResult<ImportedModel | RecordingData | ObjectConfig[]>> {
    switch (format) {
      case 'obj':
        return this.parseOBJ(data as string);
      case 'gltf':
      case 'glb':
        return this.parseGLTF(data);
      case 'stl':
        return this.parseSTL(data);
      case 'fbx':
        return { success: false, errors: ['FBX format requires external library'], warnings: [] };
      case 'json':
        return this.parseJSON(data as string);
      case 'csv':
        return this.parseCSV(data as string);
      default:
        return { success: false, errors: [`Unsupported format: ${format}`], warnings: [] };
    }
  }

  /**
   * Parse OBJ file format
   */
  static parseOBJ(objString: string): ParseResult<ImportedModel> {
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const vertexPositions: number[][] = [];
    const vertexNormals: number[][] = [];
    const vertexUVs: number[][] = [];

    const lines = objString.split('\n');
    let currentName = 'default';

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim();
      if (!line || line.startsWith('#')) continue;

      const parts = line.split(/\s+/);
      const cmd = parts[0];

      try {
        switch (cmd) {
          case 'o':
          case 'g':
            currentName = parts[1] || 'unnamed';
            break;

          case 'v': // Vertex position
            vertexPositions.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;

          case 'vn': // Vertex normal
            vertexNormals.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;

          case 'vt': // Texture coordinate
            vertexUVs.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]) || 0
            ]);
            break;

          case 'f': // Face
            const faceIndices = parts.slice(1).map(part => {
              const [vIdx, vtIdx, vnIdx] = part.split('/').map(s => s ? parseInt(s) - 1 : -1);
              return { vIdx, vtIdx, vnIdx };
            });

            // Triangulate face (fan triangulation)
            for (let i = 1; i < faceIndices.length - 1; i++) {
              for (const idx of [0, i, i + 1]) {
                const { vIdx, vtIdx, vnIdx } = faceIndices[idx];
                
                if (vIdx >= 0 && vIdx < vertexPositions.length) {
                  vertices.push(...vertexPositions[vIdx]);
                }

                if (vnIdx >= 0 && vnIdx < vertexNormals.length) {
                  normals.push(...vertexNormals[vnIdx]);
                }

                if (vtIdx >= 0 && vtIdx < vertexUVs.length) {
                  uvs.push(...vertexUVs[vtIdx]);
                }

                indices.push(indices.length);
              }
            }
            break;

          case 'mtllib':
          case 'usemtl':
            warnings.push(`Material references not fully supported: ${line}`);
            break;
        }
      } catch (e) {
        errors.push(`Error parsing line ${lineNum + 1}: ${line}`);
      }
    }

    if (vertices.length === 0) {
      return { success: false, errors: ['No vertices found in OBJ file'], warnings };
    }

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(vertices);
    const center = {
      x: (boundingBox.min.x + boundingBox.max.x) / 2,
      y: (boundingBox.min.y + boundingBox.max.y) / 2,
      z: (boundingBox.min.z + boundingBox.max.z) / 2
    };

    // Estimate volume from bounding box
    const volume = (boundingBox.max.x - boundingBox.min.x) *
                   (boundingBox.max.y - boundingBox.min.y) *
                   (boundingBox.max.z - boundingBox.min.z);

    const meshData: MeshData = {
      vertices: new Float32Array(vertices),
      indices: new Uint32Array(indices),
      normals: normals.length > 0 ? new Float32Array(normals) : undefined,
      uvs: uvs.length > 0 ? new Float32Array(uvs) : undefined,
      boundingBox,
      center,
      volume
    };

    return {
      success: true,
      data: {
        name: currentName,
        meshes: [meshData],
        nodes: [{
          name: currentName,
          meshIndex: 0,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 },
          children: []
        }],
        materials: []
      },
      errors,
      warnings
    };
  }

  /**
   * Parse glTF/GLB format
   */
  static parseGLTF(data: string | ArrayBuffer): ParseResult<ImportedModel> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      let gltf: any;
      let buffers: ArrayBuffer[] = [];

      if (typeof data === 'string') {
        // JSON glTF
        gltf = JSON.parse(data);
      } else {
        // Binary GLB
        const view = new DataView(data);
        const magic = view.getUint32(0, true);
        
        if (magic !== 0x46546C67) { // 'glTF'
          return { success: false, errors: ['Invalid GLB magic number'], warnings };
        }

        const version = view.getUint32(4, true);
        if (version !== 2) {
          warnings.push(`GLB version ${version} may not be fully supported`);
        }

        // Parse chunks
        let offset = 12;
        while (offset < data.byteLength) {
          const chunkLength = view.getUint32(offset, true);
          const chunkType = view.getUint32(offset + 4, true);
          const chunkData = data.slice(offset + 8, offset + 8 + chunkLength);

          if (chunkType === 0x4E4F534A) { // 'JSON'
            const decoder = new TextDecoder();
            gltf = JSON.parse(decoder.decode(chunkData));
          } else if (chunkType === 0x004E4942) { // 'BIN'
            buffers.push(chunkData);
          }

          offset += 8 + chunkLength;
        }
      }

      if (!gltf) {
        return { success: false, errors: ['Failed to parse glTF data'], warnings };
      }

      // Parse meshes
      const meshes: MeshData[] = [];
      
      for (const mesh of gltf.meshes || []) {
        for (const primitive of mesh.primitives || []) {
          const positions = this.getAccessorData(gltf, primitive.attributes?.POSITION, buffers);
          const indices = this.getAccessorData(gltf, primitive.indices, buffers);
          const normals = this.getAccessorData(gltf, primitive.attributes?.NORMAL, buffers);
          
          if (positions) {
            const boundingBox = this.calculateBoundingBox(Array.from(positions));
            const center = {
              x: (boundingBox.min.x + boundingBox.max.x) / 2,
              y: (boundingBox.min.y + boundingBox.max.y) / 2,
              z: (boundingBox.min.z + boundingBox.max.z) / 2
            };

            meshes.push({
              vertices: positions,
              indices: indices || new Uint32Array(0),
              normals: normals || undefined,
              boundingBox,
              center,
              volume: this.estimateMeshVolume(positions, indices)
            });
          }
        }
      }

      // Parse nodes
      const nodes = (gltf.nodes || []).map((node: any, i: number) => ({
        name: node.name || `node_${i}`,
        meshIndex: node.mesh,
        position: node.translation ? { x: node.translation[0], y: node.translation[1], z: node.translation[2] } : { x: 0, y: 0, z: 0 },
        rotation: node.rotation ? { x: node.rotation[0], y: node.rotation[1], z: node.rotation[2], w: node.rotation[3] } : { x: 0, y: 0, z: 0, w: 1 },
        scale: node.scale ? { x: node.scale[0], y: node.scale[1], z: node.scale[2] } : { x: 1, y: 1, z: 1 },
        children: node.children || []
      }));

      // Parse materials
      const materials = (gltf.materials || []).map((mat: any, i: number) => ({
        name: mat.name || `material_${i}`,
        color: mat.pbrMetallicRoughness?.baseColorFactor 
          ? { r: mat.pbrMetallicRoughness.baseColorFactor[0], g: mat.pbrMetallicRoughness.baseColorFactor[1], b: mat.pbrMetallicRoughness.baseColorFactor[2], a: mat.pbrMetallicRoughness.baseColorFactor[3] }
          : undefined,
        roughness: mat.pbrMetallicRoughness?.roughnessFactor,
        metallic: mat.pbrMetallicRoughness?.metallicFactor
      }));

      return {
        success: true,
        data: {
          name: gltf.asset?.extras?.name || 'model',
          meshes,
          nodes,
          materials
        },
        errors,
        warnings
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse glTF: ${e}`], warnings };
    }
  }

  private static getAccessorData(
    gltf: any,
    accessorIndex: number | undefined,
    buffers: ArrayBuffer[]
  ): Float32Array | Uint32Array | null {
    if (accessorIndex === undefined) return null;

    const accessor = gltf.accessors?.[accessorIndex];
    if (!accessor) return null;

    const bufferView = gltf.bufferViews?.[accessor.bufferView];
    if (!bufferView) return null;

    const buffer = buffers[bufferView.buffer] || null;
    if (!buffer) {
      // Try base64 embedded buffer
      const bufferDef = gltf.buffers?.[bufferView.buffer];
      if (bufferDef?.uri?.startsWith('data:')) {
        const base64 = bufferDef.uri.split(',')[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        buffers[bufferView.buffer] = bytes.buffer;
      }
    }

    const finalBuffer = buffers[bufferView.buffer];
    if (!finalBuffer) return null;

    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    
    const componentTypes: Record<number, any> = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    };

    const TypedArray = componentTypes[accessor.componentType];
    if (!TypedArray) return null;

    const typeComponents: Record<string, number> = {
      'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16
    };

    const components = typeComponents[accessor.type] || 1;
    const count = accessor.count * components;

    return new TypedArray(finalBuffer, byteOffset, count);
  }

  /**
   * Parse STL format (ASCII and Binary)
   */
  static parseSTL(data: string | ArrayBuffer): ParseResult<ImportedModel> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      let vertices: number[] = [];
      let normals: number[] = [];

      if (typeof data === 'string') {
        // ASCII STL
        const lines = data.split('\n');
        let currentNormal: number[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('facet normal')) {
            const parts = trimmed.split(/\s+/);
            currentNormal = [parseFloat(parts[2]), parseFloat(parts[3]), parseFloat(parts[4])];
          } else if (trimmed.startsWith('vertex')) {
            const parts = trimmed.split(/\s+/);
            vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
            normals.push(...currentNormal);
          }
        }
      } else {
        // Binary STL
        const view = new DataView(data);
        
        // Skip 80-byte header
        const numTriangles = view.getUint32(80, true);
        let offset = 84;

        for (let i = 0; i < numTriangles; i++) {
          // Normal
          const nx = view.getFloat32(offset, true);
          const ny = view.getFloat32(offset + 4, true);
          const nz = view.getFloat32(offset + 8, true);
          offset += 12;

          // 3 vertices
          for (let v = 0; v < 3; v++) {
            vertices.push(
              view.getFloat32(offset, true),
              view.getFloat32(offset + 4, true),
              view.getFloat32(offset + 8, true)
            );
            normals.push(nx, ny, nz);
            offset += 12;
          }

          // Skip attribute byte count
          offset += 2;
        }
      }

      if (vertices.length === 0) {
        return { success: false, errors: ['No vertices found in STL file'], warnings };
      }

      // Generate indices
      const indices = new Uint32Array(vertices.length / 3);
      for (let i = 0; i < indices.length; i++) {
        indices[i] = i;
      }

      const boundingBox = this.calculateBoundingBox(vertices);
      const center = {
        x: (boundingBox.min.x + boundingBox.max.x) / 2,
        y: (boundingBox.min.y + boundingBox.max.y) / 2,
        z: (boundingBox.min.z + boundingBox.max.z) / 2
      };

      return {
        success: true,
        data: {
          name: 'stl_model',
          meshes: [{
            vertices: new Float32Array(vertices),
            indices,
            normals: new Float32Array(normals),
            boundingBox,
            center,
            volume: this.estimateMeshVolume(new Float32Array(vertices), indices)
          }],
          nodes: [{
            name: 'root',
            meshIndex: 0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 },
            children: []
          }],
          materials: []
        },
        errors,
        warnings
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse STL: ${e}`], warnings };
    }
  }

  /**
   * Parse JSON recording data
   */
  static parseJSON(jsonString: string): ParseResult<RecordingData> {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      if (!data.frames || !Array.isArray(data.frames)) {
        return { success: false, errors: ['Invalid recording format: missing frames array'], warnings: [] };
      }

      return {
        success: true,
        data: data as RecordingData,
        errors: [],
        warnings: []
      };
    } catch (e) {
      return { success: false, errors: [`Failed to parse JSON: ${e}`], warnings: [] };
    }
  }

  /**
   * Parse CSV data into object configs
   */
  static parseCSV(csvString: string): ParseResult<ObjectConfig[]> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const objects: ObjectConfig[] = [];

    try {
      const lines = csvString.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        return { success: false, errors: ['CSV must have header and at least one data row'], warnings };
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((h, j) => {
          row[h] = values[j] || '';
        });

        try {
          const config: ObjectConfig = {
            type: (row.type as any) || 'sphere',
            position: {
              x: parseFloat(row.x || row.position_x || '0'),
              y: parseFloat(row.y || row.position_y || '0'),
              z: parseFloat(row.z || row.position_z || '0')
            },
            mass: parseFloat(row.mass || '1'),
            radius: row.radius ? parseFloat(row.radius) : undefined,
            width: row.width ? parseFloat(row.width) : undefined,
            height: row.height ? parseFloat(row.height) : undefined,
            depth: row.depth ? parseFloat(row.depth) : undefined
          };

          objects.push(config);
        } catch (e) {
          warnings.push(`Error parsing row ${i + 1}`);
        }
      }

      return { success: true, data: objects, errors, warnings };
    } catch (e) {
      return { success: false, errors: [`Failed to parse CSV: ${e}`], warnings };
    }
  }

  /**
   * Calculate bounding box from vertex array
   */
  private static calculateBoundingBox(vertices: number[] | Float32Array): { min: Vector3; max: Vector3 } {
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };

    for (let i = 0; i < vertices.length; i += 3) {
      min.x = Math.min(min.x, vertices[i]);
      min.y = Math.min(min.y, vertices[i + 1]);
      min.z = Math.min(min.z, vertices[i + 2]);
      max.x = Math.max(max.x, vertices[i]);
      max.y = Math.max(max.y, vertices[i + 1]);
      max.z = Math.max(max.z, vertices[i + 2]);
    }

    return { min, max };
  }

  /**
   * Estimate mesh volume using signed tetrahedra
   */
  private static estimateMeshVolume(
    vertices: Float32Array,
    indices: Uint32Array | null
  ): number {
    if (!indices || indices.length < 3) {
      // Estimate from bounding box
      const bb = this.calculateBoundingBox(Array.from(vertices));
      return (bb.max.x - bb.min.x) * (bb.max.y - bb.min.y) * (bb.max.z - bb.min.z);
    }

    let volume = 0;

    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;

      const v0 = { x: vertices[i0], y: vertices[i0 + 1], z: vertices[i0 + 2] };
      const v1 = { x: vertices[i1], y: vertices[i1 + 1], z: vertices[i1 + 2] };
      const v2 = { x: vertices[i2], y: vertices[i2 + 1], z: vertices[i2 + 2] };

      // Signed volume of tetrahedron from origin
      volume += (
        v0.x * (v1.y * v2.z - v2.y * v1.z) -
        v1.x * (v0.y * v2.z - v2.y * v0.z) +
        v2.x * (v0.y * v1.z - v1.y * v0.z)
      ) / 6;
    }

    return Math.abs(volume);
  }

  /**
   * Convert imported model to physics object configs
   */
  static modelToPhysicsObjects(
    model: ImportedModel,
    options: {
      density?: number;
      friction?: number;
      restitution?: number;
      convexDecomposition?: boolean;
    } = {}
  ): ObjectConfig[] {
    const configs: ObjectConfig[] = [];
    const density = options.density ?? 1;
    const friction = options.friction ?? 0.5;
    const restitution = options.restitution ?? 0.3;

    for (const node of model.nodes) {
      if (node.meshIndex !== undefined && node.meshIndex < model.meshes.length) {
        const mesh = model.meshes[node.meshIndex];
        const mass = mesh.volume * density;

        configs.push({
          type: 'mesh',
          position: node.position,
          rotation: node.rotation,
          scale: node.scale,
          mass,
          friction,
          restitution,
          meshData: {
            vertices: Array.from(mesh.vertices),
            indices: Array.from(mesh.indices),
            normals: mesh.normals ? Array.from(mesh.normals) : undefined
          }
        });
      }
    }

    return configs;
  }
}

export default Importer;
