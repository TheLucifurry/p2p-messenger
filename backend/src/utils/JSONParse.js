module.exports = function JSONParse(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};
