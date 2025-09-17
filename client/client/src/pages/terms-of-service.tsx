import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Вернуться на главную
        </Link>
        
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-8 text-gradient">Условия использования</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Принятие условий</h2>
              <p>Используя сервис You2Fetch, вы соглашаетесь с данными условиями использования. Если вы не согласны с условиями, не используйте наш сервис.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Описание сервиса</h2>
              <p>You2Fetch предоставляет возможность конвертации YouTube видео в MP3 и MP4 форматы. Сервис предоставляется "как есть" без каких-либо гарантий.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Ограничения использования</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Сервис предназначен только для личного некоммерческого использования</li>
                <li>Вы не можете загружать контент, защищенный авторскими правами</li>
                <li>Запрещено использование автоматизированных инструментов или ботов</li>
                <li>Не допускается перегрузка серверов чрезмерными запросами</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Авторские права</h2>
              <p>Вы несете полную ответственность за соблюдение авторских прав при использовании нашего сервиса. Мы не несем ответственности за нарушение авторских прав пользователями.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Ограничение ответственности</h2>
              <p>You2Fetch не несет ответственности за любые прямые или косвенные убытки, возникшие в результате использования сервиса.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Изменения условий</h2>
              <p>Мы оставляем за собой право изменять данные условия в любое время. Продолжение использования сервиса означает согласие с обновленными условиями.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Контакты</h2>
              <p>По вопросам условий использования обращайтесь: <a href="mailto:reklama@you2fetch.ru" className="text-blue-400 hover:text-blue-300">reklama@you2fetch.ru</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}