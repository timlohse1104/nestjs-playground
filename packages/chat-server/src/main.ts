import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { ChatServerModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

class ChatServer {
  private app?: INestApplication;
  private serverPort?: string;
  private serverAddress?: string;
  private globalPrefix?: string;

  /**
   * Bootstrap the server application.
   */
  async bootstrap() {
    await this.setupApplication();
    this.configureApplication();
    this.setupOpenAPI();
    await this.startServer();
  }

  /**
   * Setup the server application. Configure the logger and app settings like
   * the global app prefix and enable the endpoint data validation.
   *
   * @private
   */
  private async setupApplication() {
    this.app = await NestFactory.create(ChatServerModule);
    this.app.setGlobalPrefix(this.globalPrefix);
    this.app.useLogger(['error', 'warn', 'log', 'debug']);
    this.app.enableCors();
  }

  /**
   * Load needed configuration values.
   *
   * @private
   */
  private configureApplication() {
    this.serverPort = this.getConfigString('SERVER_PORT');
    this.serverAddress = this.getConfigString('SERVER_ADDRESS');
    this.globalPrefix = this.getConfigString('SERVER_GLOBAL_PREFIX');
  }

  /**
   * Get configuration values from the loaded config files.
   *
   * @param name Name of the configuration.
   * @private
   */
  private getConfigString(name: string): string {
    const configService = this.app.get(ConfigService);
    const value = configService.get<string>(name);

    console.log(`${name}`, value);
    console.log(`${name}`, typeof value);
    console.log(`process ${name}`, process.env.SERVER_PORT);

    if (typeof value === 'string') {
      return value;
    }

    throw new TypeError(`Configuration <${name}> must be of type string`);
  }

  /**
   * Setup the basic OpenAPI documentation entries.
   *
   * @private
   */
  private setupOpenAPI() {
    const config = new DocumentBuilder()
      .setTitle('Chat Server')
      .setDescription('The Chat Server endpoint.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    SwaggerModule.setup(
      this.globalPrefix,
      this.app,
      SwaggerModule.createDocument(this.app, config)
    );
  }

  /**
   * Start the RestAPI HTTP server.
   *
   * @private
   */
  private async startServer() {
    await this.app.listen(this.serverPort, this.serverAddress, () => {
      Logger.log(
        `🚀 Application is running on: http://${this.serverAddress}:${this.serverPort}/${this.globalPrefix}`,
        ChatServer.name
      );
    });
  }
}

new ChatServer()
  .bootstrap()
  .catch((error) => Logger.error(error, error.stack, ChatServer.name));
