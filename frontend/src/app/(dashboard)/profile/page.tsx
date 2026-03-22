"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { UserCircle, PenLine, Camera, CheckCircle2, Loader2, User as UserIcon, Zap, UserCog, Save, Shield, Lock, ScanFace, Key } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    name: "",
    rank: "Not Specified",
    vesselType: "Not Specified",
    bio: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const meta = session.user.user_metadata;
        setProfileData({
          name: meta?.full_name || session.user.email?.split("@")[0] || "",
          rank: meta?.rank || "Not Specified",
          vesselType: meta?.vessel_type || "Not Specified",
          bio: meta?.bio || ""
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: profileData.name,
        rank: profileData.rank,
        vessel_type: profileData.vesselType,
        bio: profileData.bio
      }
    });

    if (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile updates.");
    } else {
      if (data?.user) setUser(data.user);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      
      const file = e.target.files[0];
      setLoadingAvatar(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      if (updateData?.user) setUser(updateData.user);
      
    } catch (error: any) {
      console.error(error);
      alert(`Upload failed: ${error.message}\nMake sure you have created an "avatars" storage bucket in Supabase and set it to Public!`);
    } finally {
      setLoadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in slide-in-from-bottom-4 duration-300">
      {/* Dashboard Title */}
      <header className="mb-12">
        <h1 className="text-4xl font-headline font-extrabold tracking-wider uppercase text-on-surface mb-2">Personnel File</h1>
        <p className="text-on-surface-variant font-body">Sub-Sector 7 / Command Personnel / ID-{user?.id?.substring(0, 4) || "9982"}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: User Profile Card (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-xl p-8 relative overflow-hidden group">
            {/* Abstract Background Decoration */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <label className="w-40 h-40 rounded-full border-2 border-primary/30 p-2 mb-6 cursor-pointer relative group-hover:border-primary/60 transition-colors block">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={loadingAvatar}
                />
                <div className="w-full h-full rounded-full overflow-hidden border border-primary primary-glow relative bg-surface-container-highest flex items-center justify-center">
                  {loadingAvatar ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Uploading</span>
                    </div>
                  ) : user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-16 w-16 text-primary/40" />
                  )}
                  {/* Overlay on hover */}
                  {!loadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white mb-1" />
                      <span className="text-[10px] font-bold text-white tracking-widest uppercase">Update Photo</span>
                    </div>
                  )}
                </div>
              </label>
              
              <div className="mb-1 text-[10px] font-headline tracking-[0.3em] text-primary uppercase font-bold">{profileData.rank}</div>
              <h2 className="text-2xl font-headline font-extrabold tracking-widest text-on-surface mb-1">{profileData.name || "Anonymous Officer"}</h2>
              <p className="text-on-surface-variant text-sm tracking-wide mb-6">{profileData.vesselType}</p>
              
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary">Duty Status: Active</span>
              </div>
              
              <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-outline-variant/10 pt-8">
                <div>
                  <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold mb-1">Account Born</div>
                  <div className="text-sm font-headline font-bold text-on-surface">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold mb-1">Clearance</div>
                  <div className="text-lg font-headline font-bold text-tertiary">Level 9</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Auxiliary Stats Card */}
          <div className="glass-card rounded-xl p-6 border-l-4 border-l-tertiary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-tertiary">System Health</h3>
              <Zap className="h-4 w-4 text-tertiary" />
            </div>
            <div className="space-y-4">
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full w-[88%] text-tertiary" style={{boxShadow: '0 0 15px rgba(233, 193, 118, 0.3)'}}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                <span>Core Stability</span>
                <span>88%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Stack (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Details Edit */}
          <section className="glass-card rounded-xl p-8 relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <UserCog className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-headline font-bold tracking-wider uppercase">Operational Dossier</h3>
              </div>
              {successMsg && (
                <span className="text-primary text-sm font-bold tracking-widest uppercase flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 className="h-4 w-4" /> Updated
                </span>
              )}
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Officer Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="input-field bg-surface-container-highest border-b-2 border-transparent focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Current Assignment Rank</label>
                  <select 
                    value={profileData.rank}
                    onChange={e => setProfileData({...profileData, rank: e.target.value})}
                    className="input-field bg-surface-container-highest border-b-2 border-transparent focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="Not Specified">Not Specified</option>
                    <option value="Master">Master</option>
                    <option value="Chief Officer">Chief Officer</option>
                    <option value="Second Officer">Second Officer</option>
                    <option value="Third Officer">Third Officer</option>
                    <option value="Chief Engineer">Chief Engineer</option>
                    <option value="Second Engineer">Second Engineer</option>
                    <option value="Electro-Technical Officer (ETO)">ETO</option>
                    <option value="Cadet">Cadet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Primary Vessel Designation</label>
                <select 
                  value={profileData.vesselType}
                  onChange={e => setProfileData({...profileData, vesselType: e.target.value})}
                  className="input-field bg-surface-container-highest border-b-2 border-transparent focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="Oil Tanker">Oil Tanker</option>
                  <option value="Chemical Tanker">Chemical Tanker</option>
                  <option value="Gas Carrier (LNG/LPG)">Gas Carrier (LNG/LPG)</option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                  <option value="Container Ship">Container Ship</option>
                  <option value="Offshore / DP">Offshore / DP</option>
                  <option value="Passenger / Cruise">Passenger / Cruise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Tactical Biography</label>
                <textarea 
                  rows={4}
                  value={profileData.bio}
                  onChange={e => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Detail your operational history, certifications, and combat-readiness..."
                  className="input-field bg-surface-container-highest border-b-2 border-transparent focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary min-w-[200px] flex items-center justify-center space-x-3 tracking-widest text-xs uppercase"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Commit Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Security/Account */}
          <section className="glass-card rounded-xl p-8">
            <div className="flex items-center space-x-4 mb-8">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-headline font-bold tracking-wider uppercase">Security / Account</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Sub-Network ID</label>
                <div className="p-4 bg-surface-container-highest rounded-lg flex items-center justify-between border-b-2 border-transparent">
                  <span className="font-mono text-sm">{user?.email || "ENCRYPTED"}</span>
                  <Lock className="h-4 w-4 text-on-surface-variant" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold px-1">Biometric Authorization Status</label>
                <div className="p-4 bg-surface-container-highest rounded-lg flex items-center justify-between border-b-2 border-tertiary">
                  <span className="text-sm font-bold text-tertiary">ENCRYPTED & VERIFIED</span>
                  <ScanFace className="h-4 w-4 text-tertiary" />
                </div>
              </div>
              
              <div className="md:col-span-2 pt-4">
                <button className="flex items-center justify-center space-x-3 w-full py-4 border border-outline-variant/20 rounded-xl font-headline text-xs font-extrabold tracking-[0.2em] uppercase hover:bg-surface-container-highest hover:border-primary/30 transition-all group">
                  <Key className="h-5 w-5 text-primary group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-on-surface">Reset Encryption Key</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
