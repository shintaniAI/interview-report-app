const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 2,
      features: {
        "oklab-function": true,
        "color-mix": true,
        "nesting-rules": true,
        "custom-properties": false,
      },
      browsers: "Safari >= 14, iOS >= 14, > 0.5%, last 3 versions, not dead",
    },
  },
};

export default config;
