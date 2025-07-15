# Refactor Checkup

- Extracted file management logic from `ClientFilesTab` into new hook `useClientFiles`.
- Moved file list UI into new component `ClientFilesList`.
- Added type definition `FileMetadata` in `src/types/file.ts`.