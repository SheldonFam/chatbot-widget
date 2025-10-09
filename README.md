# Chatbot Widget

A fully functional React chatbot widget with modern UI/UX features including file upload, feedback system, and persistent storage.

## 🚀 Features

- **Interactive Chat Interface**: Real-time messaging with markdown support
- **File Upload**: Support for PDF, DOCX, and TXT files with drag-and-drop
- **Feedback System**: Upvote/downvote per message + overall chat rating
- **Persistent Storage**: Messages and feedback saved to localStorage
- **Customizable**: Light/dark themes, positioning, bot name configuration
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Hook Form** for form management
- **Zustand** for state management
- **Framer Motion** for animations
- **React Markdown** for message rendering
- **Lucide React** for icons

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chatbot-widget
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Usage

```tsx
import { ChatbotWidget } from "./components/ChatbotWidget";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatbotWidget />
    </div>
  );
}
```

### Advanced Configuration

```tsx
import { ChatbotWidget } from "./components/ChatbotWidget";

function App() {
  return (
    <div>
      <ChatbotWidget
        botName="My AI Assistant"
        theme="dark"
        position="bottom-left"
        allowUpload={true}
      />
    </div>
  );
}
```

## 🔧 Props

| Prop          | Type                              | Default          | Description                              |
| ------------- | --------------------------------- | ---------------- | ---------------------------------------- |
| `botName`     | `string`                          | `'AI Assistant'` | Name displayed in the chat header        |
| `theme`       | `'light' \| 'dark'`               | `'light'`        | Color theme for the widget               |
| `position`    | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Position of the chat bubble              |
| `allowUpload` | `boolean`                         | `true`           | Enable/disable file upload functionality |

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatBubble.tsx          # Floating chat button
│   ├── ChatWindow.tsx          # Main chat interface
│   ├── ChatbotWidget.tsx       # Main widget component
│   ├── FeedbackButtons.tsx     # Message rating buttons
│   ├── FeedbackModal.tsx       # Chat feedback form
│   ├── FileUpload.tsx          # File upload component
│   ├── MessageInput.tsx        # Message input with form
│   └── MessageItem.tsx         # Individual message display
├── store/
│   └── useChatStore.ts         # Zustand store for state management
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx                     # Demo application
├── main.tsx                    # Application entry point
└── index.css                   # Global styles
```

## 🎨 Customization

### Themes

The widget supports light and dark themes. You can customize the colors by modifying the theme classes in each component.

### Styling

All components use TailwindCSS classes and can be easily customized by modifying the className props.

### Animations

Animations are handled by Framer Motion. You can customize animations by modifying the motion props in each component.

## 📱 Features in Detail

### File Upload

- Supports PDF, DOCX, and TXT files
- Maximum 3 files, 10MB each
- Drag-and-drop support
- File preview with size display
- Validation and error handling

### Feedback System

- Thumbs up/down for individual messages
- 5-star rating system for overall chat experience
- Optional comment field
- All feedback persisted to localStorage

### Message Features

- Markdown rendering for bot messages
- Timestamp display
- File attachment indicators
- Smooth animations for new messages
- Auto-scroll to latest message

### Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in message input

## 🔄 State Management

The widget uses Zustand for state management with the following features:

- **Messages**: Array of chat messages with metadata
- **Feedback**: Message ratings and overall chat feedback
- **UI State**: Chat open/closed, minimized state
- **File Management**: Uploaded files and validation
- **Persistence**: Automatic localStorage sync

## 🚀 Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on the repository.
