import { defineField, defineType } from "sanity";

export default defineType({
  name: "chatSession",
  title: "Chat Sessions",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      description: "User's email address from chat",
    }),
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique identifier for this chat session",
    }),
    defineField({
      name: "startedAt",
      title: "Started At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "lastActivityAt",
      title: "Last Activity",
      type: "datetime",
      description: "Updated with each new message",
    }),
    defineField({
      name: "messageHistory",
      title: "Message History",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
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
            },
            {
              name: "content",
              title: "Message Content",
              type: "text",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
              validation: (Rule) => Rule.required(),
              initialValue: () => new Date().toISOString(),
            },
            {
              name: "messageId",
              title: "Message ID",
              type: "string",
              description: "Unique ID for this message",
            },
          ],
          preview: {
            select: {
              role: "role",
              content: "content",
              timestamp: "timestamp",
            },
            prepare({ role, content, timestamp }) {
              const roleEmoji = role === "user" ? "👤" : "🤖";
              const date = new Date(timestamp).toLocaleString();
              return {
                title: `${roleEmoji} ${role}`,
                subtitle: `${date} - ${content?.slice(0, 50)}...`,
              };
            },
          },
        },
      ],
      description: "All messages in this chat session",
    }),
    defineField({
      name: "metadata",
      title: "Metadata",
      type: "object",
      fields: [
        {
          name: "userAgent",
          title: "User Agent",
          type: "string",
          description: "Browser information (optional)",
        },
        {
          name: "referrer",
          title: "Referrer",
          type: "string",
          description: "Where they came from (optional)",
        },
      ],
    }),
  ],
  preview: {
    select: {
      email: "email",
      startedAt: "startedAt",
      messageCount: "messageHistory",
    },
    prepare({ email, startedAt, messageCount }) {
      const date = startedAt
        ? new Date(startedAt).toLocaleDateString()
        : "Unknown";
      const count = Array.isArray(messageCount) ? messageCount.length : 0;
      return {
        title: email || "Unknown Email",
        subtitle: `${date} • ${count} messages`,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "lastActivityDesc",
      by: [{ field: "lastActivityAt", direction: "desc" }],
    },
    {
      title: "Oldest First",
      name: "lastActivityAsc",
      by: [{ field: "lastActivityAt", direction: "asc" }],
    },
    {
      title: "Email A-Z",
      name: "emailAsc",
      by: [{ field: "email", direction: "asc" }],
    },
  ],
});
