# Development Plan: Tactical Animator Enhancements

This document outlines the roadmap for enhancing the Tactical Animator. It tracks the evolution of features, including design decisions and architectural reasoning.

## Project Roadmap

### Phase 0: Structural Refactoring (Completed)
*   **Goal:** Clean up the codebase to improve maintainability, readability, and ease of adding new features. This phase focuses on separating concerns within `App.tsx`.
*   **Tasks:**
    1.  **Extract Types:** Moved common TypeScript interfaces and types (e.g., `ItemType`, `DraggableItem`) into a dedicated file (`src/features/playbook/types.ts`). (Completed)
    2.  **Extract Constants:** Moved all application-wide constants (e.g., `SCALE`, `FIELD_LENGTH`, `COLORS`) into a separate file (`src/features/playbook/constants/canvas.ts`). (Completed)
    3.  **Componentization:** Extracted the `<Stage>` rendering logic into a dedicated component (`PlaybookCanvas.tsx`). (Completed)
    4.  **Refactor App.tsx:** Updated `App.tsx` to import the extracted types, constants, and the new `PlaybookCanvas` component. (Completed)
    5.  **Verify Build:** Confirmed the application builds correctly after refactoring. (Completed)

### Phase 1: "Modify" & Frame State Management (Completed)
*   **Goal:** Ensure frame edits are robust, reactive, and intuitive, strictly adhering to the "Independent Keyframe" model with explicit save confirmation.
*   **Implemented Design:**
    *   **Explicit Save:** Changes don't apply to the permanent animation timeline until a "Save Changes" button is clicked.
    *   **State Separation:** Utilizes `editingFrame` (temporary state for unsaved changes) and `frames` (committed timeline state).
    *   **UI Indicators:** "Unsaved" state indicator, conditional "Save Changes" and "Discard" buttons.
    *   **Navigation Protection:** Alerts the user about unsaved changes when attempting to switch frames, load a play, or export video.
*   **Tasks:**
    1.  Modify `App.tsx` to introduce `editingFrame` state and `isDirty` (unsaved changes) logic. (Completed)
    2.  Update `handleDragEnd` to update `editingFrame` instead of the main `frames` state. (Completed)
    3.  Implement `saveChanges` and `discardChanges` functions in `App.tsx`. (Completed)
    4.  Update the UI to conditionally display "Save" and "Discard" buttons when there are unsaved changes. (Completed)
    5.  Ensure `PlaybookCanvas` renders the `editingFrame` when in edit mode. (Completed)
    6.  Integrate unsaved changes check into frame navigation, play loading, and exporting. (Completed)

#### *Design Decision Record: "Propagate Mode" (Dropped)*
*   **Original Idea:** A "Propagate Mode" toggle where moving a player in Frame `N` would auto-shift that player in Frames `N+1`, `N+2`, etc., preserving relative movement.
*   **Reasoning for Rejection:**
    1.  **UX Risk (The "Modal Trap"):** Users might forget the mode is ON and accidentally destroy future frames when making minor adjustments.
    2.  **Convention:** Standard animation software (Flash, After Effects) uses independent keyframes. Deviating creates confusion.
    3.  **Complexity vs. Value:** The engineering cost is high for a feature that is rarely needed in short (3-5 frame) clips.

### Phase 2: Efficient Item "Withdrawal" (Reset/Undo) (Completed with UX Enhancements)
*   **Goal:** Provide a quick, context-aware way to revert a specific player's move, addressing UX concerns.
*   **Implemented UI Approach:** **Click-to-Select with Toolbar Button** (Replaced Right-Click Context Menu).
*   **Tasks:**
    1.  **Selection State:** Added `selectedItemId` to `useTacticalState` to track the currently selected draggable item. (Completed)
    2.  **Visual Selection Feedback:** Implemented visual highlighting (thicker yellow stroke) for the selected item on the `PlaybookCanvas`. (Completed)
    3.  **Click-to-Select:** Modified `PlaybookCanvas` to handle clicks on items for selection and clicks on empty canvas space for deselection. (Completed)
    4.  **"Reset Item" Button:** Added a dedicated "Reset Item" button to the `TimelineControls` area. This button is enabled only when an item is selected and it's not the first frame. (Completed)
    5.  **Reset Logic Integration:** The `resetToPrevious` function (in `useTacticalState`) now acts on the `selectedItemId`. (Completed)
    6.  **Removed Context Menu:** The `ContextMenu` component and all associated logic have been removed to resolve layout shift and improve UX. (Completed)
    7.  **User Guidance:** Updated the tip in `TimelineControls` to instruct users about selecting an item and using the "Reset Item" button. (Completed)

### Phase 3: Import / Export System for Animations (Completed)
*   **Goal:** Enable users to save, load, and share their animations.
*   **Tasks:**
    1.  **Define Playbook Data Schema:** Created the `PlaybookData` interface in `src/features/playbook/types.ts`. (Completed)
    2.  **Export Functionality:**
        *   **"Export Full Play":** Implemented "SAVE PLAY" button that serializes the `frames` and metadata into a JSON file download. (Completed)
    3.  **Import Functionality:**
        *   **"Load Play":** Implemented "LOAD PLAY" button with a hidden file input to upload and parse a `playbook.json` file, replacing the current state. (Completed)
    4.  **UI Updates:** Added "SAVE PLAY" and "LOAD PLAY" buttons to the header. (Completed)
    5.  **Clear All Frames:** Added a function and button to clear all frames and reset to an initial state. (Completed)

### Phase 4: Premium UI/UX Overhaul (Completed)
*   **Goal:** Transform the application interface from a basic functional prototype to a premium, professional-grade design matching the "Tactical Animator" mockup.
*   **Implemented Design:**
    *   **Design System:** Established a centralized design system (`src/shared/design/tokens.ts`) with a dark, modern color palette, typography scale, and reusable component tokens.
    *   **Visual Polish:** Implemented a rich, stadium-style field with gradients, hash marks, and alternating grass strips.
    *   **Professional Canvas:** Replaced flat colors with gradient-filled players, shadows, and proper text labels using the "Outfit" font.
    *   **Modern Timeline:** Redesigned the timeline with a dedicated playback control bar and "mini-field" frame thumbnails.
    *   **Component Library:** Created reusable `Button` components with varied variants (primary, secondary, ghost, danger) to ensure consistency.
    *   **Layout Optimization:** Restructured the application layout to align with standard video editing tools (Header -> Toolbar -> Field -> Timeline).
    *   **Typography:** Integrated Google Fonts ("Outfit" and "JetBrains Mono") for a clean, modern look.

---

## Architectural Critique & Proposed Refactoring (Completed - Refactoring Implemented)

### **1. The "God Component" Problem (Violation of Single Responsibility Principle)**
*   **Initial Observation:** `App.tsx` handled all state, logic, and UI.
*   **Resolution:** Addressed through extensive refactoring into custom hooks and sub-components.

### **2. State Management Complexity & Coupling**
*   **Initial Observation:** Dispersed boolean flags and ad-hoc enable/disable logic.
*   **Resolution:** Centralized modes and derived states into custom hooks (`useTacticalState`, `usePlaybackAndExport`). `App.tsx` now orchestrates these states.

### **3. UI/UX Interaction Inconsistencies**
*   **Initial Observation:** Cluttered UI, awkward context menu for resets.
*   **Resolution:** UI decomposed into `HeaderControls`, `EditModeControls`, `TimelineControls`. Context menu replaced with explicit item selection and a dedicated toolbar button.

### **4. Code Structure & Refactoring Opportunities**
*   **Initial Observation:** `useRef` usage, repetitive logic.
*   **Resolution:** Logic encapsulated within custom hooks (`useTacticalState`, `usePlaybackAndExport`, `usePlaybookIO`). `App.tsx` now uses these hooks as primary building blocks.

---

## Future Enhancements (Potential Phase 5)

*   **Export Frame Range:** UI to select Start/End frames for partial export.
*   **Append Frames:** Option to add imported frames to the end of the current timeline instead of replacing it.
*   **Undo/Redo Stack:** A global history stack for undoing actions beyond just "Discard Changes" for the current editing frame.
*   **Improved Item Labeling:** UI to edit player labels/numbers dynamically.
*   **More Advanced Playbook Metadata:** Allow users to name/describe their plays more easily.
*   **Performance Optimization:** Further optimize rendering or state updates if performance bottlenecks are identified with larger playbooks.
