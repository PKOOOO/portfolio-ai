import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Disable CDN for server-side writes/reads to avoid stale reads during upsert flows
  useCdn: false,
  token: process.env.SANITY_SERVER_API_TOKEN,
});
