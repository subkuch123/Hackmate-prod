// utils/isTrackingEnabled.js
import AppSetting from "../models/AppSetting.model.js";
let cachedValue = null;
let lastFetch = 0;

export const isTrackingEnabled = async () => {
  // cache for 60 seconds
  if (cachedValue !== null && Date.now() - lastFetch < 60000) {
    return cachedValue;
  }

  const setting = await AppSetting.findOne({ key: "analytics_enabled" });
  cachedValue = setting?.value === true;
  lastFetch = Date.now();

  return cachedValue;
};
