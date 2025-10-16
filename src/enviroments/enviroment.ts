export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api/v1',
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
            loteIndividual: '/lote-individual/procesar',
            list: '/images',
            delete: (id: number) => `/images/${id}`
        },
        history: {
            list: '/history/transformations',  
            detail: (id: number) => `/history/transformations/${id}`, 
            delete: (id: number) => `/history/transformations/${id}`  
        }
    }
};