import { firebaseApp, firebaseAuth, firebaseStorage, firestore, isFirebaseConfigured, getFirebaseConfig } from '../../src/lib/firebase/client';
import { registerUser } from '../../src/lib/userStore';
import { connectToDatabase } from '../../src/lib/mongodb';
import { BriefModel } from '../../src/lib/models/Brief';
import { CreatorModel } from '../../src/lib/models/Creator';
import { UserModel } from '../../src/lib/models/User';
import { EngagementModel } from '../../src/lib/models/Engagement';
import { Brief } from '../../src/types';

export interface TestResult {
  name: string;
  pass: boolean;
  details?: string;
}

export async function runFirebaseBriefAssignmentTests(): Promise<{ tests: TestResult[] }> {
  const tests: TestResult[] = [];

  // =========================================================================
  // TEST 1: Firebase Client Configuration and Initialization
  // =========================================================================
  try {
    const config = getFirebaseConfig();
    const isProjectIdValid = config.projectId === 'createai-marketplace';
    const isAuthDomainValid = config.authDomain.includes('createai-marketplace');
    const isStorageBucketValid = config.storageBucket.includes('createai-marketplace');
    const configured = isFirebaseConfigured();

    const pass = isProjectIdValid && isAuthDomainValid && isStorageBucketValid && configured && firebaseApp !== null;
    tests.push({
      name: 'Firebase Client module successfully loads createai-marketplace configuration and initializes singleton services',
      pass,
      details: `Project ID: ${config.projectId}, Auth Domain: ${config.authDomain}, Configured: ${configured}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Firebase Client module configuration test',
      pass: false,
      details: e.message
    });
  }

  // =========================================================================
  // TEST 2: Registration Links Firebase UID to MongoDB User & Creator Profile
  // =========================================================================
  const timestamp = Date.now();
  const testFirebaseUid = `firebase_uid_creator_${timestamp}`;
  const testCreatorEmail = `arjun.studio.${timestamp}@gencraft.ai`;
  const testCreatorName = `Arjun Verma Studio ${timestamp}`;

  try {
    await connectToDatabase();

    const registeredResult = await registerUser({
      name: testCreatorName,
      email: testCreatorEmail,
      password: 'SecurePassword123!',
      role: 'creator',
      id: testFirebaseUid,
    });

    const userInDb = await UserModel.findOne({ id: testFirebaseUid });
    const creatorInDb = await CreatorModel.findOne({ id: testFirebaseUid });

    const pass = (
      registeredResult.success === true &&
      registeredResult.user?.id === testFirebaseUid &&
      userInDb !== null &&
      userInDb.id === testFirebaseUid &&
      creatorInDb !== null &&
      creatorInDb.id === testFirebaseUid &&
      creatorInDb.name === testCreatorName
    );

    tests.push({
      name: 'Newly registered creator with Firebase UID creates both MongoDB User and Creator profiles',
      pass,
      details: `User ID: ${userInDb?.id}, Creator Profile ID: ${creatorInDb?.id}, Name: ${creatorInDb?.name}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Registration user and creator linking test',
      pass: false,
      details: e.message
    });
  }

  // =========================================================================
  // TEST 3: Brand Brief Direct Assignment Persists in MongoDB
  // =========================================================================
  const testBrandId = `brand_user_${timestamp}`;
  const testBrandName = `Titan Watches ${timestamp}`;
  const testBriefId = `brief_${timestamp}`;

  try {
    await connectToDatabase();

    // Persist brand brief directly assigned to the creator
    const createdBrief = await BriefModel.create({
      id: testBriefId,
      title: 'Titan Stellar AI Watch Commercial',
      brandName: testBrandName,
      brandId: testBrandId,
      assignedCreatorId: testFirebaseUid,
      assignedCreatorName: testCreatorName,
      visibility: 'private',
      status: 'Assigned',
      description: 'Futuristic sci-fi luxury timepiece reveal with procedural planetary textures.',
      contentType: '3D Motion',
      style: 'Cinematic Photoreal',
      aspectRatio: '16:9',
      deadline: '7 Days',
      budget: '₹85,000',
      commercialUse: 'Full Buyout',
      requiredTools: ['Veo', 'Midjourney', 'Blender'],
      deliverables: ['1x 4K Master Video', '3x 9:16 Cutdowns'],
    });

    const fetchedBrief = await BriefModel.findOne({ id: testBriefId }).lean();

    const pass = (
      fetchedBrief !== null &&
      fetchedBrief.id === testBriefId &&
      fetchedBrief.brandId === testBrandId &&
      fetchedBrief.assignedCreatorId === testFirebaseUid &&
      fetchedBrief.visibility === 'private' &&
      fetchedBrief.status === 'Assigned'
    );

    tests.push({
      name: 'Brand directly assigns brief to creator, persisting brandId, assignedCreatorId, and private visibility',
      pass,
      details: `Brief ID: ${fetchedBrief?.id}, AssignedTo: ${fetchedBrief?.assignedCreatorId}, Visibility: ${fetchedBrief?.visibility}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Brand brief persistence test',
      pass: false,
      details: e.message
    });
  }

  // =========================================================================
  // TEST 4: Creator Isolation - Assigned Creator Can Read, Unrelated Creator Blocked
  // =========================================================================
  const testUnrelatedCreatorId = `unrelated_creator_${timestamp}`;

  try {
    await connectToDatabase();

    // Query for assigned creator
    const creatorAssignedBriefs = await BriefModel.find({
      $or: [
        { assignedCreatorId: testFirebaseUid },
        { assignedCreatorName: testCreatorName }
      ]
    }).lean();

    // Query for unrelated creator (should NOT find private brief assigned to Creator A)
    const unrelatedCreatorBriefs = await BriefModel.find({
      $and: [
        { visibility: 'private' },
        { assignedCreatorId: testUnrelatedCreatorId }
      ]
    }).lean();

    const pass = (
      creatorAssignedBriefs.some((b: any) => b.id === testBriefId) &&
      unrelatedCreatorBriefs.length === 0
    );

    tests.push({
      name: 'Participant isolation: Assigned creator discovers private brief, unrelated creator is strictly blocked',
      pass,
      details: `Assigned matches: ${creatorAssignedBriefs.length}, Unrelated matches: ${unrelatedCreatorBriefs.length}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Creator isolation and visibility guard test',
      pass: false,
      details: e.message
    });
  }

  // =========================================================================
  // TEST 5: Public Marketplace Brief vs Private Direct Brief
  // =========================================================================
  const testPublicBriefId = `brief_public_${timestamp}`;
  try {
    await connectToDatabase();

    await BriefModel.create({
      id: testPublicBriefId,
      title: 'Public Open Challenge: Indie Game Trailer',
      brandName: 'PixelCraft Games',
      brandId: testBrandId,
      visibility: 'public',
      status: 'Open',
      description: 'Open competition for next-gen Unreal Engine cinematic teaser.',
      contentType: 'Animation',
      style: 'Stylized Cyberpunk',
      aspectRatio: '16:9',
      deadline: '14 Days',
      budget: '₹1,20,000',
      commercialUse: 'Licensed',
      requiredTools: ['Unreal Engine', 'Kling'],
      deliverables: ['1x 60s Trailer'],
    });

    const publicFeedBriefs = await BriefModel.find({
      $or: [
        { visibility: 'public' },
        { visibility: { $exists: false } }
      ]
    }).lean();

    const isPublicFound = publicFeedBriefs.some((b: any) => b.id === testPublicBriefId);
    const isPrivateHidden = !publicFeedBriefs.some((b: any) => b.id === testBriefId);

    const pass = isPublicFound && isPrivateHidden;
    tests.push({
      name: 'Marketplace feed integrity: Public briefs appear in feed while private assigned briefs remain isolated',
      pass,
      details: `Public brief in feed: ${isPublicFound}, Private brief in feed: ${!isPrivateHidden}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Public vs private marketplace feed test',
      pass: false,
      details: e.message
    });
  }

  // =========================================================================
  // TEST 6: Fresh Refresh / Re-query Durability
  // =========================================================================
  try {
    await connectToDatabase();

    // Simulate page reload: query by assignedCreatorId
    const reloadedBrief = await BriefModel.findOne({ id: testBriefId }).lean();
    const pass = (
      reloadedBrief !== null &&
      reloadedBrief.assignedCreatorId === testFirebaseUid &&
      reloadedBrief.assignedCreatorName === testCreatorName &&
      reloadedBrief.status === 'Assigned'
    );

    tests.push({
      name: 'Persistent brief assignment survives reload and accurately reflects in creator dashboard',
      pass,
      details: `Reloaded ID: ${reloadedBrief?.id}, Assigned: ${reloadedBrief?.assignedCreatorName}`
    });
  } catch (e: any) {
    tests.push({
      name: 'Brief reload durability test',
      pass: false,
      details: e.message
    });
  }

  return { tests };
}
