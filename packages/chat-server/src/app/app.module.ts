import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

/**
 * The application module of chat-server application.
 * This is the place to add all needed modules and controllers.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          pinoHttp: {
            transport:
              config.get('ENVIRONMENT') === 'development'
                ? {
                    target: 'pino-pretty',
                    options: {
                      ignore: 'pid,hostname',
                      translateTime: false, // Turn off the built-in timestamp translation
                      singleLine: true,
                      colorize: true,
                      messageFormat: '[{context}] {msg}', // Custom format
                    },
                  }
                : null, // Use pino-pretty in development to make logs more readable
            redact: ['req.headers.authorization'], // Remove sensitive token from logs
            timestamp: () => `,"time":"${new Date().toLocaleString()}"`, // Format timestamp
            level: 'trace',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
