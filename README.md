# Chatbot Widget

A fully functional React chatbot widget with modern UI/UX features including file upload, feedback system, and persistent storage.

## 🚀 Features

- **Interactive Chat Interface**: Real-time streaming chat with markdown support
- **Document Q&A**: Upload PDF files and ask questions about their content
- **File Upload**: Support for PDF, DOCX, and TXT files (up to 3 files, 10MB each)
- **Feedback System**: Upvote/downvote per message + overall chat rating
- **Persistent Storage**: Messages and feedback saved to localStorage
- **API Health Monitoring**: Automatic health checks with retry logic
- **Customizable**: Light/dark themes, positioning, bot name configuration
- **Smooth Animations**: Powered by Framer Motion
- **Error Handling**: Graceful error boundaries and user-friendly error messages
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

3. Create a `.env` file in the root directory:

```bash
VITE_API_BASE_URL=your-api-base-url
VITE_API_KEY=your-api-key
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
VITE_API_BASE_URL=http://your-api-server.com  # Your backend API URL
VITE_API_KEY=your-api-key                      # Optional: API key for authentication
```

### Backend API Requirements

The widget expects the following API endpoints:

**Chat Endpoints:**
- `POST /api/v1/chat` - Send a chat message and receive response
- `POST /api/v1/chat/stream` - Streaming chat responses (SSE)

**Document Endpoints:**
- `POST /api/v1/documents/upload` - Upload PDF file
- `POST /api/v1/documents/qa` - Ask questions about uploaded documents (supports streaming)

**Health Check:**
- `GET /api/v1/health` - API health status

See [src/services/](src/services/) for detailed API interface definitions.

## 🔧 Widget Configuration

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
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── FeedbackButtons.tsx     # Message rating buttons
│   ├── FeedbackModal.tsx       # Chat feedback form
│   ├── FileUpload.tsx          # File upload component
│   ├── MessageInput.tsx        # Message input with form
│   ├── MessageItem.tsx         # Individual message display
│   └── MessageWithFeedback.tsx # Memoized message wrapper
├── store/
│   ├── slices/
│   │   ├── feedbackSlice.ts   # Feedback state management
│   │   ├── messageSlice.ts    # Message state management
│   │   ├── uiSlice.ts         # UI state management
│   │   └── uploadSlice.ts     # File upload state management
│   └── useChatStore.ts        # Main Zustand store
├── services/
│   ├── api/
│   │   └── client.ts          # API client and error handling
│   ├── chatService.ts         # Chat API integration
│   ├── documentService.ts     # Document Q&A and upload
│   └── healthService.ts       # API health checks
├── hooks/
│   └── useAPIHealth.ts        # API health monitoring hook
├── constants/
│   └── index.ts               # Application constants
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # Demo application
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## 🎨 Customization

### Configuration Constants

Application constants are centralized in [src/constants/index.ts](src/constants/index.ts):

- **FILE_UPLOAD**: File upload limits and allowed types
- **HEALTH_CHECK**: API health check intervals and retry delays
- **STREAMING**: Streaming simulation delays and chunk sizes
- **CHAT**: Chat configuration (e.g., max conversation history)
- **UI**: UI-related constants (e.g., textarea height, file name width)

### Themes

The widget supports light and dark themes. You can customize the colors by modifying the theme classes in each component.

### Styling

All components use TailwindCSS classes and can be easily customized by modifying the className props.

### Animations

Animations are handled by Framer Motion. You can customize animations by modifying the motion props in each component.

## 📱 Features in Detail

### Chat Interface

- **Streaming Responses**: Real-time streaming of AI responses using Server-Sent Events (SSE)
- **Markdown Support**: Bot messages support markdown formatting
- **Conversation History**: Last 10 messages sent as context to the API
- **Auto-scroll**: Automatically scrolls to the latest message
- **Loading States**: Visual indicators for message processing

### Document Q&A

- Upload PDF files and ask questions about their content
- Streaming responses for document-based queries
- File upload status indicators (uploading, success, error)
- Support for multiple file uploads (max 3 files)

### File Upload

- **Supported Formats**: PDF, DOCX, and TXT files
- **Limits**: Maximum 3 files, 10MB each
- **Validation**: Client-side validation for file type and size
- **Error Handling**: Clear error messages for upload failures
- **Visual Feedback**: Upload progress and status indicators

### Feedback System

- **Message Rating**: Thumbs up/down for individual bot messages
- **Overall Rating**: 5-star rating system when closing the chat
- **Comments**: Optional text feedback field
- **Persistence**: All feedback saved to localStorage

### API Health Monitoring

- **Automatic Checks**: Health check every 30 seconds while chat is open
- **Retry Logic**: Faster retry (5 seconds) on health check failure
- **Status Indicator**: Visual health status in chat header
- **Error Recovery**: Graceful handling of API unavailability

### Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in message input
- `Esc`: Close feedback modal

## 🔄 State Management

The widget uses Zustand with a modular slice pattern for state management:

### Store Slices

1. **Message Slice** ([messageSlice.ts](src/store/slices/messageSlice.ts))
   - Add, update, and clear messages
   - Handle streaming and loading states
   - Message history management

2. **Feedback Slice** ([feedbackSlice.ts](src/store/slices/feedbackSlice.ts))
   - Per-message feedback (upvote/downvote)
   - Overall chat feedback with ratings and comments
   - Feedback persistence

3. **UI Slice** ([uiSlice.ts](src/store/slices/uiSlice.ts))
   - Chat open/closed state
   - Minimized state
   - API health status monitoring
   - Last health check timestamp

4. **Upload Slice** ([uploadSlice.ts](src/store/slices/uploadSlice.ts))
   - File upload state management
   - Uploaded files tracking
   - Clear uploaded files

### Persistence

- Uses Zustand persist middleware
- Stores messages, feedback, and chat feedback in localStorage
- Custom merge logic for state hydration
- Version management for migrations

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
