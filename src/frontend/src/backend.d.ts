import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    status: string;
    title: string;
    createdAt: bigint;
    description: string;
}
export interface Message {
    id: bigint;
    content: string;
    role: string;
    timestamp: bigint;
}
export interface Note {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
}
export interface backendInterface {
    addNote(title: string, content: string): Promise<Note>;
    addTask(title: string, description: string): Promise<Task>;
    clearHistory(): Promise<void>;
    deleteNote(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getMessages(): Promise<Array<Message>>;
    getNotes(): Promise<Array<Note>>;
    getTasks(): Promise<Array<Task>>;
    sendMessage(userText: string): Promise<string>;
    updateTaskStatus(id: bigint, done: boolean): Promise<void>;
}
