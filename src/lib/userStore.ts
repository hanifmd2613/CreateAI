import crypto from 'crypto';
import { connectToDatabase } from './mongodb';
import { UserModel, IUser } from './models/User';
import { CreatorModel } from './models/Creator';
import { UserAccount, UserRole, Creator } from '../types';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  avatar?: string;
  handle?: string;
  companyName?: string;
  specialization?: string;
  location?: string;
  tools?: string[];
  hourlyRate?: number;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback store for deterministic operation when MongoDB is offline
const memoryUsers = new Map<string, StoredUser>();
const activeSessions = new Map<string, string>(); // token -> userId

// Password hashing using cryptographic SHA-256 with per-user salt
export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateSessionToken(userId: string): string {
  const token = `gencraft_sess_${crypto.randomBytes(24).toString('hex')}`;
  activeSessions.set(token, userId);
  return token;
}

export function getSessionUserId(token: string): string | undefined {
  return activeSessions.get(token);
}

export function invalidateSession(token: string): void {
  activeSessions.delete(token);
}

// Normalize email
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// RFC-compliant email format check
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return emailRegex.test(email.trim());
}

// Password strength policy
export function validatePasswordPolicy(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 6) {
    return { valid: false, reason: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}

// Initialize default seed users in memory
function ensureSeedUsers() {
  if (memoryUsers.size === 0) {
    const salt1 = generateSalt();
    memoryUsers.set('campaigns@kaveristudios.in', {
      id: 'user-brand-kaveri',
      name: 'Kaveri Creative Studios',
      email: 'campaigns@kaveristudios.in',
      passwordHash: hashPassword('GenCraft@2026', salt1),
      salt: salt1,
      role: 'brand',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      handle: '@kaveri_studios',
      companyName: 'Kaveri Creative Studios (Bengaluru & Delhi)',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const salt2 = generateSalt();
    memoryUsers.set('karthik@karthiksubramanian.ai', {
      id: 'creator-1',
      name: 'Karthik Subramanian',
      email: 'karthik@karthiksubramanian.ai',
      passwordHash: hashPassword('GenCraft@2026', salt2),
      salt: salt2,
      role: 'creator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KarthikSubramanian&gender=male&hairColor=000000&facialHairProbability=60&accessoriesProbability=20',
      handle: '@karthik_director.ai',
      specialization: 'AI Filmmaker & Commercial Director',
      hourlyRate: 12500,
      location: 'Bengaluru, Karnataka',
      tools: ['Veo', 'Kling', 'Sora', 'ElevenLabs'],
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

// Register a new user
export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  avatar?: string;
  handle?: string;
  companyName?: string;
  specialization?: string;
  location?: string;
  tools?: string[];
  hourlyRate?: number;
  bio?: string;
}): Promise<{ success: boolean; user?: UserAccount; token?: string; error?: string }> {
  ensureSeedUsers();

  const { name, email, password, confirmPassword, role } = params;

  // 1. Validation
  if (!name || !name.trim()) {
    return { success: false, error: 'Name is required.' };
  }

  if (!email || !isValidEmailFormat(email)) {
    return { success: false, error: 'A valid email address is required.' };
  }

  const passCheck = validatePasswordPolicy(password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.reason };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match. Please verify your password confirmation.' };
  }

  const normEmail = normalizeEmail(email);

  // 2. Duplicate Check
  const existingMemory = memoryUsers.get(normEmail);
  if (existingMemory) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  try {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const existingDb = await UserModel.findOne({ email: normEmail });
      if (existingDb) {
        return { success: false, error: 'An account with this email address already exists.' };
      }
    }
  } catch (err) {
    // Continue with in-memory store
  }

  // 3. Create Account
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  const defaultAvatar = params.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;
  const cleanHandle = params.handle?.trim() || `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const stored: StoredUser = {
    id: userId,
    name: name.trim(),
    email: normEmail,
    passwordHash,
    salt,
    role,
    avatar: defaultAvatar,
    handle: cleanHandle,
    companyName: role === 'brand' ? (params.companyName || `${name} Studios`) : undefined,
    specialization: role === 'creator' ? (params.specialization || 'Generative AI Creator') : undefined,
    location: params.location || 'India',
    tools: params.tools || (role === 'creator' ? ['Veo', 'Kling', 'Flux.1'] : undefined),
    hourlyRate: params.hourlyRate || (role === 'creator' ? 9500 : undefined),
    bio: params.bio,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  };

  memoryUsers.set(normEmail, stored);

  // Persist to MongoDB if connected
  try {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      await UserModel.create({
        ...stored,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });

      if (role === 'creator') {
        await CreatorModel.findOneAndUpdate(
          { id: stored.id },
          {
            id: stored.id,
            name: stored.name,
            handle: stored.handle || `@${stored.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ai`,
            avatar: stored.avatar || defaultAvatar,
            specialization: stored.specialization || 'Generative AI Director',
            bio: stored.bio || 'AI Video & Visual Specialist creating commercial content with generative models.',
            location: stored.location || 'Bengaluru, India',
            languages: ['English'],
            skills: ['AI Directing', 'Prompt Engineering'],
            tools: stored.tools || ['Veo', 'Kling'],
            hourlyRate: stored.hourlyRate || 9500,
            avgTurnaround: '48 Hours',
            availability: true,
            availableNow: true,
            isVerified: false,
            rating: 5.0,
            reviewCount: 0,
            completedProjects: 0,
            portfolio: [],
            isUserCreated: true,
            createdAt: new Date(now),
            updatedAt: new Date(now),
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (err) {
    console.warn('MongoDB user/creator create fallback to memory:', err);
  }

  const userAccount: UserAccount = {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    avatar: stored.avatar || defaultAvatar,
    handle: stored.handle || cleanHandle,
    companyName: stored.companyName,
    specialization: stored.specialization,
    location: stored.location,
    tools: stored.tools,
    hourlyRate: stored.hourlyRate,
    bio: stored.bio,
    isVerified: stored.isVerified,
  };

  const token = generateSessionToken(stored.id);
  return { success: true, user: userAccount, token };
}

// Authenticate user with email and password
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserAccount; token?: string; error?: string }> {
  ensureSeedUsers();

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normEmail = normalizeEmail(email);

  let stored = memoryUsers.get(normEmail);

  if (!stored) {
    try {
      const isConnected = await connectToDatabase();
      if (isConnected) {
        const dbUser = await UserModel.findOne({ email: normEmail });
        if (dbUser) {
          stored = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            salt: dbUser.salt,
            role: dbUser.role,
            avatar: dbUser.avatar,
            handle: dbUser.handle,
            companyName: dbUser.companyName,
            specialization: dbUser.specialization,
            location: dbUser.location,
            tools: dbUser.tools,
            hourlyRate: dbUser.hourlyRate,
            bio: dbUser.bio,
            isVerified: dbUser.isVerified,
            createdAt: dbUser.createdAt.toISOString(),
            updatedAt: dbUser.updatedAt.toISOString(),
          };
          memoryUsers.set(normEmail, stored);
        }
      }
    } catch (err) {
      console.warn('MongoDB user lookup fallback to memory:', err);
    }
  }

  if (!stored) {
    return { success: false, error: 'Invalid email or password. Please check your credentials.' };
  }

  const computedHash = hashPassword(password, stored.salt);
  if (computedHash !== stored.passwordHash) {
    return { success: false, error: 'Invalid email or password. Please check your credentials.' };
  }

  const userAccount: UserAccount = {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    avatar: stored.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(stored.name)}`,
    handle: stored.handle || `@${stored.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    companyName: stored.companyName,
    specialization: stored.specialization,
    location: stored.location,
    tools: stored.tools,
    hourlyRate: stored.hourlyRate,
    bio: stored.bio,
    isVerified: stored.isVerified,
  };

  const token = generateSessionToken(stored.id);
  return { success: true, user: userAccount, token };
}

// Find user by ID (synchronous from memory)
export function getUserById(id: string): UserAccount | undefined {
  const usersList = Array.from(memoryUsers.values());
  for (const stored of usersList) {
    if (stored.id === id) {
      return {
        id: stored.id,
        name: stored.name,
        email: stored.email,
        role: stored.role,
        avatar: stored.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(stored.name)}`,
        handle: stored.handle || `@${stored.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        companyName: stored.companyName,
        specialization: stored.specialization,
        location: stored.location,
        tools: stored.tools,
        hourlyRate: stored.hourlyRate,
        bio: stored.bio,
        isVerified: stored.isVerified,
      };
    }
  }
  return undefined;
}

// Find user by ID asynchronously with MongoDB query fallback
export async function getUserByIdAsync(id: string): Promise<UserAccount | undefined> {
  const cached = getUserById(id);
  if (cached) return cached;

  try {
    const isConnected = await connectToDatabase();
    if (isConnected) {
      const dbUser = await UserModel.findOne({ id }).lean();
      if (dbUser) {
        const stored: StoredUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          salt: dbUser.salt,
          role: dbUser.role as UserRole,
          avatar: dbUser.avatar,
          handle: dbUser.handle,
          companyName: dbUser.companyName,
          specialization: dbUser.specialization,
          location: dbUser.location,
          tools: dbUser.tools,
          hourlyRate: dbUser.hourlyRate,
          bio: dbUser.bio,
          isVerified: dbUser.isVerified,
          createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: dbUser.updatedAt ? new Date(dbUser.updatedAt).toISOString() : new Date().toISOString(),
        };
        memoryUsers.set(stored.email, stored);
        return {
          id: stored.id,
          name: stored.name,
          email: stored.email,
          role: stored.role,
          avatar: stored.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(stored.name)}`,
          handle: stored.handle || `@${stored.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          companyName: stored.companyName,
          specialization: stored.specialization,
          location: stored.location,
          tools: stored.tools,
          hourlyRate: stored.hourlyRate,
          bio: stored.bio,
          isVerified: stored.isVerified,
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB getUserByIdAsync fallback warning:', err);
  }

  return undefined;
}
