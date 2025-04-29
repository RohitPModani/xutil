import { Link } from 'react-router-dom';

interface UtilityItem {
  name: string;
  path?: string;
}

interface UtilityCardProps {
  title: string;
  icon: string;
  items: (string | UtilityItem)[];
}

function UtilityCard({ title, icon, items }: UtilityCardProps) {
  return (
    <div className="card shadow-md rounded-lg p-4 sm:p-6 hover:shadow-lg transition">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
        <span className="mr-2">{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, index) =>
          typeof item === 'string' ? (
            <div
              key={index}
              className="hover-surface bg-gray-100 dark:bg-gray-700 sm:p-3 p-2 rounded cursor-pointer"
              onClick={() => alert(`Clicked: ${item}`)}
            >
              {item}
            </div>
          ) : (
            <Link
              key={index}
              to={item.path!}
              className="hover-surface bg-gray-100 dark:bg-gray-700 sm:p-3 p-2 rounded cursor-pointer block"
            >
              {item.name}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}

export default UtilityCard;