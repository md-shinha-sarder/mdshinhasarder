import { useState, useEffect } from "react";
import { MessageSquare, Trash2, CheckCircle2, AlertOctagon, CornerDownRight, Filter, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CommentItem {
  id: string;
  author: string;
  email: string;
  postTitle: string;
  postSlug: string;
  content: string;
  date: string;
  status: "published" | "pending" | "spam";
  avatar?: string;
}

const initialComments: CommentItem[] = [
  {
    id: "c-1",
    author: "Tanvir Ahmed",
    email: "tanvir.tech@gmail.com",
    postTitle: "MD. Shinha Sarder Expands Practical Learning Through University Fieldwork",
    postSlug: "md-shinha-sarder-expands-practical-learning",
    content: "Outstanding initiative and inspiring thoughts on experiential learning! Keep inspiring us.",
    date: "Nov 11, 2026, 4:20 PM",
    status: "published",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Tanvir",
  },
  {
    id: "c-2",
    author: "Sajib Rahman",
    email: "sajib.dev@outlook.com",
    postTitle: "MD. Shinha Sarder Start Use on Fedora Linux for Advanced Development",
    postSlug: "md-shinha-sarder-start-use-on-fedora-linux",
    content: "Fedora Workstation is truly the cleanest distro for developers. Glad to see your workflow setup!",
    date: "Nov 08, 2026, 11:15 AM",
    status: "published",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sajib",
  },
  {
    id: "c-3",
    author: "Nafisa Khatun",
    email: "nafisa.k@gmail.com",
    postTitle: "Aguner Moton Song by MD. Shinha Sarder",
    postSlug: "aguner-moton-song-by-md-shinha-sarder",
    content: "The melody and lyricism are heart-touching. Looking forward to more releases on Spotify and Apple Music.",
    date: "Nov 05, 2026, 8:45 PM",
    status: "published",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Nafisa",
  },
  {
    id: "c-4",
    author: "Arif Hossain",
    email: "arif.techwriter@gmail.com",
    postTitle: "MD. Shinha Sarder Exposes the 2026 YouTube AI Video Crisis",
    postSlug: "md-shinha-sarder-exposes-2026-youtube-ai-crisis",
    content: "Crucial analysis on automated video sludge. Google and YouTube definitely need better provenance algorithms.",
    date: "Nov 02, 2026, 2:10 PM",
    status: "published",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Arif",
  },
];

export const CommentsAdmin = () => {
  const [tab, setTab] = useState<"published" | "pending" | "spam">("published");
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const stored = localStorage.getItem("blogger_comments_data");
      if (stored) return JSON.parse(stored);
    } catch (_err) {
      void _err;
    }
    return initialComments;
  });
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    localStorage.setItem("blogger_comments_data", JSON.stringify(comments));
  }, [comments]);

  const filtered = comments.filter((c) => c.status === tab);

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("Comment deleted");
  };

  const handleMarkSpam = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "spam" ? "published" : "spam" } : c))
    );
    toast.success("Comment status updated");
  };

  const handleApprove = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "published" } : c))
    );
    toast.success("Comment approved and published");
  };

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return toast.error("Please enter a reply message");
    toast.success("Reply posted to discussion!");
    setReplyOpen(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dadce0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <MessageSquare size={22} className="text-[#e37400]" />
            <span>Comments</span>
          </h1>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Manage visitor comments, moderations, replies, and spam filters across blog posts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-[#feefe3] text-[#d93025] font-semibold rounded-full border border-orange-200">
            {comments.length} Total Comments
          </span>
        </div>
      </div>

      {/* Tabs matching Blogger style */}
      <div className="flex items-center gap-2 border-b border-[#dadce0] pb-2 text-xs font-medium">
        <button
          onClick={() => setTab("published")}
          className={`px-3 py-1.5 rounded-md transition-all ${
            tab === "published"
              ? "bg-[#feefe3] text-[#d93025] font-bold shadow-xs"
              : "text-[#5f6368] hover:bg-[#f1f3f4]"
          }`}
        >
          Published ({comments.filter((c) => c.status === "published").length})
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-3 py-1.5 rounded-md transition-all ${
            tab === "pending"
              ? "bg-[#feefe3] text-[#d93025] font-bold shadow-xs"
              : "text-[#5f6368] hover:bg-[#f1f3f4]"
          }`}
        >
          Awaiting Moderation ({comments.filter((c) => c.status === "pending").length})
        </button>
        <button
          onClick={() => setTab("spam")}
          className={`px-3 py-1.5 rounded-md transition-all ${
            tab === "spam"
              ? "bg-[#feefe3] text-[#d93025] font-bold shadow-xs"
              : "text-[#5f6368] hover:bg-[#f1f3f4]"
          }`}
        >
          Spam ({comments.filter((c) => c.status === "spam").length})
        </button>
      </div>

      {/* Comment List */}
      <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden divide-y divide-[#f1f3f4] shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#5f6368]">
            <MessageSquare size={32} className="mx-auto text-[#dadce0] mb-2" />
            <p className="text-sm font-semibold text-[#202124]">No comments in this category.</p>
            <p className="text-xs text-[#80868b] mt-1">
              New responses submitted on articles will automatically appear here.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 hover:bg-[#f8f9fa] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={item.avatar || "/profile.webp"}
                    alt={item.author}
                    className="w-10 h-10 rounded-full border border-[#dadce0] shrink-0 object-cover mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-[#202124]">{item.author}</span>
                      <span className="text-xs text-[#5f6368]">&lt;{item.email}&gt;</span>
                      <span className="text-xs text-[#80868b]">• {item.date}</span>
                    </div>

                    <div className="text-xs text-[#1a73e8] mt-1 flex items-center gap-1 font-medium">
                      <span>on</span>
                      <Link to={`/post/${item.postSlug}`} target="_blank" className="hover:underline truncate max-w-md">
                        {item.postTitle}
                      </Link>
                      <ExternalLink size={12} className="shrink-0" />
                    </div>

                    <p className="text-sm text-[#3c4043] mt-2 bg-[#f8f9fa] p-3 rounded-lg border border-[#e8eaed] leading-relaxed">
                      {item.content}
                    </p>

                    {/* Quick Reply Form */}
                    {replyOpen === item.id && (
                      <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg shadow-xs space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply as MD. Shinha Sarder to ${item.author}...`}
                          className="w-full text-xs p-2.5 border border-[#dadce0] rounded-md outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyOpen(null)}
                            className="h-7 text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSendReply(item.id)}
                            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white h-7 text-xs"
                          >
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setReplyOpen(replyOpen === item.id ? null : item.id)}
                    className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] rounded-full transition-colors"
                    title="Reply"
                  >
                    <CornerDownRight size={15} />
                  </button>

                  {item.status !== "published" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="p-1.5 text-[#1e8e3e] hover:bg-[#e6f4ea] rounded-full transition-colors"
                      title="Approve comment"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  )}

                  <button
                    onClick={() => handleMarkSpam(item.id)}
                    className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors"
                    title={item.status === "spam" ? "Mark as Not Spam" : "Mark as Spam"}
                  >
                    <AlertOctagon size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Moderation Settings Summary Card */}
      <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#1e8e3e] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-[#202124]">Spam &amp; Moderation Guard</h4>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Filtered links and malicious scripts are automatically quarantined before reaching public readers.
            </p>
          </div>
        </div>
        <Link
          to="/admin/seo"
          className="text-xs font-semibold text-[#1a73e8] hover:underline shrink-0"
        >
          Configure in Settings &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CommentsAdmin;
