import { useState } from "react";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { ChatbotWidgetProps } from "./types";

function App() {
  const [widgetConfig, setWidgetConfig] = useState<ChatbotWidgetProps>({
    botName: "AI Assistant",
    theme: "light",
    position: "bottom-right",
    allowUpload: true,
  });

  const theme = widgetConfig.theme || "light";

  const themeClasses = {
    light: {
      page: "bg-gray-50 text-gray-900",
      header: "text-gray-900",
      subtext: "text-gray-600",
      card: "bg-white",
      cardText: "text-gray-900",
      cardSubtext: "text-gray-600",
      iconBg: {
        blue: "bg-blue-100",
        green: "bg-green-100",
        yellow: "bg-yellow-100",
        purple: "bg-purple-100",
        red: "bg-red-100",
        indigo: "bg-indigo-100",
      },
      panel: "bg-white",
      panelText: "text-gray-900",
      label: "text-gray-900",
      input: "bg-white border-gray-300 text-gray-900",
      instructions: "bg-blue-50",
      instructionsText: "text-gray-900",
    },
    dark: {
      page: "bg-gray-900 text-gray-100",
      header: "text-gray-100",
      subtext: "text-gray-400",
      card: "bg-gray-800",
      cardText: "text-gray-100",
      cardSubtext: "text-gray-400",
      iconBg: {
        blue: "bg-blue-900",
        green: "bg-green-900",
        yellow: "bg-yellow-900",
        purple: "bg-purple-900",
        red: "bg-red-900",
        indigo: "bg-indigo-900",
      },
      panel: "bg-gray-800",
      panelText: "text-gray-100",
      label: "text-gray-100",
      input: "bg-gray-700 border-gray-600 text-gray-100",
      instructions: "bg-blue-900",
      instructionsText: "text-gray-100",
    },
  } as const;

  const styles = themeClasses[theme];

  return (
    <div className={`min-h-screen ${styles.page}`}>
      {/* Demo Page Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-4 ${styles.header}`}>
              Chatbot Widget Demo
            </h1>
            <p className={`text-lg opacity-75 ${styles.subtext}`}>
              A fully functional React chatbot widget with file upload, feedback, and
              persistence.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.blue} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">💬</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                Real-time Chat
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Interactive chat interface with markdown support and smooth animations.
              </p>
            </div>

            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.green} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">📎</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                File Upload
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Upload PDF, DOCX, and TXT files by clicking the attachment icon.
              </p>
            </div>

            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.yellow} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">👍</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                Feedback System
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Rate messages and provide overall chat experience feedback.
              </p>
            </div>

            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.purple} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">💾</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                Persistent Storage
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Messages and feedback are saved locally and persist across sessions.
              </p>
            </div>

            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.red} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                Customizable
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Light/dark themes, positioning, and configurable bot name.
              </p>
            </div>

            <div className={`${styles.card} p-6 rounded-lg shadow-md`}>
              <div
                className={`w-12 h-12 ${styles.iconBg.indigo} rounded-lg flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${styles.cardText}`}>
                Smooth Animations
              </h3>
              <p className={`text-sm opacity-75 ${styles.cardSubtext}`}>
                Powered by Framer Motion for delightful user interactions.
              </p>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className={`${styles.panel} p-6 rounded-lg shadow-md mb-12`}>
            <h2 className={`text-xl font-semibold mb-6 ${styles.panelText}`}>
              Widget Configuration
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="bot-name"
                  className={`block text-sm font-medium mb-2 ${styles.label}`}
                >
                  Bot Name
                </label>
                <input
                  id="bot-name"
                  type="text"
                  value={widgetConfig.botName}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      botName: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${styles.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label
                  htmlFor="theme"
                  className={`block text-sm font-medium mb-2 ${styles.label}`}
                >
                  Theme
                </label>
                <select
                  id="theme"
                  value={widgetConfig.theme}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      theme: e.target.value as "light" | "dark",
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${styles.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="position"
                  className={`block text-sm font-medium mb-2 ${styles.label}`}
                >
                  Position
                </label>
                <select
                  id="position"
                  value={widgetConfig.position}
                  onChange={(e) =>
                    setWidgetConfig((prev) => ({
                      ...prev,
                      position: e.target.value as "bottom-right" | "bottom-left",
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${styles.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  <span className={`text-sm font-medium ${styles.label}`}>
                    Allow File Upload
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={`${styles.instructions} p-6 rounded-lg`}>
            <h2 className={`text-xl font-semibold mb-4 ${styles.instructionsText}`}>
              How to Use
            </h2>
            <div className={`space-y-3 text-sm ${styles.instructionsText}`}>
              <p>• Click the chat bubble in the bottom-right corner to open the chat</p>
              <p>• Type messages and press Enter to send (Shift+Enter for new line)</p>
              <p>• Upload files by clicking the attachment icon</p>
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
