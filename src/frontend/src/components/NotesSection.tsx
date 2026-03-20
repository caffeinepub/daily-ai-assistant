import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddNote, useDeleteNote, useGetNotes } from "@/hooks/useQueries";
import { Loader2, Plus, StickyNote, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface NoteFormProps {
  onClose: () => void;
}

function NoteForm({ onClose }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const addNote = useAddNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addNote.mutateAsync({
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("Note saved");
      onClose();
    } catch {
      toast.error("Failed to save note");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-surface-raised border border-gold/30 rounded-xl p-4 mb-6 col-span-full"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm text-foreground">New Note</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-smooth"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label
            htmlFor="note-title"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Title *
          </Label>
          <Input
            id="note-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Contract review notes"
            className="bg-background border-border text-sm"
            autoFocus
          />
        </div>
        <div>
          <Label
            htmlFor="note-content"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Content
          </Label>
          <Textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here…"
            className="bg-background border-border text-sm resize-none"
            rows={4}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || addNote.isPending}
            className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {addNote.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Save Note
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

interface NoteCardProps {
  id: bigint;
  title: string;
  content: string;
  createdAt: bigint;
}

function NoteCard({ id, title, content, createdAt }: NoteCardProps) {
  const deleteNote = useDeleteNote();

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const formattedDate = new Date(Number(createdAt)).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative bg-surface-raised border border-border rounded-xl p-4 hover:border-gold/30 transition-smooth flex flex-col gap-2 min-h-[120px]"
    >
      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteNote.isPending}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-smooth"
        aria-label="Delete note"
      >
        {deleteNote.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-t-[20px] border-l-transparent border-t-gold/20 rounded-tl-xl" />

      <h3 className="font-serif text-sm text-foreground pr-6 leading-snug line-clamp-2">
        {title}
      </h3>

      {content && (
        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed flex-1">
          {content}
        </p>
      )}

      <p className="text-[10px] text-muted-foreground/60 mt-auto">
        {formattedDate}
      </p>
    </motion.div>
  );
}

export function NotesSection() {
  const [showForm, setShowForm] = useState(false);
  const { data: notes = [], isLoading } = useGetNotes();

  const sortedNotes = [...notes].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="font-serif text-xl text-foreground">My Notes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {notes.length} {notes.length === 1 ? "note" : "notes"} saved
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          New Note
        </Button>
      </div>

      <div className="gold-line mx-6" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {showForm && (
                <NoteForm key="form" onClose={() => setShowForm(false)} />
              )}
            </AnimatePresence>

            {sortedNotes.length === 0 && !showForm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center h-48 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-3">
                  <StickyNote className="w-5 h-5 text-gold" />
                </div>
                <p className="font-serif text-lg text-foreground/70">
                  No notes yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Capture your thoughts and research
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sortedNotes.map((note) => (
                  <NoteCard
                    key={note.id.toString()}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    createdAt={note.createdAt}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
