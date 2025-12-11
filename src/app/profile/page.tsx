"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserCircle, Mail, LogOut, Globe, FileText, Camera, Save, Loader2, TrendingUp, Calendar, ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import dynamic from 'next/dynamic';

const ActivityCalendar = dynamic<any>(() => import("react-activity-calendar").then(mod => (mod as any).ActivityCalendar || (mod as any).default), { ssr: false }); // Attempt named then default
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  // Stats Data
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        bio: (session.user as any).bio || "",
        website: (session.user as any).website || "",
        description: (session.user as any).description || "",
        image: session.user.image || "",
      });
      fetchStats(session.user.id);
    }
  }, [session]);

  const fetchStats = async (userId: string) => {
    try {
      const { data } = await axios.get(`/api/users/${userId}/stats`);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.put("/api/profile/update", formData);
      
      await update(formData); // Update local session
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post("/api/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({ ...prev, image: res.data.url }));
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Loader />
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const warnings = stats?.user?.warnings || 0;
  const isBanned = stats?.user?.isBanned || false;
  const health = isBanned ? 0 : Math.max(0, 100 - (warnings * 33));
  
  let healthColor = "bg-green-500";
  let healthText = "Good Standing";
  let HealthIcon = ShieldCheck;

  if (isBanned) {
      healthColor = "bg-red-500";
      healthText = "Account Banned";
      HealthIcon = Ban;
  } else if (warnings === 1) {
      healthColor = "bg-yellow-500";
      healthText = "Warning Issued";
      HealthIcon = AlertTriangle;
  } else if (warnings >= 2) {
      healthColor = "bg-orange-500";
      healthText = "At Risk";
      HealthIcon = AlertTriangle;
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Profile Settings Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 xl:col-span-4 p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md h-fit"
        >
            <div className="flex justify-between items-center mb-8 border-b border-[var(--card-border)] pb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Profile Settings</h2>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors flex items-center gap-2"
            >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            </div>

            {/* Account Health Section */}
            {!loadingStats && (
                <div className="mb-8 p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <HealthIcon className={`w-5 h-5 ${isBanned ? 'text-red-500' : warnings > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                            <span className="font-semibold text-sm text-[var(--foreground)]">Account Health</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBanned ? 'bg-red-500/10 text-red-500' : warnings > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                            {healthText}
                        </span>
                    </div>
                    <div className="w-full bg-[var(--foreground)]/10 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${healthColor}`} 
                            style={{ width: `${health}%` }}
                        ></div>
                    </div>
                    {warnings > 0 && !isBanned && (
                        <p className="text-xs text-[var(--foreground)]/60 mt-2">
                            You have {warnings} warning(s). reaching 3 warnings will result in a ban.
                        </p>
                    )}
                    {isBanned && (
                        <p className="text-xs text-red-500 mt-2">
                            Your account has been suspended due to violations.
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--card-border)] bg-[var(--card-bg)] shadow-inner">
                    {formData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={formData.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserCircle className="w-16 h-16 text-[var(--foreground)]/40" />
                    </div>
                    )}
                </div>
                
                {/* Overlay for upload */}
                <div 
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                    <Camera className="w-8 h-8 text-white" />
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                </div>
                <p className="text-[var(--foreground)]/60 text-xs flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {session?.user?.email}
                </p>

                <div className="flex justify-center gap-8 w-full py-4 border-y border-[var(--card-border)] mt-2">
                    <div className="text-center">
                        <div className="text-xl font-bold text-[var(--foreground)]">{stats?.user?.followersCount || 0}</div>
                        <div className="text-xs text-[var(--foreground)]/60 uppercase tracking-wide font-medium">Followers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-[var(--foreground)]">{stats?.user?.followingCount || 0}</div>
                        <div className="text-xs text-[var(--foreground)]/60 uppercase tracking-wide font-medium">Following</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-[var(--foreground)]/70 mb-1">Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--foreground)]/70 mb-1">Headline</label>
                    <input
                        type="text"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Software Engineer..."
                        className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--foreground)]/70 mb-1">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground)]/60" />
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--foreground)]/70 mb-1">About</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 text-sm text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] outline-none resize-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || uploading}
                className="w-full py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
            </button>
            </form>
        </motion.div>

        {/* Right Panel: Stats & Graphs */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 xl:col-span-8 space-y-8"
        >
            {/* Rating Graph Card */}
            <div className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Contest Rating</h3>
                        <p className="text-sm text-[var(--foreground)]/60">Current Rating: <span className="font-mono font-bold text-[var(--accent-gradient-to)]">{stats?.user?.rating || 1500}</span></p>
                    </div>
                </div>
                
                <div className="h-[300px] w-full">
                    {loadingStats ? (
                        <div className="h-full flex items-center justify-center text-[var(--foreground)]/40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : stats?.ratingHistory?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.ratingHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.5} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="var(--foreground)" 
                                    opacity={0.5} 
                                    tick={{fontSize: 12}} 
                                    tickMargin={10}
                                />
                                <YAxis 
                                    stroke="var(--foreground)" 
                                    opacity={0.5} 
                                    tick={{fontSize: 12}}
                                    domain={['dataMin - 50', 'dataMax + 50']}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--card-bg)', 
                                        borderColor: 'var(--card-border)',
                                        borderRadius: '8px',
                                        color: 'var(--foreground)'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    labelStyle={{ color: 'var(--foreground)', marginBottom: '5px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="rating" 
                                    stroke="var(--foreground)" 
                                    strokeWidth={2} 
                                    dot={{ r: 4, fill: 'var(--card-bg)', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-[var(--foreground)]/40 border-2 border-dashed border-[var(--card-border)] rounded-xl">
                            <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
                            <p>No contest history yet.</p>
                            <p className="text-xs">Participate in contests to establish your rating!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contribution Calendar Card */}
            <div className="p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--foreground)]">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Submission Heatmap</h3>
                        <p className="text-sm text-[var(--foreground)]/60">Your coding activity over the last year</p>
                    </div>
                </div>

                <div className="flex justify-center overflow-x-auto pb-2">
                    {loadingStats ? (
                         <div className="py-12 flex items-center justify-center text-[var(--foreground)]/40">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : stats?.calendarData?.length > 0 ? (
                        <ActivityCalendar 
                            data={stats.calendarData}
                            theme={{
                                light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                            }}
                            colorScheme={theme === 'dark' ? 'dark' : 'light'}
                            blockSize={12}
                            blockMargin={4}
                            fontSize={12}
                            style={{ color: 'var(--foreground)' }}
                        />
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-[var(--foreground)]/40 border-2 border-dashed border-[var(--card-border)] rounded-xl">
                            <Calendar className="w-10 h-10 mb-2 opacity-50" />
                            <p>No activity yet.</p>
                            <p className="text-xs">Solve problems to see your heatmap!</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
      </div>
    </main>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center space-x-2 text-[var(--foreground)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-2 border-[var(--foreground)]/50 border-t-[var(--foreground)] rounded-full"
      />
    </div>
  );
}
