import Image from 'next/image';
import Link from 'next/link';

interface ModCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ModCard({ id, title, description, price, imageUrl, category }: ModCardProps) {
  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.01]">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-green-600 text-white text-sm px-2 py-1 rounded">
          {category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-300 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-white font-bold text-lg">${price.toFixed(2)}</span>
          <Link
            href={`/mods/${id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
} 