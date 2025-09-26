# GitHub Copilot Instructions for Tab Counter

## Project Overview
Tab Counter is a Chrome extension that displays the current number of open tabs in the browser. The extension is built with Deno and TypeScript, following modern web extension development practices.

## Technology Stack
- **Runtime**: Deno
- **Language**: TypeScript
- **Target**: Chrome Extension (Manifest V3)
- **Build Tool**: Custom Deno script (`build.ts`)
- **Testing**: Deno Test
- **Linting**: Deno Lint
- **Formatting**: Deno Format

## Development Guidelines

### Language and Communication
- **Primary Language**: All code comments, documentation, and communication should be in Japanese (日本語)
- **Code Style**: Follow existing code patterns and conventions consistently

### Architecture and Code Organization
```
src/
├── background.ts       # Chrome extension service worker
├── popup.ts           # Popup UI logic
├── popup.html         # Popup UI structure
├── popup.css          # Popup UI styling
├── types.ts           # TypeScript type definitions
├── manifest.json      # Chrome extension manifest
└── *_test.ts          # Test files
```

### Development Practices

#### Test-Driven Development (TDD)
- Follow t_wada's TDD cycle: Red → Green → Refactor
- Write tests before implementing new features
- Ensure all code changes are covered by relevant tests
- Run tests frequently: `deno task test`

#### YAGNI Principle
- "You Ain't Gonna Need It" - Don't implement features that aren't currently needed
- Focus on current requirements and avoid over-engineering

#### Small Steps (Baby Steps)
- Make incremental changes and commit frequently
- Ask for feedback early and often
- Break down large tasks into smaller, manageable pieces

### Code Quality Standards

#### Type Safety
- Use strict TypeScript settings
- Provide proper type annotations for all functions and interfaces
- Leverage Chrome extension types from `@types/chrome`

#### Chrome Extension Specific
- Follow Manifest V3 standards
- Use proper Chrome APIs for tabs and storage
- Handle asynchronous operations correctly with Chrome APIs
- Respect Chrome extension security policies

### Build and Test Commands
```bash
deno task build    # Build the extension
deno task test     # Run tests
deno task lint     # Lint code
deno task fmt      # Format code
deno task all      # Run build, format, lint, and test
```

### File Naming Conventions
- Use snake_case for test files: `*_test.ts`
- Use camelCase for regular TypeScript files
- Keep file names descriptive and concise

### Chrome Extension Specific Guidelines

#### Background Scripts
- Use service workers (background.js)
- Handle Chrome runtime events properly
- Manage storage operations efficiently

#### Popup Interface
- Keep UI lightweight and responsive
- Use proper DOM manipulation
- Handle Chrome storage changes reactively

#### Storage Management
- Use Chrome storage API appropriately
- Handle storage errors gracefully
- Implement proper data migration if needed

### Testing Strategy
- Unit tests for core logic functions
- Mock Chrome APIs in tests
- Test UI update functions independently
- Ensure tests are fast and reliable

### Code Review Guidelines
- Review code for type safety
- Check Chrome extension compliance
- Verify test coverage
- Ensure Japanese comments are clear and helpful

### Common Patterns in This Project

#### Storage Data Structure
```typescript
interface StorageData {
  dailyStats?: DailyStats;
  tabCount?: number;
  lastAvailablePreviousDayCount?: number;
}
```

#### Badge Color Logic
- Green: Good state (≤5 tabs, improvement from previous day, at daily low)
- Red: Warning state (high tab count)

#### Daily Statistics Tracking
- Track high/low tab counts per day
- Maintain previous day's final count
- Reset stats on date change

### Specific Implementation Notes
- Use `chrome.storage.local` for persistence
- Update badge color based on tab count and historical data
- Handle tab count changes reactively
- Maintain proper date formatting (ISO format: 'sv-SE')

### Dependencies and Imports
- Use Deno standard library: `std/`
- Chrome types: `@types/chrome`
- Bundle tool: `deno_emit`
- Assertions: `assert/`

When contributing to this project, always consider the user experience of Japanese Chrome users and maintain the existing code quality standards.