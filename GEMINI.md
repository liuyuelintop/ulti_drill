# Ultimate Playbook (Tactical Animator)

## Project Overview

This project is a web-based **Tactical Animator** for Ultimate Frisbee, built with **React** and **Vite**. It allows users to design plays by defining player positions across multiple "frames" and animating the movement between them. The application features a **premium, light-mode UI** with a realistic stadium field, intuitive timeline controls, responsive canvas scaling, and robust state management.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (configured with custom Design Tokens)
- **Graphics/Canvas:** Konva (via `react-konva`)
- **Linting:** ESLint

## Key Features

### Frame-based Animation

Users create a sequence of frames; the app interpolates player movement between them.

### Responsive Canvas

- **Dynamic Scaling:** Canvas automatically scales to fit container width while maintaining aspect ratio
- **ResizeObserver:** Real-time updates on window/container resize
- **Resolution Independent:** Item positions stored in absolute coordinates (880×320px), visual scaling applied separately
- **No Upscaling:** Capped at 100% scale to maintain visual quality

### Premium Canvas

- **Realistic Field:** Alternating green grass strips, green gradient endzones (Home/Away), and cross-shaped brick marks
- **Interactive Items:** Draggable players (Offense in Red, Defense in Blue) and Disc with gradient fills and drop shadows
- **Visual Feedback:** Ghost positions for previous frames and distinct selection highlights
- **Unobstructed View:** No overlays on field - all status indicators in header

### Light Mode UI

A fresh, high-energy "Day Mode" aesthetic using Sky Blue primary colors and Slate neutrals.

### Three-Row Header System

1.  **Row 1: Branding + Status**
    - Logo, app title, and subtitle
    - **Dynamic status badges** (context-aware display):
      - **Frame counter** (current/total) - shown when not playing
      - **Unsaved badge** (amber, pulsing dot) - shown when editing
      - **Recording badge** (red, pulsing dot, "● Recording") - shown when recording
      - **Live Preview badge** (emerald green, pulsing dot, "▶ Live Preview") - shown when playing
2.  **Row 2: File Operations (Always Visible)**
    - Load Play, Save Play, Export Video buttons
    - Ghost variant styling for subtle appearance
    - Dimmed to 60% opacity when editing
    - Smart guards: prompts to save if unsaved changes exist
3.  **Row 3: Edit Bar (Conditional)**
    - Only appears when `isDirty === true`
    - Amber warning background with icon
    - "You have unsaved changes to Frame X" message
    - SAVE CHANGES (emerald green) and DISCARD (gray) buttons

### Compact Timeline Editor

- **Header:** "⏱️ Timeline Editor" with clock icon
- **Frame Sequence:** Horizontal scrollable strip with compact frame buttons (100px × 64px)
  - Active frame: Emerald border + ring glow effect
  - Hover: Sky blue border + lift animation
  - "+ Add" button at the end
- **Three Control Groups:**
  1.  **Playback Controls:** Previous, Play/Pause (emerald green), Next, Speed selector (1.0x)
  2.  **Frame Actions:** 🔄 Reset (only when editing), 📋 Duplicate
  3.  **Danger Zone:** 🗑️ Delete, ⚠️ Clear All (red background warning)

### Frame Management

- **Add Frame:** Creates new frame based on last frame
- **Duplicate Frame:** Duplicates current frame (including unsaved changes) and inserts right after
- **Delete Frame:** Removes current frame with confirmation
- **Clear All:** Removes all frames with confirmation
- **Reset Item:** Resets selected item to last **saved** position in current frame (not previous frame)

### Explicit Frame Editing

Changes are drafted in a temporary state and must be explicitly saved or discarded. Auto-enter edit mode on item drag.

### Playbook Management

Save/Load entire playbooks via JSON.

### Video Export

Record and export animations as `.mp4` video files (preferred). Gracefully falls back to `.webm` if the browser does not support MP4 export.

### Help System

Dedicated **HelpFooter** component with keyboard shortcuts and usage tips displayed at bottom of page.

### Mobile Responsive Layout

- **Adaptive Layout:** Automatically detects mobile devices (< 768px) and switches to mobile-optimized layout
- **Landscape Enforcement:** Portrait mode shows fullscreen rotation prompt to encourage landscape orientation
- **Optimized Controls:** Compact single-row bottom panel maximizes field visibility (56-69% of screen vs desktop)
- **Touch-Optimized:** All buttons meet minimum 32×32px touch targets for accessibility
- **Field Priority:** Canvas occupies majority of screen space without scrolling required

## Architecture & Key Files

### Architecture & Key Files

### Core Logic (Custom Hooks)

- **`src/features/playbook/hooks/usePlaybookState.ts`**: Manages the core data model for the playbook (frames, editing state, item selection, and manipulation logic).
  - `updateEditingFrame`: Auto-enters edit mode on item drag.
  - `saveChanges`: Commits editing frame to frames array.
  - `discardChanges`: Reverts to saved state.
  - `addFrame`: Creates new frame (copy of last) and jumps to it.
  - `duplicateFrame`: Duplicates current frame (including edits) and inserts after.
  - `deleteFrame`: Removes current frame, intelligently adjusting current frame index.
  - `clearAllFrames`: Resets to initial formation.
  - `resetToPrevious`: Resets selected item to **current frame's saved position**.
  - **`updateTeamConfig`**: Dynamically adjusts offense/defense player counts, positioning new defenders relative to existing offense players with formation-aware offsets.
- **`src/features/playbook/hooks/useAnimation.ts`**: Manages the animation playback loop, `isPlaying` state, and updates `animatingItems` for canvas rendering.
- **`src/features/playbook/hooks/useVideoExport.ts`**: Handles video recording of the canvas, manages `isRecording` and `isExporting` states, and generates video files (MP4/WebM). Now explicitly uses `avc3` codec for improved stability during export.
- **`src/features/playbook/hooks/useFileHandler.ts`**: Manages saving and loading playbook data to/from JSON files, now includes prompting for play name on save.
- **`src/features/playbook/hooks/useCanvasViewport.ts`**: Calculates optimal viewport scale and position for mobile canvas (fit-width mode with padding).
- **`src/shared/hooks/useIsMobile.ts`**: Detects mobile devices using media query (< 768px breakpoint).
- **`src/shared/hooks/useOrientation.ts`**: Detects screen orientation (landscape/portrait) for mobile layout optimization.

### Components

#### Desktop Layout

- **`src/app/layouts/DesktopLayout.tsx`**: Desktop-optimized layout with full header and timeline controls
  - Sticky header (HeaderControls)
  - Flex-1 canvas area (centered)
  - Timeline footer (TimelineControls)
  - Help footer (HelpFooter)
  - Global keyboard shortcuts (Esc to deselect)
- **`src/features/playbook/components/HeaderControls.tsx`**: Unified three-row header component
  - Manages all header functionality (branding, status, file ops, edit bar)
  - Replaced old EditModeControls (merged into Row 3)
  - Contextual status badges (frame counter, unsaved, recording/preview)
- **`src/features/playbook/components/TimelineControls.tsx`**: Compact timeline editor orchestrating four subsections
  - Header with title
  - Frame sequence strip (`timeline/FrameStrip`)
  - Playback controls (`timeline/PlaybackControls`)
  - Frame actions (`timeline/FrameActions`)
  - Danger zone (`timeline/DangerZone`)
  - Decoupled from help text (moved to HelpFooter)
- **`src/features/playbook/components/HelpFooter.tsx`**: Standalone tips component
  - Keyboard shortcuts and usage instructions
  - Fully reusable and self-contained
- **`src/features/playbook/components/TeamConfig.tsx`**: New component for dynamic offense/defense player configuration.
- **`src/features/playbook/components/PlaySelector.tsx`**: New component for loading built-in plays and importing from file.
- **`src/features/playbook/components/PresetSelector.tsx`**: Component for loading built-in formations/presets.

#### Mobile Layout

- **`src/app/layouts/MobileLayout.tsx`**: Mobile-optimized layout enforcing landscape orientation
  - Portrait warning screen with rotation prompt (中文: "请旋转手机")
  - Compact top bar with menu and help buttons
  - Fullscreen canvas background
  - Ultra-compact bottom panel (60-108px height)
  - Single-row control layout: [Play] [Reset] [Duplicate] [Delete] [Timeline] [Add]
  - Icon-only operation buttons (32×32px) with title tooltips
  - Semi-transparent white background (bg-white/90) with backdrop blur
- **`src/features/playbook/components/MobileCanvas.tsx`**: Mobile-optimized Konva canvas
  - Fixed viewport (no pan/zoom gestures to avoid conflicts with dragging)
  - Automatic fit-width scaling with padding
  - Touch-optimized event handlers (onTap)
  - Same layer structure as desktop (FieldLayer, GhostLayer, ItemsLayer)

#### Shared Canvas Components

- **`src/features/playbook/components/PlaybookCanvas.tsx`**: Desktop responsive Konva canvas with ResizeObserver
- **`src/features/playbook/components/canvas/FieldLayer.tsx`**: Stadium field rendering (grass strips, endzones, brick marks)
- **`src/features/playbook/components/canvas/GhostLayer.tsx`**: Previous frame ghost positions
- **`src/features/playbook/components/canvas/ItemsLayer.tsx`**: Interactive draggable items with gradient fills and selection highlights

#### Shared UI

- **`src/shared/ui/Button.tsx`**: Reusable button component with variants
  - Primary, Secondary, Success, Danger, Ghost
  - Styled for light theme with hover/active states

### Design & Configuration

- **`src/shared/design/tokens.ts`**: Centralized design system definitions (Colors, Typography, Spacing, Shadows)
- **`src/features/playbook/constants/canvas.ts`**: Application constants, now includes `DEFENSE_OFFSETS` for precise defender placement.
  - Field dimensions: FIELD_LENGTH (880px), FIELD_WIDTH (320px)
  - Player/disc sizes, colors from design tokens
- **`src/presets/`**: Centralized directory for built-in plays and formations.
  - **`src/presets/formations/`**: JSON files for default team setups (e.g., Vertical Stack, Horizontal Stack).
  - **`src/presets/plays/`**: JSON files for pre-designed game plays (e.g., Facial).
  - **`src/presets/index.ts`**: Registry for accessing built-in `PRESETS` and `PLAYS`.
- **`src/index.css`**: Global styles, Tailwind imports, and custom CSS variables
- **`tailwind.config.js`**: Tailwind configuration extending theme with design tokens

## Usage

### Starting a New Play

1.  Click "⚠️ Clear All" to reset the canvas
2.  Confirm the action to initialize with default formation

### Editing Frames

1.  **Select an item:** Click on a player or disc (Sky Blue highlight appears)
2.  **Drag to new position:** Automatically enters edit mode, unsaved badge appears in header
3.  **Save or discard:**
    - Click "✓ SAVE CHANGES" in the amber edit bar to commit
    - Click "✕ DISCARD" to revert to saved state
4.  **Reset individual item:** Select item, click "🔄 Reset" to revert to saved position

### Timeline Navigation

- **Frame Thumbnails:** Click any frame button to switch frames
- **Playback Controls:** Use Previous (◀◀) and Next (▶▶) buttons
- **Keyboard Shortcuts:** Arrow keys (← →) to navigate frames

### Playback & Animation

1.  Click the large **Play** button (▶️) to start animation
2.  Click **Pause** to stop playback
3.  Speed selector shows current playback speed (1.0x)

### Frame Management

- **Add Frame:** Click "+ Add" button at end of timeline strip
- **Duplicate Frame:** Select frame, click "📋 Duplicate" to copy it
- **Delete Frame:** Click "🗑️ Delete" with confirmation prompt
- **Clear All:** Click "⚠️ Clear All" to reset everything (with confirmation)

### File Operations

- **Save Play:** Click "💾 Save Play" to download JSON file
- **Load Play:** Click "📁 Load Play" to import JSON file
- **Export Video:** Click "🎥 Export Video" to record and download `.mp4` (or `.webm`) file
  - Must save all changes before exporting
  - File operations show smart guards if unsaved changes exist

### Keyboard Shortcuts

- **Esc** - Unselect item or discard changes (with prompt)
- **Ctrl+S** - Save current frame changes
- **← →** - Navigate frames (when not editing)
- **Space** - Play/pause animation (when not editing)

## Recent Improvements

### Mobile Tactical Player (Latest)

-   **Pivot to Viewer:** Completely refactored the mobile experience from a cramped editor to a dedicated **Tactical Player**.
    -   **Read-Only Mode:** Removed all editing controls (drag, save, add/delete frames) to focus on friction-free playback.
    -   **Simplified UI:** streamlined interface featuring only playback controls, a timeline slider, and a "Load Tactics" menu.
    -   **Portrait Support:** Removed the "Rotate to View" restriction; the player now adapts to both portrait and landscape orientations.
-   **Visibility Fixes:**
    -   Fixed invisible Play/Pause button and active frame indicators by replacing custom Tailwind colors with standard utility classes (`bg-sky-600`), resolving configuration issues on mobile.
    -   Ensured high contrast for critical controls (white icons on blue backgrounds).

### Dynamic Player Configuration & Play/Preset Management (Previous)

-   **Dynamic Offense/Defense Players:** Implemented the ability to configure both offense and defense players (1-7 each) via a new `TeamConfig` component.
-   **Configurable Defense Positioning:** When adding defense players, their initial positions are now intelligently calculated relative to their corresponding offense players, using formation-aware offsets (Vertical vs. Horizontal Stack). Offsets are centralized in `src/features/playbook/constants/canvas.ts` for easy management.
-   **Built-in Play/Preset Support:**
    -   Organized JSON data into `src/presets/formations/` (for static starting layouts) and `src/presets/plays/` (for full game scenarios).
    -   Introduced dedicated `PlaySelector` and `PresetSelector` components to load these built-in options directly, separating them from local file import.
-   **Improved Save/Load UX:**
    -   When saving a play, the user is now prompted to enter a name, which is used for both the JSON file's `name` property and the downloaded filename.
    -   Team configuration changes (adding/removing players) now auto-save if no other edits are present, avoiding unnecessary "unsaved changes" warnings.

### Mobile Optimization (Previous)

-   **Landscape-First Design:** Force landscape orientation for optimal field viewing (2.7:1 aspect ratio)
-   **Portrait Warning Screen:** Fullscreen prompt encouraging users to rotate device
-   **Space Optimization:** Reduced bottom panel from 193-245px to 60-108px (69% improvement)
-   **Canvas Visibility:** Increased from 19-34% to 56-69% of screen height
-   **Compact Controls:** Merged two control rows into single row with icon-only buttons
-   **Field Fully Visible:** No scrolling required in landscape mode (667×375px)
-   **Touch Accessibility:** All buttons meet 32×32px minimum touch targets
-   **Semi-Transparent UI:** Bottom panel uses bg-white/90 with backdrop blur

### Layout Reorganization (Previous)

- Refactored header into unified three-row component
- Redesigned timeline with compact, organized layout
- Separated help text into dedicated HelpFooter component
- Full-screen flex layout with sticky header
- Separate desktop and mobile layouts with adaptive routing

### Bug Fixes (Previous)

- Fixed Reset Item to reset to current frame's saved position (was incorrectly resetting to previous frame)
- Reset Item now only enabled when `isDirty === true`
- Fixed canvas gesture conflicts on mobile by disabling pan/zoom
- Known Issue: iPhone 13 on Chrome iOS exhibits an unresolvable WebKit viewport/orientation bug where initial landscape detection is incorrect.

### New Features (Previous)

- Duplicate Frame functionality
- Responsive canvas with dynamic scaling
- Pulsing unsaved changes badge
- Smart file operation guards
- Mobile/desktop detection and adaptive layouts
- Orientation detection for mobile devices

### UI Polish (Previous)

- Emerald green for primary actions (play button, save, active frames)
- Danger zone with red background for destructive actions
- Visual button labels ("🗑️ Delete", "⚠️ Clear All")
- Improved hover/active states throughout
- Recording/Preview indicator moved to header (no canvas obstruction)
- Contextual status badges with consistent styling
- Icon-only buttons with tooltips for space efficiency on mobile

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
