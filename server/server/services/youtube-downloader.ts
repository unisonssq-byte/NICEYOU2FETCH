import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import type { DownloadRequest, DownloadResponse } from '@shared/schema';
import { YouTubeUrlParser } from './youtube-url';

export class YouTubeDownloader {
  private tempDir = path.join(process.cwd(), 'temp');
  private ytDlpWrap: YTDlpWrap;

  constructor() {
    // Initialize yt-dlp-wrap - access the actual constructor from .default
    const YTDlpWrapClass = (YTDlpWrap as any).default || YTDlpWrap;
    this.ytDlpWrap = new YTDlpWrapClass();
    console.log('Successfully created YTDlpWrap instance');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async getVideoInfo(url: string) {
    try {
      // First validate and clean the URL using our YouTube URL parser
      console.log(`Validating and parsing URL: ${url}`);
      const { videoId, cleanUrl } = YouTubeUrlParser.getVideoIdSafe(url);
      const canonicalUrl = YouTubeUrlParser.toCanonicalUrl(videoId);
      
      console.log(`Fetching video info for video ID: ${videoId}`);
      console.log(`Using canonical URL: ${canonicalUrl}`);
      
      // Use yt-dlp to get video information
      const info = await this.ytDlpWrap.getVideoInfo(canonicalUrl);
      console.log(`Successfully fetched info for video: ${info.title}`);
      
      // Extract best thumbnail URL
      let thumbnailUrl = info.thumbnail || '';
      if (!thumbnailUrl && info.thumbnails && info.thumbnails.length > 0) {
        // Find best quality thumbnail
        const bestThumbnail = info.thumbnails.reduce((best: any, current: any) => 
          (current.width || 0) > (best.width || 0) ? current : best
        );
        thumbnailUrl = bestThumbnail.url || info.thumbnails[0].url || '';
      }
      
      return {
        title: info.title || info.fulltitle || '',
        duration: info.duration ? info.duration.toString() : '0',
        thumbnail: thumbnailUrl,
        videoId: info.id || videoId,
      };
    } catch (error) {
      console.error('Failed to get video info:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: url
      });
      
      // Handle URL parsing errors first (from YouTubeUrlParser.getVideoIdSafe)
      if (error instanceof Error && error.message.includes('YouTube URL parsing failed')) {
        throw new Error('Неверный формат ссылки YouTube. Поддерживаются ссылки вида: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., и др.');
      }
      
      // Handle yt-dlp specific errors
      let errorMessage = 'Не удалось получить информацию о видео.';
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes('video unavailable') || errMsg.includes('unavailable')) {
          errorMessage = 'Видео недоступно или удалено.';
        } else if (errMsg.includes('private video') || errMsg.includes('private')) {
          errorMessage = 'Это приватное видео.';
        } else if (errMsg.includes('not available') || errMsg.includes('region')) {
          errorMessage = 'Видео недоступно в вашем регионе.';
        } else if (errMsg.includes('age-restricted') || errMsg.includes('age restricted') || errMsg.includes('age_limit')) {
          errorMessage = 'Видео имеет возрастные ограничения.';
        } else if (errMsg.includes('status code 404') || errMsg.includes('404') || errMsg.includes('not found')) {
          errorMessage = 'Видео не найдено. Возможно, оно было удалено.';
        } else if (errMsg.includes('timeout') || errMsg.includes('network') || errMsg.includes('connection')) {
          errorMessage = 'Ошибка сети. Попробуйте позже.';
        } else if (errMsg.includes('invalid youtube url') || errMsg.includes('unsupported url')) {
          errorMessage = 'Неверная ссылка на YouTube видео.';
        } else if (errMsg.includes('sign in') || errMsg.includes('login required')) {
          errorMessage = 'Видео требует входа в аккаунт или имеет ограничения доступа.';
        } else if (errMsg.includes('premium') || errMsg.includes('membership')) {
          errorMessage = 'Видео доступно только для участников или подписчиков.';
        }
      }
      throw new Error(`${errorMessage} Проверьте URL и попробуйте еще раз.`);
    }
  }

  async downloadAudio(url: string, quality: string = '320'): Promise<DownloadResponse> {
    // Get video info and canonical URL for consistent processing
    const info = await this.getVideoInfo(url);
    const { videoId } = YouTubeUrlParser.getVideoIdSafe(url);
    const canonicalUrl = YouTubeUrlParser.toCanonicalUrl(videoId);
    
    const id = randomUUID();
    const filename = `${this.sanitizeFilename(info.title)}.mp3`;
    const outputPath = path.join(this.tempDir, `${id}.mp3`);

    try {
      console.log(`Starting audio download for: ${info.title} at quality ${quality}kbps`);
      
      // Map quality to audio bitrate
      const audioBitrate = this.mapAudioQuality(quality);
      
      // Use yt-dlp to download and extract audio in MP3 format
      const args = [
        canonicalUrl,
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', audioBitrate,
        '--output', outputPath.replace('.mp3', '.%(ext)s'),
        '--no-playlist',
        '--no-warnings',
        '--prefer-ffmpeg',
        '--no-check-certificate',
        // Add headers for better compatibility
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      console.log('Executing yt-dlp with args:', args.join(' '));
      await this.ytDlpWrap.execPromise(args);

      console.log(`Successfully downloaded audio for: ${info.title}`);
      
      // Find the actual downloaded file
      const actualFilePath = this.findActualDownloadedFile(id, 'mp3');
      if (!actualFilePath) {
        throw new Error('Downloaded file not found after yt-dlp completion');
      }
      
      console.log(`Actual downloaded file found at: ${actualFilePath}`);

      return {
        id,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: this.formatDuration(parseInt(info.duration)),
        downloadUrl: `/api/download/${id}`,
        filename,
      };
    } catch (error) {
      console.error('Audio download error:', error);
      console.error('Error details for audio download:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        videoTitle: info.title,
        quality: quality
      });
      
      // Clean up files on error
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      
      // Handle yt-dlp specific errors for audio
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes('ffmpeg') || errMsg.includes('conversion')) {
          throw new Error('Ошибка при конвертации аудио. Попробуйте другое качество.');
        } else if (errMsg.includes('format not available') || errMsg.includes('no suitable formats')) {
          throw new Error('Аудиодорожка недоступна для этого видео.');
        }
      }
      throw new Error('Ошибка при скачивании и конвертации в MP3');
    }
  }

  async downloadVideo(url: string, quality: string = '1080p'): Promise<DownloadResponse> {
    // Get video info and canonical URL for consistent processing
    const info = await this.getVideoInfo(url);
    const { videoId } = YouTubeUrlParser.getVideoIdSafe(url);
    const canonicalUrl = YouTubeUrlParser.toCanonicalUrl(videoId);
    
    const id = randomUUID();
    const filename = `${this.sanitizeFilename(info.title)}.mp4`;
    const outputPath = path.join(this.tempDir, `${id}.mp4`);

    try {
      console.log(`Starting video download for: ${info.title} at ${quality}`);
      
      // Map quality to yt-dlp format selector
      const formatSelector = this.mapVideoQuality(quality);
      
      // Use yt-dlp to download video in MP4 format with specified quality
      const args = [
        canonicalUrl,
        '--format', formatSelector,
        '--output', outputPath.replace('.mp4', '.%(ext)s'),
        '--merge-output-format', 'mp4',
        '--no-playlist',
        '--no-warnings',
        '--prefer-ffmpeg',
        '--no-check-certificate',
        // Add headers for better compatibility
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      
      console.log('Executing yt-dlp with args:', args.join(' '));
      await this.ytDlpWrap.execPromise(args);

      console.log(`Successfully downloaded video for: ${info.title} at ${quality}`);
      
      // Find the actual downloaded file
      const actualFilePath = this.findActualDownloadedFile(id, 'mp4');
      if (!actualFilePath) {
        throw new Error('Downloaded file not found after yt-dlp completion');
      }
      
      console.log(`Actual downloaded file found at: ${actualFilePath}`);

      return {
        id,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: this.formatDuration(parseInt(info.duration)),
        downloadUrl: `/api/download/${id}`,
        filename,
      };
    } catch (error) {
      console.error('Video download error:', error);
      console.error('Error details for video download:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        videoTitle: info.title,
        quality: quality
      });
      
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      
      // Handle yt-dlp specific errors for video
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes('format not available') || errMsg.includes('no suitable formats')) {
          // Try to fallback to a lower quality
          if (quality !== '720p') {
            console.log(`Quality ${quality} not available, falling back to 720p`);
            return this.downloadVideo(url, '720p');
          }
          throw new Error('Запрошенное качество видео недоступно. Попробуйте другое качество.');
        } else if (errMsg.includes('ffmpeg') || errMsg.includes('merger')) {
          throw new Error('Ошибка при обработке видео. Попробуйте другое качество.');
        } else if (errMsg.includes('too large') || errMsg.includes('file size')) {
          throw new Error('Файл слишком большой для скачивания. Попробуйте более низкое качество.');
        }
      }
      throw new Error('Ошибка при скачивании видео');
    }
  }

  /**
   * Map quality string to audio bitrate for yt-dlp
   */
  private mapAudioQuality(quality: string): string {
    const qualityMap: { [key: string]: string } = {
      '128': '128K',
      '192': '192K', 
      '256': '256K',
      '320': '320K'
    };
    return qualityMap[quality] || '192K';
  }

  /**
   * Map quality string to video format selector for yt-dlp
   */
  private mapVideoQuality(quality: string): string {
    const qualityMap: { [key: string]: string } = {
      '720p': 'best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best',
      '1080p': 'best[height<=1080][ext=mp4]/best[height<=1080]/best[ext=mp4]/best',
      '1440p': 'best[height<=1440][ext=mp4]/best[height<=1440]/best[ext=mp4]/best',
      '2160p': 'best[height<=2160][ext=mp4]/best[height<=2160]/best[ext=mp4]/best'
    };
    return qualityMap[quality] || qualityMap['1080p'];
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^\w\s.-]/gi, '').replace(/\s+/g, '_').substring(0, 100);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getFilePath(id: string, format: 'mp3' | 'mp4'): string {
    return path.join(this.tempDir, `${id}.${format}`);
  }

  /**
   * Find the actual downloaded file after yt-dlp processing
   * yt-dlp may create files with different names than expected
   * Now includes retry logic for additional reliability
   */
  findActualDownloadedFile(id: string, expectedFormat: 'mp3' | 'mp4'): string | null {
    const maxRetries = 5;
    const retryDelay = 200; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Read temp directory to find files matching the ID pattern
        const files = fs.readdirSync(this.tempDir);
        
        // Look for files that start with our ID
        const matchingFiles = files.filter(file => file.startsWith(id + '.'));
        
        if (matchingFiles.length === 0) {
          if (attempt < maxRetries) {
            console.log(`No files found for ID: ${id} on attempt ${attempt}, retrying in ${retryDelay}ms...`);
            // Wait before retry
            const start = Date.now();
            while (Date.now() - start < retryDelay) {
              // Synchronous wait
            }
            continue;
          }
          console.error(`No files found for ID: ${id} after ${maxRetries} attempts`);
          return null;
        }
        
        // Prefer exact format match, but accept any file with our ID
        const exactMatch = matchingFiles.find(file => file === `${id}.${expectedFormat}`);
        if (exactMatch) {
          const filePath = path.join(this.tempDir, exactMatch);
          console.log(`Found exact match file: ${filePath} on attempt ${attempt}`);
          return filePath;
        }
        
        // Accept any file with our ID (in case yt-dlp used a different extension)
        const fallbackFile = matchingFiles[0];
        const filePath = path.join(this.tempDir, fallbackFile);
        console.log(`Using fallback file: ${filePath} for ID: ${id} on attempt ${attempt}`);
        return filePath;
        
      } catch (error) {
        if (attempt < maxRetries) {
          console.warn(`Error finding downloaded file for ID ${id} on attempt ${attempt}:`, error);
          // Wait before retry
          const start = Date.now();
          while (Date.now() - start < retryDelay) {
            // Synchronous wait
          }
          continue;
        }
        console.error(`Error finding downloaded file for ID ${id} after ${maxRetries} attempts:`, error);
        return null;
      }
    }
    
    return null;
  }

  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}