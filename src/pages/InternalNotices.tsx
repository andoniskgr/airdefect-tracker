import { useState, useEffect } from "react";
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
} from "../utils/noticeUtils";
import { PlusCircle, Edit, Trash, Eye, EyeOff, Search } from "lucide-react";

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

  useEffect(() => {
    // Load notices and categories on component mount
    const loadData = async () => {
      setIsLoading(true);
      try {
        const isAdmin = userData?.role === "admin";
        const [loadedNotices, loadedCategories] = await Promise.all([
          getNotices(currentUser?.email || undefined, isAdmin),
          getNoticeCategories()
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
        // Update existing notice
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

      // Reload notices and categories after adding or updating
      const isAdmin = userData?.role === "admin";
      const [updatedNotices, updatedCategories] = await Promise.all([
        getNotices(currentUser?.email || undefined, isAdmin),
        getNoticeCategories()
      ]);
      setNotices(updatedNotices);
      setCategories(updatedCategories);
      await buildEmailToUserCodeMap(updatedNotices);

      // Reset form and close dialog
      form.reset();
      setIsEditing(false);
      setSelectedNotice(null);
      setDialogOpen(false);
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
    if (userData?.role !== "admin" && notice.author !== currentUser?.email) {
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
    if (userData?.role !== "admin" && notice.author !== currentUser?.email) {
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
          currentUser?.email || undefined,
          isAdmin
        );
        setNotices(updatedNotices);

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
      notice.category.toLowerCase().includes(searchLower) ||
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
          <h1 className="text-2xl font-bold">Internal Notices</h1>

          <Button className="flex items-center gap-2" onClick={openAddDialog}>
            <PlusCircle size={18} />
            <span>Add Notice</span>
          </Button>
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
                          {notice.category}
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
                      {(userData?.role === "admin" ||
                        notice.author === (userData?.userCode || currentUser?.email)) && (
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
                          Category: {notice.category}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posted on {new Date(notice.date).toLocaleDateString()}{" "}
                          by {notice.author}
                        </div>
                        <div className="mt-4 whitespace-pre-wrap">
                          {notice.content}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Notice" : "Add New Internal Notice"}
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
                        placeholder="Notice title" 
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
