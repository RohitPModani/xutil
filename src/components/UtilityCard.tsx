import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleImplementedClick = (path: string, toolName: string) => {
    sessionStorage.setItem('lastClickedTool', toolName);
    navigate(path);
  };

  return (
    <div className="card shadow-md rounded-lg p-4 sm:p-6 hover:shadow-lg transition">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-zinc-800 dark:text-white">
        <span className="mr-2">{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, index) => {
          const toolName = typeof item === 'string' ? item : item.name;
          const path = typeof item === 'string' ? undefined : item.path;
          const elementId = toolName.replace(/\s+/g, '-').toLowerCase();

          if (!path) {
            return (
              <div
                key={index}
                id={elementId}
                className="bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 sm:p-3 p-2 rounded cursor-not-allowed select-none"
                title="Coming soon"
              >
                {toolName}
              </div>
            );
          }

          return (
            <div
              key={index}
              id={elementId}
              className="bg-zinc-100 dark:bg-zinc-600 border border-transparent hover:border-zinc-800 dark:hover:border-white transition-all duration-300 text-zinc-800 dark:text-white sm:p-3 p-2 rounded cursor-pointer transition"
              onClick={() => handleImplementedClick(path, toolName)}
            >
              {toolName}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UtilityCard;