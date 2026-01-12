import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    birthDate: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && formData.firstName && formData.lastName && formData.birthDate) {
      setIsRegistered(true);
      toast.success('Добро пожаловать!');
    } else {
      toast.error('Пожалуйста, заполните все поля');
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Heart" size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Забота о здоровье</h1>
            <p className="text-xl text-muted-foreground">Регистрация в системе</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="text-xl font-medium mb-3 block">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-16 text-2xl px-6"
              />
            </div>

            <div>
              <label className="text-xl font-medium mb-3 block">Имя</label>
              <Input
                type="text"
                placeholder="Введите ваше имя"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-16 text-2xl px-6"
              />
            </div>

            <div>
              <label className="text-xl font-medium mb-3 block">Фамилия</label>
              <Input
                type="text"
                placeholder="Введите вашу фамилию"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-16 text-2xl px-6"
              />
            </div>

            <div>
              <label className="text-xl font-medium mb-3 block">Дата рождения</label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="h-16 text-2xl px-6"
              />
            </div>

            <Button type="submit" size="lg" className="w-full h-20 text-2xl font-bold">
              Зарегистрироваться
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { icon: 'Pill', label: 'Лекарства', color: 'bg-secondary', description: 'График приёма' },
    { icon: 'Calendar', label: 'Врачи', color: 'bg-accent', description: 'Запись на приём' },
    { icon: 'Phone', label: 'Связь', color: 'bg-muted', description: 'Близкие и родные' },
    { icon: 'Heart', label: 'Здоровье', color: 'bg-primary/20', description: 'История и данные' },
    { icon: 'CheckSquare', label: 'Задачи', color: 'bg-secondary', description: 'Напоминания' },
    { icon: 'AlertCircle', label: 'SOS', color: 'bg-destructive', description: 'Быстрая помощь', isEmergency: true },
    { icon: 'Image', label: 'Галерея', color: 'bg-accent', description: 'Фото от близких' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Heart" size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Здравствуйте, {formData.firstName}!</h1>
              <p className="text-muted-foreground text-lg">Ваше здоровье под контролем</p>
            </div>
          </div>
          <Button variant="outline" size="lg" className="h-14 px-6">
            <Icon name="Settings" size={24} className="mr-2" />
            <span className="text-xl">Настройки</span>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Главное меню</h2>
          <p className="text-xl text-muted-foreground">Выберите нужный раздел</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className={`${item.color} p-8 cursor-pointer hover:scale-105 transition-transform duration-200 ${
                item.isEmergency ? 'ring-4 ring-destructive shadow-xl' : ''
              }`}
              onClick={() => toast.info(`Открываю раздел: ${item.label}`)}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`${item.isEmergency ? 'animate-pulse' : ''}`}>
                  <Icon
                    name={item.icon as any}
                    size={64}
                    className={item.isEmergency ? 'text-white' : 'text-foreground'}
                  />
                </div>
                <div>
                  <h3 className={`text-3xl font-bold mb-2 ${item.isEmergency ? 'text-white' : ''}`}>
                    {item.label}
                  </h3>
                  <p className={`text-lg ${item.isEmergency ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-blue-50">
          <div className="flex items-start gap-4">
            <Icon name="Info" size={32} className="text-primary flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Подсказка</h3>
              <p className="text-lg text-muted-foreground">
                Нажмите на любую карточку, чтобы открыть нужный раздел. 
                Для срочной помощи используйте красную кнопку SOS.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;
