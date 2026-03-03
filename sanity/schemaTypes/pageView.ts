import { defineField, defineType } from "sanity";

export default defineType({
  name: "pageView",
  title: "Page View",
  type: "document",
  fields: [
    defineField({
      name: "path",
      title: "Page Path",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "referrer",
      title: "Referrer",
      type: "string",
    }),
    defineField({
      name: "userAgent",
      title: "User Agent",
      type: "string",
    }),
    defineField({
      name: "deviceType",
      title: "Device Type",
      type: "string",
      options: {
        list: [
          { title: "Desktop", value: "desktop" },
          { title: "Mobile", value: "mobile" },
          { title: "Tablet", value: "tablet" },
        ],
      },
    }),
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
    }),
    defineField({
      name: "timestamp",
      title: "Timestamp",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "path", subtitle: "timestamp" },
  },
});
