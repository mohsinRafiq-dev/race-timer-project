# Race Timer - by upXXXXXXX

## Key Features
This application is a web-based race timing solution designed for Portsmouth Joggers' Club. It allows race organizers to time events, record finishers, and manage results both online and offline. The system consists of a client-side interface and a server-side database for result storage.

## Core Features

### Race Timing
- **How to use**: Click the "Start Race" button to begin timing. The timer will display elapsed time in HH:MM:SS format.
- **Design**: The timer uses JavaScript's Date object for precision and stores the start time in localStorage for persistence across page refreshes. The UI provides large, clear buttons for easy operation in outdoor conditions.

### Finisher Recording
- **How to use**: Enter a runner number and click "Record Finish" to log their time relative to race start.
- **Design**: Results are stored both locally (for offline use) and can be synced to the server when online. The input field has a large font size and clear labeling for visibility.

### Offline Capability
- **How to use**: The app automatically detects network status. Results recorded offline are queued for upload when connection is restored.
- **Design**: Uses localStorage for data persistence and the navigator.onLine API to detect connectivity changes. Pending uploads are managed with a queue system.

### Data Management
- **How to use**: "Upload Results" sends data to server, "Export Results" creates a CSV download, "Clear Race" resets all data.
- **Design**: The export function generates standards-compliant CSV. The clear function provides confirmation to prevent accidental data loss.

## Technical Implementation

### Server
- Built with Node.js and Express
- SQLite database for simple, file-based storage
- REST API endpoints for results management
- CORS headers configured for development

### Client
- Vanilla JavaScript with no frameworks
- Responsive design with large touch targets
- Accessible interface with ARIA labels
- Offline-first architecture

## AI Usage

### Development Process
I used AI tools primarily for troubleshooting and exploring alternative implementations. All core architecture decisions were made independently.

### Prompts for Database Setup
> "How to properly set up SQLite with Node.js for a simple race timing application?"
The response helped me understand connection handling but I modified the implementation to include proper error handling and path management.

### Prompts for Offline Functionality
> "Best practices for implementing offline-first web applications with localStorage"
The suggestions about queuing mechanisms inspired my pending uploads system, though I implemented a simpler version tailored to this specific use case.

### Prompts for UI Accessibility
> "How to make buttons more accessible for users with limited dexterity?"
The recommendations about size and spacing informed my CSS design, particularly the minimum touch target sizes.

## Improvements Since Prototype
- Added CSV export functionality
- Implemented proper error handling for database operations
- Improved offline sync reliability
- Enhanced UI with better contrast and larger touch targets
- Added connection status indicator

## Reflection
Developing this application reinforced the importance of simplicity in systems meant for real-world use. The constraints (no frameworks, offline operation) led to creative solutions that might not have emerged with more permissive requirements. My use of AI was most valuable for exploring alternative approaches rather than generating code directly.

The biggest challenge was implementing reliable offline-to-online synchronization while maintaining data integrity. This required careful management of local and remote states.

## Setup Instructions
1. Extract the zip file
2. Run `npm install`
3. Run `npm run setup` to initialize the database
4. Run `npm start` to launch the server
5. Access the application at http://localhost:8080