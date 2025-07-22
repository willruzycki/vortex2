import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChannelNavigation({ tabs, activeTab, onTabChange }) {
  const scrollRef = useRef(null);

  const scrollToActiveTab = () => {
    const activeTabElement = scrollRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  useEffect(() => {
    scrollToActiveTab();
  }, [activeTab]);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="px-4 md:px-8">
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-2 font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation - Scrollable */}
          <div className="flex md:hidden w-full overflow-x-auto scrollbar-hide" ref={scrollRef}>
            <div className="flex space-x-6 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`py-4 px-3 font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}