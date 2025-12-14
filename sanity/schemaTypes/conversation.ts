import { defineField, defineType } from "sanity";

// Conversation schema to persist AI chat transcripts
// - Stores participant email and a session identifier
// - Tracks message list with roles, content, and timestamps
// - Includes lifecycle metadata and optional context (UA/IP/source)
export default defineType({
  name: "conversation",
  title: "AI Conversations",
  type: "document",
  __experimental_search: [
    { path: "email", weight: 10 },
    { path: "sessionId", weight: 5 },
    { path: "messages.content", weight: 2 },
  ],
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "User's email address associated with this conversation",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
      description: "Unique identifier for this conversation session",
      // Note: Uniqueness across documents is best enforced at write-time.
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Ended", value: "ended" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startedAt",
      title: "Started At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastMessageAt",
      title: "Last Message At",
      type: "datetime",
      description: "Updated when a new message is appended",
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              options: {
                list: [
                  { title: "User", value: "user" },
                  { title: "Assistant", value: "assistant" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "content",
              title: "Content",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
              initialValue: () => new Date().toISOString(),
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              role: "role",
              content: "content",
              timestamp: "timestamp",
            },
            prepare({ role, content, timestamp }) {
              const roleEmoji = role === "user" ? "👤" : "🤖";
              const when = timestamp
                ? new Date(timestamp).toLocaleString()
                : "";
              return {
                title: `${roleEmoji} ${role}`,
                subtitle: `${when} • ${(content || "").slice(0, 80)}`,
              };
            },
          },
        },
      ],
      description: "Chronological list of messages",
    }),
    defineField({
      name: "metadata",
      title: "Metadata",
      type: "object",
      fields: [
        defineField({
          name: "userAgent",
          title: "User Agent",
          type: "string",
        }),
        defineField({
          name: "ipAddress",
          title: "IP Address",
          type: "string",
        }),
        defineField({
          name: "source",
          title: "Source",
          type: "string",
          description: "Origin of the conversation (e.g., website, widget)",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      email: "email",
      startedAt: "startedAt",
      lastMessageAt: "lastMessageAt",
      messages: "messages",
      status: "status",
    },
    prepare({ email, startedAt, lastMessageAt, messages, status }) {
      const latest = lastMessageAt || startedAt;
      const date = latest ? new Date(latest).toLocaleString() : "";
      const count = Array.isArray(messages) ? messages.length : 0;
      const statusLabel = status === "ended" ? "Ended" : "Active";
      return {
        title: email || "Unknown Email",
        subtitle: `${date} • ${count} messages • ${statusLabel}`,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "lastMessageDesc",
      by: [{ field: "lastMessageAt", direction: "desc" }],
    },
    {
      title: "Oldest First",
      name: "lastMessageAsc",
      by: [{ field: "lastMessageAt", direction: "asc" }],
    },
    {
      title: "Email A-Z",
      name: "emailAsc",
      by: [{ field: "email", direction: "asc" }],
    },
  ],
});
