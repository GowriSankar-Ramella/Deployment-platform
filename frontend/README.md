# Deployment Platform UI

A modern, beautiful React-based user interface for deploying GitHub repositories with real-time log streaming.

## Features

✨ **Modern Design**
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Clean, intuitive interface

🚀 **Real-time Deployment**
- Live log streaming via Socket.IO
- Deployment status indicators
- Preview URL generation
- Auto-scrolling logs

🎨 **Enhanced UX**
- GitHub URL validation
- Loading states and spinners
- Success/error status banners
- Empty states
- Monospace font for logs (Fira Code)

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time websocket communication
- **Axios** - HTTP requests
- **Lucide React** - Beautiful icons
- **CSS3** - Modern styling with animations

## Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- Your backend server running on:
  - API Server: `http://localhost:9000`
  - WebSocket Server: `http://localhost:9002`

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure Backend URLs (if different):**

If your backend is running on different ports, update the URLs in `DeploymentUI.jsx`:

```javascript
// Line 6 - WebSocket connection
const socket = io("http://localhost:9002");

// Line 39 - API endpoint
const { data } = await axios.post(`http://localhost:9000/project`, {
  gitURL: repoURL,
  slug: projectId,
});
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3000` and open automatically in your browser.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
deployment-ui/
├── index.html              # HTML entry point
├── main.jsx                # React app entry point
├── App.jsx                 # Main App component
├── App.css                 # App styles
├── index.css               # Global styles
├── DeploymentUI.jsx        # Main deployment interface component
├── DeploymentUI.css        # Deployment UI styles
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Usage

1. **Enter GitHub URL:**
   - Paste your GitHub repository URL (e.g., `https://github.com/username/repository`)
   - The input validates the URL format automatically

2. **Deploy:**
   - Click the "Deploy Now" button
   - Watch real-time logs as your project deploys
   - See deployment status (success/error)

3. **Preview:**
   - Once deployment completes, click the preview URL
   - Your deployed application opens in a new tab

## Backend API Requirements

Your backend should expose these endpoints:

### POST /project
```json
{
  "gitURL": "https://github.com/username/repo",
  "slug": "optional-project-slug"
}
```

**Response:**
```json
{
  "data": {
    "projectSlug": "generated-slug",
    "url": "https://your-preview-url.com"
  }
}
```

### WebSocket Events

**Subscribe to logs:**
```javascript
socket.emit("subscribe", `logs:${projectSlug}`);
```

**Receive logs:**
```javascript
socket.on("message", (message) => {
  // message format: { "log": "Log message text" }
});
```

## Customization

### Change Colors

Edit the gradient in `DeploymentUI.css`:

```css
/* Background gradient */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header gradient */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change Log Colors

Edit the log text color in `DeploymentUI.css`:

```css
.logs-content {
  color: #10b981; /* Green by default */
}
```

### Adjust Layout

- **Maximum card width:** Change `max-width` in `.deployment-card`
- **Log height:** Modify `height` in `.logs-container`
- **Spacing:** Adjust padding and margin values

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### WebSocket Connection Issues

If logs aren't appearing, check:
1. Backend WebSocket server is running on port 9002
2. CORS is configured correctly on backend
3. Browser console for connection errors

### API Errors

If deployment fails:
1. Verify backend API is running on port 9000
2. Check network tab for API response
3. Ensure GitHub URL is valid and accessible

### Styling Issues

If styles don't load:
1. Clear browser cache
2. Check that all CSS files are imported
3. Verify Google Fonts are loading

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ using React and Vite
