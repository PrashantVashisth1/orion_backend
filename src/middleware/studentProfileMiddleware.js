// // File: src/middleware/studentProfileMiddleware.js 

// import { getStudentProfile, createStudentProfile } from '../models/studentProfileModel.js'; 

// /**
//  * Middleware to check if the student profile exists for the authenticated user.
//  * If it doesn't exist, it creates a new one.
//  * Attaches the profile object (req.profile) for subsequent controllers.
//  */
// export async function checkAndCreateStudentProfile(req, res, next) {
//   const userId = req.user.id; 

//   try {
//     // 1. Try to find the existing profile
//     let profile = await getStudentProfile(userId);

//     // 2. If no profile exists, create one
//     if (!profile) {
//       console.log(`No student profile found for User ID ${userId}. Creating new profile.`);
//       profile = await createStudentProfile(userId);

//       // IMPORTANT: After creation, we need to fetch the profile again 
//       // if subsequent controllers rely on included relations (like skills_info ID).
//       // However, for immediate upsert operations, the base profile ID is usually enough.
//       // We will attach the minimal profile object containing the ID.
//     }

//     // 3. Attach the profile object to the request for the controller
//     req.profile = profile; 
    
//     // 4. Proceed to the next middleware or controller
//     next();
//   } catch (error) {
//     console.error(`[Middleware Error] checkAndCreateStudentProfile failed for User ID ${userId}:`, error);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: 'PROFILE_SETUP_ERROR',
//         message: 'Could not ensure the student profile exists before saving data.'
//       }
//     });
//   }
// }

import { getStudentProfile, createStudentProfile } from '../models/studentProfileModel.js';

export async function checkAndCreateStudentProfile(req, res, next) {
  const userId = req.user.id;

  try {
    // Get or create profile
    let profile = await getStudentProfile(userId);
    if (!profile) {
      console.log(`Creating new profile for User ID ${userId}`);
      profile = await createStudentProfile(userId);
    }

    // Refresh profile for certificate operations to get latest skills_info
    const isCertificateRoute = req.path.includes('/certificate');
    if (isCertificateRoute) {
      profile = await getStudentProfile(userId); // Fetch fresh data
    }

    req.profile = profile;
    next();
  } catch (error) {
    console.error('[Middleware Error]', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_SETUP_ERROR',
        message: 'Could not ensure the student profile exists.'
      }
    });
  }
}
