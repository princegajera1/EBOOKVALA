import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Inbox, Archive, User, ThumbsUp, Paperclip, Sparkles, Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { dbService } from "../../../services/db";
import { toast } from "react-hot-toast";

export const MessagesCommunityCenter = ({ user }) => {
  const [activeTab, setActiveTab] = useState("inbox"); // inbox | community
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // New Thread State
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const msgList = await dbService.getMessages(user.uid);
      setMessages(msgList);
      if (msgList.length > 0) setSelectedMsg(msgList[0]);

      const threadList = await dbService.getCommunityThreads();
      setThreads(threadList);
    };
    load();
  }, [user]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMsg) return;
    setSendingReply(true);
    try {
      await dbService.sendMessageReply(selectedMsg.id, replyText);
      toast.success("Reply sent to reader! ✉️");
      setSelectedMsg(prev => ({
        ...prev,
        replies: [...(prev.replies || []), { sender: "author", text: replyText, createdAt: new Date().toISOString() }]
      }));
      setReplyText("");
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadBody.trim()) {
      toast.error("Please enter a title and message for the community discussion.");
      return;
    }
    const newThread = {
      id: `thread-${Date.now()}`,
      authorName: user?.displayName || user?.name || "Author Pro",
      authorRole: "Verified Author",
      title: newThreadTitle,
      body: newThreadBody,
      upvotes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      tags: ["Announcement"]
    };
    setThreads(prev => [newThread, ...prev]);
    toast.success("Community discussion thread created! 💬");
    setNewThreadTitle("");
    setNewThreadBody("");
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex items-center gap-3 border-b border-brand-border/40 pb-3">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "inbox" ? "bg-brand-accent text-white" : "bg-[#161618] text-brand-text-secondary hover:text-brand-text border border-brand-border/40"
          }`}
        >
          <Inbox className="h-4 w-4" /> Reader Direct Messages ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab("community")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "community" ? "bg-brand-accent text-white" : "bg-[#161618] text-brand-text-secondary hover:text-brand-text border border-brand-border/40"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Creator Community Board
        </button>
      </div>

      {/* Direct Messaging Inbox */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-3">Conversations</h3>
            {messages.map(m => (
              <div
                key={m.id}
                onClick={() => setSelectedMsg(m)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  selectedMsg?.id === m.id
                    ? "bg-brand-accent/15 border-brand-accent text-brand-text"
                    : "bg-[#111113] border-brand-border/40 text-brand-text-secondary hover:text-brand-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text">{m.senderName}</span>
                  <span className="text-[10px] font-mono text-brand-text-secondary">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs font-medium text-brand-text mt-1 truncate">{m.subject}</p>
                <p className="text-[11px] text-brand-text-secondary truncate mt-0.5">{m.body}</p>
              </div>
            ))}
          </div>

          {/* Selected Message Thread View */}
          <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 md:col-span-2 space-y-4 flex flex-col justify-between">
            {selectedMsg ? (
              <>
                <div className="space-y-4">
                  <div className="border-b border-brand-border/40 pb-4">
                    <h3 className="text-base font-bold text-brand-text">{selectedMsg.subject}</h3>
                    <p className="text-xs text-brand-text-secondary mt-1">From <span className="font-bold text-brand-text">{selectedMsg.senderName}</span> ({selectedMsg.senderEmail})</p>
                  </div>

                  <div className="bg-[#111113] border border-brand-border/40 rounded-xl p-4 text-xs text-brand-text leading-relaxed">
                    {selectedMsg.body}
                  </div>

                  {selectedMsg.replies && selectedMsg.replies.map((r, idx) => (
                    <div key={idx} className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4 text-xs text-brand-text leading-relaxed ml-6">
                      <p className="text-[10px] font-mono font-bold text-brand-accent mb-1">Author Reply:</p>
                      {r.text}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-brand-border/40 space-y-3">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to this reader..."
                    className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleSendReply} isLoading={sendingReply}>
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Send Quick Reply
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-brand-text-secondary italic">Select a message to view details.</p>
            )}
          </div>
        </div>
      )}

      {/* Community Board */}
      {activeTab === "community" && (
        <div className="space-y-6">
          <div className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-display font-black text-brand-text border-b border-brand-border/40 pb-3">Start a New Community Thread</h3>
            <Input label="Thread Title" value={newThreadTitle} onChange={e => setNewThreadTitle(e.target.value)} placeholder="e.g. Q&A for Chapter 5 Code Samples" />
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-text-secondary mb-1.5">Thread Message</label>
              <textarea
                rows={3}
                value={newThreadBody}
                onChange={e => setNewThreadBody(e.target.value)}
                placeholder="Write message to readers..."
                className="w-full bg-[#111113] border border-brand-border/60 rounded-xl p-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleCreateThread}>
              <Plus className="h-4 w-4 mr-1.5" /> Post Discussion
            </Button>
          </div>

          <div className="space-y-4">
            {threads.map(t => (
              <div key={t.id} className="bg-[#161618] border border-brand-border/60 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text">{t.authorName} <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">{t.authorRole}</span></span>
                  <span className="text-[10px] font-mono text-brand-text-secondary">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-brand-text">{t.title}</h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">{t.body}</p>
                <div className="flex items-center gap-4 text-xs text-brand-text-secondary pt-2">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5 text-amber-400" /> {t.upvotes} Upvotes</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5 text-sky-400" /> {t.commentsCount} Comments</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
