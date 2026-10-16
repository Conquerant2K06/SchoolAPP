import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { StudentsListComponent } from './features/admin/students/students-list/students-list.component';
import { TeachersListComponent } from './features/admin/teachers/teachers-list/teachers-list.component';
import { ClassesListComponent } from './features/admin/classes/classes-list/classes-list.component';
import { SubjectsListComponent } from './features/admin/subjects/subjects-list/subjects-list.component';
import { ReportCardsAdminComponent } from './features/admin/report-cards-list/report-cards-admin.component';
import { GradeEntryComponent } from './features/teacher/grade-entry/grade-entry.component';
import { MyGradesComponent } from './features/student/my-grades/my-grades.component';
import { MyReportCardsComponent } from './features/student/my-report-cards/my-report-cards.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'admin/students', component: StudentsListComponent, canActivate: [roleGuard('admin')] },
      { path: 'admin/teachers', component: TeachersListComponent, canActivate: [roleGuard('admin')] },
      { path: 'admin/classes', component: ClassesListComponent, canActivate: [roleGuard('admin')] },
      { path: 'admin/subjects', component: SubjectsListComponent, canActivate: [roleGuard('admin')] },
      { path: 'admin/report-cards', component: ReportCardsAdminComponent, canActivate: [roleGuard('admin')] },
      { path: 'teacher/grades', component: GradeEntryComponent, canActivate: [roleGuard('admin', 'teacher')] },
      { path: 'student/grades', component: MyGradesComponent, canActivate: [roleGuard('admin', 'student')] },
      { path: 'student/report-cards', component: MyReportCardsComponent, canActivate: [roleGuard('admin', 'student')] },
    ],
  },
  { path: '**', redirectTo: '' },
];