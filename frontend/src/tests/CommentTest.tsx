import Thread from "../components/Thread/Thread";
import type { CommentDTO, ThreadDTO } from "../types/comment.types";

export const mockThread: ThreadDTO = {
  id: "thread-ts-migration",
  title: "Should we migrate the legacy dashboard to TypeScript?",
  content: "The legacy dashboard is getting harder to maintain. I'm proposing we take two sprints to incrementally migrate it to TypeScript. Thoughts?",
  authorId: 101, // Alice
  isDeleted: false,
  createdAt: new Date("2026-03-13T08:00:00Z"),
  updatedAt: new Date("2026-03-13T08:00:00Z"),
  taskId: "TECH-550",
  comments: ["c1", "c2", "c3"] // Top-level comments
};

export const mockAllComments: Record<string, CommentDTO> = {
  "c1": {
    id: "c1",
    content: "I totally agree. We spend way too much time debugging runtime type errors.",
    threadId: "thread-ts-migration",
    authorId: 102, // Bob
    isDeleted: false,
    parentId: null,
    createdAt: new Date("2026-03-13T08:15:00Z"),
    updatedAt: new Date("2026-03-13T08:15:00Z"),
    replies: ["c1-1", "c1-2"]
  },
  "c1-1": {
    id: "c1-1",
    content: "Are we going to use strict mode from the start? Or add it later?",
    threadId: "thread-ts-migration",
    authorId: 103, // Charlie
    isDeleted: false,
    parentId: "c1",
    createdAt: new Date("2026-03-13T08:20:00Z"),
    updatedAt: new Date("2026-03-13T08:20:00Z"),
    replies: ["c1-1-1"]
  },
  "c1-1-1": {
    id: "c1-1-1",
    content: "Strict mode from day one, otherwise we'll just end up with a sea of `any` types.",
    threadId: "thread-ts-migration",
    authorId: 101, // Alice
    isDeleted: false,
    parentId: "c1-1",
    createdAt: new Date("2026-03-13T08:25:00Z"),
    updatedAt: new Date("2026-03-13T08:25:00Z"),
    replies: ["c1-1-1-1"]
  },
  "c1-1-1-1": {
    id: "c1-1-1-1",
    content: "Agreed. I can set up the tsconfig.json this afternoon.",
    threadId: "thread-ts-migration",
    authorId: 102, // Bob
    isDeleted: false,
    parentId: "c1-1-1",
    createdAt: new Date("2026-03-13T08:30:00Z"),
    updatedAt: new Date("2026-03-13T08:30:00Z"),
    replies: []
  },
  "c1-2": {
    id: "c1-2",
    content: "We should also set up ESLint rules to enforce typing alongside it.",
    threadId: "thread-ts-migration",
    authorId: 104, // Dave
    isDeleted: false,
    parentId: "c1",
    createdAt: new Date("2026-03-13T08:22:00Z"),
    updatedAt: new Date("2026-03-13T08:22:00Z"),
    replies: []
  },

  "c2": {
    id: "c2",
    content: "Can we afford to dedicate two whole sprints to this right now?",
    threadId: "thread-ts-migration",
    authorId: 105, // Eve
    isDeleted: false,
    parentId: null,
    createdAt: new Date("2026-03-13T09:00:00Z"),
    updatedAt: new Date("2026-03-13T09:00:00Z"),
    replies: ["c2-1"]
  },
  "c2-1": {
    id: "c2-1",
    content: "[Deleted by user]",
    threadId: "thread-ts-migration",
    authorId: 101, // Alice
    isDeleted: true, // This flag should trigger your "deleted comment" UI
    parentId: "c2",
    createdAt: new Date("2026-03-13T09:10:00Z"),
    updatedAt: new Date("2026-03-13T09:15:00Z"),
    replies: ["c2-1-1"]
  },
  "c2-1-1": {
    id: "c2-1-1",
    content: "Nevermind the above deleted comment, I just checked the roadmap and we have a buffer in Q2.",
    threadId: "thread-ts-migration",
    authorId: 101, // Alice
    isDeleted: false,
    parentId: "c2-1", // Replying to a deleted comment
    createdAt: new Date("2026-03-13T09:20:00Z"),
    updatedAt: new Date("2026-03-13T09:20:00Z"),
    replies: []
  },

  "c3": {
    id: "c3",
    content: "I'll create a Jira epic to track the individual component migrations.",
    threadId: "thread-ts-migration",
    authorId: 103, // Charlie
    isDeleted: false,
    parentId: null,
    createdAt: new Date("2026-03-13T10:00:00Z"),
    updatedAt: new Date("2026-03-13T10:00:00Z"),
    replies: []
  }
};

export function CommentTest() {
  return (
    <Thread thread={mockThread} allComments={mockAllComments} />
  );
}