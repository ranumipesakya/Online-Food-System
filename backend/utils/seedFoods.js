import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import foodModel from "../models/foodModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DESCRIPTION = "Food provides essential nutrients for overall health and well-being";

export const seedDefaultFoodsIfEmpty = async () => {
  try {
    const existingCount = await foodModel.countDocuments();
    if (existingCount > 0) {
      return;
    }

    const backendRoot = path.resolve(__dirname, "..");
    const projectRoot = path.resolve(backendRoot, "..");
    const frontendAssetsDir = path.join(projectRoot, "frontend", "src", "assets");
    const uploadsDir = path.join(backendRoot, "uploads");
    const assetsFilePath = path.join(frontendAssetsDir, "assets.js");

    if (!fs.existsSync(assetsFilePath)) {
      return;
    }

    const assetsFileContent = fs.readFileSync(assetsFilePath, "utf8");
    const regex =
      /_id:\s*"(\d+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?price:\s*(\d+)[\s\S]*?category:\s*"([^"]+)"/g;

    const docs = [];
    let match = regex.exec(assetsFileContent);
    while (match) {
      const id = match[1];
      const name = match[2];
      const price = Number(match[3]);
      const category = match[4];
      const imageName = `food_${id}.png`;

      const srcImagePath = path.join(frontendAssetsDir, imageName);
      const destImagePath = path.join(uploadsDir, imageName);

      if (fs.existsSync(srcImagePath) && !fs.existsSync(destImagePath)) {
        fs.copyFileSync(srcImagePath, destImagePath);
      }

      docs.push({
        name,
        description: DEFAULT_DESCRIPTION,
        price,
        category,
        image: imageName,
      });

      match = regex.exec(assetsFileContent);
    }

    if (docs.length > 0) {
      await foodModel.insertMany(docs);
      console.log(`Seeded ${docs.length} default food items.`);
    }
  } catch (error) {
    console.error("Food seed failed:", error.message);
  }
};
