import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mama Chidi's Kitchen",
    short_name: "Mama Chidi's",
    description:
      "Order jollof rice, grilled chicken, burgers, pizza and more. Fast delivery across Lagos.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf4",
    theme_color: "#f2611a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
