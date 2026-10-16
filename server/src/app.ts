import cors from 'cors';
import express, { type Express } from 'express';
import type { AppConfig } from './config.js';
import type { Store } from './db/store.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { adminUsersRouter } from './routes/admin-users.routes.js';
import { assignmentsRouter } from './routes/assignments.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { classesRouter } from './routes/classes.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { gradesRouter } from './routes/grades.routes.js';
import { reportCardsRouter } from './routes/report-cards.routes.js';
import { schoolYearsRouter } from './routes/school-years.routes.js';
import { studentsRouter } from './routes/students.routes.js';
import { subjectsRouter } from './routes/subjects.routes.js';
import { teachersRouter } from './routes/teachers.routes.js';

export interface AppDeps {
  store: Store;
  config: AppConfig;
}

/** Assemble l'application Express à partir du store et de la configuration. */
export function createApp({ store, config }: AppDeps): Express {
  const app = express();

  app.use(
    cors({
      origin: config.frontendOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter({ store, config }));
  app.use('/api/admin/users', adminUsersRouter({ store, config }));
  app.use('/api/classes', classesRouter({ store, config }));
  app.use('/api/subjects', subjectsRouter({ store, config }));
  app.use('/api/school-years', schoolYearsRouter({ store, config }));
  app.use('/api/assignments', assignmentsRouter({ store, config }));
  app.use('/api/students', studentsRouter({ store, config }));
  app.use('/api/teachers', teachersRouter({ store, config }));
  app.use('/api/grades', gradesRouter({ store, config }));
  app.use('/api/report-cards', reportCardsRouter({ store, config }));
  app.use('/api/dashboard', dashboardRouter({ store, config }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
