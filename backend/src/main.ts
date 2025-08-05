import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('VENDOR ONBOARDING API')
    .setDescription('API documentation for Vendor Onboarding Platform. A system for LEADWAY to onboard vendors.')
    .setVersion('1.0')
    .addTag('Vendors')
    .addTag('Auth')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
