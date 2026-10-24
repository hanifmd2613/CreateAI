import { DeliverableSpec, ValidationCheck, ValidationRunResult } from '../types';

export interface MediaMetadata {
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

export function validateDeliverableFile(
  spec: DeliverableSpec,
  metadata: MediaMetadata
): ValidationRunResult {
  const checks: ValidationCheck[] = [];

  // 1. File Type / Format Check
  const extension = metadata.fileName.split('.').pop()?.toUpperCase() || '';
  const expectedFormat = spec.format.toUpperCase();
  const formatMatches = extension === expectedFormat || 
                        (expectedFormat === 'MP4' && (extension === 'MP4' || metadata.fileType.includes('mp4'))) ||
                        (expectedFormat === 'MOV' && (extension === 'MOV' || metadata.fileType.includes('quicktime')));

  checks.push({
    id: 'chk-format',
    name: 'File Format & Container',
    category: 'format',
    expected: spec.format,
    actual: extension || metadata.fileType,
    passed: formatMatches,
    severity: 'strict',
    message: formatMatches 
      ? `Container format matches campaign requirement (${spec.format}).`
      : `File format mismatch. Expected ${spec.format}, but detected .${extension || 'unknown'}.`,
    correctiveAction: formatMatches ? undefined : `Transcode or export file in H.264 / ${spec.format} format before resubmitting.`
  });

  // 2. Aspect Ratio & Orientation Check
  let aspectPassed = false;
  let detectedRatio = 'Unknown';

  if (metadata.width && metadata.height) {
    const ratio = metadata.width / metadata.height;
    if (Math.abs(ratio - (9 / 16)) < 0.05) detectedRatio = '9:16 (Vertical)';
    else if (Math.abs(ratio - (16 / 9)) < 0.05) detectedRatio = '16:9 (Landscape)';
    else if (Math.abs(ratio - 1.0) < 0.05) detectedRatio = '1:1 (Square)';
    else if (Math.abs(ratio - (4 / 5)) < 0.05) detectedRatio = '4:5 (Portrait)';
    else detectedRatio = `${metadata.width}:${metadata.height}`;

    if (spec.aspectRatio === '9:16') {
      aspectPassed = Math.abs(ratio - (9 / 16)) < 0.05;
    } else if (spec.aspectRatio === '16:9') {
      aspectPassed = Math.abs(ratio - (16 / 9)) < 0.05;
    } else if (spec.aspectRatio === '1:1') {
      aspectPassed = Math.abs(ratio - 1.0) < 0.05;
    } else if (spec.aspectRatio === '4:5') {
      aspectPassed = Math.abs(ratio - (4 / 5)) < 0.05;
    }
  }

  checks.push({
    id: 'chk-ratio',
    name: 'Aspect Ratio & Orientation',
    category: 'aspect_ratio',
    expected: `${spec.aspectRatio} (${spec.aspectRatio === '9:16' ? 'Vertical Story/Reel' : spec.aspectRatio === '16:9' ? 'Landscape' : 'Square'})`,
    actual: detectedRatio,
    passed: aspectPassed,
    severity: 'strict',
    message: aspectPassed
      ? `Aspect ratio conforms to ${spec.aspectRatio} campaign specification.`
      : `Aspect ratio mismatch. Expected ${spec.aspectRatio}, but detected ${detectedRatio}.`,
    correctiveAction: aspectPassed ? undefined : `Re-render or crop asset to strictly ${spec.aspectRatio} (e.g. 1080x1920 for 9:16 Reels).`
  });

  // 3. Resolution / Dimensions Check
  let dimensionsPassed = false;
  if (metadata.width && metadata.height) {
    dimensionsPassed = metadata.width >= spec.width && metadata.height >= spec.height;
  }

  checks.push({
    id: 'chk-dimensions',
    name: 'Resolution & Pixel Dimensions',
    category: 'dimensions',
    expected: `Minimum ${spec.width} × ${spec.height} px`,
    actual: metadata.width && metadata.height ? `${metadata.width} × ${metadata.height} px` : 'Unreadable metadata',
    passed: dimensionsPassed,
    severity: 'strict',
    message: dimensionsPassed
      ? `Resolution of ${metadata.width}x${metadata.height} meets high-definition standard.`
      : `Sub-resolution detected. Expected at least ${spec.width}x${spec.height}px, received ${metadata.width || 0}x${metadata.height || 0}px.`,
    correctiveAction: dimensionsPassed ? undefined : `Upscale or export using at least 1080p master dimensions.`
  });

  // 4. Video Duration Check (if video requirement)
  if (spec.targetDurationSeconds) {
    const tolerance = spec.durationToleranceSeconds || 1.5;
    const target = spec.targetDurationSeconds;
    const actualDur = metadata.durationSeconds || 0;
    const durationPassed = Math.abs(actualDur - target) <= tolerance;

    checks.push({
      id: 'chk-duration',
      name: 'Content Run Time / Duration',
      category: 'duration',
      expected: `${target}s (±${tolerance}s tolerance)`,
      actual: actualDur > 0 ? `${actualDur.toFixed(1)}s` : 'Unknown / Non-video',
      passed: durationPassed,
      severity: spec.isStrict ? 'strict' : 'warning',
      message: durationPassed
        ? `Video duration (${actualDur.toFixed(1)}s) is within the acceptable ${target}s target window.`
        : `Duration mismatch. Target is ${target}s (±${tolerance}s), but video runs for ${actualDur.toFixed(1)}s.`,
      correctiveAction: durationPassed ? undefined : `Trim or extend timeline cut to hit the required ${target}s mark.`
    });
  }

  // 5. File Size Limit Check
  const maxBytes = spec.maxFileSizeBytes || (50 * 1024 * 1024); // 50MB default
  const actualBytes = metadata.fileSizeBytes;
  const sizePassed = actualBytes <= maxBytes;

  const actualMB = (actualBytes / (1024 * 1024)).toFixed(1);
  const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);

  checks.push({
    id: 'chk-size',
    name: 'File Size & Bitrate Ceiling',
    category: 'file_size',
    expected: `< ${maxMB} MB`,
    actual: `${actualMB} MB`,
    passed: sizePassed,
    severity: 'warning',
    message: sizePassed
      ? `File size (${actualMB} MB) is well within the ${maxMB} MB upload allowance.`
      : `File size exceeds threshold (${actualMB} MB vs ${maxMB} MB limit).`,
    correctiveAction: sizePassed ? undefined : `Apply H.264 variable bitrate compression to reduce asset payload.`
  });

  // Calculate Overall Status
  const strictFailed = checks.some(c => !c.passed && c.severity === 'strict');
  const warningFailed = checks.some(c => !c.passed && c.severity === 'warning');

  let overallStatus: 'pass' | 'fail' | 'needs_review' = 'pass';
  let summary = 'Deliverable passed all technical compliance checks.';

  if (strictFailed) {
    overallStatus = 'fail';
    const failedChecks = checks.filter(c => !c.passed && c.severity === 'strict');
    summary = `Failed ${failedChecks.length} strict compliance check${failedChecks.length > 1 ? 's' : ''}: ${failedChecks.map(f => f.name).join(', ')}. Revision required.`;
  } else if (warningFailed) {
    overallStatus = 'needs_review';
    summary = 'Passed strict specifications with minor advisory warnings. Brand review recommended.';
  }

  return {
    id: `val-run-${Date.now()}`,
    testedAt: new Date().toISOString(),
    overallStatus,
    checks,
    summary
  };
}

// Browser metadata inspector extracting real video/image properties
export async function extractBrowserMediaMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const isVideo = file.type.includes('video') || file.name.endsWith('.mp4') || file.name.endsWith('.mov');
    const isImage = file.type.includes('image') || file.name.endsWith('.jpg') || file.name.endsWith('.png');

    const basic: MediaMetadata = {
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg')
    };

    if (isVideo && typeof document !== 'undefined') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          ...basic,
          width: video.videoWidth || 1080,
          height: video.videoHeight || 1920,
          durationSeconds: video.duration || 15
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(basic);
      };
    } else if (isImage && typeof document !== 'undefined') {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          ...basic,
          width: img.naturalWidth || 1080,
          height: img.naturalHeight || 1920
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(basic);
      };
    } else {
      resolve(basic);
    }
  });
}
