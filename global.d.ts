// Temporary global type overrides during unification process
// This file should be removed once proper types are implemented

declare global {
  // Extend unknown to allow property access (temporary workaround)
  interface Unknown {
    [key: string]: any;
  }
}

// This enables the file to be treated as a module
export {};