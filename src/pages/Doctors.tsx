import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/de0d5e49-e4be-472f-ab36-f8000eb27b8e';

interface User {
  id: number;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  specialty: string;
  phone?: string;
}

interface DoctorsProps {
  user: User;
}

const Doctors = ({ user }: DoctorsProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    specialty: '',
    phone: ''
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      toast.error('Не удалось загрузить список');
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.specialty) {
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
        toast.success('Врач добавлен');
        setShowDialog(false);
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          specialty: '',
          phone: ''
        });
        loadDoctors();
      }
    } catch (error) {
      toast.error('Не удалось добавить');
    }
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои врачи</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-16">
              <Icon name="Plus" size={28} className="mr-2" />
              <span className="text-xl">Добавить</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Добавить врача</DialogTitle>
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
                <Label className="text-xl mb-2">Специальность *</Label>
                <Input
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Например: Терапевт"
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Телефон</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (___) ___-__-__"
                  className="h-14 text-xl"
                />
              </div>
              <Button onClick={handleSubmit} size="lg" className="w-full h-16 text-xl">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {doctors.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Stethoscope" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Список пуст</h3>
          <p className="text-xl text-muted-foreground mb-6">
            Добавьте врачей, которые вас обслуживают
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="UserRound" size={32} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {doctor.lastName} {doctor.firstName} {doctor.middleName}
                  </h3>
                  <p className="text-xl text-primary mb-2">{doctor.specialty}</p>
                  {doctor.phone && (
                    <a
                      href={`tel:${doctor.phone}`}
                      className="flex items-center gap-2 text-lg text-muted-foreground hover:text-primary"
                    >
                      <Icon name="Phone" size={20} />
                      {doctor.phone}
                    </a>
                  )}
                </div>
                <Button size="lg" variant="outline" className="h-14">
                  <Icon name="Phone" size={24} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
