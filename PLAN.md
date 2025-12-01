# PLAN: Logical Coordinate System Refactor

## 🎯 Objective
Transition the application from a pixel-based (hardcoded 880x320) coordinate system to a logical, resolution-independent coordinate system based on real-world units (Yards). This enables support for multiple field standards (WFDF, USAU) and dynamic scaling across devices without breaking data integrity.

## 🏗️ Architecture

### 1. The "Logical" Core
- **Unit of Measure:** Yards.
- **Origin (0,0):** Top-Left corner of the Back Endzone.
- **Data Storage:** All `x` and `y` values in Redux/State/JSON will be stored in Yards.

### 2. Field Standards (Configuration)
Define standard dimensions separately from the view logic.
- **Default:** WFDF (100m x 37m approx, converted to yards for consistency or kept in meters if we prefer metric. *Decision: Use Yards as internal unit for simplicity with existing logic, but map WFDF correctly.*)
    - *Correction:* Ultimate implies Yards usually, but WFDF is Metric.
    - *Decision:* We will use a generic "Unit" system, but default to **Yards** as the base for now to match the 110x40 existing mental model, or strictly adhere to the requested WFDF default.
    - **WFDF Dimensions:** 100m length (18m endzone, 64m playing field, 18m endzone) x 37m width.
    - **Coordinate Space:** 0 to 100 (Length), 0 to 37 (Width).

### 3. The Rendering Layer (View)
- **Dynamic Scale:** Calculated at runtime based on container width.
    - `scale = containerWidth / fieldLength (logical)`
- **Projection:**
    - `renderX = logicalX * scale`
    - `renderY = logicalY * scale`
- **Input Mapping:**
    - `logicalX = pointerX / scale`

## 📝 Implementation Steps

### Phase 1: Core Configuration
1.  Create `src/features/playbook/constants/standards.ts`.
    - Define `FieldStandard` interface.
    - Define `WFDF` and `USAU` constants.
    - Set `WFDF` as default.
2.  Update `canvas.ts` to export a dynamic `useFieldScale` hook or helper instead of hardcoded constants.

### Phase 2: Type & State Refactor
1.  Audit `types.ts`. Ensure clear separation (maybe rename properties or add comments, but strict `number` type remains).
2.  Update `useCanvasViewport` to accept a `FieldStandard` to calculate aspect ratios.

### Phase 3: Coordinate Transformation
1.  Create `src/features/playbook/utils/coordinates.ts`.
    - `toScreen(logical, scale)`
    - `toLogical(screen, scale)`
2.  **CRITICAL:** Refactor `MobileCanvas` and `PlaybookCanvas` (Desktop).
    - They currently pass "Pixel" coordinates to Konva.
    - **Change:** They must receive "Logical" frames.
    - **Change:** They must calculate `scale` based on container size vs Standard size.
    - **Change:** Pass `scale` to `ItemsLayer`.
3.  Update `ItemsLayer` to render at `item.x * scale`.
    - **Token Scaling:** Ensure players don't shrink too much. `radius = BASE_RADIUS * (scale / BASE_SCALE)`.

### Phase 4: Data Migration (The Hard Part)
1.  Existing Presets (Vertical/Horizontal/Facial) are in Pixels (880x320).
2.  Create a script/utility to convert them to Logical Units based on the *old* scale (8px = 1 yard).
    - `Logical = OldPixel / 8`.
3.  Overwrite the JSON files in `src/presets` with the new normalized values.

### Phase 5: Interaction Updates
1.  Update `usePlaybookState`'s `updateEditingFrame`.
    - When dragging stops, `e.target.x()` is in Pixels.
    - Convert back to Logical before saving to state.

## 🧪 Testing Plan
1.  **Visual Verification:** Does the field look correct (100x37 aspect ratio)?
2.  **Data Verification:** Save a play. Open JSON. Are coordinates small numbers (e.g., 10, 50) instead of huge pixels (80, 400)?
3.  **Responsiveness:** Resize window. Do players stay in their relative positions?