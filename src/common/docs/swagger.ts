import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerInit = async (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Event Meeting App')
    .setDescription('The Event Meeting App API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      docExpansion: 'none',
      preloadModels: false,
      tryItOutEnabled: true,
      syntaxHighlight: true,
    },
    customSiteTitle: 'Backend Event Meeting App',
  });
};
