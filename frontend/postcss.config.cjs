const path = require("path");
module.exports = {
    plugins: {
        "@tailwindcss/postcss": {
            config: path.resolve(__dirname, "tailwind.config.js"),
        },
        autoprefixer: {},
    },
};

// Add path module at the top of the file
