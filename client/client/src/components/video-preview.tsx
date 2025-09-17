import { Download, Clock, FileAudio, FileVideo } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoPreviewProps {
  title: string;
  thumbnail: string;
  duration: string;
  format: "mp3" | "mp4";
  quality?: string;
  progress: number;
  isDownloading: boolean;
  onDownload: () => void;
}

export default function VideoPreview({
  title,
  thumbnail,
  duration,
  format,
  quality,
  progress,
  isDownloading,
  onDownload
}: VideoPreviewProps) {
  const formatDuration = (seconds: string) => {
    const num = parseInt(seconds, 10);
    if (isNaN(num)) return seconds;
    
    const hours = Math.floor(num / 3600);
    const minutes = Math.floor((num % 3600) / 60);
    const secs = num % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mb-8 glass-effect rounded-2xl p-6 animate-in slide-in-from-bottom-4">
      {/* Video Preview */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full md:w-32 h-20 md:h-20 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSI2NCIgY3k9IjQwIiByPSIxNiIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNNTggMzJMNzIgNDBMNTggNDhaIiBmaWxsPSIjOUM5Q0EwIi8+Cjwvc3ZnPgo=';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
            {format === "mp3" ? (
              <FileAudio className="text-white w-6 h-6" />
            ) : (
              <FileVideo className="text-white w-6 h-6" />
            )}
          </div>
        </div>
        
        {/* Video Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="uppercase text-blue-400 font-medium">
              {format === "mp4" ? `${format.toUpperCase()} ${quality}` : format.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isDownloading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">
              {progress === 100 ? "Завершено" : "Скачивание..."}
            </span>
            <span className="text-sm text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full btn-gradient-download py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        {isDownloading ? "Скачивание..." : `Скачать ${format.toUpperCase()}`}
      </button>
    </div>
  );
}