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

  const handleUnimplementedClick = (toolName: string) => {
    sessionStorage.setItem('lastClickedTool', toolName); // ✅ Save tool
    navigate(`/coming-soon?tool=${encodeURIComponent(toolName)}`);
  };

  const handleImplementedClick = (path: string, toolName: string) => {
    sessionStorage.setItem('lastClickedTool', toolName); // ✅ Save tool
    navigate(path);
  };

  return (
    <div className="card shadow-md rounded-lg p-4 sm:p-6 hover:shadow-lg transition">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
        <span className="mr-2">{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, index) => {
          const toolName = typeof item === 'string' ? item : item.name;
          const path = typeof item === 'string' ? undefined : item.path;

          if (!path) {
            return (
              <div
                key={index}
                id={toolName.replace(/\s+/g, '-').toLowerCase()} // id for scroll later
                className="hover-surface bg-gray-100 dark:bg-gray-700 sm:p-3 p-2 rounded cursor-pointer"
                onClick={() => handleUnimplementedClick(toolName)}
              >
                {toolName}
              </div>
            );
          } else {
            return (
              <div
                key={index}
                id={toolName.replace(/\s+/g, '-').toLowerCase()} // id for scroll later
                className="hover-surface bg-gray-100 dark:bg-gray-700 sm:p-3 p-2 rounded cursor-pointer"
                onClick={() => handleImplementedClick(path, toolName)}
              >
                {toolName}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default UtilityCard;
