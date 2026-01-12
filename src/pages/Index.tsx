import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import Home from './Home';
import Grandchildren from './Grandchildren';
import Doctors from './Doctors';
import Gallery from './Gallery';
import Profile from './Profile';

const API_AUTH_URL = 'https://functions.poehali.dev/a1c319aa-17e9-4504-9466-3f6378fd7d97';

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

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    birthDate: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast.error('Введите номер телефона');
      return;
    }

    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          phone: formData.phone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        toast.success('Добро пожаловать!');
      } else {
        toast.error('Пользователь не найден');
      }
    } catch (error) {
      toast.error('Ошибка входа');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.firstName || !formData.lastName || !formData.birthDate) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        toast.success('Регистрация успешна!');
      }
    } catch (error) {
      toast.error('Ошибка регистрации');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setFormData({
      phone: '',
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      birthDate: ''
    });
    toast.success('Вы вышли из аккаунта');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Heart" size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Забота о здоровье</h1>
            <p className="text-xl text-muted-foreground">
              {authMode === 'login' ? 'Вход в систему' : 'Регистрация'}
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <Button
              variant={authMode === 'login' ? 'default' : 'outline'}
              size="lg"
              className="flex-1 h-16 text-xl"
              onClick={() => setAuthMode('login')}
            >
              Войти
            </Button>
            <Button
              variant={authMode === 'register' ? 'default' : 'outline'}
              size="lg"
              className="flex-1 h-16 text-xl"
              onClick={() => setAuthMode('register')}
            >
              Регистрация
            </Button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-6">
            <div>
              <label className="text-xl font-medium mb-3 block">Номер телефона *</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-16 text-2xl px-6"
              />
            </div>

            {authMode === 'register' && (
              <>
                <div>
                  <label className="text-xl font-medium mb-3 block">Имя *</label>
                  <Input
                    type="text"
                    placeholder="Введите ваше имя"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-16 text-2xl px-6"
                  />
                </div>

                <div>
                  <label className="text-xl font-medium mb-3 block">Фамилия *</label>
                  <Input
                    type="text"
                    placeholder="Введите вашу фамилию"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-16 text-2xl px-6"
                  />
                </div>

                <div>
                  <label className="text-xl font-medium mb-3 block">Отчество</label>
                  <Input
                    type="text"
                    placeholder="Введите отчество (необязательно)"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="h-16 text-2xl px-6"
                  />
                </div>

                <div>
                  <label className="text-xl font-medium mb-3 block">Email</label>
                  <Input
                    type="email"
                    placeholder="Почта (необязательно)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-16 text-2xl px-6"
                  />
                </div>

                <div>
                  <label className="text-xl font-medium mb-3 block">Дата рождения *</label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="h-16 text-2xl px-6"
                  />
                </div>
              </>
            )}

            <Button type="submit" size="lg" className="w-full h-20 text-2xl font-bold">
              {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'grandchildren', icon: 'Users', label: 'Внуки' },
    { id: 'gallery', icon: 'Image', label: 'Галерея' },
    { id: 'doctors', icon: 'Stethoscope', label: 'Врачи' },
    { id: 'profile', icon: 'User', label: 'Профиль' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={currentUser} onLogout={handleLogout} />;
      case 'grandchildren':
        return <Grandchildren user={currentUser} />;
      case 'doctors':
        return <Doctors user={currentUser} />;
      case 'gallery':
        return <Gallery user={currentUser} />;
      case 'profile':
        return <Profile user={currentUser} onLogout={handleLogout} />;
      default:
        return <Home user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto p-6">
        {renderPage()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around items-center h-20">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  currentPage === item.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon name={item.icon as any} size={28} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
