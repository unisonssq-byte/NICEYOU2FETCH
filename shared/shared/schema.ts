import { z } from "zod";

// Custom YouTube URL validator using the comprehensive URL parser
const youtubeUrlValidator = z.string()
  .min(1, "URL не может быть пустым")
  .refine((url) => {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      // Use the comprehensive YouTube URL parser for validation
      // Import dynamically to avoid circular dependencies
      const { YouTubeUrlParser } = require('../server/services/youtube-url');
      return YouTubeUrlParser.isYouTubeUrl(url);
    } catch (error) {
      // Fallback to basic validation if parser is not available
      const cleanUrl = url.trim().replace(/&amp;/g, '&');
      const hasYouTubeDomain = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
      if (!hasYouTubeDomain) {
        return false;
      }
      // Basic video ID pattern check
      const videoIdMatch = cleanUrl.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([a-zA-Z0-9_-]{11})/);
      return !!videoIdMatch;
    }
  }, {
    message: "Пожалуйста, введите корректную ссылку на YouTube видео"
  });

export const downloadRequestSchema = z.object({
  url: youtubeUrlValidator,
  format: z.enum(["mp3", "mp4"], { required_error: "Выберите формат" }),
  quality: z.enum(["720p", "1080p", "1440p", "2160p"]).optional(),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;

export const downloadResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  downloadUrl: z.string(),
  filename: z.string(),
});

export type DownloadResponse = z.infer<typeof downloadResponseSchema>;

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Schema for video info request
export const videoInfoRequestSchema = z.object({
  url: youtubeUrlValidator,
});

export type VideoInfoRequest = z.infer<typeof videoInfoRequestSchema>;

// Schema for video info response
export const videoInfoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
});

export type VideoInfoResponse = z.infer<typeof videoInfoResponseSchema>;
