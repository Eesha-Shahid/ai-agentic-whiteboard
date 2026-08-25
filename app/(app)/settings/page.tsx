"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  Loader2,
  MessageSquare,
  Monitor,
  Moon,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-gradient-to-r from-[#4338CA] to-[#6366F1]" : "bg-gray-200"
      }`}
      style={{ minWidth: "44px" }}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function NotificationRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3.5 overflow-hidden rounded-xl border border-gray-100 p-3.5 transition hover:border-gray-200">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [notifications, setNotifications] = useState({
    comments: true,
    shares: true,
    weeklyDigest: false,
    productUpdates: true,
  });

  useEffect(() => {
    if (user) {
      const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      setDisplayName(name);
      setOriginalName(name);
    }
  }, [user]);

  const isDirty = displayName !== originalName || avatarPreview !== null;

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setOriginalName(displayName);
    setAvatarPreview(null);
    setIsSaving(false);
    toast.add({ type: "success", title: "Profile updated" });
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const avatarSrc = avatarPreview || user?.imageUrl;

  return (
    <div className="p-6">
      <div
        className="flex items-center gap-3"
        style={{ animation: "fadeInUp 0.4s ease-out both" }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_6px_16px_rgba(67,56,202,0.3)]">
          <Settings size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Settings
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage your account, preferences, and workspace.
          </p>
        </div>
      </div>

      {/* Profile hero card */}
      <div
        className="relative mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white"
        style={{ animation: "fadeInUp 0.4s ease-out 0.05s both" }}
      >
        <div className="relative h-20 bg-gradient-to-br from-[#4338CA] via-[#6366F1] to-[#818CF8]">
          <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div
            className="absolute left-8 top-4 h-14 w-14 rounded-full bg-white/10"
            style={{ animation: "floatSlow 6s ease-in-out infinite" }}
          />
        </div>
        <div className="relative flex items-end gap-4 px-6 pb-5 -mt-8">
          {avatarSrc ? (
            <Image
              className="rounded-full border-4 border-white shadow-md"
              src={avatarSrc}
              alt="Profile"
              height={72}
              width={72}
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-gray-100 shadow-md">
              <User size={26} className="text-gray-300" />
            </div>
          )}
          <div className="min-w-0 flex-1 pb-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {user?.fullName}
            </p>
            <p className="truncate text-xs text-gray-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          {memberSince && (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[11px] font-medium text-[#4338CA] sm:flex">
              <Sparkles size={11} />
              Since {memberSince}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <div className="flex gap-1 overflow-x-auto lg:sticky lg:top-20 lg:h-fit lg:flex-col lg:overflow-visible">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`group relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? "bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] text-[#4338CA]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {activeSection === section.id && (
                <span className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#4338CA] to-[#6366F1] lg:block" />
              )}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white shadow-[0_4px_10px_rgba(67,56,202,0.3)]"
                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                }`}
              >
                <section.icon size={14} />
              </span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div
          key={activeSection}
          className="rounded-2xl border border-gray-100 bg-white p-6"
          style={{ animation: "fadeInUp 0.3s ease-out both" }}
        >
          {activeSection === "profile" && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Profile details
              </h3>
              <p className="mt-0.5 text-sm text-gray-400">
                This is how others will see you across WhizBoard.
              </p>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative">
                  {avatarSrc ? (
                    <Image
                      className="rounded-full ring-2 ring-[#4338CA]/10"
                      src={avatarSrc}
                      alt="Profile"
                      height={64}
                      width={64}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 ring-2 ring-[#4338CA]/10">
                      <User size={24} className="text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white shadow-sm transition hover:brightness-110"
                  >
                    <Camera size={12} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile photo
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    PNG or JPG, up to 2MB
                  </p>
                  {avatarPreview && (
                    <p className="mt-1 text-xs font-medium text-[#4338CA]">
                      New photo selected
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Display name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 max-w-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Email
                  </label>
                  <Input
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="h-10 max-w-sm bg-gray-50"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                <Button
                  onClick={handleSaveProfile}
                  disabled={!isDirty || isSaving}
                  className="cursor-pointer gap-1.5 border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] shadow-[0_6px_16px_rgba(67,56,202,0.25)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Save changes
                    </>
                  )}
                </Button>
                {isDirty && !isSaving && (
                  <span className="text-xs text-gray-400">
                    You have unsaved changes
                  </span>
                )}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Appearance
              </h3>
              <p className="mt-0.5 text-sm text-gray-400">
                Customize how WhizBoard looks on your device.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    id: "light" as const,
                    label: "Light",
                    icon: Sun,
                    iconColor: "text-amber-400",
                  },
                  {
                    id: "dark" as const,
                    label: "Dark",
                    icon: Moon,
                    iconColor: "text-indigo-300",
                  },
                  {
                    id: "system" as const,
                    label: "System",
                    icon: Monitor,
                    iconColor: "text-gray-400",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`group overflow-hidden rounded-xl border-2 transition ${
                      theme === opt.id
                        ? "border-[#4338CA]"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {/* Live mini canvas preview instead of a flat swatch */}
                    <div
                      className={`relative h-20 w-full ${
                        opt.id === "dark"
                          ? "bg-gray-900"
                          : opt.id === "system"
                            ? "bg-gradient-to-br from-white to-gray-900"
                            : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`absolute inset-3 rounded-md border ${
                          opt.id === "dark"
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div
                          className={`absolute left-2 top-2 h-3 w-8 rounded-sm ${opt.id === "dark" ? "bg-indigo-400/40" : "bg-[#818CF8]/30"}`}
                        />
                        <div
                          className={`absolute right-2 top-2 h-3 w-3 rounded-full ${opt.id === "dark" ? "bg-rose-400/40" : "bg-[#FB7185]/40"}`}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 border-t border-gray-50 bg-white py-2.5">
                      <opt.icon size={13} className={opt.iconColor} />
                      <span className="text-xs font-medium text-gray-700">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                <Sparkles size={12} className="text-[#818CF8]" />
                Dark mode is coming soon — your selection will apply once it
                ships.
              </p>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Notifications
              </h3>
              <p className="mt-0.5 text-sm text-gray-400">
                Choose what you want to be notified about.
              </p>

              <div className="mt-5 space-y-2.5">
                <NotificationRow
                  icon={MessageSquare}
                  iconBg="bg-[#EEF2FF]"
                  iconColor="text-[#4338CA]"
                  label="Comments"
                  desc="When someone comments on your board"
                  checked={notifications.comments}
                  onChange={() => toggleNotification("comments")}
                />
                <NotificationRow
                  icon={Share2}
                  iconBg="bg-[#FFF1F2]"
                  iconColor="text-[#FB7185]"
                  label="Shares"
                  desc="When someone shares a board with you"
                  checked={notifications.shares}
                  onChange={() => toggleNotification("shares")}
                />
                <NotificationRow
                  icon={Bell}
                  iconBg="bg-[#FFFBEB]"
                  iconColor="text-amber-500"
                  label="Weekly digest"
                  desc="A summary of your workspace activity"
                  checked={notifications.weeklyDigest}
                  onChange={() => toggleNotification("weeklyDigest")}
                />
                <NotificationRow
                  icon={Sparkles}
                  iconBg="bg-[#ECFDF5]"
                  iconColor="text-emerald-500"
                  label="Product updates"
                  desc="New features and announcements"
                  checked={notifications.productUpdates}
                  onChange={() => toggleNotification("productUpdates")}
                />
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Security
              </h3>
              <p className="mt-0.5 text-sm text-gray-400">
                Manage your account access and active sessions.
              </p>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4338CA]">
                    <Shield size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Password
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Managed through your sign-in provider
                    </p>
                  </div>
                  <Button variant="outline" className="cursor-pointer shrink-0">
                    Manage
                  </Button>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-gray-100 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECFDF5] text-emerald-600">
                    <Monitor size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Active sessions
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      1 device currently signed in
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="cursor-pointer shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Sign out all
                  </Button>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-red-100 bg-gradient-to-br from-red-50/60 to-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-700">
                      Delete account
                    </p>
                    <p className="mt-0.5 text-xs text-red-500/80">
                      Permanently delete your account and all boards. This
                      cannot be undone.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {!confirmDelete ? (
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDelete(true)}
                          className="cursor-pointer border-red-200 text-red-600 hover:bg-red-100"
                        >
                          Delete account
                        </Button>
                      ) : (
                        <>
                          <Button className="cursor-pointer border-0 bg-red-600 text-white hover:bg-red-700">
                            Yes, delete permanently
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setConfirmDelete(false)}
                            className="cursor-pointer text-gray-500"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
