import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static configure(app: INestApplication) {
    const options = new DocumentBuilder()
      .setTitle('Provider Api Doc')
      .setVersion('v1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('/api', app, document, {
      customSiteTitle: 'Provider Api Doc',
      swaggerOptions: {
        docExpansion: 'none',
        layout: 'BaseLayout',
        tagsSorter: 'alpha',
      },
    });
  }
}
