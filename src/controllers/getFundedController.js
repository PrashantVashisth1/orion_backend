import prisma from '../config/prismaClient.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import aws from 'aws-sdk';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});
const s3 = new aws.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Add this helper for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 Upload Helper Function (using v2 SDK)
const uploadToS3 = (fileBuffer, fileName, mimeType) => {
  const s3Key = `pitch-reviews/${fileName}`; // Folder in S3
  
  const params = {
    Bucket: bucketName,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
    // We'll make the reports public-read so the user can download them
    ACL: 'public-read', 
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading to S3:", err);
        reject(new Error("S3 Upload Failed"));
      }
      // data.Location is the public URL
      resolve(data.Location); 
    });
  });
};

// Helper function to poll the AI service
const pollForAnalysis = async (analysisId) => {
  // We'll get this URL from your environment variables, or default to localhost
  const statusUrl = `${process.env.AI_SERVICE_URL_BASE || 'http://localhost:8000'}/status/${analysisId}`;
  
  while (true) {
    try {
      const { data } = await axios.get(statusUrl);
      console.log(`Polling job ${analysisId}: Status is ${data.status}`);
      
      if (data.status === 'completed') {
        return data; // Job done
      } else if (data.status === 'failed') {
        throw new Error('AI analysis failed.');
      }
      
      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (pollError) {
      console.error("Polling error:", pollError);
      throw new Error('Failed to get analysis status.');
    }
  }
};

// --- Add this function ---
// CHECK 1: Get the user's current review status
// export const getPitchReviewStatus = async (req, res) => {
//   try {
//     const userId = req.user.id; 

//     const lastSubmission = await prisma.pitchReviewSubmission.findUnique({
//       where: { userId: userId },
//     });

//     if (!lastSubmission) {
//       // No submission ever, good to go
//       return res.status(200).json({ canSubmit: true, lastSubmission: null });
//     }

//     // Check submission status
//     if (lastSubmission.status === "PENDING") {
//       return res.status(200).json({
//         canSubmit: false,
//         lastSubmission: null,
//         message: 'Your previous submission is still processing. Please wait.',
//       });
//     }

//     if (lastSubmission.status === "FAILED") {
//       // If it failed, let them try again
//       return res.status(200).json({ 
//         canSubmit: true, 
//         lastSubmission: null,
//         message: 'Your last submission failed. Please try again.' 
//       });
//     }

//     // If COMPLETED, check the 24-hour rule
//     if (lastSubmission.status === "COMPLETED") {
//       const now = new Date();
//       const lastSubmissionDate = new Date(lastSubmission.updatedAt); // Use updatedAt
//       const diffInHours = (now.getTime() - lastSubmissionDate.getTime()) / (1000 * 60 * 60);

//       if (diffInHours < 24) {
//         return res.status(200).json({
//           canSubmit: false,
//           lastSubmission: {
//             pdfUrl: lastSubmission.pdfUrl,
//             date: lastSubmission.updatedAt,
//           },
//           message: 'You can submit a new review 24 hours after your last one.',
//         });
//       }
//     }

//     // 24 hours have passed since last COMPLETED submission
//     res.status(200).json({ canSubmit: true, lastSubmission: null });

//   } catch (error) {
//     console.error('Error checking pitch review status:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// 1. Get the user's current review status (WITH AUTO-CLEANUP)
export const getPitchReviewStatus = async (req, res) => {
  try {
    const userId = req.user.id; 

    const lastSubmission = await prisma.pitchReviewSubmission.findUnique({
      where: { userId: userId },
    });

    if (!lastSubmission) {
      // No submission ever, good to go
      return res.status(200).json({ canSubmit: true, lastSubmission: null });
    }

    // --- AUTO-CLEANUP LOGIC START ---
    // If the submission is COMPLETED but older than 24 hours, it is "trash".
    // We can reset the record so the database stays clean.
    if (lastSubmission.status === "COMPLETED") {
      const now = new Date();
      const lastSubmissionDate = new Date(lastSubmission.updatedAt);
      const diffInHours = (now.getTime() - lastSubmissionDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours >= 24) {
        // It's been more than 24 hours. Reset the record!
        // We keep the record ID but clear the data.
        
        // OPTIONAL: Delete the old file from S3 here if you want to be extra thorough
        // await deleteFromS3(lastSubmission.pdfUrl); 

        await prisma.pitchReviewSubmission.update({
          where: { id: lastSubmission.id },
          data: {
            status: "PENDING", // Reset status so they can submit again
            pdfUrl: null,      // Clear the old URL
            jsonUrl: null,     // Clear the old URL
            // We don't change createdAt yet, that happens on new submission
          }
        });
        
        return res.status(200).json({ 
          canSubmit: true, 
          lastSubmission: null,
          message: "You can submit a new review."
        });
      }
      
      // It is less than 24 hours, so return the download link
      return res.status(200).json({
        canSubmit: false,
        lastSubmission: {
          pdfUrl: lastSubmission.pdfUrl,
          date: lastSubmission.updatedAt,
        },
        message: 'You can submit a new review 24 hours after your last one.',
      });
    }
    // --- AUTO-CLEANUP LOGIC END ---

    // Check pending/failed status (same as before)
    if (lastSubmission.status === "PENDING") {
      return res.status(200).json({
        canSubmit: false,
        lastSubmission: null,
        message: 'Your previous submission is still processing. Please wait.',
      });
    }

    if (lastSubmission.status === "FAILED") {
      return res.status(200).json({ 
        canSubmit: true, 
        lastSubmission: null,
        message: 'Your last submission failed. Please try again.' 
      });
    }

    // Fallback
    res.status(200).json({ canSubmit: true, lastSubmission: null });

  } catch (error) {
    console.error('Error checking pitch review status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Add this function ---
// CHECK 2: Handle the new pitch deck submission

export const submitPitchForReview = async (req, res) => {
  let submissionRecord; // We need this to update on failure

  try {
    const userId = req.user.id;

    // 1. --- CRITICAL LOCK ---
    // Check user's status *before* doing anything
    const lastSubmission = await prisma.pitchReviewSubmission.findUnique({
      where: { userId: userId },
    });

    if (lastSubmission) {
      if (lastSubmission.status === "PENDING") {
        return res.status(429).json({ message: 'A submission is already processing.' });
      }

      if (lastSubmission.status === "COMPLETED") {
        const now = new Date();
        const lastSubmissionDate = new Date(lastSubmission.updatedAt);
        const diffInHours = (now.getTime() - lastSubmissionDate.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 24) {
          return res.status(429).json({ message: 'Daily limit exceeded.' });
        }
      }
      // If status is FAILED, we allow them to continue
    }
    // --- END LOCK ---

    if (!req.file) {
      return res.status(400).json({ message: 'No pitch deck file uploaded.' });
    }

    // 2. --- CREATE "PENDING" RECORD ---
    // This is our lock. We create/update the record to PENDING.
    submissionRecord = await prisma.pitchReviewSubmission.upsert({
      where: { userId: userId },
      update: {
        status: "PENDING",
        createdAt: new Date(), // Reset timestamp for the new submission
        pdfUrl: null,
        jsonUrl: null,
      },
      create: {
        userId: userId,
        status: "PENDING",
      }
    });

    // 3. --- START AI PROCESS ---
    const { key, bucket, originalname } = req.file;
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();

    const aiServiceBaseUrl = process.env.AI_SERVICE_URL_BASE || 'http://localhost:49152';
    const analyzeUrl = `${aiServiceBaseUrl}/api/analyze`;

    const formData = new FormData();
    formData.append('file', s3Stream, originalname);

    const aiResponse = await axios.post(analyzeUrl, formData, {
      headers: { ...formData.getHeaders() },
      responseType: 'arraybuffer' 
    });

    const analysis_id = aiResponse.headers['x-analysis-id'];
    if (!analysis_id) {
      throw new Error('Analysis ID was not found in the AI response headers.');
    }

    const jsonReportUrl = `${aiServiceBaseUrl}/api/analysis/${analysis_id}`;
    const jsonResponse = await axios.get(jsonReportUrl, { 
      responseType: 'arraybuffer' 
    });

    // 4. --- UPLOAD REPORTS TO S3 ---
    const generatedPdfFileName = `review_${userId}_${analysis_id}.pdf`;
    const generatedJsonFileName = `review_${userId}_${analysis_id}.json`;

    const [pdfUrl, jsonUrl] = await Promise.all([
      uploadToS3(aiResponse.data, generatedPdfFileName, 'application/pdf'),
      uploadToS3(jsonResponse.data, generatedJsonFileName, 'application/json')
    ]);

    // 5. --- UPDATE RECORD TO "COMPLETED" ---
    const finalSubmission = await prisma.pitchReviewSubmission.update({
      where: { id: submissionRecord.id },
      data: {
        status: "COMPLETED",
        pdfUrl: pdfUrl,
        jsonUrl: jsonUrl,
      }
    });

    // 6. --- SEND SUCCESS RESPONSE ---
    res.status(201).json({
      message: 'Pitch review successful!',
      downloadUrl: finalSubmission.pdfUrl,
      reviewDataUrl: finalSubmission.jsonUrl,
    });

  } catch (error) {
    // 7. --- CRITICAL FAILURE HANDLER ---
    // If anything fails, update the record to FAILED so the user can try again
    if (submissionRecord) {
      await prisma.pitchReviewSubmission.update({
        where: { id: submissionRecord.id },
        data: { status: "FAILED" }
      });
    }
    console.error('Error submitting pitch for review:', error);
    res.status(500).json({ message: 'Server error during pitch review. Please try again.' });
  }
};

// Get all resources, grouped by category
export const getResources = async (req, res) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      include: {
        files: true, // Include all related files for each category
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
};

// 3. Get trending startups
export const getTrendingStartups = async (req, res) => {
  try {
    // Fetch the single startup of the week
    const startupOfTheWeek = await prisma.startupProfile.findFirst({
      where: { isStartupOfTheWeek: true },
      include: {
        // Include related data needed for the card
        user: { select: { id: true } }, // Useful for linking later
        company_details: {
          select: {
            company_name: true,
            company_description: true,
            industry: true, // Used for 'category'
          }
        },
        business_details: {
          select: {
            funding_stage: true, // Used for 'funding'
            team_size: true, // Used for 'team'
            // Add 'revenue' here if you want to display growth based on it
            // revenue: true, 
          }
        },
      },
    });

    // Fetch up to 3 other trending startups
    const trendingStartups = await prisma.startupProfile.findMany({
      where: {
        isTrending: true,
        isStartupOfTheWeek: false, // Exclude the weekly one
      },
      include: {
        user: { select: { id: true } },
        company_details: {
          select: {
            company_name: true,
            company_description: true,
            industry: true,
          }
        },
        business_details: {
          select: {
            funding_stage: true,
            team_size: true,
            // revenue: true, 
          }
        },
      },
      orderBy: {
        updated_at: 'desc', // Show the most recently updated ones
      },
      take: 3, // Limit to 3 for the grid
    });

    res.status(200).json({ startupOfTheWeek, trendingStartups });
  } catch (error) {
    console.error("Error fetching trending startups:", error); // Log the error
    res.status(500).json({ message: 'Error fetching trending startups', error: error.message });
  }
};

// Handle pitch deck submission for funding opportunity
export const submitForFunding = async (req, res) => {
  // req.user comes from the 'auth' middleware
  console.log('--- submitForFunding Controller ---'); // <-- Log entry point
  console.log('req.user:', req.user); // <-- Log user (from auth)
  console.log('req.file:', req.file); // <-- Log file (from multer)
  console.log('req.body:', req.body);
  const { id: userId } = req.user; 

  // req.file comes from the 'fileUpload' (multer-s3) middleware
  if (!req.file) {
    return res.status(400).json({ message: 'No pitch deck file uploaded.' });
  }

  // Extract file details provided by multer-s3
  const { originalname: fileName, location: filePath } = req.file; 
  // 'location' is the S3 URL

  try {
    // Create a record in the database
    const submission = await prisma.fundingSubmission.create({
      data: {
        userId: parseInt(userId, 10), // Ensure userId is an integer
        fileName: fileName,
        filePath: filePath, // Store the S3 URL
        status: "SUBMITTED", // Initial status
      },
    });

    // Send success response
    res.status(201).json({ 
      message: 'Pitch deck submitted successfully!', 
      submission: {
        id: submission.id,
        fileName: submission.fileName,
        submittedAt: submission.createdAt,
      } 
    });

  } catch (error) {
    console.error("Error submitting pitch deck:", error);
    // Consider deleting the uploaded S3 file if DB insert fails (optional cleanup)
    res.status(500).json({ message: 'Error saving submission record', error: error.message });
  }
};