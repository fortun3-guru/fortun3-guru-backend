import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        this.logger.error(
          `Error occurred during request method ${request.method} to ${request.url}`,
          err.stack,
        );

        if (err instanceof HttpException) {
          // Handle HttpExceptions (e.g., 404, 500, etc.)
          return throwError(
            () => new HttpException(err.getResponse(), err.getStatus()),
          );
        } else {
          // Handle other exceptions
          return throwError(() => new BadGatewayException());
        }
      }),
    );
  }
}
