import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  addNotice,
  getNotices,
  updateNotice,
  deleteNotice,
  getNoticeCategories,
  getEmailToUserCode,
  renameNoticeCategoryEverywhere,
  clearNoticeCategoryEverywhere,
} from "../utils/noticeUtils";
import { PlusCircle, Edit, Trash, Eye, EyeOff, Search, Tags, Pencil } from "lucide-react";
import { LinkifiedText } from "@/components/LinkifiedText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the Notice type
export interface Notice {
  id?: string;
  title: string;
  category: string;
  description: string;
  content: string;
  date: string;
  author: string;
  visibility: "public" | "private";
}

const InternalNotices = () => {
  const { currentUser, userData } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [emailToUserCodeMap, setEmailToUserCodeMap] = useState<Record<string, string>>({});
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameNewValue, setRenameNewValue] = useState("");
  const [deleteTargetCategory, setDeleteTargetCategory] = useState<string | null>(null);
  const [manageNewCategory, setManageNewCategory] = useState("");

  const form = useForm<Omit<Notice, "id" | "date" | "author">>({
    defaultValues: {
      title: "",
      category: "",
      description: "",
      content: "",
      visibility: "public" as const,
    },
  });

  // Reset form when selectedNotice changes or editing mode changes
  useEffect(() => {
    if (selectedNotice && isEditing) {
      // When editing, set form values from the selected notice
      form.reset({
        title: selectedNotice.title,
        category: selectedNotice.category,
        description: selectedNotice.description,
        content: selectedNotice.content,
        visibility: selectedNotice.visibility,
      });
    } else if (!isEditing) {
      // When not editing, reset to empty values
      form.reset({
        title: "",
        category: "",
        description: "",
        content: "",
        visibility: "public" as const,
      });
    }
  }, [selectedNotice, isEditing, form]);

  // Load categories
  const loadCategories = async () => {
    try {
      const loadedCategories = await getNoticeCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Build email to user code mapping
  const buildEmailToUserCodeMap = async (notices: Notice[]) => {
    const uniqueEmails = [...new Set(notices.map(notice => notice.author))];
    const mapping: Record<string, string> = {};
    
    for (const email of uniqueEmails) {
      try {
        const userCode = await getEmailToUserCode(email);
        mapping[email] = userCode;
      } catch (error) {
        console.error(`Failed to get user code for ${email}:`, error);
        mapping[email] = email; // Fallback to email
      }
    }
    
    setEmailToUserCodeMap(mapping);
  };

  const reloadNoticesAndCategories = useCallback(async () => {
    const isAdmin = userData?.role === "admin";
    const [updatedNotices, updatedCategories] = await Promise.all([
      getNotices(
        { userCode: userData?.userCode, email: currentUser?.email || undefined },
        isAdmin
      ),
      getNoticeCategories(),
    ]);
    setNotices(updatedNotices);
    setCategories(updatedCategories);
    await buildEmailToUserCodeMap(updatedNotices);
  }, [currentUser, userData]);

  useEffect(() => {
    // Load notices and categories on component mount
    const loadData = async () => {
      setIsLoading(true);
      try {
        const isAdmin = userData?.role === "admin";
        const identity = { userCode: userData?.userCode, email: currentUser?.email || undefined };
        const [loadedNotices, loadedCategories] = await Promise.all([
          getNotices(identity, isAdmin),
          getNoticeCategories(),
        ]);
        setNotices(loadedNotices);
        setCategories(loadedCategories);
        await buildEmailToUserCodeMap(loadedNotices);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser, userData]);

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const upperCategory = newCategory.trim().toUpperCase();
      if (!categories.includes(upperCategory)) {
        setCategories(prev => [...prev, upperCategory].sort());
        form.setValue("category", upperCategory);
      }
      setNewCategory("");
      setShowNewCategoryInput(false);
    }
  };

  const handleManageCreateCategory = () => {
    const raw = manageNewCategory.trim();
    if (!raw) return;
    const upper = raw.toUpperCase();
    if (categories.includes(upper)) {
      toast.message("That category already exists.");
      return;
    }
    setCategories((prev) => [...prev, upper].sort());
    setManageNewCategory("");
    toast.success(
      "Category added. It stays in the list after reload once a note uses it."
    );
  };

  const handleConfirmRenameCategory = async () => {
    if (!renameTarget) return;
    const next = renameNewValue.trim().toUpperCase();
    if (!next) {
      toast.error("Enter a new category name");
      return;
    }
    if (next === renameTarget.trim().toUpperCase()) {
      toast.error("New name must be different from the current one");
      return;
    }
    setIsLoading(true);
    try {
      const { updated } = await renameNoticeCategoryEverywhere(renameTarget, next);
      if (updated === 0) {
        toast.message("No notes used that category.");
      } else {
        toast.success(
          `Renamed category on ${updated} note${updated === 1 ? "" : "s"}.`
        );
      }
      setRenameTarget(null);
      setRenameNewValue("");
      await reloadNoticesAndCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteTargetCategory) return;
    setIsLoading(true);
    try {
      const { updated } = await clearNoticeCategoryEverywhere(deleteTargetCategory);
      if (updated === 0) {
        toast.message("No notes had that category.");
      } else {
        toast.success(
          `Removed category from ${updated} note${updated === 1 ? "" : "s"}.`
        );
      }
      setDeleteTargetCategory(null);
      setManageCategoriesOpen(false);
      await reloadNoticesAndCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove category.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: Omit<Notice, "id" | "date" | "author">) => {
    if (!currentUser?.email) {
      toast.error("You must be logged in to add a notice");
      return;
    }

    // Check if user can edit this notice (for updates)
    if (isEditing && selectedNotice) {
      const currentUserCode = userData?.userCode || currentUser?.email;
      if (
        userData?.role !== "admin" &&
        selectedNotice.author !== currentUserCode
      ) {
        toast.error("You can only edit your own notices");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Transform title and category to uppercase
      const transformedValues = {
        ...values,
        title: values.title.toUpperCase(),
        category: values.category.toUpperCase(),
      };

      if (isEditing && selectedNotice?.id) {
        await updateNotice(selectedNotice.id, transformedValues);
        toast.success("Notice updated successfully");
      } else {
        // Add new notice
        const userCode = userData?.userCode || currentUser.email;
        const newNotice: Notice = {
          ...transformedValues,
          date: new Date().toISOString(),
          author: userCode,
        };

        await addNotice(newNotice);
        toast.success("Notice added successfully");
      }

      // Reset form and close dialog
      form.reset();
      setIsEditing(false);
      setSelectedNotice(null);
      setDialogOpen(false);

      // Refresh list in background (prevents "freeze" feeling after clicking Update)
      const isAdmin = userData?.role === "admin";
      void (async () => {
        const [updatedNotices, updatedCategories] = await Promise.all([
          getNotices({ userCode: userData?.userCode, email: currentUser?.email || undefined }, isAdmin),
          getNoticeCategories(),
        ]);
        setNotices(updatedNotices);
        setCategories(updatedCategories);
        await buildEmailToUserCodeMap(updatedNotices);
      })();
    } catch (error) {
      console.error("Error in onSubmit:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("ERR_BLOCKED_BY_CLIENT")) {
          toast.error(
            "Network request blocked. Please check your browser extensions or firewall settings."
          );
        } else if (error.message.includes("permission-denied")) {
          toast.error("Permission denied. Please check your user permissions.");
        } else if (error.message.includes("unauthenticated")) {
          toast.error("You must be logged in to perform this action.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error(
          isEditing ? "Failed to update notice" : "Failed to add notice"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (notice: Notice) => {
    // Check if user can edit this notice
    if (
      notice.author !== userData?.userCode &&
      notice.author !== currentUser?.email
    ) {
      toast.error("You can only edit your own notices");
      return;
    }

    setIsEditing(true);
    setSelectedNotice(notice);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Find the notice to check permissions
    const notice = notices.find((n) => n.id === id);
    if (!notice) {
      toast.error("Notice not found");
      return;
    }

    // Check if user can delete this notice
    if (
      notice.author !== userData?.userCode &&
      notice.author !== currentUser?.email
    ) {
      toast.error("You can only delete your own notices");
      return;
    }

    if (confirm("Are you sure you want to delete this notice?")) {
      setIsLoading(true);
      try {
        await deleteNotice(id);

        // Reload notices after deletion
        const isAdmin = userData?.role === "admin";
        const updatedNotices = await getNotices(
          { userCode: userData?.userCode, email: currentUser?.email || undefined },
          isAdmin
        );
        setNotices(updatedNotices);
        await buildEmailToUserCodeMap(updatedNotices);

        toast.success("Notice deleted successfully");
      } catch (error) {
        toast.error("Failed to delete notice");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter notices based on search term
  const filteredNotices = notices.filter((notice) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      notice.title.toLowerCase().includes(searchLower) ||
      (notice.category || "").toLowerCase().includes(searchLower) ||
      notice.description.toLowerCase().includes(searchLower) ||
      notice.content.toLowerCase().includes(searchLower) ||
      notice.author.toLowerCase().includes(searchLower)
    );
  });

  const openAddDialog = () => {
    // Check authentication status
    if (!currentUser) {
      toast.error("You must be logged in to create a notice");
      return;
    }

    setIsEditing(false);
    setSelectedNotice(null);
    form.reset({
      title: "",
      category: "",
      description: "",
      content: "",
      visibility: "public" as const,
    });
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notes</h1>

          <div className="flex items-center gap-2">
            {userData?.role === "admin" && (
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2 bg-slate-600 text-white border-slate-500 hover:bg-slate-500 hover:text-white"
                onClick={() => setManageCategoriesOpen(true)}
              >
                <Tags size={18} />
                <span>Categories</span>
              </Button>
            )}
            <Button className="flex items-center gap-2" onClick={openAddDialog}>
              <PlusCircle size={18} />
              <span>Add Note</span>
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search notices by title, category, description, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card text-card-foreground border-slate-500 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              {filteredNotices.length} notice{filteredNotices.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {isLoading && notices.length === 0 ? (
          <div className="text-center py-8">
            <p>Loading notices...</p>
          </div>
        ) : filteredNotices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotices.map((notice) => (
              <Card key={notice.id} className="bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {notice.title}
                        {notice.visibility === "private" ? (
                          <EyeOff
                            size={16}
                            className="text-orange-500"
                            title="Private notice"
                          />
                        ) : (
                          <Eye
                            size={16}
                            className="text-green-500"
                            title="Public notice"
                          />
                        )}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <div className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                          {notice.category?.trim()
                            ? notice.category
                            : "Uncategorized"}
                        </div>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            notice.visibility === "private"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {notice.visibility === "private"
                            ? "Private"
                            : "Public"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(notice.author === userData?.userCode ||
                        notice.author === currentUser?.email) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(notice)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => notice.id && handleDelete(notice.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">
                    Posted on {new Date(notice.date).toLocaleDateString()} by{" "}
                    {emailToUserCodeMap[notice.author] || notice.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{notice.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNotice(notice)}
                      >
                        Read More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{notice.title}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">
                          Category:{" "}
                          {notice.category?.trim()
                            ? notice.category
                            : "Uncategorized"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posted on {new Date(notice.date).toLocaleDateString()}{" "}
                          by {notice.author}
                        </div>
                        <div className="mt-4 whitespace-pre-wrap break-words">
                          <LinkifiedText text={notice.content} />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <p>No notices found matching "{searchTerm}".</p>
            <Button 
              variant="secondary" 
              onClick={() => setSearchTerm("")} 
              className="mt-4 bg-slate-600 text-white border-slate-500 hover:bg-slate-700 hover:text-white"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No notices available at this time.</p>
          </div>
        )}
      </div>

      <Dialog
        open={manageCategoriesOpen}
        onOpenChange={(open) => {
          setManageCategoriesOpen(open);
          if (!open) {
            setRenameTarget(null);
            setRenameNewValue("");
            setManageNewCategory("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] text-card-foreground">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rename updates every note that uses the category. Delete removes the
            label only; notes are kept (they appear as uncategorized until you
            assign a category again).
          </p>
          <div className="space-y-2 rounded-md border border-border p-3">
            <p className="text-sm font-medium">Create category</p>
            <p className="text-xs text-muted-foreground">
              It appears in this list and in the note form. It persists after a
              refresh once at least one note uses it.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={manageNewCategory}
                onChange={(e) =>
                  setManageNewCategory(e.target.value.toUpperCase())
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManageCreateCategory();
                  }
                }}
                style={{ textTransform: "uppercase" }}
                placeholder="Category name"
                className="bg-card sm:flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                disabled={!manageNewCategory.trim()}
                onClick={handleManageCreateCategory}
              >
                Add category
              </Button>
            </div>
          </div>
          {renameTarget && (
            <div className="space-y-2 rounded-md border border-slate-500 p-3 bg-slate-800/50">
              <p className="text-sm font-medium text-white">
                Rename &quot;{renameTarget}&quot;
              </p>
              <Input
                value={renameNewValue}
                onChange={(e) =>
                  setRenameNewValue(e.target.value.toUpperCase())
                }
                style={{ textTransform: "uppercase" }}
                placeholder="New category name"
                className="bg-card"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRenameTarget(null);
                    setRenameNewValue("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleConfirmRenameCategory()}
                  disabled={
                    isLoading ||
                    !renameNewValue.trim() ||
                    renameNewValue.trim().toUpperCase() ===
                      renameTarget.trim().toUpperCase()
                  }
                >
                  Save
                </Button>
              </div>
            </div>
          )}
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {categories.length === 0 ? (
              <li className="text-sm text-muted-foreground">No categories yet.</li>
            ) : (
              categories.map((cat) => (
                <li
                  key={cat}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2"
                >
                  <span className="truncate text-sm font-medium">{cat}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        setRenameTarget(cat);
                        setRenameNewValue(cat);
                      }}
                      title="Rename category"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-muted"
                      onClick={() => setDeleteTargetCategory(cat)}
                      title="Remove category from all notes"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTargetCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove category?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the &quot;{deleteTargetCategory}&quot; label from
              every note that uses it. No notes are deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={() => void handleConfirmDeleteCategory()}
            >
              {isLoading ? "Working…" : "Remove category"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Note" : "Add New Note form"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Note title" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) => {
                            if (value === "__add_new__") {
                              setShowNewCategoryInput(true);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select or create a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="__add_new__">
                              + Add new category
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showNewCategoryInput && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new category"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCategory();
                                }
                                if (e.key === 'Escape') {
                                  setShowNewCategoryInput(false);
                                  setNewCategory("");
                                }
                              }}
                              style={{ textTransform: 'uppercase' }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleAddCategory}
                              disabled={!newCategory.trim()}
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowNewCategoryInput(false);
                                setNewCategory("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          Public (Visible to all users)
                        </SelectItem>
                        <SelectItem value="private">
                          Private (Visible only to you)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short description for the notice card"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full email content here"
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? isEditing
                      ? "Updating..."
                      : "Adding..."
                    : isEditing
                    ? "Update"
                    : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternalNotices;
