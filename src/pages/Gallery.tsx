import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id: number;
}

interface GalleryProps {
  user: User;
}

const Gallery = ({ user }: GalleryProps) => {
  const [photos] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500', description: 'Семейное фото' },
    { id: 2, url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=500', description: 'Отдых на природе' },
    { id: 3, url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=500', description: 'Праздник' }
  ]);

  const handleAddPhoto = () => {
    toast.info('Функция загрузки фото будет доступна скоро');
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Галерея</h1>
        <Button size="lg" className="h-16" onClick={handleAddPhoto}>
          <Icon name="Plus" size={28} className="mr-2" />
          <span className="text-xl">Добавить фото</span>
        </Button>
      </div>

      <p className="text-xl text-muted-foreground mb-6">
        Фото и видео от ваших близких
      </p>

      {photos.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Image" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Галерея пуста</h3>
          <p className="text-xl text-muted-foreground mb-6">
            Здесь будут отображаться фото от близких
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <img
                src={photo.url}
                alt={photo.description}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <p className="text-xl font-medium">{photo.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
