# Workstream 3: Visual and Responsive Polish

## Design-system foundation

- Define reusable tokens for spacing, radius, shadows, typography, interaction
  states, success, warning, danger, and focus.
- Replace repeated one-off button styles with shared primary, secondary,
  tertiary, and danger variants.
- Establish consistent page width, vertical rhythm, section heading, card, form,
  and status-panel patterns.
- Use a deliberate display and body type system instead of the browser-oriented
  Arial stack.
- Keep contrast suitable for the dark theme.

## Navigation and shell

- Design desktop, tablet, and compact mobile header variants.
- Prevent the current seven navigation items from overflowing on narrow screens.
- Add a clear account/avatar affordance without crowding primary navigation.
- Improve footer hierarchy and mobile wrapping.

## Page polish

- Strengthen home-page storytelling and calls to action.
- Improve catalog filters with active-filter display and a clear reset action.
- Give game pages more product information and stronger purchase/ownership
  hierarchy.
- Standardize account, wallet, library, and feedback card proportions.
- Ensure loading placeholders match the final layouts to avoid shifting.

## Responsive acceptance matrix

Test at minimum:

| Viewport | Expected behavior                                              |
| -------- | -------------------------------------------------------------- |
| 320 px   | No horizontal scroll; compact menu; one-column forms and cards |
| 375 px   | Touch targets remain at least 44 by 44 CSS pixels              |
| 768 px   | Tablet grids and navigation do not crowd or truncate           |
| 1024 px  | Desktop hierarchy begins without excessive empty space         |
| 1440 px  | Content remains bounded and readable                           |

Also verify long customer names, long emails, large point balances, long game
titles, empty data, and translated-length text.

## Visual acceptance criteria

- Components feel like one product rather than independently styled features.
- Important actions have one clear visual priority per section.
- Text does not clip, overlap, or cause horizontal page scrolling.
- Hover, active, focus, disabled, loading, success, and error states are
  visually distinct.
- Image dimensions prevent layout shift and preserve intended crops.
