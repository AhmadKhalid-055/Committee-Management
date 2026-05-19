"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CommitteeModal } from "@/components/committees/CommitteeModal";
import { exportToCSV } from "@/lib/export";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CommitteesPage() {
  const router = useRouter();
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [committeeToEdit, setCommitteeToEdit] = useState<any>(null);

  const fetchCommittees = async (search = "", category = "", currentPage = 1) => {
    setLoading(true);
    try {
      const url = `/api/committees?search=${encodeURIComponent(search)}&page=${currentPage}&limit=10${category && category !== "all" ? `&category=${category}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCommittees(json.data.committees);
        setTotalPages(json.data.totalPages);
        setTotalItems(json.data.total);
      }
    } catch (e) {
      toast.error("Failed to load committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // get user role first
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.success) setUserRole(j.data.role);
    });
    fetchCommittees();
  }, []);

  // Debounced search & filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCommittees(searchQuery, categoryFilter, page);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryFilter, page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this committee?")) return;
    try {
      const res = await fetch(`/api/committees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Committee deleted");
        fetchCommittees(searchQuery);
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleOpenAddModal = () => {
    setCommitteeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (committee: any) => {
    setCommitteeToEdit(committee);
    setIsModalOpen(true);
  };

  const handleExportCommittees = () => {
    const headers = [
      { key: "name", label: "Committee Name" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description" },
      { key: "chairman.name", label: "Chairman" },
      { key: "status", label: "Status" }
    ];
    exportToCSV(committees, headers, "organizational_committees");
    toast.success("Committees list exported successfully!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Committees</h1>
          <p className="text-muted-foreground mt-1">Manage all organizational committees and their members.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCommittees} disabled={committees.length === 0}>
            Export List
          </Button>
          {userRole === "super_admin" && (
            <Button onClick={handleOpenAddModal} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" /> Add Committee
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search committees..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <select 
                className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
                <option value="student_affairs">Student Affairs</option>
                <option value="ad_hoc">Ad-hoc / Special</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Committee Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Chairman</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : committees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No committees found.</TableCell>
                  </TableRow>
                ) : (
                  committees.map((committee) => (
                    <TableRow key={committee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold">{committee.name}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{committee.description}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{committee.category.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        {committee.chairman ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{committee.chairman.name}</span>
                            <span className="text-xs text-muted-foreground">{committee.chairman.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize
                          ${committee.status === 'active' ? 'bg-green-100 text-green-800' : 
                            committee.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {committee.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/committees/${committee._id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {userRole === "super_admin" && (
                              <>
                                <DropdownMenuItem onClick={() => handleOpenEditModal(committee)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleDelete(committee._id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t text-xs text-muted-foreground flex justify-between items-center">
            <span>Showing {committees.length} of {totalItems} results</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CommitteeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        committeeToEdit={committeeToEdit}
        onSuccess={() => fetchCommittees(searchQuery)}
      />
    </motion.div>
  );
}
