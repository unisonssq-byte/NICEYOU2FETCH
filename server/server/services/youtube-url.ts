/**
 * Comprehensive YouTube URL parsing service
 * Handles various YouTube URL formats and extracts video IDs reliably
 */

export interface ParsedYouTubeUrl {
  videoId: string;
  originalUrl: string;
  canonicalUrl: string;
  isValid: boolean;
}

export interface YouTubeUrlInfo {
  videoId: string | null;
  playlistId: string | null;
  timestamp: number | null;
  isShorts: boolean;
  isLive: boolean;
  isMobile: boolean;
  isMusic: boolean;
}

export class YouTubeUrlParser {
  // YouTube video ID regex - 11 characters, alphanumeric plus underscore and hyphen
  private static readonly VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
  
  // Common YouTube domains
  private static readonly YOUTUBE_DOMAINS = [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
    'youtu.be',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com'
  ];

  // URL patterns for different YouTube formats
  private static readonly URL_PATTERNS = [
    // Standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      type: 'watch'
    },
    // Short URLs: https://youtu.be/VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      type: 'short'
    },
    // Shorts URLs: https://www.youtube.com/shorts/VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      type: 'shorts'
    },
    // Embed URLs: https://www.youtube.com/embed/VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      type: 'embed'
    },
    // Live URLs: https://www.youtube.com/live/VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/live\/([a-zA-Z0-9_-]{11})/,
      type: 'live'
    },
    // Channel specific video URLs: https://www.youtube.com/c/CHANNEL/watch?v=VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/c\/[^\/]+\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      type: 'channel'
    },
    // User specific video URLs: https://www.youtube.com/user/USER/watch?v=VIDEO_ID
    {
      pattern: /(?:https?:\/\/)?(?:www\.|m\.|music\.|gaming\.)?youtube(?:-nocookie)?\.com\/user\/[^\/]+\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      type: 'user'
    }
  ];

  /**
   * Extract video ID from various YouTube URL formats
   * @param url - YouTube URL to parse
   * @returns Video ID or null if not found or invalid
   */
  static parseVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Clean the URL - remove whitespace and handle common encoding issues
    const cleanUrl = url.trim().replace(/&amp;/g, '&');
    
    // Try each pattern
    for (const { pattern } of this.URL_PATTERNS) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // Validate the video ID format
        if (this.VIDEO_ID_REGEX.test(videoId)) {
          return videoId;
        }
      }
    }

    return null;
  }

  /**
   * Check if a URL is a valid YouTube URL
   * @param url - URL to validate
   * @returns True if it's a valid YouTube URL
   */
  static isYouTubeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check if it's a known YouTube domain
      const isYouTubeDomain = this.YOUTUBE_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
      
      if (!isYouTubeDomain) {
        return false;
      }

      // Try to extract video ID to confirm it's a valid video URL
      return this.parseVideoId(url) !== null;
    } catch {
      // If URL parsing fails, try regex patterns directly
      return this.URL_PATTERNS.some(({ pattern }) => pattern.test(url));
    }
  }

  /**
   * Create a canonical YouTube URL from video ID
   * @param videoId - YouTube video ID
   * @returns Canonical YouTube URL
   */
  static toCanonicalUrl(videoId: string): string {
    if (!videoId || !this.VIDEO_ID_REGEX.test(videoId)) {
      throw new Error('Invalid video ID');
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Parse comprehensive information from YouTube URL
   * @param url - YouTube URL to parse
   * @returns Detailed information about the URL
   */
  static parseUrlInfo(url: string): YouTubeUrlInfo {
    const defaultInfo: YouTubeUrlInfo = {
      videoId: null,
      playlistId: null,
      timestamp: null,
      isShorts: false,
      isLive: false,
      isMobile: false,
      isMusic: false
    };

    if (!url || typeof url !== 'string') {
      return defaultInfo;
    }

    const cleanUrl = url.trim().replace(/&amp;/g, '&');
    const videoId = this.parseVideoId(cleanUrl);
    
    if (!videoId) {
      return defaultInfo;
    }

    try {
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const searchParams = urlObj.searchParams;
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();

      // Extract playlist ID
      const playlistId = searchParams.get('list');

      // Extract timestamp
      let timestamp: number | null = null;
      const tParam = searchParams.get('t') || searchParams.get('start');
      if (tParam) {
        // Handle formats like "1h2m3s", "1m30s", "90s", "90"
        if (tParam.includes('h') || tParam.includes('m') || tParam.includes('s')) {
          // Enhanced regex to support hours, minutes, and seconds
          const match = tParam.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
          if (match) {
            const hours = parseInt(match[1] || '0', 10);
            const minutes = parseInt(match[2] || '0', 10);
            const seconds = parseInt(match[3] || '0', 10);
            timestamp = hours * 3600 + minutes * 60 + seconds;
          }
        } else {
          timestamp = parseInt(tParam, 10) || null;
        }
      }

      return {
        videoId,
        playlistId,
        timestamp,
        isShorts: pathname.includes('/shorts/'),
        isLive: pathname.includes('/live/'),
        isMobile: hostname.startsWith('m.'),
        isMusic: hostname.startsWith('music.')
      };
    } catch {
      return {
        ...defaultInfo,
        videoId
      };
    }
  }

  /**
   * Normalize a YouTube URL to a standard format
   * @param url - YouTube URL to normalize
   * @returns Normalized ParsedYouTubeUrl object
   */
  static parseUrl(url: string): ParsedYouTubeUrl {
    const videoId = this.parseVideoId(url);
    const isValid = videoId !== null;
    
    return {
      videoId: videoId || '',
      originalUrl: url,
      canonicalUrl: isValid ? this.toCanonicalUrl(videoId!) : '',
      isValid
    };
  }

  /**
   * Extract video ID from URL with additional validation
   * @param url - YouTube URL
   * @returns Video ID if valid, throws error if invalid
   */
  static extractVideoIdOrThrow(url: string): string {
    const videoId = this.parseVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL: Unable to extract video ID');
    }
    return videoId;
  }

  /**
   * Clean and validate YouTube URL
   * @param url - Raw URL input
   * @returns Clean, validated YouTube URL
   */
  static cleanAndValidateUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required');
    }

    // Clean the URL
    let cleanUrl = url.trim();
    
    // Remove common prefixes if they exist
    cleanUrl = cleanUrl.replace(/^(youtube\.com|www\.youtube\.com|youtu\.be|m\.youtube\.com)/, 'https://$1');
    
    // Add protocol if missing
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Validate it's a YouTube URL
    if (!this.isYouTubeUrl(cleanUrl)) {
      throw new Error('Invalid YouTube URL format');
    }

    return cleanUrl;
  }

  /**
   * Get video ID from URL or throw descriptive error
   * @param url - YouTube URL
   * @returns Video ID
   */
  static getVideoIdSafe(url: string): { videoId: string; cleanUrl: string } {
    try {
      const cleanUrl = this.cleanAndValidateUrl(url);
      const videoId = this.extractVideoIdOrThrow(cleanUrl);
      return { videoId, cleanUrl };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`YouTube URL parsing failed: ${error.message}`);
      }
      throw new Error('YouTube URL parsing failed: Unknown error');
    }
  }
}

// Export convenience functions for backward compatibility
export const parseVideoId = YouTubeUrlParser.parseVideoId.bind(YouTubeUrlParser);
export const isYouTubeUrl = YouTubeUrlParser.isYouTubeUrl.bind(YouTubeUrlParser);
export const toCanonicalUrl = YouTubeUrlParser.toCanonicalUrl.bind(YouTubeUrlParser);
export const parseUrlInfo = YouTubeUrlParser.parseUrlInfo.bind(YouTubeUrlParser);
export const parseUrl = YouTubeUrlParser.parseUrl.bind(YouTubeUrlParser);
export const cleanAndValidateUrl = YouTubeUrlParser.cleanAndValidateUrl.bind(YouTubeUrlParser);
export const getVideoIdSafe = YouTubeUrlParser.getVideoIdSafe.bind(YouTubeUrlParser);