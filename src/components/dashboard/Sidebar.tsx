import React from 'react';
import { LogOut } from 'lucide-react';

interface SidebarTab {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  tabs: SidebarTab[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, tabs }) => {
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col relative">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      <nav className="mt-6 flex-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t">
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
