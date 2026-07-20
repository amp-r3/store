import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_TAGS } from './tags';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fakeBaseQuery(),
    tagTypes: API_TAGS,
    endpoints: () => ({}),
});
