import bcrypt from 'bcrypt';
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

/**
 * Create a new user in the database with hashed password
 * @param {Object} userData - { fullName, email, mobile, password }
 * @returns {Promise<Object>} newly created user data (without password hash)
 */
// export async function createUser({ fullName, email, mobile, password }) {
//   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//   const newUser = await prisma.user.create({
//     data: {
//       full_name: fullName,
//       email,
//       mobile,
//       password_hash: hashedPassword
//     }
//   });
//   return newUser;
// }

export async function createUser({ fullName, email, mobile, password, role = "STARTUP" }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      full_name: fullName,
      email,
      mobile,
      password_hash: hashedPassword,
      role, 
    },
  });

  return newUser;
}


/**
 * Find a user by email
 * @param {string} email
 * @returns {Promise<Object|null>} user row including password_hash or null if not found
 */
export async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    return user;
  }
  return null;
}
/**
 * Find a user by ID (excluding password hash)
 * @param {number} id
 * @returns {Promise<Object|null>} user data or null if not found
 */
export async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    }
  });

  if (user) {
    return user;
  }
  return null;
}

/**
 * Finds a user by their email and verification status.
 * @param {string} email - The user's email.
 * @param {boolean} is_verified - The verification status to check for.
 * @returns {Promise<object|null>} The user object or null if not found.
 */
export const findUserByEmailAndStatus = async (email, is_verified) => {
  return await prisma.user.findFirst({
    where: {
      email,
      is_verified,
    },
  });
};

/**
 * Creates a new unverified user or updates an existing unverified user's OTP.
 * This is useful for "Resend OTP" and initial signup.
 * @param {string} email - The user's email to use as the unique identifier.
 * @param {object} userData - The user data to create or update.
 * @returns {Promise<object>} The created or updated user object.
 */
export const upsertUnverifiedUser = async (email, userData) => {
  return await prisma.user.upsert({
    where: { email },
    update: { // What to do if an unverified user with this email already exists
      ...userData,
    },
    create: { // What to do if no user with this email exists
      ...userData,
    },
  });
};


/**
 * Marks a user as verified and clears their OTP fields.
 * @param {string} email - The user's email.
 * @returns {Promise<object>} The updated, verified user object.
 */
export const verifyUser = async (email) => {
    return await prisma.user.update({
        where: { email },
        data: {
            is_verified: true,
            otp: null,
            otp_expires_at: null,
        },
    });
}

export const findUserByResetToken = async (token) => {
  return await prisma.user.findUnique({
    where: { reset_token: token },
  });
};

export const updateUserPassword = async (userId, password) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: hashedPassword,
      reset_token: null, // Clear the token after use
      reset_token_expiry: null,
    },
  });
};

export const setUserResetToken = async (userId, token, expiry) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      reset_token: token,
      reset_token_expiry: expiry,
    },
  });
};

