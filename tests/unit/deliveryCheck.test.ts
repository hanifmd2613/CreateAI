import { inspectDeliveryAssetBuffer } from '../../src/lib/deliveryCheck';
import { MediaDeliverySpecs } from '../../src/types';

/**
 * Helper to construct a synthetic valid PNG buffer with IHDR chunk
 */
function createSyntheticPngBuffer(width: number, height: number): Buffer {
  const buf = Buffer.alloc(33);
  // PNG signature
  buf.writeUInt8(0x89, 0);
  buf.write('PNG\r\n\x1a\n', 1, 'ascii');
  // IHDR length = 13
  buf.writeUInt32BE(13, 8);
  // IHDR type
  buf.write('IHDR', 12, 'ascii');
  // Dimensions
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  // Bit depth, color type, compression, filter, interlace
  buf.writeUInt8(8, 24);
  buf.writeUInt8(6, 25);
  buf.writeUInt8(0, 26);
  buf.writeUInt8(0, 27);
  buf.writeUInt8(0, 28);
  // Dummy CRC
  buf.writeUInt32BE(0, 29);
  return buf;
}

/**
 * Helper to construct a synthetic valid MP4 buffer with ftyp and moov/mvhd/tkhd boxes
 */
function createSyntheticMp4Buffer(width: number, height: number, durationSeconds: number): Buffer {
  // 1. ftyp box (20 bytes)
  const ftyp = Buffer.alloc(20);
  ftyp.writeUInt32BE(20, 0);
  ftyp.write('ftyp', 4, 'ascii');
  ftyp.write('isom', 8, 'ascii');
  ftyp.writeUInt32BE(512, 12);
  ftyp.write('isom', 16, 'ascii');

  // 2. mvhd box (108 bytes, version 0)
  const mvhd = Buffer.alloc(108);
  mvhd.writeUInt32BE(108, 0);
  mvhd.write('mvhd', 4, 'ascii');
  mvhd.writeUInt8(0, 8); // version 0
  const timescale = 1000;
  mvhd.writeUInt32BE(timescale, 20); // timescale offset 20
  mvhd.writeUInt32BE(durationSeconds * timescale, 24); // duration offset 24

  // 3. tkhd box (92 bytes, version 0)
  const tkhd = Buffer.alloc(92);
  tkhd.writeUInt32BE(92, 0);
  tkhd.write('tkhd', 4, 'ascii');
  tkhd.writeUInt8(0, 8); // version 0
  tkhd.writeUInt16BE(width, 84); // width fixed point (integer part)
  tkhd.writeUInt16BE(height, 88); // height fixed point (integer part)

  // 4. trak box wrapping tkhd
  const trak = Buffer.alloc(8 + tkhd.length);
  trak.writeUInt32BE(trak.length, 0);
  trak.write('trak', 4, 'ascii');
  tkhd.copy(trak, 8);

  // 5. moov box wrapping mvhd and trak
  const moov = Buffer.alloc(8 + mvhd.length + trak.length);
  moov.writeUInt32BE(moov.length, 0);
  moov.write('moov', 4, 'ascii');
  mvhd.copy(moov, 8);
  trak.copy(moov, 8 + mvhd.length);

  return Buffer.concat([ftyp, moov]);
}

export function runDeliveryCheckUnitTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  // Subtest 1: Valid 9:16 Video within 15 seconds meets specs
  try {
    const specs: MediaDeliverySpecs = {
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      maxDurationSeconds: 15,
      requiredFormat: 'mp4',
    };

    const validVideoBuf = createSyntheticMp4Buffer(1080, 1920, 12);
    const check = inspectDeliveryAssetBuffer(validVideoBuf, 'novaphone-v1.mp4', specs, 'v1', 'eng-1');

    if (check.overallStatus !== 'PASS') {
      throw new Error(`Expected PASS, got ${check.overallStatus}. Failing checks: ${check.checks.filter(c => c.status !== 'PASS').map(c => c.message).join(', ')}`);
    }
    results.push({ name: 'Valid 9:16 1080x1920 MP4 video passes all automated delivery checks', passed: true });
  } catch (err: any) {
    results.push({ name: 'Valid 9:16 1080x1920 MP4 video passes all automated delivery checks', passed: false, message: err.message });
  }

  // Subtest 2: Orientation/Aspect Ratio failure (16:9 submitted for 9:16 brief)
  try {
    const specs: MediaDeliverySpecs = {
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      maxDurationSeconds: 15,
      requiredFormat: 'mp4',
    };

    // Submitting 1920x1080 (horizontal 16:9)
    const horizontalVideoBuf = createSyntheticMp4Buffer(1920, 1080, 10);
    const check = inspectDeliveryAssetBuffer(horizontalVideoBuf, 'novaphone-horizontal.mp4', specs, 'v1', 'eng-1');

    if (check.overallStatus !== 'FAIL') {
      throw new Error(`Expected FAIL for horizontal video, got ${check.overallStatus}`);
    }
    const arCheck = check.checks.find(c => c.id === 'check-aspect-ratio');
    if (!arCheck || arCheck.status !== 'FAIL') {
      throw new Error('Aspect ratio check did not flag failure for 16:9 vs 9:16');
    }
    results.push({ name: 'Aspect ratio mismatch (16:9 submitted for 9:16 brief) fails check with guidance', passed: true });
  } catch (err: any) {
    results.push({ name: 'Aspect ratio mismatch (16:9 submitted for 9:16 brief) fails check with guidance', passed: false, message: err.message });
  }

  // Subtest 3: Duration failure (30s video submitted for 15s max brief)
  try {
    const specs: MediaDeliverySpecs = {
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      maxDurationSeconds: 15,
      requiredFormat: 'mp4',
    };

    // Submitting 30 second video
    const longVideoBuf = createSyntheticMp4Buffer(1080, 1920, 30);
    const check = inspectDeliveryAssetBuffer(longVideoBuf, 'novaphone-long.mp4', specs, 'v1', 'eng-1');

    if (check.overallStatus !== 'FAIL') {
      throw new Error(`Expected FAIL for exceeding duration, got ${check.overallStatus}`);
    }
    const durCheck = check.checks.find(c => c.id === 'check-duration');
    if (!durCheck || durCheck.status !== 'FAIL') {
      throw new Error('Duration check did not flag failure for 30s vs 15s max');
    }
    results.push({ name: 'Duration overrun (30s submitted for 15s limit) fails duration check', passed: true });
  } catch (err: any) {
    results.push({ name: 'Duration overrun (30s submitted for 15s limit) fails duration check', passed: false, message: err.message });
  }

  // Subtest 4: Corrupt / truncated file handling
  try {
    const specs: MediaDeliverySpecs = {
      aspectRatio: '9:16',
      requiredFormat: 'mp4',
    };

    // Random noise buffer
    const corruptBuf = Buffer.from('NOT_A_VALID_MEDIA_FILE_BINARY_CORRUPTED_1234567890');
    const check = inspectDeliveryAssetBuffer(corruptBuf, 'corrupt.mp4', specs, 'v1', 'eng-1');

    if (check.overallStatus === 'PASS') {
      throw new Error('Corrupt file was erroneously marked PASS');
    }
    if (check.extractedMetadata.isDecodable === true) {
      throw new Error('Corrupt file was erroneously reported as decodable');
    }
    results.push({ name: 'Corrupt or unreadable file is flagged UNVERIFIABLE/FAIL and never PASS', passed: true });
  } catch (err: any) {
    results.push({ name: 'Corrupt or unreadable file is flagged UNVERIFIABLE/FAIL and never PASS', passed: false, message: err.message });
  }

  return results;
}

if (process.argv[1]?.includes('deliveryCheck.test.ts')) {
  const res = runDeliveryCheckUnitTests();
  console.table(res);
}
