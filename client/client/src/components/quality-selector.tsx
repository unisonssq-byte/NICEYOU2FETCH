import { useEffect, useState } from "react";

interface QualitySelectorProps {
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  isVisible: boolean;
}

export default function QualitySelector({ 
  selectedQuality, 
  onQualityChange, 
  isVisible 
}: QualitySelectorProps) {
  const qualities = ["720p", "1080p", "1440p", "2160p"];
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setShow(true), 50);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`mb-8 transition-all duration-400 ease-out ${
      show ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-5 scale-95'
    }`}>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <span className="text-gray-300 text-sm">Выберите качество:</span>
        <div className="flex gap-2 flex-wrap justify-center">
          {qualities.map((quality, index) => (
            <button
              key={quality}
              onClick={() => onQualityChange(quality)}
              className={`quality-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedQuality === quality ? "active" : ""
              }`}
              style={{
                transitionDelay: show ? `${index * 100}ms` : '0ms'
              }}
              data-testid={`button-quality-${quality}`}
            >
              {quality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
