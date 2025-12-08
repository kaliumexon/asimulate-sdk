/**
 * ASIMULATE SDK - Analysis Module
 * Time series analysis, FFT, statistics, and peak finding
 */

import { 
  TimeSeries, 
  Statistics, 
  FrequencySpectrum, 
  PeakResult,
  Vector3 
} from '../types';

export interface AnalysisResult {
  timeSeries: TimeSeries;
  statistics: Statistics;
  peaks: PeakResult[];
  frequency?: FrequencySpectrum;
}

export interface CorrelationResult {
  correlation: number;
  lag: number;
  pValue: number;
}

export interface TrendResult {
  slope: number;
  intercept: number;
  rSquared: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class Analysis {
  
  // ==================== Statistics ====================

  /**
   * Calculate basic statistics for a data series
   */
  static statistics(data: number[]): Statistics {
    if (data.length === 0) {
      return {
        count: 0,
        mean: 0,
        std: 0,
        min: 0,
        max: 0,
        median: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0,
        sum: 0,
        range: 0
      };
    }

    const n = data.length;
    const sorted = [...data].sort((a, b) => a - b);
    
    // Basic stats
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    
    // Median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // Variance and standard deviation
    const squaredDiffs = data.map(x => (x - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(variance);

    // Skewness (third standardized moment)
    const cubedDiffs = data.map(x => ((x - mean) / std) ** 3);
    const skewness = std > 0 ? cubedDiffs.reduce((a, b) => a + b, 0) / n : 0;

    // Kurtosis (fourth standardized moment) - excess kurtosis
    const fourthDiffs = data.map(x => ((x - mean) / std) ** 4);
    const kurtosis = std > 0 ? fourthDiffs.reduce((a, b) => a + b, 0) / n - 3 : 0;

    return {
      count: n,
      mean,
      std,
      min,
      max,
      median,
      variance,
      skewness,
      kurtosis,
      sum,
      range
    };
  }

  /**
   * Calculate percentile
   */
  static percentile(data: number[], p: number): number {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Calculate quartiles
   */
  static quartiles(data: number[]): { q1: number; q2: number; q3: number; iqr: number } {
    const q1 = this.percentile(data, 25);
    const q2 = this.percentile(data, 50);
    const q3 = this.percentile(data, 75);
    return { q1, q2, q3, iqr: q3 - q1 };
  }

  /**
   * Detect outliers using IQR method
   */
  static detectOutliers(data: number[], threshold: number = 1.5): number[] {
    const { q1, q3, iqr } = this.quartiles(data);
    const lower = q1 - threshold * iqr;
    const upper = q3 + threshold * iqr;
    return data.filter(x => x < lower || x > upper);
  }

  // ==================== Time Series ====================

  /**
   * Create time series from data
   */
  static createTimeSeries(
    times: number[],
    values: number[],
    name: string = 'series'
  ): TimeSeries {
    if (times.length !== values.length) {
      throw new Error('Times and values must have same length');
    }

    return {
      name,
      times,
      values,
      statistics: this.statistics(values)
    };
  }

  /**
   * Resample time series to uniform intervals
   */
  static resample(series: TimeSeries, interval: number): TimeSeries {
    if (series.times.length === 0) return series;

    const startTime = series.times[0];
    const endTime = series.times[series.times.length - 1];
    const newTimes: number[] = [];
    const newValues: number[] = [];

    for (let t = startTime; t <= endTime; t += interval) {
      newTimes.push(t);
      newValues.push(this.interpolate(series, t));
    }

    return this.createTimeSeries(newTimes, newValues, series.name);
  }

  /**
   * Interpolate value at specific time
   */
  static interpolate(series: TimeSeries, time: number): number {
    const { times, values } = series;
    
    if (time <= times[0]) return values[0];
    if (time >= times[times.length - 1]) return values[values.length - 1];

    // Binary search for surrounding points
    let left = 0;
    let right = times.length - 1;
    
    while (right - left > 1) {
      const mid = Math.floor((left + right) / 2);
      if (times[mid] <= time) {
        left = mid;
      } else {
        right = mid;
      }
    }

    // Linear interpolation
    const t = (time - times[left]) / (times[right] - times[left]);
    return values[left] + t * (values[right] - values[left]);
  }

  /**
   * Calculate derivative of time series
   */
  static derivative(series: TimeSeries): TimeSeries {
    const { times, values } = series;
    if (times.length < 2) {
      return this.createTimeSeries([], [], `d${series.name}/dt`);
    }

    const newTimes: number[] = [];
    const newValues: number[] = [];

    for (let i = 0; i < times.length - 1; i++) {
      const dt = times[i + 1] - times[i];
      const dv = values[i + 1] - values[i];
      newTimes.push((times[i] + times[i + 1]) / 2);
      newValues.push(dv / dt);
    }

    return this.createTimeSeries(newTimes, newValues, `d${series.name}/dt`);
  }

  /**
   * Calculate integral of time series
   */
  static integral(series: TimeSeries): TimeSeries {
    const { times, values } = series;
    if (times.length === 0) {
      return this.createTimeSeries([], [], `∫${series.name}dt`);
    }

    const newTimes = [...times];
    const newValues: number[] = [0];

    for (let i = 1; i < times.length; i++) {
      const dt = times[i] - times[i - 1];
      const avgValue = (values[i] + values[i - 1]) / 2;
      newValues.push(newValues[i - 1] + avgValue * dt);
    }

    return this.createTimeSeries(newTimes, newValues, `∫${series.name}dt`);
  }

  /**
   * Moving average filter
   */
  static movingAverage(series: TimeSeries, windowSize: number): TimeSeries {
    const { times, values } = series;
    if (windowSize < 1 || values.length < windowSize) {
      return series;
    }

    const newValues: number[] = [];
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= windowSize) {
        sum -= values[i - windowSize];
      }
      const count = Math.min(i + 1, windowSize);
      newValues.push(sum / count);
    }

    return this.createTimeSeries(times, newValues, `${series.name}_ma${windowSize}`);
  }

  /**
   * Exponential moving average
   */
  static exponentialMovingAverage(series: TimeSeries, alpha: number): TimeSeries {
    const { times, values } = series;
    if (values.length === 0) return series;

    const newValues: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      newValues.push(alpha * values[i] + (1 - alpha) * newValues[i - 1]);
    }

    return this.createTimeSeries(times, newValues, `${series.name}_ema`);
  }

  /**
   * Low-pass filter (Butterworth-style)
   */
  static lowPassFilter(series: TimeSeries, cutoffFreq: number): TimeSeries {
    const { times, values } = series;
    if (values.length < 2) return series;

    const dt = (times[times.length - 1] - times[0]) / (times.length - 1);
    const rc = 1 / (2 * Math.PI * cutoffFreq);
    const alpha = dt / (rc + dt);

    const newValues: number[] = [values[0]];
    
    for (let i = 1; i < values.length; i++) {
      newValues.push(newValues[i - 1] + alpha * (values[i] - newValues[i - 1]));
    }

    return this.createTimeSeries(times, newValues, `${series.name}_lpf`);
  }

  /**
   * High-pass filter
   */
  static highPassFilter(series: TimeSeries, cutoffFreq: number): TimeSeries {
    const lowPassed = this.lowPassFilter(series, cutoffFreq);
    const newValues = series.values.map((v, i) => v - lowPassed.values[i]);
    return this.createTimeSeries(series.times, newValues, `${series.name}_hpf`);
  }

  // ==================== Peak Detection ====================

  /**
   * Find peaks in data
   */
  static findPeaks(
    series: TimeSeries,
    options: {
      minHeight?: number;
      minProminence?: number;
      minDistance?: number;
      threshold?: number;
    } = {}
  ): PeakResult[] {
    const { times, values } = series;
    const peaks: PeakResult[] = [];

    const minHeight = options.minHeight ?? -Infinity;
    const minProminence = options.minProminence ?? 0;
    const minDistance = options.minDistance ?? 1;
    const threshold = options.threshold ?? 0;

    // Find local maxima
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        if (values[i] >= minHeight) {
          const prominence = this.calculateProminence(values, i);
          if (prominence >= minProminence) {
            const width = this.calculatePeakWidth(values, i, values[i] - prominence / 2);
            peaks.push({
              index: i,
              time: times[i],
              value: values[i],
              prominence,
              width
            });
          }
        }
      }
    }

    // Filter by minimum distance
    if (minDistance > 1) {
      const filtered: PeakResult[] = [];
      peaks.sort((a, b) => b.value - a.value); // Sort by value descending
      
      for (const peak of peaks) {
        const tooClose = filtered.some(p => Math.abs(p.index - peak.index) < minDistance);
        if (!tooClose) {
          filtered.push(peak);
        }
      }
      
      return filtered.sort((a, b) => a.index - b.index);
    }

    return peaks;
  }

  /**
   * Find valleys (local minima)
   */
  static findValleys(series: TimeSeries, options: {} = {}): PeakResult[] {
    const invertedValues = series.values.map(v => -v);
    const invertedSeries = this.createTimeSeries(series.times, invertedValues, series.name);
    const peaks = this.findPeaks(invertedSeries, options);
    
    return peaks.map(p => ({
      ...p,
      value: -p.value
    }));
  }

  private static calculateProminence(values: number[], peakIndex: number): number {
    const peakValue = values[peakIndex];
    
    // Find the lowest point between this peak and higher peaks on each side
    let leftMin = peakValue;
    for (let i = peakIndex - 1; i >= 0; i--) {
      if (values[i] > peakValue) break;
      leftMin = Math.min(leftMin, values[i]);
    }

    let rightMin = peakValue;
    for (let i = peakIndex + 1; i < values.length; i++) {
      if (values[i] > peakValue) break;
      rightMin = Math.min(rightMin, values[i]);
    }

    return peakValue - Math.max(leftMin, rightMin);
  }

  private static calculatePeakWidth(values: number[], peakIndex: number, heightThreshold: number): number {
    let left = peakIndex;
    let right = peakIndex;

    while (left > 0 && values[left] > heightThreshold) left--;
    while (right < values.length - 1 && values[right] > heightThreshold) right++;

    return right - left;
  }

  // ==================== Frequency Analysis ====================

  /**
   * Compute FFT of time series
   */
  static fft(series: TimeSeries): FrequencySpectrum {
    const { times, values } = series;
    
    // Pad to power of 2
    const n = Math.pow(2, Math.ceil(Math.log2(values.length)));
    const paddedValues = [...values];
    while (paddedValues.length < n) {
      paddedValues.push(0);
    }

    // Compute FFT
    const { real, imag } = this.computeFFT(paddedValues);

    // Calculate frequencies and magnitudes
    const dt = (times[times.length - 1] - times[0]) / (times.length - 1);
    const sampleRate = 1 / dt;
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    const phases: number[] = [];

    const halfN = n / 2;
    for (let i = 0; i <= halfN; i++) {
      frequencies.push((i * sampleRate) / n);
      magnitudes.push(Math.sqrt(real[i] ** 2 + imag[i] ** 2) / n);
      phases.push(Math.atan2(imag[i], real[i]));
    }

    // Find dominant frequency
    let maxMag = 0;
    let dominantIndex = 0;
    for (let i = 1; i < magnitudes.length; i++) {
      if (magnitudes[i] > maxMag) {
        maxMag = magnitudes[i];
        dominantIndex = i;
      }
    }

    return {
      frequencies,
      magnitudes,
      phases,
      dominantFrequency: frequencies[dominantIndex],
      dominantMagnitude: magnitudes[dominantIndex],
      sampleRate
    };
  }

  private static computeFFT(values: number[]): { real: number[]; imag: number[] } {
    const n = values.length;
    
    if (n <= 1) {
      return { real: [...values], imag: new Array(n).fill(0) };
    }

    // Bit reversal permutation
    const real = new Array(n).fill(0);
    const imag = new Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      let j = 0;
      let temp = i;
      for (let k = 0; k < Math.log2(n); k++) {
        j = (j << 1) | (temp & 1);
        temp >>= 1;
      }
      real[j] = values[i];
    }

    // Cooley-Tukey iterative FFT
    for (let size = 2; size <= n; size *= 2) {
      const halfSize = size / 2;
      const step = (2 * Math.PI) / size;

      for (let i = 0; i < n; i += size) {
        for (let j = 0; j < halfSize; j++) {
          const angle = -step * j;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const idx1 = i + j;
          const idx2 = i + j + halfSize;

          const tReal = cos * real[idx2] - sin * imag[idx2];
          const tImag = sin * real[idx2] + cos * imag[idx2];

          real[idx2] = real[idx1] - tReal;
          imag[idx2] = imag[idx1] - tImag;
          real[idx1] = real[idx1] + tReal;
          imag[idx1] = imag[idx1] + tImag;
        }
      }
    }

    return { real, imag };
  }

  /**
   * Power spectral density
   */
  static powerSpectralDensity(series: TimeSeries): FrequencySpectrum {
    const spectrum = this.fft(series);
    spectrum.magnitudes = spectrum.magnitudes.map(m => m * m);
    return spectrum;
  }

  // ==================== Correlation ====================

  /**
   * Cross-correlation between two series
   */
  static crossCorrelation(series1: TimeSeries, series2: TimeSeries): CorrelationResult[] {
    const v1 = series1.values;
    const v2 = series2.values;
    const n = Math.min(v1.length, v2.length);
    
    const mean1 = v1.reduce((a, b) => a + b, 0) / n;
    const mean2 = v2.reduce((a, b) => a + b, 0) / n;
    
    const std1 = Math.sqrt(v1.reduce((a, x) => a + (x - mean1) ** 2, 0) / n);
    const std2 = Math.sqrt(v2.reduce((a, x) => a + (x - mean2) ** 2, 0) / n);

    const results: CorrelationResult[] = [];
    const maxLag = Math.floor(n / 2);

    for (let lag = -maxLag; lag <= maxLag; lag++) {
      let sum = 0;
      let count = 0;

      for (let i = 0; i < n; i++) {
        const j = i + lag;
        if (j >= 0 && j < n) {
          sum += (v1[i] - mean1) * (v2[j] - mean2);
          count++;
        }
      }

      const correlation = count > 0 ? sum / (count * std1 * std2) : 0;
      
      // Approximate p-value using Fisher transformation
      const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
      const se = 1 / Math.sqrt(count - 3);
      const pValue = 2 * (1 - this.normalCDF(Math.abs(z) / se));

      results.push({ correlation, lag, pValue });
    }

    return results;
  }

  /**
   * Auto-correlation
   */
  static autoCorrelation(series: TimeSeries): CorrelationResult[] {
    return this.crossCorrelation(series, series);
  }

  /**
   * Pearson correlation coefficient
   */
  static pearsonCorrelation(series1: TimeSeries, series2: TimeSeries): number {
    const v1 = series1.values;
    const v2 = series2.values;
    const n = Math.min(v1.length, v2.length);

    const mean1 = v1.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const mean2 = v2.slice(0, n).reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den1 = 0;
    let den2 = 0;

    for (let i = 0; i < n; i++) {
      const d1 = v1[i] - mean1;
      const d2 = v2[i] - mean2;
      num += d1 * d2;
      den1 += d1 * d1;
      den2 += d2 * d2;
    }

    return num / Math.sqrt(den1 * den2);
  }

  private static normalCDF(x: number): number {
    // Approximation of normal CDF
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  // ==================== Trend Analysis ====================

  /**
   * Linear regression / trend analysis
   */
  static linearTrend(series: TimeSeries): TrendResult {
    const { times, values } = series;
    const n = times.length;

    if (n < 2) {
      return { slope: 0, intercept: 0, rSquared: 0, trend: 'stable' };
    }

    const sumX = times.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = times.reduce((acc, x, i) => acc + x * values[i], 0);
    const sumX2 = times.reduce((a, x) => a + x * x, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
    const intercept = meanY - slope * meanX;

    // R-squared
    const predicted = times.map(t => slope * t + intercept);
    const ssRes = values.reduce((acc, y, i) => acc + (y - predicted[i]) ** 2, 0);
    const ssTot = values.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
    const rSquared = 1 - ssRes / ssTot;

    // Determine trend direction
    const threshold = 0.001;
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (slope > threshold) {
      trend = 'increasing';
    } else if (slope < -threshold) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return { slope, intercept, rSquared, trend };
  }

  /**
   * Polynomial fit
   */
  static polynomialFit(series: TimeSeries, degree: number): number[] {
    const { times, values } = series;
    const n = times.length;

    if (n <= degree) {
      throw new Error('Not enough data points for polynomial degree');
    }

    // Build Vandermonde matrix
    const X: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j <= degree; j++) {
        row.push(Math.pow(times[i], j));
      }
      X.push(row);
    }

    // Solve using normal equations: (X^T * X) * coeffs = X^T * y
    const XT = this.transpose(X);
    const XTX = this.matmul(XT, X);
    const XTy = this.matvec(XT, values);
    
    // Solve linear system using Gaussian elimination
    return this.solve(XTX, XTy);
  }

  private static transpose(A: number[][]): number[][] {
    const rows = A.length;
    const cols = A[0].length;
    const result: number[][] = [];
    
    for (let j = 0; j < cols; j++) {
      const row: number[] = [];
      for (let i = 0; i < rows; i++) {
        row.push(A[i][j]);
      }
      result.push(row);
    }
    
    return result;
  }

  private static matmul(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0].length;
    const colsB = B[0].length;
    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
      const row: number[] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) {
          sum += A[i][k] * B[k][j];
        }
        row.push(sum);
      }
      result.push(row);
    }

    return result;
  }

  private static matvec(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }

  private static solve(A: number[][], b: number[]): number[] {
    const n = A.length;
    const aug = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Partial pivoting
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

      // Eliminate
      for (let k = i + 1; k < n; k++) {
        const factor = aug[k][i] / aug[i][i];
        for (let j = i; j <= n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= aug[i][j] * x[j];
      }
      x[i] /= aug[i][i];
    }

    return x;
  }

  // ==================== Vector Analysis ====================

  /**
   * Analyze 3D trajectory
   */
  static analyzeTrajectory(
    positions: Array<{ time: number; position: Vector3 }>
  ): {
    totalDistance: number;
    displacement: Vector3;
    averageSpeed: number;
    maxSpeed: number;
    curvature: number[];
  } {
    if (positions.length < 2) {
      return {
        totalDistance: 0,
        displacement: { x: 0, y: 0, z: 0 },
        averageSpeed: 0,
        maxSpeed: 0,
        curvature: []
      };
    }

    let totalDistance = 0;
    const speeds: number[] = [];
    const curvature: number[] = [];

    for (let i = 1; i < positions.length; i++) {
      const p1 = positions[i - 1].position;
      const p2 = positions[i].position;
      const dt = positions[i].time - positions[i - 1].time;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dz = p2.z - p1.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      totalDistance += distance;
      speeds.push(dt > 0 ? distance / dt : 0);
    }

    // Calculate curvature at each point (except endpoints)
    for (let i = 1; i < positions.length - 1; i++) {
      const p0 = positions[i - 1].position;
      const p1 = positions[i].position;
      const p2 = positions[i + 1].position;

      // Approximate curvature using Menger curvature
      const a = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2 + (p1.z - p0.z) ** 2);
      const b = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2 + (p2.z - p1.z) ** 2);
      const c = Math.sqrt((p2.x - p0.x) ** 2 + (p2.y - p0.y) ** 2 + (p2.z - p0.z) ** 2);

      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      const k = (4 * area) / (a * b * c);
      
      curvature.push(isFinite(k) ? k : 0);
    }

    const first = positions[0].position;
    const last = positions[positions.length - 1].position;
    const displacement = {
      x: last.x - first.x,
      y: last.y - first.y,
      z: last.z - first.z
    };

    const totalTime = positions[positions.length - 1].time - positions[0].time;

    return {
      totalDistance,
      displacement,
      averageSpeed: totalTime > 0 ? totalDistance / totalTime : 0,
      maxSpeed: Math.max(...speeds),
      curvature
    };
  }
}

export default Analysis;
