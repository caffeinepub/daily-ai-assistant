import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  // Types
  type Message = {
    id : Nat;
    role : Text;
    content : Text;
    timestamp : Int;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Nat.compare(message1.id, message2.id);
    };
  };

  type Task = {
    id : Nat;
    title : Text;
    description : Text;
    status : Text;
    createdAt : Int;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Nat.compare(task1.id, task2.id);
    };
  };

  type Note = {
    id : Nat;
    title : Text;
    content : Text;
    createdAt : Int;
  };

  module Note {
    public func compare(note1 : Note, note2 : Note) : Order.Order {
      Nat.compare(note1.id, note2.id);
    };
  };

  // Helper function to get current timestamp
  func getTimestamp() : Int {
    Time.now();
  };

  // Maps and counters
  var messageCounter = 0;
  var taskCounter = 0;
  var noteCounter = 0;
  let messages = Map.empty<Nat, Message>();
  let tasks = Map.empty<Nat, Task>();
  let notes = Map.empty<Nat, Note>();

  // Messaging functionality
  public shared ({ caller }) func sendMessage(userText : Text) : async Text {
    let userMessage : Message = {
      id = messageCounter;
      role = "user";
      content = userText;
      timestamp = getTimestamp();
    };
    messages.add(messageCounter, userMessage);
    messageCounter += 1;

    let assistantReplyText = generateAssistantReply(userText);

    let assistantMessage : Message = {
      id = messageCounter;
      role = "assistant";
      content = assistantReplyText;
      timestamp = getTimestamp();
    };
    messages.add(messageCounter, assistantMessage);
    messageCounter += 1;

    assistantReplyText;
  };

  public query ({ caller }) func getMessages() : async [Message] {
    messages.values().toArray().sort();
  };

  public shared ({ caller }) func clearHistory() : async () {
    messages.clear();
    messageCounter := 0;
  };

  // Task functionality
  public shared ({ caller }) func addTask(title : Text, description : Text) : async Task {
    let task : Task = {
      id = taskCounter;
      title;
      description;
      status = "pending";
      createdAt = getTimestamp();
    };
    tasks.add(taskCounter, task);
    taskCounter += 1;
    task;
  };

  public shared ({ caller }) func updateTaskStatus(id : Nat, done : Bool) : async () {
    switch (tasks.get(id)) {
      case (?task) {
        let updatedTask : Task = {
          id = task.id;
          title = task.title;
          description = task.description;
          status = if done { "done" } else { "pending" };
          createdAt = task.createdAt;
        };
        tasks.add(id, updatedTask);
      };
      case (null) { Runtime.trap("Task not found") };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?_task) {
        tasks.remove(id);
      };
    };
  };

  public query ({ caller }) func getTasks() : async [Task] {
    tasks.values().toArray().sort();
  };

  // Notes functionality
  public shared ({ caller }) func addNote(title : Text, content : Text) : async Note {
    let note : Note = {
      id = noteCounter;
      title;
      content;
      createdAt = getTimestamp();
    };
    notes.add(noteCounter, note);
    noteCounter += 1;
    note;
  };

  public shared ({ caller }) func deleteNote(id : Nat) : async () {
    switch (notes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?_note) {
        notes.remove(id);
      };
    };
  };

  public query ({ caller }) func getNotes() : async [Note] {
    notes.values().toArray().sort();
  };

  // Helper functions
  func contains(text : Text, keyword : Text) : Bool {
    let textArray = text.toArray();
    let keywordArray = keyword.toArray();
    let textLength = textArray.size();
    let keywordLength = keywordArray.size();

    if (keywordLength == 0 or textLength < keywordLength) {
      return false;
    };

    func startsAt(position : Nat) : Bool {
      if (position + keywordLength > textLength) {
        return false;
      };
      var i = 0;
      while (i < keywordLength) {
        if (textArray[i + position] != keywordArray[i]) {
          return false;
        };
        i += 1;
      };
      true;
    };

    var j = 0;
    while (j + keywordLength <= textLength) {
      if (startsAt(j)) {
        return true;
      };
      j += 1;
    };

    false;
  };

  func generateAssistantReply(userText : Text) : Text {
    let legalTopics = List.fromArray(["contract", "nda", "lease", "tenant", "landlord", "employer", "compliance", "privacy", "rights", "legal"]);
    let taskKeywords = List.fromArray(["schedule", "reminder", "todo", "task", "email", "letter", "complaint"]);

    for (topic in legalTopics.values()) {
      if (contains(userText, topic)) {
        switch (topic) {
          case ("contract") { return "Looks like you need help with contracts. I can assist with drafting, reviewing, or understanding key contract terms. Please specify your contract-related question."; };
          case ("nda") { return "It seems you have questions about NDAs. I can explain key clauses, review agreements, or help you create an NDA. Please provide more details."; };
          case ("tenant") { return "You're asking about tenant rights. I can provide information on leases, rights, and responsibilities. Please let me know your specific concerns."; };
          case ("employer") { return "Employer concerns detected. I can offer advice on rights and employment issues. Please describe the issue you'd like help with."; };
          case ("compliance") { return "Compliance topic detected. I can guide you on regulations and procedures. Please share your compliance question."; };
          case ("privacy") { return "Privacy concerns detected. I can help with data privacy, rights, and best practices. Please specify your privacy-related question."; };
          case ("rights") { return "General rights question detected. I can provide guidance on legal rights and responsibilities. Please elaborate on your situation."; };
          case (_) { return "Legal topic detected. Please provide more details about your specific question."; };
        };
      };
    };

    for (keyword in taskKeywords.values()) {
      if (contains(userText, keyword)) {
        switch (keyword) {
          case ("schedule") { return "It seems you mentioned scheduling. I can help you add reminders or tasks. Please let me know what you would like to schedule."; };
          case ("todo") { return "You mentioned to-do lists. I can assist with task management and reminders. Please let me know the tasks you want to add."; };
          case ("email") { return "You want help with email communication. I can assist with drafting professional emails or reminders. Please share the specific message and recipient."; };
          case ("letter") { return "Letter writing detected. I can help draft formal letters or complaints. Please specify the type of letter and its purpose."; };
          case ("reminder") { return "It looks like you need help setting reminders. Please specify what you would like to be reminded about and when."; };
          case (_) { return "Productivity request detected. Please provide more details about your task or scheduling needs."; };
        };
      };
    };

    "Hello! I'm your Daily AI Assistant. I can help with legal matters and daily task management. Please describe your request so I can assist you effectively.";
  };
};
