// Generates supabase/seed.sql from the demo data in lib/data/menu.ts.
// Run with: node scripts/generate-seed.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const { CATEGORIES, MEALS, RESTAURANT_SETTINGS } = await import(
  pathToFileURL(join(here, "..", "lib", "data", "menu.ts")).href
);

const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
const j = (value) => `${q(JSON.stringify(value))}::jsonb`;

const lines = [
  "-- ============================================================================",
  "--  Mama Chidi's Kitchen — demo seed data",
  "--  Generated from lib/data/menu.ts by scripts/generate-seed.mjs.",
  "--  Run after supabase/schema.sql.",
  "-- ============================================================================",
  "",
  "begin;",
  "",
  "insert into public.categories (id, name, emoji, sort_order) values",
  CATEGORIES.map(
    (c, i) => `  (${q(c.id)}, ${q(c.name)}, ${q(c.emoji)}, ${i})`,
  ).join(",\n") + "\non conflict (id) do update set name = excluded.name, emoji = excluded.emoji, sort_order = excluded.sort_order;",
  "",
  "insert into public.meals (id, name, description, price, category_id, image, emoji, available, featured, popular, options) values",
  MEALS.map(
    (m) =>
      "  (" +
      [
        q(m.id),
        q(m.name),
        q(m.description),
        m.price,
        q(m.categoryId),
        q(m.image),
        q(m.emoji),
        m.available,
        m.featured,
        m.popular,
        j(m.options),
      ].join(", ") +
      ")",
  ).join(",\n") +
    "\non conflict (id) do update set name = excluded.name, description = excluded.description, price = excluded.price, category_id = excluded.category_id, image = excluded.image, emoji = excluded.emoji, available = excluded.available, featured = excluded.featured, popular = excluded.popular, options = excluded.options;",
  "",
  "insert into public.settings (id, restaurant_name, tagline, phone, email, address, opening_hours, delivery_fee, free_delivery_over) values",
  "  (" +
    [
      1,
      q(RESTAURANT_SETTINGS.restaurantName),
      q(RESTAURANT_SETTINGS.tagline),
      q(RESTAURANT_SETTINGS.phone),
      q(RESTAURANT_SETTINGS.email),
      q(RESTAURANT_SETTINGS.address),
      q(RESTAURANT_SETTINGS.openingHours),
      RESTAURANT_SETTINGS.deliveryFee,
      RESTAURANT_SETTINGS.freeDeliveryOver,
    ].join(", ") +
    ")\non conflict (id) do update set restaurant_name = excluded.restaurant_name, tagline = excluded.tagline, phone = excluded.phone, email = excluded.email, address = excluded.address, opening_hours = excluded.opening_hours, delivery_fee = excluded.delivery_fee, free_delivery_over = excluded.free_delivery_over;",
  "",
  "commit;",
  "",
];

const out = join(here, "..", "supabase", "seed.sql");
await writeFile(out, lines.join("\n"), "utf8");
console.log(`Wrote ${out} (${CATEGORIES.length} categories, ${MEALS.length} meals)`);
