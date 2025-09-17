import { Music, Video } from "lucide-react";

interface FormatSelectorProps {
  selectedFormat: "mp3" | "mp4";
  onFormatChange: (format: "mp3" | "mp4") => void;
}

export default function FormatSelector({ selectedFormat, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-300 text-sm">Выберите формат:</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onFormatChange("mp3")}
          className={`format-btn px-6 py-3 rounded-full font-medium flex items-center gap-2 ${
            selectedFormat === "mp3" ? "active" : ""
          }`}
          data-testid="button-format-mp3"
        >
          <Music className="w-4 h-4" />
          MP3
        </button>
        <button
          onClick={() => onFormatChange("mp4")}
          className={`format-btn px-6 py-3 rounded-full font-medium flex items-center gap-2 ${
            selectedFormat === "mp4" ? "active" : ""
          }`}
          data-testid="button-format-mp4"
        >
          <Video className="w-4 h-4" />
          MP4
        </button>
      </div>
    </div>
  );
}
