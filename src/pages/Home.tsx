import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_AUTH_URL = 'https://functions.poehali.dev/a1c319aa-17e9-4504-9466-3f6378fd7d97';
const API_PROFILE_URL = 'https://functions.poehali.dev/2b201be8-56ef-458c-a8a7-78010645c321';

interface User {
  id: number;
  phone: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  birthDate: string;
  medicalCardNumber?: string;
}

interface HomeProps {
  user: User;
  onLogout: () => void;
}

const Home = ({ user, onLogout }: HomeProps) => {
  const [weather, setWeather] = useState({ temp: 18, condition: 'Облачно' });
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [medicalCard, setMedicalCard] = useState(user.medicalCardNumber || '');
  const [showMedicalDialog, setShowMedicalDialog] = useState(false);
  const [showBirthdayGreeting, setShowBirthdayGreeting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const birthDate = new Date(user.birthDate);
    
    if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
      setShowBirthdayGreeting(true);
      toast.success(`🎉 С Днём Рождения, ${user.firstName}!`, {
        duration: 10000,
      });
    }
  }, [user]);

  const moods = [
    { emoji: '😊', label: 'Отлично', value: 'happy' },
    { emoji: '😌', label: 'Хорошо', value: 'good' },
    { emoji: '😐', label: 'Нормально', value: 'neutral' },
    { emoji: '😔', label: 'Грустно', value: 'sad' },
    { emoji: '😣', label: 'Плохо', value: 'bad' }
  ];

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    
    try {
      const response = await fetch(API_PROFILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveMood',
          userId: user.id,
          mood
        })
      });
      
      if (response.ok) {
        toast.success('Настроение сохранено');
      }
    } catch (error) {
      toast.error('Не удалось сохранить настроение');
    }
  };

  const handleSaveMedicalCard = async () => {
    try {
      const response = await fetch(API_PROFILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMedicalCard',
          userId: user.id,
          medicalCardNumber: medicalCard
        })
      });
      
      if (response.ok) {
        toast.success('Медицинская карта сохранена');
        setShowMedicalDialog(false);
        
        const updatedUser = { ...user, medicalCardNumber: medicalCard };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error('Не удалось сохранить медкарту');
    }
  };

  const handleSOS = () => {
    toast.error('🚨 СИГНАЛ SOS ОТПРАВЛЕН! Помощь уже в пути!', {
      duration: 5000,
    });
  };

  return (
    <div className="pb-24">
      {showBirthdayGreeting && (
        <Card className="mb-6 p-6 bg-gradient-to-r from-pink-100 to-purple-100 border-4 border-primary">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">🎂 С Днём Рождения!</h2>
            <p className="text-xl">Желаем крепкого здоровья и счастья!</p>
          </div>
        </Card>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Здравствуйте, {user.firstName}!</h1>
        <p className="text-xl text-muted-foreground">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <Card className="mb-6 p-6 bg-accent">
        <div className="flex items-center gap-4">
          <Icon name="CloudSun" size={48} className="text-primary" />
          <div>
            <h3 className="text-2xl font-bold">{weather.temp}°C</h3>
            <p className="text-xl text-muted-foreground">{weather.condition}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h3 className="text-2xl font-bold mb-4">Как ваше настроение?</h3>
        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                selectedMood === mood.value
                  ? 'bg-primary text-white scale-110'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-6 p-6 bg-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Icon name="FileText" size={40} className="text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Медицинская карта</h3>
              {user.medicalCardNumber ? (
                <p className="text-xl">Номер: {user.medicalCardNumber}</p>
              ) : (
                <p className="text-lg text-muted-foreground">Не добавлена</p>
              )}
            </div>
          </div>
          <Dialog open={showMedicalDialog} onOpenChange={setShowMedicalDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14">
                <Icon name="Plus" size={24} className="mr-2" />
                {user.medicalCardNumber ? 'Изменить' : 'Добавить'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Медицинская карта</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xl font-medium mb-3 block">Номер медицинской карты</label>
                  <Input
                    value={medicalCard}
                    onChange={(e) => setMedicalCard(e.target.value)}
                    placeholder="Например: МК-123456"
                    className="h-14 text-xl px-6"
                  />
                </div>
                <Button onClick={handleSaveMedicalCard} size="lg" className="w-full h-16 text-xl">
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Button
        onClick={handleSOS}
        size="lg"
        className="w-full h-24 text-3xl font-bold bg-destructive hover:bg-destructive/90 animate-pulse"
      >
        <Icon name="AlertCircle" size={48} className="mr-4" />
        🚨 SOS - ПОМОЩЬ
      </Button>
    </div>
  );
};

export default Home;
