import { useState, useEffect, useCallback } from "react";

export interface ProfileData {
  name: string;
  tagline: string;
  birthDate: string;
  birthPlace: string;
  father: string;
  mother: string;
  education: string;
  school: string;
  ventures: string;
  bioText: string;
  youtubeChannel: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  deezer: string;
  spotify: string;
  chaptra: string;
  scholar: string;
  email: string;
}

export const DEFAULT_PROFILE: ProfileData = {
  name: "MD. Shinha Sarder",
  tagline: "Entrepreneur",
  birthDate: "5 November, 2004",
  birthPlace: "Shirgati village, Aichgati UnionParishad, Khulna, Bangladesh",
  father: "MD. Lutfor Rahaman (Lawyer)",
  mother: "Samima Sultana (Private sector employee)",
  education: "Computer Science & Engineering (CSE), Northern University of Businesses & Technology Khulna",
  school: "Khulna Zilla School (Former Student)",
  ventures: "Founder & CEO of IT Tech BD and Biostar TV World",
  bioText:
    "MD. Shinha Sarder is known as the Founder & CEO of IT Tech BD and Biostar TV World who born on 5 November , 2004. He also known as an Entrepreneur, Musical Artist, Author, Researcher, YouTuber and Content Creator. He regularly upload Content in YouTube, Facebook and other social media. He is a regular student at Computer Science and Engineering (CSE) program in the Northern University of Businesses and Technology, Khulna. He was a former student of Khulna Zilla School. His father (MD. Lutfor Rahaman) is a lawyer. His mother (Samima Sultana) is a private sector employee. He born into a Muslim family in Shirgati village, Aichgati UnionParishad, Khulna.",
  youtubeChannel: "https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw",
  facebook: "https://www.facebook.com/md.shinha.sarder",
  twitter: "https://x.com/mdshinhasarder",
  instagram: "https://www.instagram.com/md_shinha_sarder",
  linkedin: "https://www.linkedin.com/in/md-shinha-sarder/",
  github: "https://github.com/md-shinha-sarder",
  deezer: "https://www.deezer.com/en/artist/338551431",
  spotify: "https://open.spotify.com/artist/5lJkSnrXPUFYmUHMPeGscF",
  chaptra: "https://www.chaptra.com/author/md-shinha-sarder",
  scholar: "https://scholar.google.com/citations?user=ixspgUAAAAAJ&hl=en",
  email: "shinhasarder2343@gmail.com",
};

const STORAGE_KEY = "md_shinha_profile_data_v2";

export function useProfileData() {
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("profile_updated", handleStorage);
    return () => window.removeEventListener("profile_updated", handleStorage);
  }, []);

  const saveProfile = useCallback((updated: ProfileData) => {
    setProfile(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("profile_updated"));
      } catch (e) {
        console.error("Failed to save profile:", e);
      }
    }
  }, []);

  const updateProfile = useCallback(
    (fields: Partial<ProfileData>) => {
      saveProfile({ ...profile, ...fields });
    },
    [profile, saveProfile]
  );

  const resetProfile = useCallback(() => {
    saveProfile(DEFAULT_PROFILE);
  }, [saveProfile]);

  return {
    profile,
    updateProfile,
    resetProfile,
  };
}
