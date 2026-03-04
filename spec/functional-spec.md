# Sudoku 4 All — Functional Specifications

## 1. Overview

Sudoku 4 All is a web-based Sudoku game designed to run in any modern browser on desktop, tablet, and mobile devices. The application delivers the full Sudoku experience with accessibility, usability, and persistence in mind. No server-side infrastructure is required: all game state, history, and settings are maintained entirely in the browser's local storage.

---

## 2. Scope

These specifications define the **functional** requirements of the application. Technology choices, architecture, and implementation details are intentionally left open for a separate decision.

Out of scope for this document:
- Technology stack selection
- Visual design / branding
- Accessibility (WCAG) conformance levels
- Internationalisation / localisation

---

## 3. Glossary

| Term | Definition |
|---|---|
| **Board** | The 9×9 Sudoku grid, divided into nine 3×3 boxes. |
| **Cell** | A single square within the board. |
| **Given** | A pre-filled, read-only cell provided as part of the puzzle. |
| **Candidate** | A digit the player has not yet committed to but is considering for a cell, recorded as an annotation. |
| **Annotation mode** | An input mode in which entered digits are recorded as small candidate marks rather than as confirmed answers. |
| **Answer mode** | An input mode in which entered digits are recorded as confirmed answers. |
| **Hint** | A game-provided reveal of the correct digit for a selected cell. |
| **Validation** | A game-triggered check that highlights incorrect confirmed answers. |
| **Cheating flag** | A per-game marker that is set when the player uses Validation or Hints. |
| **Completion** | The state reached when every cell contains the correct digit. |
| **Session** | A single playthrough of one puzzle from start to Completion or abandonment. |
| **Best Games list** | A persistent, ranked list of up to 50 completed sessions, ordered by completion time. |

---

## 4. Feature Specifications

### 4.1 Difficulty Selection

#### 4.1.1 Description
Before a new game starts, the player must choose a difficulty level. Difficulty controls the number of given cells and the complexity of the logical deductions required to solve the puzzle.

#### 4.1.2 Requirements

| ID | Requirement |
|---|---|
| DIFF-01 | The application **must** present at least three difficulty levels: **Easy**, **Medium**, and **Hard**. |
| DIFF-02 | The application **may** offer an additional **Expert** level. |
| DIFF-03 | The difficulty selection screen **must** be the first screen shown when starting a new game. |
| DIFF-04 | The selected difficulty **must** be displayed visibly during the game session. |
| DIFF-05 | Difficulty levels **must** be differentiated by the approximate number of given cells: Easy ≥ 36 givens, Medium 27–35, Hard 22–26, Expert < 22. |
| DIFF-06 | Each generated puzzle **must** have a unique solution. |

---

### 4.2 Game Board

#### 4.2.1 Description
The central component of the application is a 9×9 grid. The player interacts with the board to fill in missing digits.

#### 4.2.2 Requirements

| ID | Requirement |
|---|---|
| BOARD-01 | The board **must** render all 81 cells clearly distinguishable, with visible separation between 3×3 boxes. |
| BOARD-02 | Given cells **must** be visually distinct from player-entered cells (e.g., different font weight or colour). |
| BOARD-03 | The selected cell **must** be clearly highlighted. |
| BOARD-04 | All cells in the same row, column, and 3×3 box as the selected cell **should** be subtly highlighted to aid orientation. |
| BOARD-05 | All cells containing the same digit as the currently selected cell **should** be highlighted to aid pattern recognition. |
| BOARD-06 | The board **must** be fully operable via touch on mobile and tablet devices. |
| BOARD-07 | The board **must** be fully operable via mouse and keyboard on desktop devices. |
| BOARD-08 | Arrow keys **must** move the selection between cells on desktop. |
| BOARD-09 | Pressing a digit key (1–9) on desktop **must** act according to the active input mode (see §4.3). |
| BOARD-10 | A dedicated on-screen digit pad (1–9) **must** be provided for touch devices and **may** be shown on desktop. |

---

### 4.3 Input Modes

#### 4.3.1 Description
The player may enter digits in two ways: by selecting a cell first and then choosing a digit, or by selecting a digit first and then tapping/clicking cells. Both modes must be supported simultaneously and the active mode must be clearly indicated.

#### 4.3.2 Cell-First Mode (Default)

| ID | Requirement |
|---|---|
| INPUT-CF-01 | The player taps/clicks a cell to select it, then enters a digit via the on-screen pad or keyboard. |
| INPUT-CF-02 | Entering a digit fills the selected cell (in Answer or Annotation mode as applicable). |
| INPUT-CF-03 | A "Delete" / "Erase" action **must** clear the confirmed answer (or all annotations) from the selected cell. |
| INPUT-CF-04 | Selection **must** not change after entering a digit, allowing rapid correction. |

#### 4.3.3 Number-First Mode

| ID | Requirement |
|---|---|
| INPUT-NF-01 | The player selects a digit from the on-screen pad first, then taps/clicks one or more cells to fill them with that digit. |
| INPUT-NF-02 | The selected digit **must** remain active until the player selects a different digit or explicitly deselects it. |
| INPUT-NF-03 | In Number-First mode, clicking/tapping an already-filled cell that contains the active digit **must** clear that cell. |
| INPUT-NF-04 | The currently "held" digit **must** be visually highlighted in the digit pad. |

#### 4.3.4 Mode Switching

| ID | Requirement |
|---|---|
| INPUT-SW-01 | A clearly labelled toggle control **must** allow the player to switch between Cell-First and Number-First modes at any time during a game. |
| INPUT-SW-02 | The active mode **must** be persistently indicated in the UI throughout the session. |
| INPUT-SW-03 | Switching modes **must** not alter any cell values or annotations. |

---

### 4.4 Annotations (Candidate Marks)

#### 4.4.1 Description
The player may record small candidate digits inside a cell without committing to an answer. This aids logical deduction.

#### 4.4.2 Requirements

| ID | Requirement |
|---|---|
| ANNO-01 | A clearly labelled **Annotation Mode** toggle **must** be provided, distinct from the input-mode toggle. |
| ANNO-02 | When Annotation Mode is active, entering a digit adds or removes that digit as a candidate mark in the selected cell rather than placing a confirmed answer. |
| ANNO-03 | A cell **must** support up to 9 simultaneous candidate marks. |
| ANNO-04 | Candidate marks **must** be visually smaller and distinguishable from confirmed answers. |
| ANNO-05 | A cell **must not** display candidate marks if it already contains a confirmed answer. |
| ANNO-06 | Placing a confirmed answer in a cell **must** automatically clear all candidate marks in that cell. |
| ANNO-07 | When the player places a correct confirmed answer, the application **should** automatically remove that digit's candidate mark from all peer cells (same row, column, and box). |
| ANNO-08 | Annotation Mode **must** be available in both Cell-First and Number-First input modes. |
| ANNO-09 | The active state of Annotation Mode **must** persist for the duration of the session and **must** be saved alongside game progress (see §4.7). |

---

### 4.5 Validation

#### 4.5.1 Description
The player may request the game to check their current answers. Because this reveals information not derived by the player's own reasoning, it is classified as cheating.

#### 4.5.2 Requirements

| ID | Requirement |
|---|---|
| VALID-01 | A **Validate** button or action **must** be available during a game. |
| VALID-02 | Activation **must** prompt a confirmation dialog warning the player that using Validation will mark the game as cheated. |
| VALID-03 | Upon confirmation, every cell containing an incorrect confirmed answer **must** be highlighted with a clear error indicator (e.g., red background or icon). |
| VALID-04 | Correctly filled cells and given cells **must not** be marked as errors. |
| VALID-05 | The error indicator **must** remain visible until the player corrects the cell or triggers Validation again. |
| VALID-06 | Using Validation **must** set the **Cheating flag** for the current session (see §4.8). |
| VALID-07 | The Cheating flag, once set for a session, **must not** be cleared. |
| VALID-08 | The Cheating flag **must** be visibly indicated in the game UI after it is set (e.g., a small "cheated" label or icon). |

---

### 4.6 Hints

#### 4.6.1 Description
The player may request the game to reveal the correct answer for the currently selected cell. Like Validation, this is considered cheating.

#### 4.6.2 Requirements

| ID | Requirement |
|---|---|
| HINT-01 | A **Hint** button or action **must** be available during a game. |
| HINT-02 | Activation **must** prompt a confirmation dialog warning the player that using a Hint will mark the game as cheated. |
| HINT-03 | Upon confirmation, the correct digit **must** be placed in the selected cell as a confirmed, locked answer (styled identically to given cells). |
| HINT-04 | A hint-filled cell **must not** be editable by the player. |
| HINT-05 | Using a Hint **must** set the **Cheating flag** for the current session (see §4.8). |
| HINT-06 | If no cell is selected when Hint is activated, the application **must** display an informative message asking the player to select a cell first. |
| HINT-07 | A Hint **must not** be available for a cell that is already correctly filled. |

---

### 4.7 Game Progress — Local Storage

#### 4.7.1 Description
The player's current game state is automatically and continuously saved so that progress is not lost if the browser tab is closed or the page is reloaded.

#### 4.7.2 Requirements

| ID | Requirement |
|---|---|
| SAVE-01 | The application **must** save the current game state to local storage after every cell change. |
| SAVE-02 | On application load, if a saved in-progress game exists, the application **must** offer to resume it. |
| SAVE-03 | If the player declines to resume, the saved game **must** be discarded and a new game started from the difficulty selection screen. |
| SAVE-04 | The saved state **must** include: the original puzzle, all player-entered answers, all annotations, the active input mode, the Annotation Mode toggle state, the elapsed time, the Cheating flag, and the selected difficulty. |
| SAVE-05 | Starting a new game **must** replace (not append to) the single in-progress save slot. |
| SAVE-06 | Completed games **must not** occupy the in-progress save slot; instead they are recorded in the Best Games list (see §4.9). |

---

### 4.8 Cheating Flag

#### 4.8.1 Description
A per-session binary flag that records whether the player used any game-assisted features (Validation or Hints) during the session.

#### 4.8.2 Requirements

| ID | Requirement |
|---|---|
| CHEAT-01 | The Cheating flag is `false` at the start of every new session. |
| CHEAT-02 | The flag is set to `true` the first time the player confirms the use of Validation or Hints. |
| CHEAT-03 | The flag **must** be saved as part of the in-progress game state (SAVE-04). |
| CHEAT-04 | A cheated game may still be completed, but its entry in the Best Games list **must** be marked as cheated (see §4.9). |
| CHEAT-05 | The Cheating flag **must** be shown in the in-game UI once set (e.g., a persistent "Cheated" badge). |

---

### 4.9 Completion

#### 4.9.1 Description
A game is considered successfully completed when every cell contains the correct digit. The application acknowledges the player's achievement.

#### 4.9.2 Requirements

| ID | Requirement |
|---|---|
| COMP-01 | The application **must** automatically detect when every cell is correctly filled. |
| COMP-02 | Upon detection, gameplay **must** stop (the timer pauses, input is disabled). |
| COMP-03 | A congratulatory message **must** be displayed, including: the difficulty level, the elapsed time, and whether the game was completed without cheating. |
| COMP-04 | The congratulatory screen **must** offer the option to start a new game. |
| COMP-05 | The congratulatory screen **must** offer the option to view the Best Games list. |
| COMP-06 | The completed game **must** be recorded in the Best Games list (see §4.10). |
| COMP-07 | The in-progress save slot **must** be cleared upon completion. |

---

### 4.10 Timer

#### 4.10.1 Description
An elapsed-time counter runs throughout each session to measure how long the player takes to complete the puzzle.

#### 4.10.2 Requirements

| ID | Requirement |
|---|---|
| TIMER-01 | The timer **must** start automatically when the player makes their first cell change after the puzzle is loaded. |
| TIMER-02 | The elapsed time **must** be displayed visibly during the game. |
| TIMER-03 | The timer **must** pause when the application is in the background (browser tab hidden or window minimised). |
| TIMER-04 | The timer **must** resume when the application returns to the foreground. |
| TIMER-05 | The elapsed time **must** be saved as part of the in-progress game state (SAVE-04). |
| TIMER-06 | The final elapsed time **must** be saved with the completed game record (see §4.11). |

---

### 4.11 Best Games List

#### 4.11.1 Description
A persistent, in-browser ranking of the player's best completed games, stored in local storage.

#### 4.11.2 Requirements

| ID | Requirement |
|---|---|
| BEST-01 | The Best Games list **must** store up to **50** completed game records. |
| BEST-02 | Each record **must** contain: a sequential game number, the difficulty, the completion time, the date and time of completion, and the Cheating flag. |
| BEST-03 | Records **must** be sorted by completion time, ascending (fastest first), across all difficulty levels. |
| BEST-04 | When a new record would bring the total above 50, the slowest existing record **must** be dropped to maintain the cap. |
| BEST-05 | The Best Games list **must** be accessible from within the game via a clearly labelled button or menu item. |
| BEST-06 | The list **must** display each record with at least: rank, difficulty, time, date, and a cheated indicator. |
| BEST-07 | The player **must** be able to clear the Best Games list. A confirmation dialog **must** be shown before deletion. |
| BEST-08 | The Best Games list **must** be stored in local storage and survive page reloads and browser restarts. |
| BEST-09 | Newly added records **must** be visually highlighted in the list to provide feedback. |

---

## 5. Navigation and Application Flow

```
┌─────────────────────┐
│   Application Load  │
└──────────┬──────────┘
           │
           ▼
  ┌────────────────────┐    Yes   ┌──────────────────────┐
  │ In-progress save?  │─────────▶│  Resume Prompt       │
  └────────────────────┘          └──────┬───────┬───────┘
           │ No                    No    │       │ Yes
           ▼                            │       │
  ┌─────────────────────┐               │       │
  │ Difficulty Selection│◀──────────────┘       │
  └──────────┬──────────┘                       │
             │                                  │
             ▼                                  │
       ┌──────────┐                             │
       │  Game    │◀────────────────────────────┘
       │  Board   │
       └────┬─────┘
            │ Completed
            ▼
  ┌──────────────────────┐
  │ Congratulations      │
  │ Screen               │
  └────────┬─────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
 New Game   Best Games List
              (accessible any time)
```

---

## 6. Data Models

### 6.1 In-Progress Game (local storage key: `sudoku4all_current`)

| Field | Type | Description |
|---|---|---|
| `version` | string | Schema version for migration purposes. |
| `puzzle` | number[81] | Original puzzle (0 = empty cell). |
| `solution` | number[81] | Full solution for validation and hints. |
| `answers` | number[81] | Player-confirmed answers (0 = unfilled). |
| `annotations` | number[][81] | Candidate marks per cell (array of digits). |
| `difficulty` | string | `"easy"` \| `"medium"` \| `"hard"` \| `"expert"` |
| `startedAt` | ISO 8601 string | Timestamp when the game was started. |
| `elapsedSeconds` | number | Total seconds elapsed (excluding paused periods). |
| `inputMode` | string | `"cell-first"` \| `"number-first"` |
| `annotationMode` | boolean | Whether Annotation Mode is currently active. |
| `cheated` | boolean | Whether the Cheating flag has been set. |

### 6.2 Completed Game Record

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier (e.g., UUID or timestamp-based). |
| `difficulty` | string | `"easy"` \| `"medium"` \| `"hard"` \| `"expert"` |
| `completedAt` | ISO 8601 string | Timestamp of completion. |
| `elapsedSeconds` | number | Total elapsed time in seconds. |
| `cheated` | boolean | Whether the Cheating flag was set. |

### 6.3 Best Games List (local storage key: `sudoku4all_bestgames`)

| Field | Type | Description |
|---|---|---|
| `version` | string | Schema version for migration purposes. |
| `records` | CompletedGameRecord[] | Up to 50 records, sorted by `elapsedSeconds` ascending. |

---

## 7. Non-Functional Notes (for future reference)

The following are not functional requirements but are recorded here to inform future technical decisions:

- **Responsiveness**: The layout must adapt to screen widths from 320 px (small mobile) to 1920 px (large desktop).
- **Offline support**: Because all data is local, the app should be usable without an internet connection. A Service Worker or similar progressive web app technique is recommended but not mandated here.
- **Performance**: Puzzle generation and validation must not block the UI thread for perceptibly long durations.
- **No accounts / no server**: The application must not require user registration or a backend service.
