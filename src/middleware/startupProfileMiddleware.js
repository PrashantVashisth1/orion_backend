import { getStartupProfile, createStartupProfile } from '../models/startupProfileModel.js';

/**
 * Middleware to check for and create a startup profile if it doesn't exist.
 * Attaches the profile object to the request.
 */
export async function checkAndCreateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    let profile = await getStartupProfile(userId);

    if (!profile) {
      profile = await createStartupProfile(userId);
    }
    
    req.profile = profile;
    next();
  } catch (error) {
    console.error('Profile creation middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}