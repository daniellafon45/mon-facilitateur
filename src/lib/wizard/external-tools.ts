export interface ExternalTool {
  id: string;
  label: string;
  /** Logo officiel (Simple Icons CDN) */
  logo: string;
}

export const EXTERNAL_TOOLS: ExternalTool[] = [
  { id: "chatgpt", label: "ChatGPT", logo: "https://cdn.simpleicons.org/openai/10A37F" },
  { id: "claude", label: "Claude", logo: "https://cdn.simpleicons.org/anthropic/CC785C" },
  { id: "canva", label: "Canva", logo: "https://cdn.simpleicons.org/canva/00C4CC" },
  { id: "figma", label: "Figma", logo: "https://cdn.simpleicons.org/figma/F24E1E" },
  { id: "gdocs", label: "Google Docs", logo: "https://cdn.simpleicons.org/googledocs/4285F4" },
  { id: "youtube", label: "YouTube", logo: "https://cdn.simpleicons.org/youtube/FF0000" },
  { id: "miro", label: "Miro", logo: "https://cdn.simpleicons.org/miro/FFD02F" },
];
