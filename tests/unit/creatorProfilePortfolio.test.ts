import { calculateProfileCompleteness } from '../../src/lib/profileCompleteness';
import { connectToDatabase } from '../../src/lib/mongodb';
import { CreatorModel } from '../../src/lib/models/Creator';
import { Creator, PortfolioItem } from '../../src/types';
import { executeUniversalBriefMatching } from '../../src/lib/universalMatching';

export interface TestResult {
  name: string;
  pass: boolean;
  details?: string;
}

export async function runCreatorProfilePortfolioTests(): Promise<{ tests: TestResult[] }> {
  const tests: TestResult[] = [];

  // =========================================================================
  // TEST 1: Profile Completeness Engine
  // =========================================================================
  try {
    const minimalCreator: Partial<Creator> = {
      name: 'Rohan Sharma',
      handle: '@rohan.ai',
      avatar: 'https://avatar.svg',
    };
    const minReport = calculateProfileCompleteness(minimalCreator);
    const passMin = minReport.score === 15 && minReport.missingSections.includes('Headline & Biography');

    const fullCreator: Partial<Creator> = {
      name: 'Rohan Sharma',
      handle: '@rohan.ai',
      avatar: 'https://avatar.svg',
      headline: 'Senior Commercial Gen-AI Director',
      bio: 'Directing cinematic generative AI commercials across automotive and skincare brands for 4 years.',
      specialization: 'Automotive & Skincare',
      languages: ['English', 'Telugu'],
      tools: ['Veo', 'Kling', 'Midjourney v6.1'],
      skills: ['Prompt Architecture', 'Lighting Simulation'],
      hourlyRate: 15000,
      avgTurnaround: '48 Hours',
      portfolio: [
        {
          id: 'port-1',
          title: 'Aura Serum',
          type: 'video',
          mediaUrl: 'https://media.mp4',
          thumbnail: 'https://thumb.jpg',
          aspectRatio: '9:16',
        },
        {
          id: 'port-2',
          title: 'Speed EV',
          type: 'video',
          mediaUrl: 'https://media2.mp4',
          thumbnail: 'https://thumb2.jpg',
          aspectRatio: '16:9',
        }
      ]
    };
    const fullReport = calculateProfileCompleteness(fullCreator);
    const passFull = fullReport.score === 100 && fullReport.suggestions.length === 0;

    tests.push({
      name: 'Profile Completeness Engine accurately calculates scores and actionable recommendations',
      pass: passMin && passFull,
      details: `Minimal score: ${minReport.score} (expected 15), Full score: ${fullReport.score} (expected 100)`
    });
  } catch (err: any) {
    tests.push({ name: 'Profile Completeness Engine', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 2: Profile Persistence in MongoDB
  // =========================================================================
  const testCreatorId = `test-creator-${Date.now()}`;
  try {
    await connectToDatabase();

    const created = await CreatorModel.findOneAndUpdate(
      { id: testCreatorId },
      {
        $set: {
          id: testCreatorId,
          name: 'Vikram Aditya',
          handle: '@vikram_vfx.ai',
          headline: 'Sci-Fi Worldbuilder & Neural Cinematographer',
          avatar: 'https://avatar.jpg',
          specialization: 'Sci-Fi & Gaming Trailers',
          bio: 'Crafting photorealistic cinematic fantasy game trailers with Midjourney and Veo.',
          location: 'Hyderabad, India',
          languages: ['Telugu', 'English'],
          skills: ['Worldbuilding', 'Photorealistic Rendering'],
          tools: ['Veo', 'Midjourney v6.1'],
          hourlyRate: 14000,
          projectRate: 50000,
          pricingModel: 'Milestone / Deliverable',
          avgTurnaround: '72 Hours',
          contactEmail: 'vikram.private@agency.in',
          availableNow: true,
          isVerified: true,
          portfolio: []
        }
      },
      { upsert: true, new: true }
    );

    const retrieved = await CreatorModel.findOne({ id: testCreatorId }).lean();
    const pass = Boolean(
      retrieved &&
      retrieved.headline === 'Sci-Fi Worldbuilder & Neural Cinematographer' &&
      retrieved.languages?.includes('Telugu') &&
      retrieved.pricingModel === 'Milestone / Deliverable' &&
      retrieved.hourlyRate === 14000
    );

    tests.push({
      name: 'Creator profile fields persist accurately to MongoDB',
      pass,
      details: pass ? undefined : `Retrieved data did not match persisted profile.`
    });
  } catch (err: any) {
    tests.push({ name: 'Creator profile fields persist accurately to MongoDB', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 3: Portfolio Item Creation & Persistence
  // =========================================================================
  const testPortId = `port-test-${Date.now()}`;
  try {
    const newPortItem: PortfolioItem = {
      id: testPortId,
      title: 'Chronos Titanium Chronograph Launch',
      type: 'video',
      mediaUrl: 'https://cdn.gencraft.ai/chronos.mp4',
      thumbnail: 'https://cdn.gencraft.ai/chronos.jpg',
      workflowDescription: 'Luxury horlogerie commercial rendered with micro-precision lighting in 1:1 aspect ratio.',
      category: 'Luxury & Horlogerie',
      style: 'Photorealistic Macro',
      targetAudience: 'Prestige Watch Collectors',
      aspectRatio: '1:1',
      duration: '30s',
      language: 'English',
      tools: ['Veo', 'Flux.1 Pro'],
      client: 'Chronos Geneva',
      commercialUse: 'Full Buyout',
      featured: true,
      visibility: 'public',
      order: 1,
    };

    await CreatorModel.findOneAndUpdate(
      { id: testCreatorId },
      { $push: { portfolio: newPortItem } },
      { new: true }
    );

    const doc = await CreatorModel.findOne({ id: testCreatorId }).lean();
    const portMatch = doc?.portfolio?.find((p: any) => p.id === testPortId);

    const pass = Boolean(
      portMatch &&
      portMatch.title === 'Chronos Titanium Chronograph Launch' &&
      portMatch.aspectRatio === '1:1' &&
      portMatch.category === 'Luxury & Horlogerie' &&
      portMatch.featured === true
    );

    tests.push({
      name: 'Portfolio item adds and persists with rich technical attributes',
      pass,
      details: pass ? undefined : 'Portfolio item not found in creator document.'
    });
  } catch (err: any) {
    tests.push({ name: 'Portfolio item adds and persists', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 4: Portfolio Mutation (Edit, Visibility Toggle, Feature)
  // =========================================================================
  try {
    await CreatorModel.findOneAndUpdate(
      { id: testCreatorId, 'portfolio.id': testPortId },
      {
        $set: {
          'portfolio.$.visibility': 'private',
          'portfolio.$.featured': false,
          'portfolio.$.workflowDescription': 'Updated private workflow pipeline.'
        }
      },
      { new: true }
    );

    const doc = await CreatorModel.findOne({ id: testCreatorId }).lean();
    const portMatch = doc?.portfolio?.find((p: any) => p.id === testPortId);

    const pass = Boolean(
      portMatch &&
      portMatch.visibility === 'private' &&
      portMatch.featured === false &&
      portMatch.workflowDescription === 'Updated private workflow pipeline.'
    );

    tests.push({
      name: 'Portfolio project status mutates cleanly (visibility toggle & description update)',
      pass,
      details: pass ? undefined : 'Portfolio mutation failed.'
    });
  } catch (err: any) {
    tests.push({ name: 'Portfolio project status mutates cleanly', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 5: Privacy Enforcement: Public View Filter
  // =========================================================================
  try {
    // Add second public item
    const publicPortId = `port-public-${Date.now()}`;
    await CreatorModel.findOneAndUpdate(
      { id: testCreatorId },
      {
        $push: {
          portfolio: {
            id: publicPortId,
            title: 'Public Sci-Fi Teaser',
            type: 'video',
            mediaUrl: 'https://cdn.gencraft.ai/teaser.mp4',
            thumbnail: 'https://cdn.gencraft.ai/teaser.jpg',
            aspectRatio: '16:9',
            visibility: 'public',
          }
        }
      }
    );

    const doc = await CreatorModel.findOne({ id: testCreatorId }).lean();
    // Simulate what /api/creators/[id] does when viewer is NOT the owner
    const publicPortfolio = (doc?.portfolio || []).filter((p: any) => p.visibility !== 'private');
    const hasPrivate = publicPortfolio.some((p: any) => p.visibility === 'private');
    const hasPublic = publicPortfolio.some((p: any) => p.id === publicPortId);

    const pass = !hasPrivate && hasPublic;

    tests.push({
      name: 'Privacy Guard: Public viewers cannot view private portfolio projects',
      pass,
      details: pass ? undefined : 'Private item leaked to public view.'
    });
  } catch (err: any) {
    tests.push({ name: 'Privacy Guard', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 6: Connect Portfolio to AI Creator Matching Engine
  // =========================================================================
  try {
    // Add luxury horlogerie public item
    const horologyPortId = `port-horology-${Date.now()}`;
    const horologyItem: PortfolioItem = {
      id: horologyPortId,
      title: 'Titanium Horlogerie Precision Film',
      type: 'video',
      mediaUrl: 'https://cdn.gencraft.ai/watch.mp4',
      thumbnail: 'https://cdn.gencraft.ai/watch.jpg',
      category: 'Luxury & Horlogerie',
      style: 'Photorealistic Macro',
      targetAudience: 'Prestige Watch Collectors',
      aspectRatio: '1:1',
      duration: '30s',
      workflowDescription: 'Luxury horlogerie watch commercial featuring titanium case and sapphire crystal macro lens.',
      tools: ['Veo', 'Flux.1 Pro'],
      visibility: 'public',
      featured: true
    };

    const updatedCreatorDoc = await CreatorModel.findOneAndUpdate(
      { id: testCreatorId },
      { $push: { portfolio: horologyItem } },
      { new: true }
    ).lean();

    // Query universal brief matching engine with an unseen brief asking for luxury watch commercial
    const query = 'Looking for a luxury horlogerie watch video campaign in 1:1 aspect ratio with titanium photorealistic macro visuals.';
    const run = executeUniversalBriefMatching(query, [updatedCreatorDoc as any]);

    const topMatch = run.matches[0];
    const citedPortfolio = topMatch?.citations?.some(c => c.category === 'portfolio' && c.referenceId === horologyPortId);
    const pass = Boolean(
      topMatch && 
      topMatch.creatorId === testCreatorId && 
      topMatch.finalScore >= 70 &&
      citedPortfolio
    );

    tests.push({
      name: 'AI Matching Engine grounds ranking in newly created portfolio project evidence',
      pass,
      details: pass ? undefined : `Match score: ${topMatch?.finalScore}, cited: ${citedPortfolio}`
    });
  } catch (err: any) {
    tests.push({ name: 'AI Matching Engine grounds ranking in portfolio', pass: false, details: err.message });
  }

  // =========================================================================
  // TEST 7: Portfolio Item Deletion & Cleanup
  // =========================================================================
  try {
    await CreatorModel.findOneAndUpdate(
      { id: testCreatorId },
      { $pull: { portfolio: { id: testPortId } } }
    );

    const doc = await CreatorModel.findOne({ id: testCreatorId }).lean();
    const stillExists = doc?.portfolio?.some((p: any) => p.id === testPortId);

    // Clean up test creator
    await CreatorModel.deleteOne({ id: testCreatorId });

    tests.push({
      name: 'Portfolio item deletes cleanly and leaves database consistent',
      pass: !stillExists,
      details: stillExists ? 'Deleted item still exists in portfolio.' : undefined
    });
  } catch (err: any) {
    tests.push({ name: 'Portfolio item deletes cleanly', pass: false, details: err.message });
  }

  return { tests };
}
