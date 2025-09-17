import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { downloadRequestSchema, type DownloadRequest, videoInfoRequestSchema, type VideoInfoRequest } from "@shared/schema";
import { YouTubeDownloader } from "./services/youtube-downloader";
import path from "path";

const downloader = new YouTubeDownloader();
const downloadJobs = new Map<string, { format: 'mp3' | 'mp4'; filename: string }>();

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube video info endpoint
  app.post("/api/video-info", async (req, res) => {
    try {
      const request = videoInfoRequestSchema.parse(req.body) as VideoInfoRequest;
      
      const videoInfo = await downloader.getVideoInfo(request.url);
      
      res.json({
        id: videoInfo.videoId,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
      });
    } catch (error) {
      console.error("Video info error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "validation_error",
          message: error.errors[0]?.message || "Неверные данные"
        });
      }

      res.status(500).json({
        error: "video_info_error",
        message: error instanceof Error ? error.message : "Ошибка при получении информации о видео"
      });
    }
  });

  // YouTube video download endpoint
  app.post("/api/download", async (req, res) => {
    try {
      const request = downloadRequestSchema.parse(req.body) as DownloadRequest;
      
      let result;
      if (request.format === "mp3") {
        result = await downloader.downloadAudio(request.url);
      } else {
        result = await downloader.downloadVideo(request.url, request.quality || "1080p");
      }

      // Store download job info - use actual file finding instead of static paths
      downloadJobs.set(result.id, { 
        format: request.format, // Store format for finding actual file later
        filename: result.filename 
      });

      // Clean up file after 1 hour
      setTimeout(() => {
        const job = downloadJobs.get(result.id);
        if (job) {
          const actualFilePath = downloader.findActualDownloadedFile(result.id, job.format);
          if (actualFilePath) {
            downloader.deleteFile(actualFilePath);
          }
          downloadJobs.delete(result.id);
        }
      }, 60 * 60 * 1000);

      res.json(result);
    } catch (error) {
      console.error("Download error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "validation_error",
          message: error.errors[0]?.message || "Неверные данные"
        });
      }

      res.status(500).json({
        error: "download_error",
        message: error instanceof Error ? error.message : "Ошибка при скачивании"
      });
    }
  });

  // File download endpoint
  app.get("/api/download/:id", (req, res) => {
    const { id } = req.params;
    const job = downloadJobs.get(id);

    if (!job) {
      return res.status(404).json({
        error: "not_found",
        message: "Файл не найден или истёк срок действия ссылки"
      });
    }

    // Find the actual downloaded file instead of using static paths
    const actualFilePath = downloader.findActualDownloadedFile(id, job.format);
    if (!actualFilePath) {
      console.error(`Actual file not found for ID: ${id}, format: ${job.format}`);
      return res.status(404).json({
        error: "file_not_found",
        message: "Файл не найден на сервере"
      });
    }

    const { filename } = job;
    
    console.log(`Serving file: ${actualFilePath} as ${filename}`);
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.sendFile(path.resolve(actualFilePath), (err) => {
      if (err) {
        console.error("File send error:", err);
        console.error("Attempted file path:", actualFilePath);
        res.status(404).json({
          error: "file_error",
          message: "Ошибка при отправке файла"
        });
      } else {
        console.log(`Successfully served file: ${filename} (${actualFilePath})`);
      }
    });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
