import type { SharedUser } from '@/shared/types';

export interface SharedRootState {
    auth: {
        user: SharedUser | null;
    };
}
