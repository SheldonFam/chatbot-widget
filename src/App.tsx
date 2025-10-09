import React, { useState } from "react";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { ChatbotWidgetProps } from "./types";

function App() {
  const [widgetConfig, setWidgetConfig] = useState<ChatbotWidgetProps>({
    botName: "AI Assistant",
    theme: "light",
    position: "bottom-right",
    allowUpload: true,
  });

  const themeClasses = {
    light: "bg-gray-50 text-gray-900",
    dark: "bg-gray-900 text-gray-100",
  };

  return (
    <div className={`min-h-screen ${themeClasses[widgetConfig.theme]}`}>
      {/* Demo Page Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Chatbot Widget Demo</h1>
            <p className="text-lg opacity-75">
              A fully functional React chatbot widget with file upload,
              feedback, and persistence.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
              <p className="text-sm opacity-75">
                Interactive chat interface with markdown support and smooth
                animations.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📎</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">File Upload</h3>
              <p className="text-sm opacity-75">
                Upload PDF, DOCX, and TXT files with drag-and-drop support.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Feedback System</h3>
              <p className="text-sm opacity-75">
                Rate messages and provide overall chat experience feedback.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Persistent Storage</h3>
              <p className="text-sm opacity-75">
                Messages and feedback are saved locally and persist across
                sessions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customizable</h3>
              <p className="text-sm opacity-75">
                Light/dark themes, positioning, and configurable bot name.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smooth Animations</h3>
              <p className="text-sm opacity-75">
                Powered by Framer Motion for delightful user interactions.
              </p>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-12">
            <h2 className="text-xl font-semibold mb-6">Widget Configuration</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={widgetConfig.botName}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      botName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={widgetConfig.theme}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      theme: e.target.value as "light" | "dark",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Position
                </label>
                <select
                  value={widgetConfig.position}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      position: e.target.value as
                        | "bottom-right"
                        | "bottom-left",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={widgetConfig.allowUpload}
                    onChange={(e) =>
                      setWidgetConfig((prev) => ({
                        ...prev,
                        allowUpload: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Allow File Upload</span>
                </label>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <div className="space-y-3 text-sm">
              <p>
                • Click the chat bubble in the bottom-right corner to open the
                chat
              </p>
              <p>
                • Type messages and press Enter to send (Shift+Enter for new
                line)
              </p>
              <p>
                • Upload files by clicking the attachment icon or dragging files
              </p>
              <p>• Rate bot responses with thumbs up/down buttons</p>
              <p>• Close the chat to see the feedback modal</p>
              <p>• All data is automatically saved to localStorage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget {...widgetConfig} />
    </div>
  );
}

export default App;
