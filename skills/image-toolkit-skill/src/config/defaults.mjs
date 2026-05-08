/**
 * Shared defaults for CLI and batch (priority: CLI > batch JSON > defaults).
 */
export const defaults = {
  outputDir: './image-toolkit-output',
  quality: 75,
  maxWidth: 1920,
  format: 'original',
  recursive: true,
  overwrite: false,
  strict: false,
  opacity: 0.7,
  margin: 16,
  position: 'bottom-right',
};
