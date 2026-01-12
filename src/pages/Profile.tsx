import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile = ({ user, onLogout }: ProfileProps) => {
  return (
    <div className="pb-24">
      <h1 className="text-3xl font-bold mb-6">Профиль</h1>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <Icon name="User" size={48} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {user.lastName} {user.firstName} {user.middleName}
            </h2>
            <p className="text-xl text-muted-foreground">{user.phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
            <Icon name="Calendar" size={24} className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Дата рождения</p>
              <p className="text-xl font-medium">
                {new Date(user.birthDate).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {user.email && (
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
              <Icon name="Mail" size={24} className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-xl font-medium">{user.email}</p>
              </div>
            </div>
          )}

          {user.medicalCardNumber && (
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
              <Icon name="FileText" size={24} className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Медицинская карта</p>
                <p className="text-xl font-medium">{user.medicalCardNumber}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="text-2xl font-bold mb-4">Настройки</h3>
        <div className="space-y-3">
          <Button variant="outline" size="lg" className="w-full h-16 justify-start text-xl">
            <Icon name="Bell" size={24} className="mr-4" />
            Уведомления
          </Button>
          <Button variant="outline" size="lg" className="w-full h-16 justify-start text-xl">
            <Icon name="Lock" size={24} className="mr-4" />
            Безопасность
          </Button>
          <Button variant="outline" size="lg" className="w-full h-16 justify-start text-xl">
            <Icon name="Palette" size={24} className="mr-4" />
            Размер шрифта
          </Button>
          <Button variant="outline" size="lg" className="w-full h-16 justify-start text-xl">
            <Icon name="HelpCircle" size={24} className="mr-4" />
            Помощь
          </Button>
        </div>
      </Card>

      <Button
        onClick={onLogout}
        variant="destructive"
        size="lg"
        className="w-full h-16 text-xl"
      >
        <Icon name="LogOut" size={24} className="mr-4" />
        Выйти из аккаунта
      </Button>
    </div>
  );
};

export default Profile;
