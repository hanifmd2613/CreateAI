import { Brief, DeliveryCheckResult, SingleDeliveryCheck, DeliveryCheckStatus, MediaDeliverySpecs } from '../types';
import crypto from 'crypto';

export interface ExtractedMediaMetadata {
  format?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  isDecodable: boolean;
  checksumSha256?: string;
  containerBrand?: string;
  parseError?: string;
}

/**
 * Inspects a binary buffer to extract genuine media metadata
 * from image headers (PNG, JPEG, WebP) or video containers (MP4 / ISO-BMFF).
 * Never relies on filename or file extension.
 */
export function inspectBinaryBuffer(buffer: Buffer): ExtractedMediaMetadata {
  if (!buffer || buffer.length < 12) {
    return {
      isDecodable: false,
      parseError: 'File buffer is empty or too small to contain valid media headers.',
    };
  }

  const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const fileSizeBytes = buffer.length;

  // 1. Check for PNG (Magic bytes: 89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    // IHDR chunk starts at byte 12. Length (4) + Type 'IHDR' (4) + Width (4) + Height (4)
    if (buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      const ratio = calculateAspectRatioString(width, height);
      return {
        format: 'png',
        width,
        height,
        aspectRatio: ratio,
        fileSizeBytes,
        isDecodable: true,
        checksumSha256,
      };
    }
  }

  // 2. Check for JPEG (Magic bytes: FF D8)
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      // Baseline SOF0 (0xC0) or Progressive SOF2 (0xC2)
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        const ratio = calculateAspectRatioString(width, height);
        return {
          format: 'jpg',
          width,
          height,
          aspectRatio: ratio,
          fileSizeBytes,
          isDecodable: true,
          checksumSha256,
        };
      }
      const blockLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + blockLength;
    }
  }

  // 3. Check for WebP (RIFF .... WEBP)
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return {
        format: 'webp',
        width,
        height,
        aspectRatio: calculateAspectRatioString(width, height),
        fileSizeBytes,
        isDecodable: true,
        checksumSha256,
      };
    }
    // Basic VP8 / VP8L fallback
    return {
      format: 'webp',
      fileSizeBytes,
      isDecodable: true,
      checksumSha256,
    };
  }

  // 4. Check for MP4 / ISO-BMFF (Bytes 4..8 == 'ftyp')
  if (buffer.length >= 16 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const containerBrand = buffer.toString('ascii', 8, 12).trim();
    let width: number | undefined;
    let height: number | undefined;
    let durationSeconds: number | undefined;

    // Scan top-level boxes for 'moov'
    let offset = 0;
    while (offset + 8 <= buffer.length) {
      const boxSize = buffer.readUInt32BE(offset);
      const boxType = buffer.toString('ascii', offset + 4, offset + 8);

      if (boxSize < 8 || offset + boxSize > buffer.length) {
        break; // Truncated box or EOF
      }

      if (boxType === 'moov') {
        // Search inside moov for mvhd and tkhd
        let moovOffset = offset + 8;
        const moovEnd = offset + boxSize;

        while (moovOffset + 8 <= moovEnd) {
          const subSize = buffer.readUInt32BE(moovOffset);
          const subType = buffer.toString('ascii', moovOffset + 4, moovOffset + 8);

          if (subSize < 8 || moovOffset + subSize > moovEnd) {
            break;
          }

          if (subType === 'mvhd') {
            // Version 0 mvhd: version(1)+flags(3)+creation(4)+mod(4)+timescale(4)+duration(4)
            const version = buffer.readUInt8(moovOffset + 8);
            if (version === 0 && moovOffset + 28 <= moovEnd) {
              const timescale = buffer.readUInt32BE(moovOffset + 20);
              const durationUnits = buffer.readUInt32BE(moovOffset + 24);
              if (timescale > 0) {
                durationSeconds = Math.round((durationUnits / timescale) * 10) / 10;
              }
            }
          }

          if (subType === 'trak') {
            // Search inside trak for tkhd
            let trakOffset = moovOffset + 8;
            const trakEnd = moovOffset + subSize;
            while (trakOffset + 8 <= trakEnd) {
              const trakSubSize = buffer.readUInt32BE(trakOffset);
              const trakSubType = buffer.toString('ascii', trakOffset + 4, trakOffset + 8);
              if (trakSubSize < 8 || trakOffset + trakSubSize > trakEnd) break;

              if (trakSubType === 'tkhd') {
                const version = buffer.readUInt8(trakOffset + 8);
                // In version 0, width & height fixed point 16.16 are at offset 76 and 80 from tkhd start
                const wOffset = version === 0 ? trakOffset + 8 + 76 : trakOffset + 8 + 88;
                if (wOffset + 8 <= trakEnd) {
                  const rawW = buffer.readUInt32BE(wOffset) >> 16;
                  const rawH = buffer.readUInt32BE(wOffset + 4) >> 16;
                  if (rawW > 0 && rawH > 0 && !width) {
                    width = rawW;
                    height = rawH;
                  }
                }
              }
              trakOffset += trakSubSize;
            }
          }

          moovOffset += subSize;
        }
      }

      offset += boxSize;
    }

    const ratio = (width && height) ? calculateAspectRatioString(width, height) : undefined;

    return {
      format: 'mp4',
      containerBrand,
      width,
      height,
      aspectRatio: ratio,
      durationSeconds,
      fileSizeBytes,
      isDecodable: true,
      checksumSha256,
    };
  }

  // Corrupt or unrecognized binary stream
  return {
    isDecodable: false,
    fileSizeBytes,
    checksumSha256,
    parseError: 'Corrupt or unreadable media container. Magic bytes do not match valid PNG, JPEG, WebP, or MP4 containers.',
  };
}

export function calculateAspectRatioString(width: number, height: number): '16:9' | '9:16' | '1:1' | '4:5' | string {
  if (!width || !height) return 'unknown';
  const ratio = width / height;

  if (Math.abs(ratio - (16 / 9)) < 0.05) return '16:9';
  if (Math.abs(ratio - (9 / 16)) < 0.05) return '9:16';
  if (Math.abs(ratio - 1.0) < 0.05) return '1:1';
  if (Math.abs(ratio - (4 / 5)) < 0.05) return '4:5';

  return `${width}:${height}`;
}

export function parseDurationConstraintSeconds(durationStr?: string): number {
  if (!durationStr) return 30;
  const clean = durationStr.toLowerCase().trim();

  // e.g. "0:15" -> 15 seconds
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }

  // e.g. "15s" or "15 seconds"
  const match = clean.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return 30;
}

export function runDeliveryCheck(
  brief: Brief,
  metadata: ExtractedMediaMetadata,
  versionId: string,
  engagementId: string
): DeliveryCheckResult {
  const checks: SingleDeliveryCheck[] = [];
  let failCount = 0;
  let warnCount = 0;

  // 1. Container Decodability Check
  if (!metadata.isDecodable) {
    checks.push({
      id: 'chk-decodable',
      name: 'Media Decodability & Integrity',
      requirement: 'Valid, uncorrupted media stream (MP4/PNG/JPG/WEBP)',
      actual: metadata.parseError || 'Corrupt stream',
      status: 'UNVERIFIABLE',
      message: 'Uploaded file cannot be decoded by binary parser. Magic header bytes are missing or damaged.',
      isBlocking: true,
    });
    return {
      id: `chk-res-${Date.now()}`,
      versionId,
      engagementId,
      overallStatus: 'UNVERIFIABLE',
      checks,
      extractedMetadata: metadata,
      inspectedAt: new Date().toISOString(),
      actionableGuidance: 'Re-encode and upload the asset using standard MP4/H.264 or PNG container settings.'
    };
  }

  checks.push({
    id: 'chk-decodable',
    name: 'Media Decodability & Container Integrity',
    requirement: 'Valid, uncorrupted media stream',
    actual: `${(metadata.format || 'unknown').toUpperCase()} (Container: ${metadata.containerBrand || 'Standard'})`,
    status: 'PASS',
    message: 'Media header is clean, intact, and decodable.',
    isBlocking: false,
  });

  // 2. Aspect Ratio & Orientation Check
  const targetRatio = brief.targetSpecs?.aspectRatio || brief.aspectRatio || '16:9';
  if (metadata.aspectRatio) {
    const isRatioMatch = metadata.aspectRatio === targetRatio;
    if (isRatioMatch) {
      checks.push({
        id: 'chk-ratio',
        name: 'Aspect Ratio & Orientation',
        requirement: `Strict ${targetRatio} (${targetRatio === '9:16' ? 'Vertical 60fps Mobile' : 'Horizontal'})`,
        actual: `${metadata.aspectRatio} (${metadata.width}×${metadata.height}px)`,
        status: 'PASS',
        message: `Aspect ratio matches target ${targetRatio} specification.`,
        isBlocking: true,
      });
    } else {
      failCount++;
      checks.push({
        id: 'chk-ratio',
        name: 'Aspect Ratio & Orientation',
        requirement: `Strict ${targetRatio}`,
        actual: `${metadata.aspectRatio} (${metadata.width}×${metadata.height}px)`,
        status: 'FAIL',
        message: `Orientation mismatch: submitted asset is ${metadata.aspectRatio} instead of requested vertical ${targetRatio}.`,
        isBlocking: true,
      });
    }
  }

  // 3. Duration Limit Check (for Video)
  const isVideoBrief = brief.contentType.toLowerCase().includes('video') || brief.contentType.toLowerCase().includes('film');
  if (isVideoBrief && metadata.durationSeconds !== undefined) {
    const maxDuration = brief.targetSpecs?.maxDurationSeconds || parseDurationConstraintSeconds(brief.duration);
    if (metadata.durationSeconds <= maxDuration) {
      checks.push({
        id: 'chk-duration',
        name: 'Video Duration Constraint',
        requirement: `Maximum ${maxDuration}s runtime`,
        actual: `${metadata.durationSeconds}s`,
        status: 'PASS',
        message: `Duration (${metadata.durationSeconds}s) is within the ${maxDuration}s threshold.`,
        isBlocking: true,
      });
    } else {
      failCount++;
      checks.push({
        id: 'chk-duration',
        name: 'Video Duration Constraint',
        requirement: `Maximum ${maxDuration}s runtime`,
        actual: `${metadata.durationSeconds}s runtime`,
        status: 'FAIL',
        message: `Asset duration (${metadata.durationSeconds}s) exceeds the required maximum limit of ${maxDuration}s by ${(metadata.durationSeconds - maxDuration).toFixed(1)}s.`,
        isBlocking: true,
      });
    }
  }

  // 4. File Size Check
  const maxSizeBytes = brief.targetSpecs?.maxFileSizeBytes || 100 * 1024 * 1024; // 100MB default
  if (metadata.fileSizeBytes !== undefined) {
    const sizeMb = (metadata.fileSizeBytes / (1024 * 1024)).toFixed(1);
    const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    if (metadata.fileSizeBytes <= maxSizeBytes) {
      checks.push({
        id: 'chk-size',
        name: 'File Size & Bitrate Envelope',
        requirement: `Under ${limitMb}MB`,
        actual: `${sizeMb}MB`,
        status: 'PASS',
        message: `Asset size (${sizeMb}MB) is optimized for web/CDN distribution.`,
        isBlocking: false,
      });
    } else {
      warnCount++;
      checks.push({
        id: 'chk-size',
        name: 'File Size & Bitrate Envelope',
        requirement: `Under ${limitMb}MB`,
        actual: `${sizeMb}MB`,
        status: 'WARNING',
        message: `Asset size (${sizeMb}MB) exceeds recommended ceiling (${limitMb}MB). Consider multi-pass compression.`,
        isBlocking: false,
      });
    }
  }

  // 5. Aesthetic & Creative Content Human Review Label
  checks.push({
    id: 'chk-human-review',
    name: 'Brand Aesthetic & Prompt Accuracy',
    requirement: 'Human Creative Director Review',
    actual: 'Awaiting Brand User Sign-Off',
    status: 'WARNING',
    message: 'Automated checker verifies technical container integrity only. Creative originality and style adherence require human approval.',
    isBlocking: false,
  });

  // Determine overall status
  let overallStatus: DeliveryCheckStatus = 'PASS';
  if (failCount > 0) {
    overallStatus = 'FAIL';
  } else if (warnCount > 0) {
    overallStatus = 'WARNING';
  }

  const guidance = failCount > 0
    ? `Fix the ${failCount} failed technical specifications (such as aspect ratio or duration) and upload a revised draft.`
    : 'All automated physical delivery checks passed. Deliverable is ready for Brand Creative Director sign-off.';

  return {
    id: `chk-res-${Date.now()}`,
    versionId,
    engagementId,
    overallStatus,
    checks,
    extractedMetadata: metadata,
    inspectedAt: new Date().toISOString(),
    actionableGuidance: guidance,
  };
}
