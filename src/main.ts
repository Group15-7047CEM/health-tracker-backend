import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { SequelizeExceptionFilter } from './common/exception-filters/sequelize.exception-filter';




// Sequlize Options Declarative Merging
// Refer: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
declare module "sequelize" { interface CreateOptions { authUserId?: any; } interface UpdateOptions { authUserId?: any; } interface SaveOptions{ authUserId?: any; } interface FindOrCreateOptions{ authUserId?: any} }



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  // const adminConfig: ServiceAccount = {
  //   projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
  //   privateKey: configService
  //     .get<string>('FIREBASE_PRIVATE_KEY')
  //     .replace(/\\n/g, '\n'),
  //   clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  // };

  // admin.initializeApp({
  //   credential: admin.credential.cert(adminConfig),
  //   databaseURL: 'https://singer-318606.firebaseio.com',
  // });

  app.use(helmet()); // https://github.com/helmetjs/helmet#how-it-works
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // CORS whitelist
  const whitelist = [
    undefined, // For serving Backend API Docs
    'http://localhost:3000', // For frontend development
    'http://localhost:4200', // For frontend development
    'http://localhost:8080',
    'https://health-tracker-group15.herokuapp.com/',
    configService.get<string>('FRONTEND_BASE_URL'),
    configService.get<string>('BACKEND_BASE_URL'),
  ];
  app.enableCors({
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        // console.log("allowed cors for:", origin)
        callback(null, true);
      } else {
        // console.log("blocked cors for:", origin)
        callback(new Error('Not allowed by CORS'));
      }
    },
    // allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS,PATCH',
    credentials: true,
  });
  
  app.useGlobalFilters(new SequelizeExceptionFilter());
  app.setGlobalPrefix(`api`);

  await app.listen(process.env.PORT || 4000); // For Cloud Run
  // await app.listen(parseInt(process.env.PORT, "0.0.0.0") || 3000);
}
bootstrap();
