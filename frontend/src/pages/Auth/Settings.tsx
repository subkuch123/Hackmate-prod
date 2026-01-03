import { BackgroundScene } from "@/components/3d/background-scene";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Bell,
  Eye,
  EyeOff,
  Github,
  Globe,
  Key,
  Linkedin,
  Palette,
  Save,
  Shield,
  Trash2,
  Twitter,
  Upload,
  User,
  Plus,
  X,
  Award,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Globe as WebsiteIcon,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_URL } from "@/config/API_URL";

// API service functions
const apiService = {
  // Get user profile
  async getUserProfile() {
    const response = await fetch(`${API_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response);
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  // Update profile
  async updateProfile(profileData: any) {
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  // Change password
  async changePassword(passwordData: any) {
    const response = await fetch(`${API_URL}/api/user/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) throw new Error("Failed to change password");
    return response.json();
  },

  // Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/api/user/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload avatar");
    return response.json();
  },

  // Remove avatar
  async removeAvatar() {
    const response = await fetch(`${API_URL}/user/remove-avatar`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to remove avatar");
    return response.json();
  },

  // Update privacy settings
  async updatePrivacySettings(privacyData: any) {
    const response = await fetch(`${API_URL}/api/user/privacy-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(privacyData),
    });
    if (!response.ok) throw new Error("Failed to update privacy settings");
    return response.json();
  },

  // Update social links
  async updateSocialLinks(socialData: any) {
    const response = await fetch(`${API_URL}/api/user/social-links`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(socialData),
    });
    if (!response.ok) throw new Error("Failed to update social links");
    return response.json();
  },
};

// Default settings data as fallback
const defaultSettingsData = {
  profile: {
    name: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
    skills: [] as string[],
    age: undefined as number | undefined,
    experience: "",
    collegeName: "",
    github: "",
    linkedin: "",
    twitter: "",
    profileCompletion: 0,
  },
  privacy: {
    showEmail: true,
    showPhone: true,
  },
  social: {
    github: "",
    linkedin: "",
    twitter: "",
  },
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initialize formData with empty state, will be populated from backend
  const [formData, setFormData] = useState(defaultSettingsData);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "social", label: "Social Links", icon: Globe },
  ];

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getUserProfile();
        const userData = response.data.user;

        const transformedData = {
          profile: {
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            bio: userData.bio || "",
            location: userData.location || "",
            website: userData.website || "",
            avatar: userData.profilePicture || "",
            skills: userData.skills || [],
            age: userData.age || undefined,
            experience: userData.experience || "",
            collegeName: userData.collegeName || "",
            github: userData.github || "",
            linkedin: userData.linkedin || "",
            twitter: userData.twitter || "",
            profileCompletion: userData.profileCompletion || 0,
          },
          privacy: {
            showEmail: userData.privacy?.showEmail ?? true,
            showPhone: userData.privacy?.showPhone ?? true,
          },
          social: {
            github: userData.github?.split("/").pop() || "",
            linkedin: userData.linkedin?.split("/").pop() || "",
            twitter: userData.twitter?.split("/").pop() || "",
          },
        };

        setFormData(transformedData);
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let response;

      switch (activeTab) {
        case "profile":
          // Prepare profile data for backend
          const profileData = {
            name: formData.profile.name,
            username: formData.profile.username,
            email: formData.profile.email,
            age: formData.profile.age,
            skills: formData.profile.skills,
            experience: formData.profile.experience,
            github: formData.profile.github,
            linkedin: formData.profile.linkedin,
            twitter: formData.profile.twitter,
            phone: formData.profile.phone,
            collegeName: formData.profile.collegeName,
            website: formData.profile.website,
            bio: formData.profile.bio,
            location: formData.profile.location,
          };

          response = await apiService.updateProfile(profileData);
          setFormData((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              ...response.data.user,
              profileCompletion: response.data.user.profileCompletion,
            },
          }));
          break;

        case "privacy":
          response = await apiService.updatePrivacySettings(formData.privacy);
          setFormData((prev) => ({
            ...prev,
            privacy: response.data.privacySettings,
          }));
          break;

        case "social":
          response = await apiService.updateSocialLinks(formData.social);
          setFormData((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              ...response.data.user,
              profileCompletion: response.data.user.profileCompletion,
            },
            social: {
              github: response.data.user.github?.split("/").pop() || "",
              linkedin: response.data.user.linkedin?.split("/").pop() || "",
              twitter: response.data.user.twitter?.split("/").pop() || "",
            },
          }));
          break;
      }

      toast.success("Settings updated successfully!");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await apiService.uploadAvatar(file);
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: response.data.avatarUrl,
          profileCompletion: response.data.user.profileCompletion,
        },
      }));
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await apiService.removeAvatar();
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: response.data.user.profilePicture,
          profileCompletion: response.data.user.profileCompletion,
        },
      }));
      toast.success("Profile picture removed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove profile picture");
    }
  };

  const addSkill = () => {
    if (
      newSkill.trim() &&
      !formData.profile.skills?.includes(newSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...(prev.profile.skills || []), newSkill.trim()],
        },
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills:
          prev.profile.skills?.filter((skill) => skill !== skillToRemove) || [],
      },
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addSkill();
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Completion Bar */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron font-bold text-lg text-foreground">
            Profile Completion
          </h3>
          <span className="text-sm font-medium text-primary">
            {formData.profile.profileCompletion}%
          </span>
        </div>
        <Progress
          value={formData.profile.profileCompletion}
          className="h-2 bg-background/50"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Complete your profile to unlock all features and improve your
          visibility
        </p>
      </GlassCard>

      {/* Profile Picture Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary/20">
            <AvatarImage src={formData.profile.avatar} />
            <AvatarFallback className="bg-gradient-primary text-foreground font-orbitron font-bold text-2xl">
              {formData.profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={isUploadingAvatar}
          />
          <label htmlFor="avatar-upload">
            <Button
              variant="glass"
              size="sm"
              className="absolute -bottom-2 -right-2 cursor-pointer"
              disabled={isUploadingAvatar}
              asChild
            >
              <span>
                <Upload className="w-4 h-4" />
              </span>
            </Button>
          </label>
        </div>
        <div className="flex-1">
          <h3 className="font-orbitron font-bold text-xl text-foreground mb-2">
            Profile Picture
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Upload a new profile picture or remove the current one
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <label htmlFor="avatar-upload" className="w-full sm:w-auto">
              <Button
                variant="neon"
                size="sm"
                className="cursor-pointer w-full sm:w-auto"
                disabled={isUploadingAvatar}
                asChild
              >
                <span>
                  {isUploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload New
                </span>
              </Button>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={isUploadingAvatar}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <Input
            value={formData.profile.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  name: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            value={formData.profile.username}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  username: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="@username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <Input
            type="email"
            value={formData.profile.email}
            disabled={true}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  email: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone
          </label>
          <Input
            value={formData.profile.phone || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  phone: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <Input
            value={formData.profile.location}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  location: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <WebsiteIcon className="w-4 h-4" />
            Website
          </label>
          <Input
            value={formData.profile.website}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  website: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            College/University
          </label>
          <Input
            value={formData.profile.collegeName || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  collegeName: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="Your college or university"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Age</label>
          <Input
            type="number"
            value={formData.profile.age || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  age: parseInt(e.target.value) || undefined,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            min="13"
            max="120"
          />
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Skills & Technologies
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.profile.skills?.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a skill (e.g., Python, UI/UX, Machine Learning)"
            className="bg-background/50 border-glass-border flex-1"
          />
          <Button
            onClick={addSkill}
            variant="neon"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or click Add to include the skill. Click the × to remove.
        </p>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Award className="w-4 h-4" />
          Experience Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    experience: level,
                  },
                }))
              }
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.profile.experience === level
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-glass-border bg-background/50 text-muted-foreground hover:border-primary/50"
              }`}
            >
              <div className="font-medium capitalize mb-1">{level}</div>
              <div className="text-sm opacity-75">
                {level === "beginner" && "0-2 years experience"}
                {level === "intermediate" && "2-5 years experience"}
                {level === "advanced" && "5+ years experience"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bio Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Bio</label>
        <Textarea
          value={formData.profile.bio}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              profile: {
                ...prev.profile,
                bio: e.target.value,
              },
            }))
          }
          className="bg-background/50 border-glass-border"
          rows={4}
          placeholder="Tell us about yourself, your interests, and what you're passionate about..."
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Brief introduction about yourself</span>
          <span>{formData.profile.bio?.length || 0}/500</span>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="font-orbitron font-bold text-lg text-foreground mb-4">
          Privacy Settings
        </h3>
        <div className="space-y-4">
          {Object.entries(formData.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {key === "showEmail" &&
                    "Display email address on your public profile"}
                  {key === "showPhone" &&
                    "Display phone number on your public profile"}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    privacy: {
                      ...prev.privacy,
                      [key]: checked,
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="font-orbitron font-bold text-lg text-foreground mb-4">
          Security
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={isPasswordVisible ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-background/50 border-glass-border pr-10"
                placeholder="Enter current password"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New Password
            </label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="bg-background/50 border-glass-border"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="bg-background/50 border-glass-border"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            variant="neon"
            size="sm"
            onClick={handlePasswordUpdate}
            disabled={
              isUpdatingPassword ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword
            }
          >
            {isUpdatingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </GlassCard>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="font-orbitron font-bold text-lg text-foreground mb-4">
          Theme Settings
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Dark Mode</h4>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark themes
            </p>
          </div>
          <ThemeToggle />
        </div>
      </GlassCard>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub Username
          </label>
          <Input
            value={formData.social.github}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                social: {
                  ...prev.social,
                  github: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="your-github-username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn Username
          </label>
          <Input
            value={formData.social.linkedin}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                social: {
                  ...prev.social,
                  linkedin: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="your-linkedin-username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Twitter className="w-4 h-4" />
            Twitter Handle
          </label>
          <Input
            value={formData.social.twitter}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                social: {
                  ...prev.social,
                  twitter: e.target.value,
                },
              }))
            }
            className="bg-background/50 border-glass-border"
            placeholder="@your-twitter-handle"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <h4 className="font-medium text-foreground mb-2">
          Why connect social accounts?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Showcase your open source contributions</li>
          <li>• Help team members find and connect with you</li>
          <li>• Build credibility through your professional profiles</li>
          <li>• Enable easier collaboration on projects</li>
        </ul>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
        <BackgroundScene className="absolute inset-0 w-full h-full" />
        <div className="relative max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <GlassCard className="p-8 flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-foreground">Loading your settings...</span>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden pt-24">
      <BackgroundScene className="absolute inset-0 w-full h-full" />

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-foreground mb-4">
            Settings
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Customize your HackMate experience and manage your account
            preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <nav>
                <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible py-2 md:py-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 md:flex-shrink-auto w-auto md:w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Profile Completion in Sidebar */}
              <div className="mt-6 p-4 rounded-lg bg-background/50 border border-glass-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formData.profile.profileCompletion}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Profile Complete
                  </div>
                  <Progress
                    value={formData.profile.profileCompletion}
                    className="h-1 mt-2 bg-background/30"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <GlassCard className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="font-orbitron font-bold text-2xl text-foreground">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h2>
                <Button
                  variant="neon"
                  onClick={handleSave}
                  className="gap-2 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {activeTab === "profile" && renderProfileTab()}
              {activeTab === "privacy" && renderPrivacyTab()}
              {activeTab === "appearance" && renderAppearanceTab()}
              {activeTab === "social" && renderSocialTab()}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
