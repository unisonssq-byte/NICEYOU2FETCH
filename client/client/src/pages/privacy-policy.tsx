import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Вернуться на главную
        </Link>
        
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-8 text-gradient">Политика конфиденциальности</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Сбор информации</h2>
              <p>You2Fetch не собирает персональную информацию пользователей. Мы не требуем регистрации и не сохраняем данные о пользователях на наших серверах.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Использование сервиса</h2>
              <p>Наш сервис предназначен для конвертации YouTube видео в MP3 и MP4 форматы. Мы не сохраняем загруженные файлы и автоматически удаляем их после скачивания.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Файлы cookie</h2>
              <p>Мы используем только технические cookie, необходимые для работы сайта. Мы не используем cookie для отслеживания или аналитики.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Безопасность</h2>
              <p>Все данные передаются по защищенному HTTPS соединению. Мы не собираем и не передаем персональную информацию третьим лицам.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Контакты</h2>
              <p>По вопросам конфиденциальности обращайтесь: <a href="mailto:reklama@you2fetch.ru" className="text-blue-400 hover:text-blue-300">reklama@you2fetch.ru</a></p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Обновления</h2>
              <p>Мы можем обновлять эту политику конфиденциальности. Изменения публикуются на этой странице.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}