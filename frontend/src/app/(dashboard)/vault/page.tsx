"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FolderLock, Upload, FileText, FileBadge, Trash2, Calendar, Search, Filter, Eye, ChevronLeft, ChevronRight, Activity, AlertTriangle, X } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  expiry: string | null;
  size: string;
  uploadDate: string;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.storage.from('vault').list(user.id, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (error) return; // Silent fail if bucket/folder doesn't exist yet

      if (data) {
        // Filter out placeholders and the AI chat history cache
        const files = data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== 'chat_history.json');
        
        const docs = files.map(file => ({
          id: `${user.id}/${file.name}`,
          name: file.name.split('_').slice(1).join('_') || file.name, // Remove timestamp if present
          type: file.name.split('.').pop()?.toUpperCase() || "FILE",
          expiry: null,
          size: file.metadata?.size ? (file.metadata.size / (1024 * 1024)).toFixed(1) + " MB" : "Unknown",
          uploadDate: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : "Unknown"
        }));
        
        setDocuments(docs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && user) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      try {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from('vault')
          .upload(fileName, file, { upsert: true });
          
        if (error) throw error;
        
        await fetchDocuments();
        alert("Document securely uploaded to Vault!");
      } catch (err: any) {
        console.error(err);
        alert(`Failed to upload: ${err.message}\nMake sure you have created a 'vault' public bucket in Supabase.`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document from the Vault?")) return;

    try {
      const { error } = await supabase.storage.from('vault').remove([id]);
      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const filteredDocs = documents.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl font-extrabold tracking-wider text-on-surface mb-2 uppercase">Document Vault</h1>
            <p className="text-on-surface-variant text-lg tracking-wide max-w-2xl">High-precision management for maritime safety standards, operational manuals, and vessel procedures.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10 min-w-[140px]">
              <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-tighter mb-1">Total Files</div>
              <div className="text-2xl font-bold font-headline text-primary">{documents.length}</div>
            </div>
            <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10 min-w-[140px]">
              <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-tighter mb-1">Compliance</div>
              <div className="text-2xl font-bold font-headline text-tertiary">98.4%</div>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Toolbar */}
      <section className="glass-card p-6 rounded-2xl mb-8 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search manuals, IDs or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest border-none rounded-xl py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none" 
          />
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent transition-all group-focus-within:bg-tertiary"></div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto lg:ml-auto">
          <button className="flex items-center gap-2 px-5 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl border border-outline-variant/10 transition-all">
            <Filter className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide">Category</span>
          </button>
          
          <label className="ml-2 btn-primary !px-6 !py-3 !rounded-xl flex items-center gap-2 shadow-lg cursor-pointer hover:brightness-110 transition-all active:scale-95">
            {isUploading ? (
              <><span className="animate-spin text-xl">↻</span> Uploading...</>
            ) : (
              <><Upload className="h-5 w-5" /> <span>Upload Manual</span></>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </section>

      {/* Document Grid */}
      <section className="glass-card rounded-2xl overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30">
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Manual Name</th>
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Type</th>
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Status</th>
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">File Size</th>
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Expiry</th>
                <th className="px-6 py-5 text-xs font-headline uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <FileBadge className="h-16 w-16 text-on-surface-variant/30 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-on-surface-variant">No documents found</h3>
                    <p className="text-on-surface-variant/60 mt-1">Upload a file to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isExpiringSoon = doc.expiry && new Date(doc.expiry).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 90;
                  
                  return (
                    <tr key={doc.id} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface tracking-wide">{doc.name}</div>
                            <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{doc.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-2 py-1 bg-surface-container-high rounded text-xs font-mono text-cyan-400 border border-cyan-400/20">{doc.type}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full \${isExpiringSoon ? 'bg-tertiary' : 'bg-primary'}`}></span>
                          <span className={`text-sm font-medium \${isExpiringSoon ? 'text-tertiary' : 'text-primary'}`}>
                            {isExpiringSoon ? 'Action Reqd' : 'Current'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant font-medium tracking-tight">{doc.size}</td>
                      <td className="px-6 py-6 text-sm text-on-surface-variant font-medium">
                        {doc.expiry ? doc.expiry : <span className="opacity-50">N/A</span>}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-all" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedDocUrl(supabase.storage.from('vault').getPublicUrl(doc.id).data.publicUrl); 
                            }}
                            title="View Document"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                            className="p-2 hover:bg-error/20 rounded-lg text-error transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination / Footer */}
        {filteredDocs.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between bg-surface-container-highest/10 border-t border-outline-variant/10">
            <div className="text-sm text-on-surface-variant font-medium">
              Showing <span className="text-on-surface">1 - {filteredDocs.length}</span> of {documents.length} documents
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface border border-outline-variant/10 transition-all flex items-center gap-1 opacity-50 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Prev</span>
              </button>
              <button className="px-4 py-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface border border-outline-variant/10 transition-all flex items-center gap-1 opacity-50 cursor-not-allowed">
                <span className="text-xs font-bold uppercase tracking-wider">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Secondary Insights */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 md:col-span-2 glass-card p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Activity className="h-32 w-32" />
          </div>
          <h3 className="font-headline text-xl font-bold tracking-widest text-on-surface uppercase mb-6">Vault Activity Stream</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-1 bg-primary h-auto rounded-full"></div>
              <div>
                <p className="text-on-surface font-medium">New document version uploaded: <span className="text-primary tracking-wide">MARPOL Annex VI (v1.1.0)</span></p>
                <p className="text-xs text-on-surface-variant mt-1">2 hours ago • Officer J. Sterling</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-tertiary h-auto rounded-full"></div>
              <div>
                <p className="text-on-surface font-medium">System Maintenance: <span className="text-tertiary tracking-wide">Document encryption protocols updated</span></p>
                <p className="text-xs text-on-surface-variant mt-1">8 hours ago • System</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 bg-primary h-auto rounded-full"></div>
              <div>
                <p className="text-on-surface font-medium">Document accessed by {(documents.length * 3) + 2} personnel: <span className="text-primary tracking-wide">SOLAS Consolidated 2024</span></p>
                <p className="text-xs text-on-surface-variant mt-1">12 hours ago • Fleet Sector 7G</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-8 rounded-2xl flex flex-col justify-between border-l-4 border-l-tertiary group">
          <div>
            <AlertTriangle className="h-10 w-10 text-tertiary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-headline text-lg font-bold tracking-widest text-on-surface uppercase mb-4">Critical Update Required</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">The <span className="text-tertiary font-semibold">Ballast Water Management Manual</span> version on Fleet Sector 7G is currently out of sync with international standards (IMO 2024 Amendments).</p>
          </div>
          <button className="mt-8 w-full py-3 bg-tertiary/10 border border-tertiary/30 text-tertiary font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-tertiary hover:text-on-tertiary transition-all">
            Update Fleet Manuals
          </button>
        </div>
      </section>

      {/* Document Viewer Modal Overlay */}
      {selectedDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden border border-outline-variant/30 shadow-2xl">
            <div className="flex justify-between items-center p-4 bg-surface-container-high border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-on-surface uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Viewer
              </h3>
              <button 
                onClick={() => setSelectedDocUrl(null)}
                className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10 flex items-center gap-2"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-surface-container-highest">
              <iframe 
                src={selectedDocUrl} 
                className="w-full h-full border-none"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
