export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    endpoints: {
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            logout: '/auth/logout'
        },
        users: {
            profile: '/users/profile',
            update: '/users/update'
        },
        images: {
            upload: '/images/upload',
            transform: '/images/transform',
            download: '/images/download',
            list: '/images',
            delete: (id: number) => `/images/${id}`
        },
        history: {
            list: '/history',
            download: (id: number) => `/history/${id}/download`
        }
    }
};