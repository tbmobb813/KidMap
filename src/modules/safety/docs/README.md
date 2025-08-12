# Safety Module Documentation

## Structure

- **components/**: All UI components related to safety features
- **stores/**: State management for safety (e.g., parentalStore)
- **types/**: Type definitions for safety logic
- **hooks/**: Custom React hooks for safety features
- **utils/**: Utility functions for safety (validation, error handling, etc.)
- ****tests**/**: Unit and integration tests for safety features

## Usage

- Import from the module index files for easier access and encapsulation.
- Example:

  ```ts
  import { useSafeZoneMonitor } from 'src/modules/safety/hooks';
  import { SafeZone } from 'src/modules/safety/types';
  ```

## Migration Notes

- All safety-related files have been moved to this module for maintainability and scalability.
- Old files contain migration notices and should not be used.

## Best Practices

- Use barrel (`index.ts`) files for re-exports.
- Keep types, hooks, utils, and tests modular and encapsulated.
- Document new features and changes here.

## Contributors

- Please update this documentation when adding new features or refactoring.
