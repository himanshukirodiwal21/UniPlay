// src/helpers.js
export const generateSlug = (eventName) => {
  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};