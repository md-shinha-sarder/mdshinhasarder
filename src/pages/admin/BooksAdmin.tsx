import { useState } from "react";
import { useBooksData, Book, CHAPTRA_AUTHOR_URL } from "@/hooks/useBooksData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen, ExternalLink, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function BooksAdmin() {
  const { books, addBook, updateBook, deleteBook, resetBooks } = useBooksData();
  const [editing, setEditing] = useState<Book | null>(null);
  const [open, setOpen] = useState(false);

  const blankBook: Book = {
    id: `book-${Date.now()}`,
    slug: `book-${Date.now()}`,
    title: "",
    publishedDate: "2025-09-01",
    category: "Technology & AI",
    cover: "https://books.google.com/books/content?id=7veEEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
    chaptraUrl: CHAPTRA_AUTHOR_URL,
    description: "",
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast.error("Book title is required");
      return;
    }

    const exists = books.some((b) => b.id === editing.id);
    if (exists) {
      updateBook(editing.id, editing);
      toast.success("Book updated successfully");
    } else {
      addBook(editing);
      toast.success("Book added successfully");
    }
    setOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete book "${title}"?`)) return;
    deleteBook(id);
    toast.success("Book deleted");
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#e37400]" />
            <span>Books &amp; Publications</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Add, update, or edit published books, Google Books links, and Chaptra catalog entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] h-8 text-xs"
            onClick={() => { if (confirm("Reset catalog?")) { resetBooks(); toast.success("Reset done"); } }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Books
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => setEditing({ ...blankBook, id: `book-${Date.now()}` })}
                className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs font-medium rounded-full px-4 h-8 shadow-sm"
              >
                <Plus size={15} className="mr-1" /> Add New Book
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90dvh] overflow-y-auto bg-white border border-[#dadce0] text-[#202124]">
              <DialogHeader>
                <DialogTitle>{editing && books.some((b) => b.id === editing.id) ? "Edit Book" : "Add Book"}</DialogTitle>
              </DialogHeader>

              {editing && (
                <div className="space-y-4 pt-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Book Title *</Label>
                      <Input
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        placeholder="e.g. From Khulna to the Cloud"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        placeholder="e.g. Memoir & Technology"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Publication Date</Label>
                      <Input
                        type="date"
                        value={editing.publishedDate}
                        onChange={(e) => setEditing({ ...editing, publishedDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Cover Image URL</Label>
                      <Input
                        value={editing.cover}
                        onChange={(e) => setEditing({ ...editing, cover: e.target.value })}
                        placeholder="https://books.google.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Google Books / Chaptra Link</Label>
                    <Input
                      value={editing.chaptraUrl}
                      onChange={(e) => setEditing({ ...editing, chaptraUrl: e.target.value })}
                      placeholder="https://www.chaptra.com/book/..."
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      rows={4}
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      placeholder="Book overview and synopsis..."
                    />
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleSave} className="w-full">
                      Save Book
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book) => (
          <div key={book.id} className="p-4 rounded-xl border border-border bg-card flex gap-4 items-start">
            <div className="w-16 h-24 rounded overflow-hidden shrink-0 bg-black border border-border">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1">{book.title}</h3>
              <p className="text-xs text-primary font-medium mt-0.5">{book.category} · {book.publishedDate}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{book.description}</p>

              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing({ ...book }); setOpen(true); }}>
                  <Pencil size={12} className="mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => handleDelete(book.id, book.title)}>
                  <Trash2 size={12} className="mr-1" /> Delete
                </Button>
                {book.chaptraUrl && (
                  <a href={book.chaptraUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto">
                    <span>Link</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
