interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradientClass: string;
}

export default function FeatureCard({ icon, title, description, gradientClass }: FeatureCardProps) {
  return (
    <div className="feature-card p-8 rounded-2xl text-center group" data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${gradientClass}`}>
        <i className={`${icon} text-2xl text-white`}></i>
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
