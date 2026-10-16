import type { Category, Meal, Settings } from "@/lib/types";

export const RESTAURANT_SETTINGS: Settings = {
  restaurantName: "Mama Chidi's Kitchen",
  tagline: "Delicious Food, Delivered to Your Door.",
  phone: "+234 801 234 5678",
  email: "hello@mamachidis.kitchen",
  address: "12 Admiralty Way, Lekki Phase 1, Lagos",
  openingHours: "Mon - Sat: 9:00am - 9:00pm  |  Sunday: 12:00pm - 7:00pm",
  deliveryFee: 1500,
  freeDeliveryOver: 15000,
};

export const CATEGORIES: Category[] = [
  { id: "rice", name: "Rice Dishes", emoji: "🍚" },
  { id: "grill", name: "Grill & BBQ", emoji: "🍗" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "sides", name: "Sides", emoji: "🍟" },
  { id: "snacks", name: "Snacks", emoji: "🥟" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
];

function img(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
}

export const MEALS: Meal[] = [
  {
    id: "jollof-classic",
    name: "Classic Jollof Rice",
    description:
      "Smoky party-style jollof rice cooked in a rich tomato base, served with fried plantain and a fresh side salad.",
    price: 3500,
    categoryId: "rice",
    image: img("photo-1604382354936-07c5d9983bd3"),
    emoji: "🍚",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "jollof-protein",
        name: "Choose your protein",
        type: "single",
        required: true,
        choices: [
          { id: "no-protein", name: "No protein", price: 0 },
          { id: "grilled-chicken", name: "Grilled chicken", price: 1500 },
          { id: "beef-chunks", name: "Beef chunks", price: 1200 },
          { id: "suya", name: "Suya beef", price: 1800 },
        ],
      },
      {
        id: "jollof-spice",
        name: "Pepper level",
        type: "single",
        required: false,
        choices: [
          { id: "mild", name: "Mild", price: 0 },
          { id: "medium", name: "Medium", price: 0 },
          { id: "extra-pepper", name: "Extra pepper", price: 0 },
        ],
      },
    ],
  },
  {
    id: "party-fried-rice",
    name: "Party Fried Rice",
    description:
      "Nigerian party fried rice with mixed vegetables, garden eggs and your choice of protein.",
    price: 3800,
    categoryId: "rice",
    image: img("photo-1512058564366-18510be2db19"),
    emoji: "🍛",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "fried-rice-protein",
        name: "Choose your protein",
        type: "single",
        required: true,
        choices: [
          { id: "chicken", name: "Grilled chicken", price: 1500 },
          { id: "fish", name: "Fried fish", price: 2000 },
          { id: "turkey", name: "Fried turkey", price: 2200 },
        ],
      },
    ],
  },
  {
    id: "ofada-rice",
    name: "Ofada Rice & Ayamase",
    description:
      "Local ofada rice served with a smoky green pepper ayamase sauce, boiled egg and assorted meat.",
    price: 4200,
    categoryId: "rice",
    image: img("photo-1596797038530-2c107229654b"),
    emoji: "🍲",
    available: true,
    featured: false,
    popular: true,
    options: [],
  },
  {
    id: "white-rice-stew",
    name: "White Rice & Stew",
    description:
      "Steamed white rice with our signature fried stew and a choice of protein.",
    price: 3000,
    categoryId: "rice",
    image: img("photo-1516684732162-798a0062be99"),
    emoji: "🍚",
    available: true,
    featured: false,
    popular: false,
    options: [
      {
        id: "stew-protein",
        name: "Choose your protein",
        type: "single",
        required: true,
        choices: [
          { id: "chicken", name: "Chicken", price: 1200 },
          { id: "beef", name: "Beef", price: 1000 },
          { id: "fish", name: "Fish", price: 1500 },
        ],
      },
    ],
  },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken (Half)",
    description:
      "Slow-grilled half chicken marinated in our secret spice blend, served with a dipping sauce.",
    price: 4500,
    categoryId: "grill",
    image: img("photo-1598103442097-8b74394b95c6"),
    emoji: "🍗",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "chicken-sauce",
        name: "Dipping sauce",
        type: "multi",
        required: false,
        choices: [
          { id: "pepper-sauce", name: "Extra pepper sauce", price: 300 },
          { id: "garlic-mayo", name: "Garlic mayo", price: 300 },
        ],
      },
    ],
  },
  {
    id: "suya-skewers",
    name: "Suya Beef Skewers",
    description:
      "Spicy yaji-dusted beef skewers grilled over open coals, served with sliced onions and tomatoes.",
    price: 3000,
    categoryId: "grill",
    image: img("photo-1555939594-58d7cb561ad1"),
    emoji: "🍢",
    available: true,
    featured: false,
    popular: true,
    options: [
      {
        id: "suya-pack",
        name: "Pack size",
        type: "single",
        required: true,
        choices: [
          { id: "regular", name: "Regular (5 sticks)", price: 0 },
          { id: "large", name: "Large (8 sticks)", price: 1500 },
        ],
      },
    ],
  },
  {
    id: "grilled-fish",
    name: "Grilled Croaker Fish",
    description:
      "Whole croaker fish grilled to order with peppers, onions and a squeeze of lime.",
    price: 6500,
    categoryId: "grill",
    image: img("photo-1519708227418-c8fd9a32b7a2"),
    emoji: "🐟",
    available: true,
    featured: true,
    popular: false,
    options: [],
  },
  {
    id: "beef-burger",
    name: "Classic Beef Burger",
    description:
      "Juicy grilled beef patty with lettuce, tomatoes, pickles and our house burger sauce in a toasted brioche bun.",
    price: 3200,
    categoryId: "burgers",
    image: img("photo-1568901346375-23c9450c58cd"),
    emoji: "🍔",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "burger-add-ons",
        name: "Add-ons",
        type: "multi",
        required: false,
        choices: [
          { id: "extra-patty", name: "Extra beef patty", price: 1200 },
          { id: "cheese", name: "Extra cheese", price: 500 },
          { id: "bacon", name: "Crispy bacon", price: 800 },
        ],
      },
      {
        id: "burger-sides",
        name: "Make it a combo",
        type: "single",
        required: false,
        choices: [
          { id: "no-combo", name: "No combo", price: 0 },
          { id: "combo-fries", name: "Add fries", price: 1000 },
          { id: "combo-drink", name: "Add fresh juice", price: 800 },
        ],
      },
    ],
  },
  {
    id: "chicken-burger",
    name: "Crispy Chicken Burger",
    description:
      "Golden crispy chicken fillet with coleslaw and spicy mayo in a soft toasted bun.",
    price: 3000,
    categoryId: "burgers",
    image: img("photo-1606755962773-d324e0a13086"),
    emoji: "🍔",
    available: true,
    featured: false,
    popular: false,
    options: [
      {
        id: "chicken-burger-add-ons",
        name: "Add-ons",
        type: "multi",
        required: false,
        choices: [
          { id: "cheese", name: "Extra cheese", price: 500 },
          { id: "patty", name: "Extra chicken fillet", price: 1000 },
        ],
      },
    ],
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Pizza",
    description:
      "Hand-tossed pizza topped with tomato sauce, mozzarella and spicy pepperoni.",
    price: 6000,
    categoryId: "pizza",
    image: img("photo-1565299624946-b28f40a0ae38"),
    emoji: "🍕",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "pizza-size",
        name: "Size",
        type: "single",
        required: true,
        choices: [
          { id: "medium", name: "Medium (10 inch)", price: 0 },
          { id: "large", name: "Large (13 inch)", price: 2000 },
        ],
      },
      {
        id: "pizza-crust",
        name: "Crust",
        type: "single",
        required: false,
        choices: [
          { id: "classic", name: "Classic crust", price: 0 },
          { id: "stuffed", name: "Stuffed crust", price: 1200 },
        ],
      },
    ],
  },
  {
    id: "supreme-pizza",
    name: "Supreme Pizza",
    description:
      "Loaded with chicken, peppers, onions, mushrooms and extra mozzarella on our signature sauce.",
    price: 7500,
    categoryId: "pizza",
    image: img("photo-1574071318508-1cdbab80d002"),
    emoji: "🍕",
    available: true,
    featured: false,
    popular: false,
    options: [
      {
        id: "supreme-size",
        name: "Size",
        type: "single",
        required: true,
        choices: [
          { id: "medium", name: "Medium (10 inch)", price: 0 },
          { id: "large", name: "Large (13 inch)", price: 2500 },
        ],
      },
    ],
  },
  {
    id: "fried-plantain",
    name: "Fried Plantain",
    description:
      "Sweet ripe plantain fried until golden and caramelised on the edges.",
    price: 1500,
    categoryId: "sides",
    image: img("photo-1601050690597-df0568f70950"),
    emoji: "🍌",
    available: true,
    featured: false,
    popular: true,
    options: [],
  },
  {
    id: "french-fries",
    name: "French Fries",
    description:
      "Crispy golden fries sprinkled with a light dusting of seasoning salt.",
    price: 2000,
    categoryId: "sides",
    image: img("photo-1573080496219-bb080dd4f877"),
    emoji: "🍟",
    available: true,
    featured: false,
    popular: true,
    options: [
      {
        id: "fries-size",
        name: "Portion",
        type: "single",
        required: true,
        choices: [
          { id: "regular", name: "Regular", price: 0 },
          { id: "large", name: "Large", price: 700 },
        ],
      },
    ],
  },
  {
    id: "puff-puff",
    name: "Puff-Puff (6 pcs)",
    description:
      "Warm, fluffy Nigerian doughnuts — lightly sweet and perfect with a cold drink.",
    price: 1200,
    categoryId: "snacks",
    image: img("photo-1612240498936-65f510134bd0"),
    emoji: "🍩",
    available: true,
    featured: false,
    popular: true,
    options: [],
  },
  {
    id: "spring-rolls",
    name: "Spring Rolls (4 pcs)",
    description:
      "Crispy vegetable spring rolls served with a sweet chilli dipping sauce.",
    price: 1800,
    categoryId: "snacks",
    image: img("photo-1544025162-d76694265947"),
    emoji: "🥟",
    available: true,
    featured: false,
    popular: false,
    options: [],
  },
  {
    id: "meat-pie",
    name: "Beef Meat Pie",
    description:
      "Flaky pastry filled with seasoned minced beef, potatoes and carrots.",
    price: 1000,
    categoryId: "snacks",
    image: img("photo-1601050690117-94f5f6fa8bd7"),
    emoji: "🥧",
    available: true,
    featured: false,
    popular: false,
    options: [],
  },
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    description:
      "Freshly squeezed oranges served chilled — no added sugar.",
    price: 1500,
    categoryId: "drinks",
    image: img("photo-1600271886742-f049cd451bba"),
    emoji: "🍊",
    available: true,
    featured: true,
    popular: true,
    options: [
      {
        id: "juice-size",
        name: "Size",
        type: "single",
        required: true,
        choices: [
          { id: "regular", name: "Regular (35cl)", price: 0 },
          { id: "large", name: "Large (50cl)", price: 500 },
        ],
      },
    ],
  },
  {
    id: "zobo-drink",
    name: "Homemade Zobo",
    description:
      "Chilled hibiscus drink infused with pineapple, ginger and warm spices.",
    price: 1200,
    categoryId: "drinks",
    image: img("photo-1544145945-f90425340c7e"),
    emoji: "🧃",
    available: true,
    featured: false,
    popular: false,
    options: [],
  },
  {
    id: "pineapple-juice",
    name: "Pineapple Juice",
    description:
      "Bright, tropical pineapple juice blended fresh and served over ice.",
    price: 1500,
    categoryId: "drinks",
    image: img("photo-1621263764928-df1444c5e859"),
    emoji: "🍍",
    available: true,
    featured: false,
    popular: false,
    options: [],
  },
];

export interface Testimonial {
  name: string;
  location: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adaeze O.",
    location: "Lekki, Lagos",
    quote:
      "The jollof tastes exactly like a proper party. Ordering took two minutes and it arrived hot.",
    rating: 5,
  },
  {
    name: "Tunde A.",
    location: "Victoria Island",
    quote:
      "Best burgers on the island, hands down. The combo deal is great value for money.",
    rating: 5,
  },
  {
    name: "Chiamaka E.",
    location: "Ikoyi",
    quote:
      "I order the grilled fish every Sunday. Fresh, well seasoned and always on time.",
    rating: 4,
  },
  {
    name: "Segun K.",
    location: "Yaba",
    quote:
      "Tracking my order live gave me peace of mind. The kitchen dashboard clearly works!",
    rating: 5,
  },
];
