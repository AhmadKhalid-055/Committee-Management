"use client";

import { useEffect, useState } from "react";
import { 
  File, Search, Upload, Download, Trash2, Eye, ExternalLink, 
  FileText, Image as ImageIcon, Briefcase, FileSpreadsheet, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState("other");
  const [docCommittee, setDocCommittee] = useState("");

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = "/api/documents?";
      if (categoryFilter !== "all") url += `category=${categoryFilter}&`;
      if (committeeFilter !== "all") url += `committeeId=${committeeFilter}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data);
      }
    } catch (e) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommittees = async () => {
    try {
      const res = await fetch("/api/committees");
      const json = await res.json();
      if (json.success) {
        setCommittees(json.data.committees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) setUser(j.data);
    });
    fetchCommittees();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, committeeFilter, searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docCommittee) {
      toast.error("Please select a file and a committee.");
      return;
    }

    setUploadLoading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const payload = {
          name: docName || selectedFile.name,
          url: base64Data,
          size: selectedFile.size,
          type: selectedFile.type,
          category: docCategory,
          committeeId: docCommittee,
        };

        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success) {
          toast.success("Document uploaded successfully!");
          setIsUploadOpen(false);
          setSelectedFile(null);
          setDocName("");
          setDocCategory("other");
          setDocCommittee("");
          fetchDocuments();
        } else {
          toast.error(json.error || "Upload failed");
        }
        setUploadLoading(false);
      };
    } catch (err) {
      toast.error("Error processing file");
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Document deleted");
        fetchDocuments();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDownload = (doc: any) => {
    try {
      const link = window.document.createElement("a");
      link.href = doc.url;
      link.download = doc.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (mime.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (mime.includes("word") || mime.includes("officedocument.word")) return <Briefcase className="h-5 w-5 text-blue-700" />;
    if (mime.includes("excel") || mime.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
          <p className="text-muted-foreground mt-1">Upload, organize, and preview committee reports and resources.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="shrink-0">
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={committeeFilter}
              onChange={(e) => setCommitteeFilter(e.target.value)}
            >
              <option value="all">All Committees</option>
              {committees.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="minutes">Minutes</option>
              <option value="report">Reports</option>
              <option value="proposal">Proposals</option>
              <option value="guideline">Guidelines</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* File listing table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Committee</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading documents...</TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No documents found.</TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          <span className="truncate max-w-[200px]">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{doc.category}</TableCell>
                      <TableCell>{formatBytes(doc.size)}</TableCell>
                      <TableCell>{doc.committee?.name}</TableCell>
                      <TableCell>{doc.uploadedBy?.name}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {/* Only allow uploader or admin to delete */}
                        {(user?.role === "super_admin" || user?._id === doc.uploadedBy?._id || user?.userId === doc.uploadedBy?._id) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload File Modal */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => !open && setIsUploadOpen(false)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select files to upload into the secure storage repository.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="file-input">Select File</Label>
              <Input 
                id="file-input" 
                type="file" 
                onChange={handleFileChange}
                disabled={uploadLoading}
                required
              />
            </div>

            {selectedFile && (
              <div className="space-y-1">
                <Label htmlFor="doc-name">Display Name</Label>
                <Input 
                  id="doc-name" 
                  value={docName} 
                  onChange={(e) => setDocName(e.target.value)}
                  disabled={uploadLoading}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Target Committee</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={docCommittee}
                onChange={(e) => setDocCommittee(e.target.value)}
                disabled={uploadLoading}
                required
              >
                <option value="">Select Committee</option>
                {committees.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                disabled={uploadLoading}
              >
                <option value="other">Other</option>
                <option value="minutes">Minutes</option>
                <option value="report">Reports</option>
                <option value="proposal">Proposals</option>
                <option value="guideline">Guidelines</option>
              </select>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)} disabled={uploadLoading}>Cancel</Button>
              <Button type="submit" disabled={uploadLoading}>
                {uploadLoading ? "Uploading..." : "Upload File"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF/File Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-[700px] h-[600px] flex flex-col p-4">
          <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <DialogTitle className="text-lg truncate max-w-[500px]">{previewDoc?.name}</DialogTitle>
              <DialogDescription className="text-xs">Category: {previewDoc?.category} • Committee: {previewDoc?.committee?.name}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDoc(null)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 w-full bg-slate-100 rounded-md overflow-hidden relative">
            {previewDoc?.type.includes("pdf") ? (
              <object
                data={previewDoc.url}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full p-4 text-center text-sm text-muted-foreground">
                  <p>PDF preview is not supported directly in this environment.</p>
                  <Button variant="link" onClick={() => handleDownload(previewDoc)} className="mt-2 text-blue-600">
                    Download file instead
                  </Button>
                </div>
              </object>
            ) : previewDoc?.type.includes("image") ? (
              <img
                src={previewDoc.url}
                alt={previewDoc.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-sm text-muted-foreground space-y-4">
                <File className="h-16 w-16 text-slate-400" />
                <div>
                  <p className="font-semibold text-foreground">Preview not available for this file type</p>
                  <p className="text-xs">You can download it to review contents on your machine.</p>
                </div>
                <Button onClick={() => handleDownload(previewDoc)}>
                  Download File ({formatBytes(previewDoc?.size || 0)})
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
