// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
        interface Locals {
          // Legacy properties for backward compatibility (will be deprecated)
          user: import("$lib/server/auth").SessionValidationResult["user"];
          session: import("$lib/server/auth").SessionValidationResult["session"];

          // New dual-session properties
          adminUser?: import("$lib/server/auth").SessionValidationResult["user"];
          adminSession?: import("$lib/server/auth").SessionValidationResult["session"];
          clientUser?: any; // Will be properly typed when client auth is implemented
          clientSession?: any; // Will be properly typed when client auth is implemented
        }
    }
}

export {};
