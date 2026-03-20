# Daily AI Assistant

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- An AI assistant chat interface for handling legal and general daily tasks
- Task categories: Legal (contracts, rights, compliance, document review guidance), Daily (reminders, to-dos, scheduling, personal admin)
- Persistent conversation history per session stored on the backend
- A task/todo manager so the user can capture actionable items from conversations
- Quick-action prompt suggestions (e.g. "Draft a simple NDA", "What are my tenant rights?", "Help me write a complaint letter", "Summarize my day's tasks")
- Ability to save important AI responses as notes

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend
- `Message` type: id, role (user | assistant), content, timestamp
- `Task` type: id, title, description, status (pending | done), createdAt
- `Note` type: id, title, content, createdAt
- `getMessages()`: returns conversation history
- `sendMessage(userText: Text)`: stores user message, generates a rule-based assistant response (no external LLM), returns assistant reply
- `clearHistory()`: clears conversation
- `addTask(title, description)`: adds a task
- `updateTaskStatus(id, status)`: toggle task done/pending
- `deleteTask(id)`: remove a task
- `getTasks()`: returns all tasks
- `addNote(title, content)`: save a note
- `getNotes()`: return saved notes
- `deleteNote(id)`: remove a note

### Frontend
- Left sidebar: navigation between Chat, Tasks, Notes sections
- Chat view: message thread, input box, quick-action suggestion chips
- Tasks view: list of tasks with add/complete/delete actions
- Notes view: list of saved notes with add/delete actions
- Responsive layout (mobile-friendly)
