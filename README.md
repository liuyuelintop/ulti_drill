# Ultimate Playbook (Tactical Animator) 🥏

A modern, web-based tactical animator for Ultimate Frisbee. Design complex offensive and defensive plays on your desktop, then take them to the field with the mobile tactical player.

## 🌟 Overview

Ultimate Playbook allows coaches and captains to visualize strategies using a frame-based animation system. Unlike static whiteboards, it interpolates movement between frames to show exactly *how* a play develops.

The application features a **Responsive Dual-Mode Design**:
*   **Desktop:** A full-featured **Tactical Editor** for creating, editing, and exporting plays.
*   **Mobile:** A streamlined **Tactical Player** optimized for handheld viewing and playback on the sideline.

## ✨ Key Features

### 🖥️ Desktop Editor (Creator Tool)
*   **Frame-based Animation:** Create keyframes; the app smooths the movement between them.
*   **Dynamic Team Configuration:** 
    *   Adjust Offense (1-7 players) and Defense (0-7 players) dynamically.
    *   **Smart Defense:** Adding defenders automatically positions them relative to offense players based on the formation (Vertical vs. Horizontal stack).
*   **Premium Canvas:** Realistic stadium field with endzones, brick marks, and distinct player/disc rendering.
*   **Play Management:**
    *   **Save/Load:** Export plays as `.json` files to share with teammates.
    *   **Presets:** Built-in standard formations (Vert Stack, Ho Stack) and example plays (Facial).
    *   **Video Export:** Record your play and download it as an `.mp4` video.
*   **Timeline Control:** Drag-and-drop editing, frame duplication, and precise timeline navigation.

### 📱 Mobile Tactical Player (Viewer)
*   **Playback-First Experience:** Friction-free interface designed for quick access on the field.
*   **Read-Only Mode:** Prevents accidental edits while scrolling or viewing.
*   **Portable Library:** Load built-in presets or import `.json` plays directly from your phone.
*   **Adaptive Layout:** Works seamlessly in both Portrait and Landscape orientations.

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (custom Design Tokens)
*   **Graphics:** Konva (via `react-konva`) for high-performance canvas rendering.
*   **State Management:** Custom hooks (`usePlaybookState`) with immutable state patterns.

## 🚀 Getting Started

### Prerequisites
*   Node.js (Latest LTS recommended)
*   pnpm (Preferred package manager)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/ultimate-playbook.git
    cd ultimate-playbook
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Start the development server:
    ```bash
    pnpm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 📖 Usage Guide

### Creating a Play (Desktop)
1.  **Setup:** Use the **Team Config** in the header to set the number of players.
2.  **Positioning:** Drag players (Red = Offense, Blue = Defense) and the Disc to their starting positions.
3.  **Next Frame:** Click `+ Add` in the timeline to create the next step. Move players to where they run *to*.
4.  **Animation:** Press **Play** (Spacebar) to see them move.
5.  **Save:** Click **Download Play** to save the `.json` file.

### Viewing a Play (Mobile)
1.  Open the app on your phone.
2.  Tap the **Menu** button (top left) or **Load Tactics**.
3.  Select a **Preset** (e.g., Vertical Stack) or **Import** a file you received.
4.  Use the timeline slider or Play button to watch the action.

## 📂 Project Structure

```text
src/
├── app/
│   ├── App.tsx                 # Main entry & Logic/Layout splitter
│   └── layouts/                # DesktopLayout vs MobileLayout
├── features/
│   └── playbook/
│       ├── components/         # UI & Canvas components (Field, Players)
│       ├── hooks/              # Core logic (Animation, File Handling, State)
│       └── utils/              # Math helpers (Viewport, Formation logic)
├── presets/
│   ├── formations/             # Static setups (Vert/Ho Stack)
│   └── plays/                  # Full animated scenarios
└── shared/
    ├── design/                 # Design tokens (Colors, Typography)
    └── hooks/                  # Utility hooks (useIsMobile, useOrientation)
```

## 🔧 Advanced: JSON Data & Coordinate System

Advanced users can create plays programmatically by generating JSON files. Here is the specification for the coordinate system and data structure.

### 1. The Field Grid (Projection Rule)
The application uses a pixel-based coordinate system mapped to standard Ultimate field dimensions.

*   **Scale Factor:** `8 pixels = 1 yard`
*   **Origin (0, 0):** Top-Left corner of the left endzone.
*   **Canvas Dimensions:** `880px` (Length) × `320px` (Width)

#### Key Reference Coordinates (X, Y)
| Landmark | X (px) | Y (px) | Notes |
| :--- | :--- | :--- | :--- |
| **Back Left Endzone** | `0` | `0 - 320` | Far left edge |
| **Left Goal Line** | `160` | `0 - 320` | Start of playing field (20 yards in) |
| **Brick Mark (Left)** | `304` | `160` | 18 yards from goal line, centered |
| **Midfield** | `440` | `160` | Dead center of the field |
| **Right Goal Line** | `720` | `0 - 320` | End of playing field |
| **Back Right Endzone** | `880` | `0 - 320` | Far right edge |

### 2. Data Structure (`PlaybookData`)

A valid play file must follow this JSON schema:

```json
{
  "version": "1.0",
  "name": "My Custom Play",
  "description": "Optional description...",
  "frames": [
    // Frame 1 (Start)
    [
      { "id": "disc", "type": "disc", "x": 304, "y": 160, "label": "" },
      { "id": "offense-1", "type": "offense", "x": 304, "y": 160, "label": "1" },
      { "id": "defense-1", "type": "defense", "x": 324, "y": 180, "label": "1" }
    ],
    // Frame 2 (Movement)
    [
      { "id": "disc", "type": "disc", "x": 440, "y": 50, "label": "" },
      ...
    ]
  ]
}
```

*   **`id`**: Unique identifier. Use `offense-N`, `defense-N`, or `disc`.
*   **`type`**: Must be `"offense"`, `"defense"`, or `"disc"`.
*   **`label`**: The text displayed on the player token (e.g., jersey number).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source.