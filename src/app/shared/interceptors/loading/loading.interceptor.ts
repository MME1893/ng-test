import { HttpInterceptorFn } from '@angular/common/http';
import { delay, finalize } from 'rxjs/operators';
import { LoadingService } from '../../services/loading/loading.service';
import { inject } from '@angular/core';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const loadingService = inject(LoadingService)
  loadingService.show();
  return next(req).pipe(finalize(() => loadingService.hide()));
};
