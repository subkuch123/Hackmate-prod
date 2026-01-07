// models/AppSetting.js
import mongoose from "mongoose";

const AppSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});
const AppSetting = mongoose.model("AppSetting", AppSettingSchema);
export default AppSetting;
