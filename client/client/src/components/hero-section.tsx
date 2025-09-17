import { useState } from "react";
import { Globe, Zap } from "lucide-react";
import FormatSelector from "./format-selector";
import QualitySelector from "./quality-selector";
import UrlInput from "./url-input";

interface HeroSectionProps {
  onLearnMore: () => void;
}

export default function HeroSection({ onLearnMore }: HeroSectionProps) {
  const [selectedFormat, setSelectedFormat] = useState<"mp3" | "mp4">("mp3");
  const [selectedQuality, setSelectedQuality] = useState("1080p");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Logo and Title */}
      <div className="text-center mb-8 floating">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full glass-effect flex items-center justify-center mr-3">
            <Globe className="text-2xl text-blue-300" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient" data-testid="text-logo">
            You2Fetch
          </h1>
        </div>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto" data-testid="text-subtitle">
          Конвертируйте YouTube видео в MP3 или MP4 за считанные секунды
        </p>
      </div>

      {/* Format Selection */}
      <div className={`format-section mb-6 ${selectedFormat === "mp4" ? "with-quality" : ""}`}>
        <FormatSelector 
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
        />
      </div>

      {/* Quality Selection */}
      <QualitySelector
        selectedQuality={selectedQuality}
        onQualityChange={setSelectedQuality}
        isVisible={selectedFormat === "mp4"}
      />

      {/* URL Input */}
      <UrlInput 
        selectedFormat={selectedFormat}
        selectedQuality={selectedQuality}
      />

      {/* Learn More Button */}
      <button
        onClick={onLearnMore}
        className="learn-more-btn px-8 py-3 rounded-full font-medium flex items-center gap-2 mb-20"
        data-testid="button-learn-more"
      >
        <Zap className="text-yellow-400 w-5 h-5" />
        Узнать больше
      </button>
    </div>
  );
}
