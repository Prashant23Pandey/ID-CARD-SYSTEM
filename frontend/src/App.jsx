import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, ROLES } from './constants';
import { useAuth } from './hooks/useAuth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Routes & Guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// School Module Pages
import SchoolList from './pages/school/SchoolList';
import CreateSchool from './pages/school/CreateSchool';
import EditSchool from './pages/school/EditSchool';
import SchoolDetails from './pages/school/SchoolDetails';
import AssignSchoolAdmin from './pages/school/AssignSchoolAdmin';
import SchoolSettings from './pages/school/SchoolSettings';

// Student Module Pages
import StudentList from './pages/student/StudentList';
import CreateStudent from './pages/student/CreateStudent';
import EditStudent from './pages/student/EditStudent';
import StudentProfile from './pages/student/StudentProfile';

// Teacher Pages
import TeacherList from './pages/teacher/TeacherList';
import CreateTeacher from './pages/teacher/CreateTeacher';
import EditTeacher from './pages/teacher/EditTeacher';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TemplateList from './pages/template/TemplateList';
import TemplateDesigner from './pages/template/TemplateDesigner';
import TemplateDetails from './pages/template/TemplateDetails';
import TemplateVersions from './pages/template/TemplateVersions';
import TemplatePreview from './pages/template/TemplatePreview';

const App = () => {
  const { isAuthenticated, role } = useAuth();

  // Root redirect logic based on auth status
  const getRootRedirect = () => {
    if (!isAuthenticated) return ROUTES.LOGIN;
    if (role === ROLES.SUPERADMIN) return ROUTES.SUPERADMIN_DASHBOARD;
    if (role === ROLES.SCHOOLADMIN) return ROUTES.SCHOOLADMIN_DASHBOARD;
    if (role === ROLES.TEACHER) return ROUTES.TEACHER_DASHBOARD;
    return ROUTES.LOGIN;
  };

  return (
    <Router>
      <Routes>
        {/* Public / Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            
            {/* Superadmin Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SUPERADMIN]} />}>
              <Route path={ROUTES.SUPERADMIN_DASHBOARD} element={<Dashboard />} />
              
              {/* School Management */}
              <Route path={ROUTES.SCHOOLS} element={<SchoolList />} />
              <Route path={ROUTES.SCHOOL_CREATE} element={<CreateSchool />} />
              <Route path={ROUTES.SCHOOL_DETAILS} element={<SchoolDetails />} />
              <Route path={ROUTES.SCHOOL_EDIT} element={<EditSchool />} />
              <Route path={ROUTES.SCHOOL_ASSIGN_ADMIN} element={<AssignSchoolAdmin />} />
              <Route path={ROUTES.SCHOOL_SETTINGS} element={<SchoolSettings />} />
            </Route>

            {/* Schooladmin Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SCHOOLADMIN]} />}>
              <Route path={ROUTES.SCHOOLADMIN_DASHBOARD} element={<Dashboard />} />
              
              {/* Student Management */}
              <Route path={ROUTES.STUDENTS} element={<StudentList />} />
              <Route path={ROUTES.STUDENT_CREATE} element={<CreateStudent />} />
              <Route path={ROUTES.STUDENT_DETAILS} element={<StudentProfile />} />
              <Route path={ROUTES.STUDENT_EDIT} element={<EditStudent />} />

              {/* Teacher Routes */}
              <Route path={ROUTES.TEACHERS} element={<TeacherList />} />
              <Route path={ROUTES.TEACHER_CREATE} element={<CreateTeacher />} />
              <Route path={ROUTES.TEACHER_DETAILS} element={<TeacherProfile />} />
              <Route path={ROUTES.TEACHER_EDIT} element={<EditTeacher />} />
              <Route path={ROUTES.TEMPLATE_LIST} element={<TemplateList />} />
              <Route path={ROUTES.TEMPLATE_DESIGNER_CREATE} element={<TemplateDesigner />} />
              <Route path={ROUTES.TEMPLATE_DESIGNER_EDIT} element={<TemplateDesigner />} />
              <Route path={ROUTES.TEMPLATE_DETAILS} element={<TemplateDetails />} />
              <Route path={ROUTES.TEMPLATE_VERSIONS} element={<TemplateVersions />} />
              <Route path={ROUTES.TEMPLATE_PREVIEW} element={<TemplatePreview />} />
            </Route>

            {/* Teacher Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
              <Route path={ROUTES.TEACHER_DASHBOARD} element={<Dashboard />} />
              {/* Add more teacher specific routes here */}
            </Route>

            {/* Shared Authenticated Routes */}
            <Route path={ROUTES.PROFILE} element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback / Root Route */}
        <Route path="/" element={<Navigate to={getRootRedirect()} replace />} />
        <Route path="*" element={<Navigate to={getRootRedirect()} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
