import { useState } from "react";
import { Link, Download } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import VideoPreview from "./video-preview";
import type { DownloadRequest, DownloadResponse, ErrorResponse, VideoInfoRequest, VideoInfoResponse } from "@shared/schema";

interface UrlInputProps {
  selectedFormat: "mp3" | "mp4";
  selectedQuality: string;
}

export default function UrlInput({ selectedFormat, selectedQuality }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfoResponse | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Mutation for getting video info
  const videoInfoMutation = useMutation({
    mutationFn: async (request: VideoInfoRequest): Promise<VideoInfoResponse> => {
      const response = await apiRequest("POST", "/api/video-info", request);
      return response.json();
    },
    onSuccess: (data) => {
      setVideoInfo(data);
      toast({
        title: "Видео найдено!",
        description: `${data.title}`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Не удалось получить информацию о видео";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
      setVideoInfo(null);
    },
  });

  // Mutation for downloading
  const downloadMutation = useMutation({
    mutationFn: async (request: DownloadRequest): Promise<DownloadResponse> => {
      setIsDownloading(true);
      setDownloadProgress(10);
      
      const response = await apiRequest("POST", "/api/download", request);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      
      const result = await response.json();
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Готово к скачиванию!",
        description: `${data.title}`,
      });
      
      // Start download after a short delay
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset state after download
        setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
          setVideoInfo(null);
          setUrl("");
        }, 2000);
      }, 1000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Произошла ошибка при скачивании";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
      setIsDownloading(false);
      setDownloadProgress(0);
    },
  });

  const handleGetVideoInfo = () => {
    if (!url.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите URL YouTube видео",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите корректный URL YouTube",
        variant: "destructive",
      });
      return;
    }

    const request: VideoInfoRequest = {
      url: url.trim(),
    };

    videoInfoMutation.mutate(request);
  };

  const handleDownload = () => {
    if (!videoInfo) return;
    
    const request: DownloadRequest = {
      url: url.trim(),
      format: selectedFormat,
      quality: selectedFormat === "mp4" ? (selectedQuality as "720p" | "1080p" | "1440p" | "2160p") : undefined,
    };

    downloadMutation.mutate(request);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (videoInfo) {
        handleDownload();
      } else {
        handleGetVideoInfo();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mb-8">
      {/* URL Input */}
      {!videoInfo && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              placeholder="Вставьте ссылку на YouTube видео..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-gray-400"
              data-testid="input-youtube-url"
              disabled={videoInfoMutation.isPending}
            />
          </div>
          <button
            onClick={handleGetVideoInfo}
            disabled={videoInfoMutation.isPending}
            className="btn-gradient-download px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-get-info"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:inline">
              {videoInfoMutation.isPending ? "Получение..." : "Получить"}
            </span>
          </button>
        </div>
      )}
      
      {/* Video Preview */}
      {videoInfo && (
        <VideoPreview
          title={videoInfo.title}
          thumbnail={videoInfo.thumbnail}
          duration={videoInfo.duration}
          format={selectedFormat}
          quality={selectedQuality}
          progress={downloadProgress}
          isDownloading={isDownloading}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
