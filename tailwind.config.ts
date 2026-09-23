import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-soft": "var(--muted-soft)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)",
        "success-soft": "var(--success-soft)",
        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
