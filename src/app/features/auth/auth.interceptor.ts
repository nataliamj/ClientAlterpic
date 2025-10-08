import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  
  console.log('🛡️ === INTERCEPTOR ACTIVADO ===');
  console.log('🛡️ URL interceptada:', req.url);
  console.log('🛡️ Método:', req.method);
  console.log('🛡️ Token disponible:', !!token);
  
  if (token) {
    console.log('🛡️ Añadiendo Authorization header...');
    console.log('🛡️ Token preview:', token.substring(0, 20) + '...');
    
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('🛡️ Headers finales:', Array.from(cloned.headers.keys()));
    console.log('🛡️ Authorization header:', cloned.headers.get('Authorization')?.substring(0, 30) + '...');
    
    return next(cloned);
  }
  
  console.log('🛡️ ❌ Sin token, enviando request sin auth');
  return next(req);
};