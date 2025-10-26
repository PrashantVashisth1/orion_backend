import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/vnd.ms-powerpoint", 
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDF, PPT, and PPTX are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      const filePath = `${req.user.id}/${Date.now().toString()}-${
        file.originalname
      }`;
      cb(null, filePath);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export const uploadSingle = upload.single("file");

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File size exceeds 5MB limit",
          },
        });
    }
  }
  if (error.message.includes("Invalid file type")) {
    return res
      .status(400)
      .json({
        success: false,
        error: { code: "INVALID_FILE_TYPE", message: error.message },
      });
  }
  return res
    .status(500)
    .json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: error.message || "File upload failed",
      },
    });
};
