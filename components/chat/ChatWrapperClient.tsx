"use client";

import { defineQuery } from "next-sanity";
import { useEffect, useState } from "react";
import Chat from "@/components/chat/Chat";
import { client } from "@/sanity/lib/client";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import SidebarToggle from "../SideBarToggle";

const CHAT_PROFILE_QUERY = defineQuery(`*[_id == "singleton-profile"][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    firstName,
    lastName,
    headline,
    shortBio,
    email,
    phone,
    location,
    availability,
    socialLinks,
    yearsOfExperience,
    profileImage
  }`);

export default function ChatWrapperClient() {
  const [email, setEmail] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [profile, setProfile] = useState<CHAT_PROFILE_QUERYResult | null>(null);

  useEffect(() => {
    // Check for saved email
    const savedEmail = localStorage.getItem("chatUserEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }

    // Ensure a stable sessionId across reloads
    // If no email, create a new session (fresh start)
    const existingSessionId = localStorage.getItem("chatSessionId");
    if (existingSessionId && savedEmail) {
      // Only reuse session if we have an email
      setSessionId(existingSessionId);
    } else {
      // Create new session for new users or after clearing history
      const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chatSessionId", newId);
      setSessionId(newId);
    }

    // Fetch profile data
    async function loadProfile() {
      try {
        const result = await client.fetch(CHAT_PROFILE_QUERY);
        setProfile(result);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }
    loadProfile();
  }, []);

  // If we don't have email yet, we'll let Chat handle prompting for it
  // The chat component will intercept messages to get email

  return (
    <div className="h-full w-full">
      <div className="md:hidden p-2 sticky top-0 z-10">
        <SidebarToggle />
      </div>

      {profile && sessionId && (
        <Chat profile={profile} email={email} sessionId={sessionId} />
      )}
    </div>
  );
}
