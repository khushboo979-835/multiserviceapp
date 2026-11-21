require("dotenv").config({ path: __dirname + "/../.env" });
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const brands = [
  {
    id: "apple_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="40" fill="#ffffff"/>
      <path fill="#000000" d="M141.5 131.2c-2.7 6.2-5.9 12-9.7 17.2-5.1 7.2-9.3 12.2-12.5 14.9-4.9 4.5-10.2 6.9-15.9 7-4.1 0-9-1.2-14.7-3.5s-11-3.5-15.8-3.5c-5.1 0-10.5 1.2-16.3 3.5s-10.5 3.6-14 3.7c-4.8.1-10.1-2.1-15.9-6.7-4.1-3.4-8.4-8.6-13.1-15.9-6.6-10.2-11.6-21.8-14.8-34.8-3.3-13-4.9-25.3-4.9-37 0-15.7 3.9-28.7 11.6-38.9 7.8-10.2 17.7-15.4 29.7-15.7 5.4.1 11.4 1.5 17.9 4.1 6.5 2.6 10.9 3.9 13.1 4.1 2 0 6.3-1.4 13-4.2s12.4-4.1 17.3-3.9c13.1.9 23.6 5.8 31.3 14.8-11.5 7-17.1 16.6-16.9 28.8.2 9.8 3.9 17.9 11.1 24.4 7.2 6.5 15.6 10.1 25.2 10.9-2.6 8.1-6 16.1-10.1 24.1zM107.1 24.3c0-7.8 2.8-15.1 8.4-22 5.6-6.9 12.5-11.5 20.9-13.8.6 3.9.6 7.7 0 11.5-1.2 7.8-4.5 15-9.7 21.8-5.2 6.8-11.8 11-19.6 12.5v-10z"/>
    </svg>`,
  },
  {
    id: "samsung_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120">
      <rect width="320" height="120" rx="24" fill="#0c4a6e"/>
      <text x="160" y="74" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="42" text-anchor="middle" letter-spacing="4">SAMSUNG</text>
    </svg>`,
  },
  {
    id: "xiaomi_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <rect width="160" height="160" rx="36" fill="#ff6700"/>
      <path fill="#ffffff" d="M46 50h18v60H46V50zm26 0h42v60H96V68H84v42H72V50z"/>
      <circle cx="106" cy="74" r="5" fill="#ffffff"/>
    </svg>`,
  },
  {
    id: "oneplus_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <rect width="160" height="160" rx="28" fill="#f43f5e"/>
      <rect x="22" y="22" width="116" height="116" rx="16" fill="none" stroke="#ffffff" stroke-width="8"/>
      <text x="56" y="96" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="64" text-anchor="middle">1</text>
      <text x="100" y="86" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="52" text-anchor="middle">+</text>
    </svg>`,
  },
  {
    id: "realme_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="240" height="120">
      <rect width="240" height="120" rx="24" fill="#ffc800"/>
      <text x="120" y="76" fill="#18181b" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" text-anchor="middle" letter-spacing="-1">realme</text>
    </svg>`,
  },
  {
    id: "vivo_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="240" height="120">
      <rect width="240" height="120" rx="24" fill="#008ce6"/>
      <text x="120" y="78" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="52" text-anchor="middle" letter-spacing="2">vivo</text>
    </svg>`,
  },
  {
    id: "oppo_logo",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="240" height="120">
      <rect width="240" height="120" rx="24" fill="#008556"/>
      <text x="120" y="76" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="46" text-anchor="middle" letter-spacing="3">OPPO</text>
    </svg>`,
  },
];

async function run() {
  console.log("Uploading brand logos to Cloudinary...");
  const results = {};
  for (const item of brands) {
    try {
      const dataUri = `data:image/svg+xml;base64,${Buffer.from(item.svg).toString("base64")}`;
      const res = await cloudinary.uploader.upload(dataUri, {
        folder: "inisha/brands",
        public_id: item.id,
        overwrite: true,
        resource_type: "image",
      });
      console.log(`Uploaded ${item.id}: ${res.secure_url}`);
      results[item.id] = res.secure_url;
    } catch (e) {
      console.error(`Failed ${item.id}:`, e.message);
    }
  }
  console.log("\n--- RESULT JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

run();
