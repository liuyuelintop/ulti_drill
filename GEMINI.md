# Ultimate Playbook (Tactical Animator)

## Project Overview
This project is a web-based **Tactical Animator** for Ultimate Frisbee, built with **React** and **Vite**. It allows users to design plays by defining player positions across multiple "frames" and animating the movement between them. The application features a **premium, light-mode UI** with a realistic stadium field, intuitive timeline controls, responsive canvas scaling, and robust state management.

## Tech Stack
*   **Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (configured with custom Design Tokens)
*   **Graphics/Canvas:** Konva (via `react-konva`)
*   **Linting:** ESLint

## Key Features

### Frame-based Animation
Users create a sequence of frames; the app interpolates player movement between them.

### Responsive Canvas
*   **Dynamic Scaling:** Canvas automatically scales to fit container width while maintaining aspect ratio
*   **ResizeObserver:** Real-time updates on window/container resize
*   **Resolution Independent:** Item positions stored in absolute coordinates (880×320px), visual scaling applied separately
*   **No Upscaling:** Capped at 100% scale to maintain visual quality

### Premium Canvas
*   **Realistic Field:** Alternating green grass strips, green gradient endzones (Home/Away), and cross-shaped brick marks
*   **Interactive Items:** Draggable players (Offense in Red, Defense in Blue) and Disc with gradient fills and drop shadows
*   **Visual Feedback:** Ghost positions for previous frames and distinct selection highlights
*   **Unobstructed View:** No overlays on field - all status indicators in header

### Light Mode UI
A fresh, high-energy "Day Mode" aesthetic using Sky Blue primary colors and Slate neutrals.

### Three-Row Header System
1.  **Row 1: Branding + Status**
    *   Logo, app title, and subtitle
    *   **Dynamic status badges** (context-aware display):
        *   **Frame counter** (current/total) - shown when not playing
        *   **Unsaved badge** (amber, pulsing dot) - shown when editing
        *   **Recording badge** (red, pulsing dot, "● Recording") - shown when recording
        *   **Live Preview badge** (emerald green, pulsing dot, "▶ Live Preview") - shown when playing
2.  **Row 2: File Operations (Always Visible)**
    *   Load Play, Save Play, Export Video buttons
    *   Ghost variant styling for subtle appearance
    *   Dimmed to 60% opacity when editing
    *   Smart guards: prompts to save if unsaved changes exist
3.  **Row 3: Edit Bar (Conditional)**
    *   Only appears when `isDirty === true`
    *   Amber warning background with icon
    *   "You have unsaved changes to Frame X" message
    *   SAVE CHANGES (emerald green) and DISCARD (gray) buttons

### Compact Timeline Editor
*   **Header:** "⏱️ Timeline Editor" with clock icon
*   **Frame Sequence:** Horizontal scrollable strip with compact frame buttons (100px × 64px)
    *   Active frame: Emerald border + ring glow effect
    *   Hover: Sky blue border + lift animation
    *   "+ Add" button at the end
*   **Three Control Groups:**
    1.  **Playback Controls:** Previous, Play/Pause (emerald green), Next, Speed selector (1.0x)
    2.  **Frame Actions:** 🔄 Reset (only when editing), 📋 Duplicate
    3.  **Danger Zone:** 🗑️ Delete, ⚠️ Clear All (red background warning)

### Frame Management
*   **Add Frame:** Creates new frame based on last frame
*   **Duplicate Frame:** Duplicates current frame (including unsaved changes) and inserts right after
*   **Delete Frame:** Removes current frame with confirmation
*   **Clear All:** Removes all frames with confirmation
*   **Reset Item:** Resets selected item to last **saved** position in current frame (not previous frame)

### Explicit Frame Editing
Changes are drafted in a temporary state and must be explicitly saved or discarded. Auto-enter edit mode on item drag.

### Playbook Management
Save/Load entire playbooks via JSON.

### Video Export
Record and export animations as `.mp4` video files (preferred). Gracefully falls back to `.webm` if the browser does not support MP4 export.

### Help System
Dedicated **HelpFooter** component with keyboard shortcuts and usage tips displayed at bottom of page.

## Architecture & Key Files

### Core Logic (Custom Hooks)
*   **`src/features/playbook/hooks/useTacticalState.ts`**: Manages core data (frames, editing state), item selection, and manipulation logic
    *   `updateEditingFrame`: Auto-enters edit mode on item drag
    *   `saveChanges`: Commits editing frame to frames array
    *   `discardChanges`: Reverts to saved state
    *   `addFrame`: Creates new frame from last frame
    *   `duplicateFrame`: Duplicates current frame (including edits) and inserts after
    *   `deleteFrame`: Removes current frame
    *   `clearAllFrames`: Resets to initial formation
    *   `resetToPrevious`: Resets selected item to **current frame's saved position** (fixed bug)
*   **`src/features/playbook/hooks/usePlaybackAndExport.ts`**: Handles animation loop (`requestAnimationFrame`), video recording, and export logic
*   **`src/features/playbook/hooks/usePlaybookIO.ts`**: Manages JSON file import/export operations

### Components
*   **`src/app/App.tsx`**: Main orchestration layer with full-screen flex layout
    *   Sticky header (HeaderControls)
    *   Flex-1 canvas area (centered)
    *   Timeline footer (TimelineControls)
    *   Help footer (HelpFooter)
    *   Global keyboard shortcuts (Esc to deselect)
*   **`src/features/playbook/components/HeaderControls.tsx`**: Unified three-row header component
    *   Manages all header functionality (branding, status, file ops, edit bar)
    *   Replaced old EditModeControls (merged into Row 3)
    *   Contextual status badges (frame counter, unsaved, recording/preview)
*   **`src/features/playbook/components/TimelineControls.tsx`**: Compact timeline editor orchestrating four subsections
    *   Header with title
    *   Frame sequence strip (`timeline/FrameStrip`)
    *   Playback controls (`timeline/PlaybackControls`)
    *   Frame actions (`timeline/FrameActions`)
    *   Danger zone (`timeline/DangerZone`)
    *   Decoupled from help text (moved to HelpFooter)
*   **`src/features/playbook/components/HelpFooter.tsx`**: Standalone tips component
    *   Keyboard shortcuts and usage instructions
    *   Fully reusable and self-contained
*   **`src/features/playbook/components/PlaybookCanvas.tsx`**: Responsive Konva canvas composed of layers
    *   `canvas/FieldLayer` renders stadium field with gradients/markings
    *   `canvas/GhostLayer` renders previous-frame ghosts (hidden while playing)
    *   `canvas/ItemsLayer` renders interactive draggable items with selection highlights
    *   Dynamic scaling with ResizeObserver
*   **`src/shared/ui/Button.tsx`**: Reusable button component with variants
    *   Primary, Secondary, Success, Danger, Ghost
    *   Styled for light theme with hover/active states

### Design & Configuration
*   **`src/shared/design/tokens.ts`**: Centralized design system definitions (Colors, Typography, Spacing, Shadows)
*   **`src/features/playbook/constants/canvas.ts`**: Application constants
    *   Field dimensions: FIELD_LENGTH (880px), FIELD_WIDTH (320px)
    *   Player/disc sizes, colors from design tokens
*   **`src/index.css`**: Global styles, Tailwind imports, and custom CSS variables
*   **`tailwind.config.js`**: Tailwind configuration extending theme with design tokens

## Usage

### Starting a New Play
1.  Click "⚠️ Clear All" to reset the canvas
2.  Confirm the action to initialize with default formation

### Editing Frames
1.  **Select an item:** Click on a player or disc (Sky Blue highlight appears)
2.  **Drag to new position:** Automatically enters edit mode, unsaved badge appears in header
3.  **Save or discard:**
    *   Click "✓ SAVE CHANGES" in the amber edit bar to commit
    *   Click "✕ DISCARD" to revert to saved state
4.  **Reset individual item:** Select item, click "🔄 Reset" to revert to saved position

### Timeline Navigation
*   **Frame Thumbnails:** Click any frame button to switch frames
*   **Playback Controls:** Use Previous (◀◀) and Next (▶▶) buttons
*   **Keyboard Shortcuts:** Arrow keys (← →) to navigate frames

### Playback & Animation
1.  Click the large **Play** button (▶️) to start animation
2.  Click **Pause** to stop playback
3.  Speed selector shows current playback speed (1.0x)

### Frame Management
*   **Add Frame:** Click "+ Add" button at end of timeline strip
*   **Duplicate Frame:** Select frame, click "📋 Duplicate" to copy it
*   **Delete Frame:** Click "🗑️ Delete" with confirmation prompt
*   **Clear All:** Click "⚠️ Clear All" to reset everything (with confirmation)

### File Operations
*   **Save Play:** Click "💾 Save Play" to download JSON file
*   **Load Play:** Click "📁 Load Play" to import JSON file
*   **Export Video:** Click "🎥 Export Video" to record and download `.mp4` (or `.webm`) file
    *   Must save all changes before exporting
    *   File operations show smart guards if unsaved changes exist

### Keyboard Shortcuts
*   **Esc** - Unselect item or discard changes (with prompt)
*   **Ctrl+S** - Save current frame changes
*   **← →** - Navigate frames (when not editing)
*   **Space** - Play/pause animation (when not editing)

## Recent Improvements (Latest Session)

### Layout Reorganization
*   Refactored header into unified three-row component
*   Redesigned timeline with compact, organized layout
*   Separated help text into dedicated HelpFooter component
*   Full-screen flex layout with sticky header

### Bug Fixes
*   Fixed Reset Item to reset to current frame's saved position (was incorrectly resetting to previous frame)
*   Reset Item now only enabled when `isDirty === true`

### New Features
*   Duplicate Frame functionality
*   Responsive canvas with dynamic scaling
*   Pulsing unsaved changes badge
*   Smart file operation guards

### UI Polish
*   Emerald green for primary actions (play button, save, active frames)
*   Danger zone with red background for destructive actions
*   Visual button labels ("🗑️ Delete", "⚠️ Clear All")
*   Improved hover/active states throughout
*   Recording/Preview indicator moved to header (no canvas obstruction)
*   Contextual status badges with consistent styling

## Development

### Running the Dev Server
```bash
pnpm run dev
```

### Building for Production
```bash
pnpm run build
```

### Linting
```bash
pnpm run lint
```
