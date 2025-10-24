import prisma from "../src/config/prismaClient.js";

// --- THIS DATA IS NOW CORRECT BASED ON YOUR SCREENSHOT ---
const BASE_URL = "http://localhost:4000/resources"; // Or your production URL

const categoriesData = [
  {
    title: "Pitch Deck Template", // From your frontend code
    files: [
      {
        title: "Pitch Deck Template", // From your frontend code
        fileName: "Pitch Deck Sample.pptx", // From your screenshot
        url: `https://orion-project-uploads.s3.ap-southeast-1.amazonaws.com/get-funded-resources/Pitch+Deck+Sample1.pptx`
      },
    ],
  },
  {
    title: "Financial Models", // From your frontend code
    files: [
      {
        title: "Financial Model", // From your frontend code
        fileName: "Financial model 1.xlsx", // From your screenshot
        url: `https://orion-project-uploads.s3.ap-southeast-1.amazonaws.com/get-funded-resources/sample_file1.xlsx`
      },
      {
        title: "Financial Model", // From your frontend code
        fileName: "Financial model 2.xlsx", // From your screenshot
        url: `https://orion-project-uploads.s3.ap-southeast-1.amazonaws.com/get-funded-resources/financial_model1.xlsx`
      },
    ],
  },
  {
    title: "Due Diligence Certificate", // From your frontend code
    files: [
      {
        title: "Due Diligence Certificate", // From your frontend code
        fileName: "Due diligence.docx", // From your screenshot
        url: `https://orion-project-uploads.s3.ap-southeast-1.amazonaws.com/get-funded-resources/due+deligince.doc`
      },
    ],
  },
];
// --- STOP EDITING ---

async function main() {
  console.log(`Start seeding ...`);

  // We need to delete existing data to avoid duplicates
  await prisma.resourceFile.deleteMany({});
  await prisma.resourceCategory.deleteMany({});
  console.log('Deleted old data.');

  for (const catData of categoriesData) {
    const category = await prisma.resourceCategory.create({
      data: {
        title: catData.title,
      },
    });

    for (const fileData of catData.files) {
      await prisma.resourceFile.create({
        data: {
          title: fileData.title,
          fileName: fileData.fileName,
          url: fileData.url,
          categoryId: category.id,
        },
      });
    }
    console.log(`Seeded category: ${category.title}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });