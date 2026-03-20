import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTaskStatus,
} from "@/hooks/useQueries";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface TaskFormProps {
  onClose: () => void;
}

function TaskForm({ onClose }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const addTask = useAddTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addTask.mutateAsync({
        title: title.trim(),
        description: description.trim(),
      });
      toast.success("Task added");
      onClose();
    } catch {
      toast.error("Failed to add task");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-surface-raised border border-border rounded-xl p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm text-foreground">New Task</h3>
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
            htmlFor="task-title"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Title *
          </Label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review lease agreement"
            className="bg-background border-border text-sm"
            autoFocus
          />
        </div>
        <div>
          <Label
            htmlFor="task-desc"
            className="text-xs text-muted-foreground mb-1 block"
          >
            Description (optional)
          </Label>
          <Textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details…"
            className="bg-background border-border text-sm resize-none"
            rows={2}
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
            disabled={!title.trim() || addTask.isPending}
            className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {addTask.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Add Task
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

interface TaskCardProps {
  id: bigint;
  title: string;
  description: string;
  status: string;
}

function TaskCard({ id, title, description, status }: TaskCardProps) {
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const isDone = status === "done";

  const handleToggle = async () => {
    try {
      await updateStatus.mutateAsync({ id, done: !isDone });
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task removed");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, scale: 0.98 }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-smooth group ${
        isDone
          ? "bg-surface-raised/50 border-border/50 opacity-60"
          : "bg-surface-raised border-border hover:border-gold/30"
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={updateStatus.isPending}
        className="mt-0.5 flex-shrink-0 transition-smooth"
        aria-label={isDone ? "Mark as pending" : "Mark as done"}
      >
        {updateStatus.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : isDone ? (
          <CheckCircle2 className="w-5 h-5 text-gold" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground hover:text-gold transition-smooth" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-tight ${
            isDone ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteTask.isPending}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-smooth"
        aria-label="Delete task"
      >
        {deleteTask.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </motion.div>
  );
}

export function TasksSection() {
  const [showForm, setShowForm] = useState(false);
  const { data: tasks = [], isLoading } = useGetTasks();

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="font-serif text-xl text-foreground">My Tasks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingTasks.length} pending · {doneTasks.length} completed
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          New Task
        </Button>
      </div>

      <div className="gold-line mx-6" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        <AnimatePresence mode="popLayout">
          {showForm && (
            <TaskForm key="form" onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : tasks.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-48 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-gold" />
            </div>
            <p className="font-serif text-lg text-foreground/70">
              No tasks yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first task to get started
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pendingTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Pending
                </p>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {pendingTasks.map((task) => (
                      <TaskCard
                        key={task.id.toString()}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        status={task.status}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}

            {/* Completed */}
            {doneTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Completed
                </p>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {doneTasks.map((task) => (
                      <TaskCard
                        key={task.id.toString()}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        status={task.status}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
