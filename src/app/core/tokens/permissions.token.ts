import { InjectionToken } from '@angular/core';

/**
 * Feature modules contribute permission strings here so core PermissionService stays generic.
 */
export const FEATURE_PERMISSIONS = new InjectionToken<ReadonlyArray<string>>('FEATURE_PERMISSIONS');
