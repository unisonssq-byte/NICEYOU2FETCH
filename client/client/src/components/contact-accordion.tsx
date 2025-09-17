import { useState } from "react";
import { ChevronDown, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      toast({
        title: "Скопировано!",
        description: `${type} скопирован в буфер обмена`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:text-white transition-colors"
        data-testid="button-contact-toggle"
      >
        Контакты
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 glass-effect rounded-lg p-4 min-w-[200px] z-50">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => copyToClipboard('t.me/unicodig', 'Telegram')}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
              data-testid="button-copy-telegram"
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm">t.me/unicodig</span>
              {copiedItem === 'Telegram' ? (
                <Check className="w-4 h-4 text-green-400 ml-auto" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 ml-auto" />
              )}
            </button>
            
            <button
              onClick={() => copyToClipboard('reklama@you2fetch.ru', 'Email')}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-left"
              data-testid="button-copy-email"
            >
              <Mail className="w-4 h-4 text-purple-400" />
              <span className="text-sm">reklama@you2fetch.ru</span>
              {copiedItem === 'Email' ? (
                <Check className="w-4 h-4 text-green-400 ml-auto" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 ml-auto" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}