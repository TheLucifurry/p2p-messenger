module.exports = {
  DEV_MODE: process.argv.includes('--mode=dev') || process.env.MODE === 'DEV',
  PORT: process.env.PORT || 3000,
  STATIC_FILES_DIR: "public",
};
