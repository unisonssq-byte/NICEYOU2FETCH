import FeatureCard from "./feature-card";

const features = [
  {
    icon: "fas fa-bolt",
    title: "Молниеносная скорость",
    description: "Конвертация за секунды без ожидания",
    gradientClass: "feature-gradient-1",
  },
  {
    icon: "fas fa-shield-alt",
    title: "Полная безопасность",
    description: "Никаких вирусов и регистрации",
    gradientClass: "feature-gradient-2",
  },
  {
    icon: "fas fa-music",
    title: "MP3 высокого качества",
    description: "До 320 kbps для лучшего звучания",
    gradientClass: "feature-gradient-3",
  },
  {
    icon: "fas fa-video",
    title: "Видео в HD качестве",
    description: "Скачивайте в разрешении до 1080p",
    gradientClass: "feature-gradient-4",
  },
  {
    icon: "fas fa-globe",
    title: "Работает везде",
    description: "На любом устройстве и в любом браузере",
    gradientClass: "feature-gradient-5",
  },
  {
    icon: "fas fa-infinity",
    title: "Без ограничений",
    description: "Скачивайте сколько угодно файлов",
    gradientClass: "feature-gradient-6",
  },
];

export default function FeaturesSection() {
  return (
    <div id="features" className="py-20 px-4" data-testid="section-features">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-features-title">
            Почему выбирают{" "}
            <span className="text-gradient">You2Fetch</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto" data-testid="text-features-subtitle">
            Самый быстрый и надёжный способ конвертировать YouTube видео в любой формат
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradientClass={feature.gradientClass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
