import fs from "fs";
import path from "path";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  throw new Error("Missing PEXELS_API_KEY in .env");
}

const imageQueries = [
  { folder: "coffee", file: "cappuccino.jpg", query: "cappuccino coffee cup" },
  { folder: "coffee", file: "latte.jpg", query: "latte coffee" },
  { folder: "coffee", file: "americano.jpg", query: "americano coffee" },
  { folder: "coffee", file: "cold-coffee.jpg", query: "iced coffee" },

  { folder: "bakery", file: "croissant.jpg", query: "croissant bakery" },
  { folder: "bakery", file: "muffin.jpg", query: "blueberry muffin" },
  { folder: "bakery", file: "brownie.jpg", query: "chocolate brownie" },
  { folder: "bakery", file: "cupcake.jpg", query: "cupcake dessert" },

  { folder: "burger", file: "veg-burger.jpg", query: "vegetarian burger" },
  { folder: "burger", file: "chicken-burger.jpg", query: "chicken burger" },

  { folder: "pizza", file: "margherita.jpg", query: "margherita pizza" },
  { folder: "pizza", file: "farm-pizza.jpg", query: "vegetable pizza" },

  { folder: "sandwich", file: "grilled-cheese.jpg", query: "grilled cheese sandwich" },
  { folder: "sandwich", file: "chicken-sandwich.jpg", query: "chicken sandwich" },

  { folder: "pasta", file: "alfredo.jpg", query: "alfredo pasta" },
  { folder: "pasta", file: "arrabbiata.jpg", query: "tomato pasta" },

  { folder: "dessert", file: "tiramisu.jpg", query: "tiramisu dessert" },
  { folder: "dessert", file: "cheesecake.jpg", query: "cheesecake dessert" },
  { folder: "dessert", file: "french-toast.jpg", query: "french toast" },

  { folder: "milkshake", file: "chocolate-milkshake.jpg", query: "chocolate milkshake" },
  { folder: "milkshake", file: "biscoff-milkshake.jpg", query: "milkshake" },

  { folder: "fries", file: "french-fries.jpg", query: "french fries" },

  { folder: "matcha", file: "matcha-latte.jpg", query: "matcha latte" }
];

async function downloadImage(url: string, outputPath: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(outputPath, buffer);
}

async function searchPexelsImage(query: string) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape`;

  const response = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY as string
    }
  });

  if (!response.ok) {
    throw new Error(`Pexels API failed for query: ${query}`);
  }

  const data = await response.json();

  if (!data.photos || data.photos.length === 0) {
    throw new Error(`No image found for query: ${query}`);
  }

  return data.photos[0].src.large;
}

async function main() {
  for (const item of imageQueries) {
    const folderPath = path.join(process.cwd(), "public", "menu", item.folder);
    const outputPath = path.join(folderPath, item.file);

    fs.mkdirSync(folderPath, { recursive: true });

    console.log(`Downloading: ${item.query}`);

    const imageUrl = await searchPexelsImage(item.query);
    await downloadImage(imageUrl, outputPath);

    console.log(`Saved: ${outputPath}`);
  }

  console.log("Menu images downloaded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
