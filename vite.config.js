import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH is the folder the site lives in on GitHub Pages ('/my-repo/').
// The deploy workflow sets it automatically. Locally it defaults to '/'.
export default defineConfig({
  base: "/tuka-mhane/",
  plugins: [react()],
});
