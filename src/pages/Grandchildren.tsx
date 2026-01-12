import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/a395a6a4-78e1-4fc0-b51f-8099a0a6a83d';

interface User {
  id: number;
}

interface Grandchild {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  gender: 'male' | 'female';
  info?: string;
}

interface GrandchildrenProps {
  user: User;
}

const Grandchildren = ({ user }: GrandchildrenProps) => {
  const [grandchildren, setGrandchildren] = useState<Grandchild[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    gender: 'male',
    info: ''
  });

  useEffect(() => {
    loadGrandchildren();
  }, []);

  const loadGrandchildren = async () => {
    try {
      const response = await fetch(`${API_URL}?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setGrandchildren(data.grandchildren);
      }
    } catch (error) {
      toast.error('Не удалось загрузить список');
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Внук/внучка добавлены');
        setShowDialog(false);
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          birthDate: '',
          gender: 'male',
          info: ''
        });
        loadGrandchildren();
      }
    } catch (error) {
      toast.error('Не удалось добавить');
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои внуки</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-16">
              <Icon name="Plus" size={28} className="mr-2" />
              <span className="text-xl">Добавить</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Добавить внука/внучку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xl mb-2">Имя *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Фамилия *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Отчество</Label>
                <Input
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Дата рождения *</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Пол *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="h-14 text-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male" className="text-xl">Мальчик</SelectItem>
                    <SelectItem value="female" className="text-xl">Девочка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xl mb-2">Информация о ребёнке</Label>
                <Textarea
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  placeholder="Увлечения, особенности..."
                  className="text-xl min-h-24"
                />
              </div>
              <Button onClick={handleSubmit} size="lg" className="w-full h-16 text-xl">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {grandchildren.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Users" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Список пуст</h3>
          <p className="text-xl text-muted-foreground mb-6">
            Добавьте информацию о ваших внуках
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {grandchildren.map((child) => (
            <Card key={child.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  child.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
                }`}>
                  {child.gender === 'male' ? '👦' : '👧'}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {child.lastName} {child.firstName} {child.middleName}
                  </h3>
                  <p className="text-xl text-muted-foreground mb-2">
                    {calculateAge(child.birthDate)} {calculateAge(child.birthDate) === 1 ? 'год' : 'года'}
                  </p>
                  <p className="text-lg text-muted-foreground">
                    Дата рождения: {new Date(child.birthDate).toLocaleDateString('ru-RU')}
                  </p>
                  {child.info && (
                    <p className="text-lg mt-2">{child.info}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Grandchildren;
