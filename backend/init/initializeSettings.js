// init/initializeSettings.js
import AppSetting from "../models/AppSetting.model.js";

async function initializeSettings() {
  await AppSetting.updateOne(
    { key: "analytics_enabled" },
    { $setOnInsert: { value: true } }, // default ON
    { upsert: true }
  );

  console.log("✅ Analytics setting initialized");
}
export default initializeSettings;
