import { memo } from 'react';

import { useMediaQuery } from '@/shared/lib/hooks';

import { AdminSidebar } from './AdminSidebar/AdminSidebar';
import { AdminMobileNav } from './AdminMobileNav/AdminMobileNav';

const MOBILE_QUERY = '(max-width: 768px)';

export const AdminNav = memo(() => {
    const isMobile = useMediaQuery(MOBILE_QUERY);

    return isMobile ? <AdminMobileNav /> : <AdminSidebar />;
});

AdminNav.displayName = 'AdminNav';
