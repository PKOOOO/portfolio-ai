import { tool } from "ai";
import { z } from "zod";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export const getProfile = tool({
  description:
    "Get the main portfolio profile (name, headline, short bio, and key stats). Use this when users ask who this person is or for a short introduction.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Optional context for what to focus on"),
  }),
  execute: async () => {
    const profile = await sanityClient.fetch(
      `*[_type == "profile"][0]{
        firstName,
        lastName,
        headline,
        shortBio,
        email,
        location,
        availability,
        yearsOfExperience,
        stats
      }`,
    );
    return { profile };
  },
});

export const getProjects = tool({
  description:
    "Get featured and recent projects. Use this when users ask about projects or things that have been built.",
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .describe("Maximum number of projects to return (default 6)"),
  }),
  execute: async ({ limit = 6 }) => {
    const projects = await sanityClient.fetch(
      `*[_type == "project"] | order(featured desc, order asc)[0...$limit]{
        title,
        "slug": slug.current,
        tagline,
        category,
        featured,
        liveUrl,
        githubUrl
      }`,
      { limit },
    );
    return { projects };
  },
});

export const getProjectDetails = tool({
  description:
    "Get detailed information about a specific project by name or slug.",
  inputSchema: z.object({
    projectName: z
      .string()
      .describe("The name or partial name of the project to search for"),
  }),
  execute: async ({ projectName }) => {
    const project = await sanityClient.fetch(
      `*[_type == "project" && (
        title match $search || 
        slug.current match $search
      )][0]{
        title,
        "slug": slug.current,
        tagline,
        category,
        liveUrl,
        githubUrl
      }`,
      { search: `*${projectName}*` },
    );
    if (!project) {
      return { error: `Project "${projectName}" not found` };
    }
    return { project };
  },
});

export const getBlogPosts = tool({
  description:
    "Get recent blog posts. Use this when users ask about articles, blogs, or content this person has written.",
  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .describe("Maximum number of posts to return (default 5)"),
  }),
  execute: async ({ limit = 5 }) => {
    const posts = await sanityClient.fetch(
      `*[_type == "blog"] | order(publishedAt desc)[0...$limit]{
        title,
        "slug": slug.current,
        excerpt,
        category,
        publishedAt,
        readTime
      }`,
      { limit },
    );
    return { posts };
  },
});

export const getAchievements = tool({
  description:
    "Get notable achievements and awards. Use this when users ask about awards, recognitions, or achievements.",
  inputSchema: z.object({
    featuredOnly: z
      .boolean()
      .optional()
      .describe("If true, only return featured achievements"),
  }),
  execute: async ({ featuredOnly = false }) => {
    const filter = featuredOnly ? " && featured == true" : "";
    const achievements = await sanityClient.fetch(
      `*[_type == "achievement"${filter}] | order(featured desc, order asc, date desc){
        title,
        type,
        issuer,
        date,
        url
      }`,
    );
    return { achievements };
  },
});

export const getTestimonials = tool({
  description:
    "Get client testimonials and reviews. Use this when users ask what clients say, client feedback, testimonials, reviews, or recommendations.",
  inputSchema: z.object({
    featuredOnly: z
      .boolean()
      .optional()
      .describe("If true, only return featured testimonials"),
  }),
  execute: async ({ featuredOnly = false }) => {
    const filter = featuredOnly ? " && featured == true" : "";
    const testimonials = await sanityClient.fetch(
      `*[_type == "testimonial"${filter}] | order(featured desc, order asc){
        name,
        position,
        company,
        testimonial,
        rating,
        date,
        linkedinUrl
      }`,
    );
    return { testimonials };
  },
});

export const getExperience = tool({
  description:
    "Get work experience and employment history. Use this when users ask about work experience, jobs, career history, companies worked at, or professional background.",
  inputSchema: z.object({
    query: z.string().optional().describe("Optional search context"),
  }),
  execute: async () => {
    const experience = await sanityClient.fetch(
      `*[_type == "experience"] | order(current desc, startDate desc){
        company,
        position,
        employmentType,
        location,
        startDate,
        endDate,
        current,
        responsibilities,
        achievements,
        companyWebsite
      }`,
    );
    return { experience };
  },
});

export const getSkills = tool({
  description:
    "Get technical skills and proficiency levels. Use this when users ask about skills, technologies, tech stack, what languages or frameworks are known, or areas of expertise.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe(
        "Optional category filter: frontend, backend, ai-ml, devops, database, mobile, cloud, testing, design, tools, soft-skills",
      ),
  }),
  execute: async ({ category }) => {
    const filter = category ? ` && category == "${category}"` : "";
    const skills = await sanityClient.fetch(
      `*[_type == "skill"${filter}] | order(category asc, name asc){
        name,
        category,
        proficiency,
        percentage,
        yearsOfExperience
      }`,
    );
    return { skills };
  },
});

export const getEducation = tool({
  description:
    "Get education history. Use this when users ask about education, degrees, university, school, or academic background.",
  inputSchema: z.object({
    query: z.string().optional().describe("Optional search context"),
  }),
  execute: async () => {
    const education = await sanityClient.fetch(
      `*[_type == "education"] | order(order asc, endDate desc){
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        current,
        gpa,
        description,
        achievements,
        website
      }`,
    );
    return { education };
  },
});

export const getCertifications = tool({
  description:
    "Get professional certifications. Use this when users ask about certifications, certificates, credentials, or professional qualifications.",
  inputSchema: z.object({
    query: z.string().optional().describe("Optional search context"),
  }),
  execute: async () => {
    const certifications = await sanityClient.fetch(
      `*[_type == "certification"] | order(order asc, issueDate desc){
        name,
        issuer,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
        description
      }`,
    );
    return { certifications };
  },
});

export const getServices = tool({
  description:
    "Get services offered. Use this when users ask about services, what can be hired for, consulting, or freelance offerings.",
  inputSchema: z.object({
    query: z.string().optional().describe("Optional search context"),
  }),
  execute: async () => {
    const services = await sanityClient.fetch(
      `*[_type == "service"] | order(featured desc, order asc){
        title,
        "slug": slug.current,
        shortDescription,
        features,
        deliverables,
        pricing,
        timeline,
        featured
      }`,
    );
    return { services };
  },
});

export const portfolioTools = {
  getProfile,
  getProjects,
  getProjectDetails,
  getBlogPosts,
  getAchievements,
  getTestimonials,
  getExperience,
  getSkills,
  getEducation,
  getCertifications,
  getServices,
};

