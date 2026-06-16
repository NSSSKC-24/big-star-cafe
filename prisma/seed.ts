import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const categories = [
  "Alternative Milk",
  "Appetizers",
  "Bakery",
  "Big Star Special Cold Creams",
  "Big Star Special Hot Serve",
  "Burger Section",
  "Classic Espresso Based",
  "Coffee On The Rocks",
  "Cold Brews",
  "Hot Chocolate",
  "Matcha Hot N Cold",
  "Milkshakes",
  "Pasta Section Veg And Non-Veg",
  "Pizza Section",
  "Sandwich Section",
  "Sides",
  "Sourdough Open Toast",
  "Sweet Eats French Toast"
];

type SeedMenuItem = {
  category: string;
  name: string;
  price: number;
  imageUrl?: string;
  videoUrl?: string;
  isVeg?: boolean;
  isFeatured?: boolean;
};

const items: SeedMenuItem[] = [
  { category: "Alternative Milk", name: "Almond Milk", price: 120, imageUrl: "/menu/coffee/latte.jpg", videoUrl: "/menu/videos/latte.mp4" },
  { category: "Alternative Milk", name: "Oat Milk", price: 120, imageUrl: "/menu/coffee/latte.jpg" },

  { category: "Appetizers", name: "Bruschetta Mushroom Tomato Basil", price: 280, imageUrl: "/menu/sandwich/grilled-cheese.jpg", isFeatured: true },
  { category: "Appetizers", name: "Crispy Chicken Tenders", price: 340, imageUrl: "/menu/fries/french-fries.jpg", isVeg: false },

  { category: "Bakery", name: "Chocolate Cup Cake", price: 160, imageUrl: "/menu/bakery/cupcake.jpg", isFeatured: true },
  { category: "Bakery", name: "Red Velvet Cup Cake", price: 180, imageUrl: "/menu/bakery/cupcake.jpg" },
  { category: "Bakery", name: "Vintage Chocolate Cake", price: 260, imageUrl: "/menu/bakery/brownie.jpg" },
  { category: "Bakery", name: "Nutella Cookie", price: 160, imageUrl: "/menu/bakery/brownie.jpg" },
  { category: "Bakery", name: "Blueberry Muffin", price: 180, imageUrl: "/menu/bakery/muffin.jpg" },
  { category: "Bakery", name: "Choco Chip Muffin", price: 180, imageUrl: "/menu/bakery/muffin.jpg" },
  { category: "Bakery", name: "Butter Croissant", price: 190, imageUrl: "/menu/bakery/croissant.jpg" },
  { category: "Bakery", name: "Almond Croissant", price: 240, imageUrl: "/menu/bakery/croissant.jpg" },
  { category: "Bakery", name: "Vanilla Cream Brulee Doughnut", price: 220, imageUrl: "/menu/bakery/cupcake.jpg" },
  { category: "Bakery", name: "Alps Rose Tres Leches", price: 320, imageUrl: "/menu/dessert/cheesecake.jpg", isFeatured: true },
  { category: "Bakery", name: "Biscoff Cheese Cake", price: 300, imageUrl: "/menu/dessert/cheesecake.jpg" },
  { category: "Bakery", name: "Classic Tiramisu", price: 320, imageUrl: "/menu/dessert/tiramisu.jpg" },
  { category: "Bakery", name: "Fudge Brownie", price: 220, imageUrl: "/menu/bakery/brownie.jpg" },

  { category: "Big Star Special Cold Creams", name: "Frappe", price: 280, imageUrl: "/menu/coffee/cold-coffee.jpg", isFeatured: true },
  { category: "Big Star Special Cold Creams", name: "Hindustani Cold Coffee", price: 260, imageUrl: "/menu/coffee/cold-coffee.jpg" },
  { category: "Big Star Special Cold Creams", name: "Café Mocha", price: 290, imageUrl: "/menu/coffee/latte.jpg" },
  { category: "Big Star Special Cold Creams", name: "Caramel Latte", price: 290, imageUrl: "/menu/coffee/latte.jpg" },
  { category: "Big Star Special Cold Creams", name: "Spanish Latte", price: 300, imageUrl: "/menu/coffee/cappuccino.jpg" },
  { category: "Big Star Special Cold Creams", name: "Nutty Hazelnut", price: 300, imageUrl: "/menu/coffee/cappuccino.jpg" },

  { category: "Burger Section", name: "Crispy Veg Burger", price: 290, imageUrl: "/menu/burger/veg-burger.jpg", isFeatured: true },
  { category: "Burger Section", name: "Crispy Chicken Burger", price: 340, imageUrl: "/menu/burger/chicken-burger.jpg", isVeg: false },
  { category: "Burger Section", name: "Smashed Chicken Burger", price: 380, imageUrl: "/menu/burger/chicken-burger.jpg", isVeg: false },
  { category: "Burger Section", name: "Smokey BBQ Chicken Blast Burger", price: 420, imageUrl: "/menu/burger/chicken-burger.jpg", isVeg: false },

  { category: "Classic Espresso Based", name: "Americano", price: 180, imageUrl: "/menu/coffee/americano.jpg" },
  { category: "Classic Espresso Based", name: "Cappuccino", price: 220, imageUrl: "/menu/coffee/cappuccino.jpg",  videoUrl: "/menu/videos/coffee/latte.mp4",isFeatured: true  },
  { category: "Classic Espresso Based", name: "Café Latte", price: 230, imageUrl: "/menu/coffee/latte.jpg" },

  { category: "Coffee On The Rocks", name: "Iced Americano", price: 220, imageUrl: "/menu/coffee/americano.jpg" },
  { category: "Coffee On The Rocks", name: "Vietnamese Iced Coffee", price: 260, imageUrl: "/menu/coffee/cold-coffee.jpg" },

  { category: "Cold Brews", name: "OG Cold Brew", price: 280, imageUrl: "/menu/coffee/cold-coffee.jpg" },

  { category: "Hot Chocolate", name: "Classic Hot Chocolate", price: 260, imageUrl: "/menu/coffee/cappuccino.jpg" },
  { category: "Hot Chocolate", name: "Zesty Orange Hot Chocolate", price: 280, imageUrl: "/menu/coffee/latte.jpg" },

  { category: "Matcha Hot N Cold", name: "OG Matcha Latte Hot", price: 280, imageUrl: "/menu/matcha/matcha-latte.jpg" },
  { category: "Matcha Hot N Cold", name: "OG Matcha Latte Cold", price: 300, imageUrl: "/menu/matcha/matcha-latte.jpg" },
  { category: "Matcha Hot N Cold", name: "Creamy Matcha Frappe", price: 330, imageUrl: "/menu/matcha/matcha-latte.jpg" },
  { category: "Matcha Hot N Cold", name: "Strawberry Cloudy Matcha", price: 340, imageUrl: "/menu/matcha/matcha-latte.jpg" },

  { category: "Milkshakes", name: "Biscoff Anjeer Milkshake", price: 340, imageUrl: "/menu/milkshake/biscoff-milkshake.jpg" },
  { category: "Milkshakes", name: "Choco Volcano Milkshake", price: 340, imageUrl: "/menu/milkshake/chocolate-milkshake.jpg" },

  { category: "Pasta Section Veg And Non-Veg", name: "Arrabbiata Pasta Veg", price: 360, imageUrl: "/menu/pasta/arrabbiata.jpg" },
  { category: "Pasta Section Veg And Non-Veg", name: "Arrabbiata Pasta Non-Veg", price: 420, imageUrl: "/menu/pasta/arrabbiata.jpg", isVeg: false },
  { category: "Pasta Section Veg And Non-Veg", name: "Creamy Parmesan Alfredo Pasta Veg", price: 390, imageUrl: "/menu/pasta/alfredo.jpg" },
  { category: "Pasta Section Veg And Non-Veg", name: "Creamy Parmesan Alfredo Pasta Non-Veg", price: 460, imageUrl: "/menu/pasta/alfredo.jpg", isVeg: false },
  { category: "Pasta Section Veg And Non-Veg", name: "Basil Pesto Pasta Veg", price: 410, imageUrl: "/menu/pasta/alfredo.jpg" },
  { category: "Pasta Section Veg And Non-Veg", name: "Spaghetti Aglio Olio Veg", price: 360, imageUrl: "/menu/pasta/arrabbiata.jpg" },
  { category: "Pasta Section Veg And Non-Veg", name: "Spaghetti Aglio Olio Non-Veg", price: 430, imageUrl: "/menu/pasta/arrabbiata.jpg", isVeg: false },

  { category: "Pizza Section", name: "Hand Stretched Garlic With Cheese Veg", price: 360, imageUrl: "/menu/pizza/margherita.jpg" },
  { category: "Pizza Section", name: "Margherita", price: 390, imageUrl: "/menu/pizza/margherita.jpg", isFeatured: true },
  { category: "Pizza Section", name: "Fresh Farm Veg Pizza", price: 440, imageUrl: "/menu/pizza/farm-pizza.jpg" },

  { category: "Sandwich Section", name: "Grilled Cheese Sandwich", price: 280, imageUrl: "/menu/sandwich/grilled-cheese.jpg" },
  { category: "Sandwich Section", name: "Corn And Cheese Sandwich", price: 290, imageUrl: "/menu/sandwich/grilled-cheese.jpg" },
  { category: "Sandwich Section", name: "Grilled Ciabatta Charcoal Veg", price: 330, imageUrl: "/menu/sandwich/grilled-cheese.jpg" },
  { category: "Sandwich Section", name: "Mushroom Melt Sourdough With Bread", price: 360, imageUrl: "/menu/sandwich/grilled-cheese.jpg" },
  { category: "Sandwich Section", name: "Smoked Chicken Salad Sandwich", price: 390, imageUrl: "/menu/sandwich/chicken-sandwich.jpg", isVeg: false },
  { category: "Sandwich Section", name: "Grilled Ciabatta Charcoal Veg N Chicken", price: 420, imageUrl: "/menu/sandwich/chicken-sandwich.jpg", isVeg: false },

  { category: "Sides", name: "Classic French Fries", price: 180, imageUrl: "/menu/fries/french-fries.jpg" },
  { category: "Sides", name: "Peri Peri Fries", price: 200, imageUrl: "/menu/fries/french-fries.jpg" },
  { category: "Sides", name: "Melted Cheese Fries", price: 240, imageUrl: "/menu/fries/french-fries.jpg" },
  { category: "Sides", name: "Overloaded Chicken Cheese Fries", price: 320, imageUrl: "/menu/fries/french-fries.jpg", isVeg: false },

  { category: "Sourdough Open Toast", name: "Avocado And Tomato Toast", price: 420, imageUrl: "/menu/sandwich/grilled-cheese.jpg" },
  { category: "Sweet Eats French Toast", name: "Classic Cream Chantilly French Toast", price: 360, imageUrl: "/menu/dessert/french-toast.jpg", isFeatured: true }
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.cafe.deleteMany();

  await prisma.cafe.create({
    data: {
      name: "The Big Star Cafe",
      slug: "the-big-star-cafe",
      description:
        "The Big Star Cafe is a premium cafe in Financial District, Hyderabad, serving handcrafted coffee, bakes, burgers, sandwiches, pizzas, salads, pasta, desserts, and beverages.",
      address:
        "Plot 40 & 41, Survey 115/1, Nanakramguda, Near US Consulate, Financial District, Hyderabad",
      city: "Hyderabad",
      phone: "+91 90329 66682",
      whatsapp: "+91 90329 66682",
      email: "hello@bigstarcafe.local",
      openingHours: "Mon - Sun, 9:00 AM - 11:30 PM",
      heroTitle: "Fresh coffee, comfort plates, and quick table ordering.",
      heroSubtitle:
        "A modern Hyderabad cafe experience with fresh coffee, comfort food, quick bites, desserts, and QR table ordering."
    }
  });

  const createdCategories = new Map<string, string>();

  for (let index = 0; index < categories.length; index++) {
    const name = categories[index];

    const created = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        displayOrder: index + 1
      }
    });

    createdCategories.set(name, created.id);
  }

  for (const item of items) {
    const categoryId = createdCategories.get(item.category);

    if (!categoryId) {
      throw new Error(`Missing category: ${item.category}`);
    }

    await prisma.menuItem.create({
      data: {
        name: item.name,
        slug: slugify(item.name),
        description: `${item.name} from The Big Star Cafe menu.`,
        price: item.price,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        isVeg: item.isVeg ?? true,
        isFeatured: item.isFeatured ?? false,
        isAvailable: true,
        categoryId
      }
    });
  }

  console.log("Seed completed for The Big Star Cafe.");
  console.log(`Categories inserted: ${categories.length}`);
  console.log(`Menu items inserted: ${items.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });