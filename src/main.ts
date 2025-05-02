import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import * as cookieParser from 'cookie-parser';
import { swaggerInit } from './common/docs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      validateCustomDecorators: true,
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  await swaggerInit(app);

  await app.listen(port, '0.0.0.0', async () => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  });
}

bootstrap();
