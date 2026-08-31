import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ZodValidationPipe } from 'nestjs-zod';
import "dotenv/config";
import { HttpExceptionFilter } from './common/filters/HttpExceptionFilter.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
