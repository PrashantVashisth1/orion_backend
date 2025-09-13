import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

/**
 * Create a new user in the database with hashed password
 * @param {Object} userData - { fullName, email, mobile, password }
 * @returns {Promise<Object>} newly created user data (without password hash)
 */
export async function createUser({ fullName, email, mobile, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await prisma.user.create({
    data: {
      full_name: fullName,
      email,
      mobile,
      password_hash: hashedPassword
    }
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

