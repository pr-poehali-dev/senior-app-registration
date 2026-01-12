import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API_URL = 'https://functions.poehali.dev/72aa9561-f0df-4bf9-9d70-6906f648dca1';

interface User {
  id: number;
}

interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  timeSchedule?: string;
  notes?: string;
}

interface MedicationsProps {
  user: User;
}

const Medications = ({ user }: MedicationsProps) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timeSchedule: '',
    notes: ''
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const response = await fetch(`${API_URL}?action=medications&userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setMedications(data.medications);
      }
    } catch (error) {
      toast.error('Не удалось загрузить лекарства');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Укажите название лекарства');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addMedication',
          userId: user.id,
          ...formData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Лекарство добавлено');
        setShowDialog(false);
        setFormData({ name: '', dosage: '', frequency: '', timeSchedule: '', notes: '' });
        loadMedications();
      }
    } catch (error) {
      toast.error('Не удалось добавить');
    }
  };

  const handleTaken = async (medId: number) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logMedication',
          medicationId: medId,
          userId: user.id,
          skipped: false
        })
      });
      toast.success('Приём отмечен ✓');
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои лекарства</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-16">
              <Icon name="Plus" size={28} className="mr-2" />
              <span className="text-xl">Добавить</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Добавить лекарство</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xl mb-2">Название *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Аспирин"
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Дозировка</Label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="500 мг"
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Частота приёма</Label>
                <Input
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="2 раза в день"
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Время приёма</Label>
                <Input
                  value={formData.timeSchedule}
                  onChange={(e) => setFormData({ ...formData, timeSchedule: e.target.value })}
                  placeholder="09:00, 21:00"
                  className="h-14 text-xl"
                />
              </div>
              <div>
                <Label className="text-xl mb-2">Примечания</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="После еды, запить водой..."
                  className="text-xl"
                />
              </div>
              <Button onClick={handleSubmit} size="lg" className="w-full h-16 text-xl">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Pill" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Список пуст</h3>
          <p className="text-xl text-muted-foreground">
            Добавьте лекарства для контроля приёма
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {medications.map((med) => (
            <Card key={med.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{med.name}</h3>
                  {med.dosage && <p className="text-xl mb-1">Дозировка: {med.dosage}</p>}
                  {med.frequency && <p className="text-lg text-muted-foreground mb-1">{med.frequency}</p>}
                  {med.timeSchedule && (
                    <p className="text-lg text-primary font-medium">⏰ {med.timeSchedule}</p>
                  )}
                  {med.notes && <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>}
                </div>
                <Button
                  size="lg"
                  className="h-16 px-8"
                  onClick={() => handleTaken(med.id)}
                >
                  <Icon name="Check" size={24} className="mr-2" />
                  Принял
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
