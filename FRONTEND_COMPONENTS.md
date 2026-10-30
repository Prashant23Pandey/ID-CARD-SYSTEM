# Frontend Components Documentation

## Overview

This document describes all React components used in the Multischool ID Card System frontend application.

## Project Structure

```
frontend/src/
├── components/
│   ├── sessions/
│   │   ├── CreateSessionForm.jsx
│   │   ├── SessionTable.jsx
│   │   ├── SessionStatistics.jsx
│   │   ├── SessionFilters.jsx
│   │   └── SessionCard.jsx
│   ├── promotions/
│   │   ├── PromotionWizard.jsx
│   │   ├── PromotionHistoryTable.jsx
│   │   ├── PromotionPreview.jsx
│   │   ├── RollbackConfirmation.jsx
│   │   └── PromotionReport.jsx
│   ├── common/
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorAlert.jsx
│   │   ├── SuccessAlert.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── SearchBar.jsx
│   └── layouts/
│       ├── MainLayout.jsx
│       ├── Header.jsx
│       └── Sidebar.jsx
├── pages/
│   ├── SessionDashboard.jsx
│   ├── SessionManagement.jsx
│   ├── PromotionCenter.jsx
│   ├── PromotionHistory.jsx
│   ├── PromotionReports.jsx
│   └── NotFound.jsx
├── features/
│   ├── sessionSlice.js
│   └── promotionSlice.js
├── services/
│   ├── sessionService.js
│   └── promotionService.js
├── hooks/
│   ├── useSession.js
│   ├── usePromotion.js
│   ├── useNotification.js
│   └── useAuth.js
└── store.js
```

---

## Session Components

### CreateSessionForm.jsx

**Purpose:** Form component for creating or editing academic sessions

**Props:**
```typescript
interface Props {
  sessionId?: string;           // Optional: Edit mode
  initialData?: SessionData;    // Pre-filled form data
  onSubmit: (data: SessionData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Validates session name (3-50 chars)
- Validates session code uniqueness
- Date picker for start/end dates
- Overlap detection
- Academic year format validation

**Usage:**
```jsx
import CreateSessionForm from '@/components/sessions/CreateSessionForm';

function MyComponent() {
  const handleSubmit = async (data) => {
    await sessionService.createSession(data);
  };

  return (
    <CreateSessionForm
      onSubmit={handleSubmit}
      onCancel={() => setOpen(false)}
    />
  );
}
```

---

### SessionTable.jsx

**Purpose:** Display sessions in a table with pagination and actions

**Props:**
```typescript
interface Props {
  sessions: Session[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onActivate: (sessionId: string) => void;
  onArchive: (sessionId: string) => void;
}
```

**Features:**
- Sortable columns
- Pagination controls
- Row actions (Edit, Delete, Activate, Archive)
- Status badges
- Loading state

**Usage:**
```jsx
import SessionTable from '@/components/sessions/SessionTable';

function SessionManagement() {
  const { sessions, pagination, loading } = useSelector(selectSessions);
  const dispatch = useDispatch();

  return (
    <SessionTable
      sessions={sessions}
      total={pagination.total}
      page={pagination.page}
      limit={pagination.limit}
      loading={loading}
      onPageChange={(page) => dispatch(fetchSessions({ page }))}
      onEdit={(session) => setEditSession(session)}
      onDelete={(id) => dispatch(deleteSession(id))}
      onActivate={(id) => dispatch(activateSession(id))}
      onArchive={(id) => dispatch(archiveSession(id))}
    />
  );
}
```

---

### SessionStatistics.jsx

**Purpose:** Display session statistics in card format

**Props:**
```typescript
interface Props {
  statistics: {
    totalSessions: number;
    activeSessions: number;
    plannedSessions: number;
    archivedSessions: number;
  };
  loading?: boolean;
}
```

**Features:**
- Four statistics cards
- Loading skeleton
- Color-coded badges
- Responsive layout

**Usage:**
```jsx
import SessionStatistics from '@/components/sessions/SessionStatistics';

function Dashboard() {
  const { statistics, loading } = useSelector(selectStatistics);

  return <SessionStatistics statistics={statistics} loading={loading} />;
}
```

---

### SessionFilters.jsx

**Purpose:** Filter panel for session search and filtering

**Props:**
```typescript
interface Props {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onReset: () => void;
}

interface FilterParams {
  status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  academicYear?: string;
  search?: string;
  isArchived?: boolean;
  dateRange?: [Date, Date];
}
```

**Features:**
- Status filter dropdown
- Academic year input
- Search box
- Date range picker
- Reset button

**Usage:**
```jsx
import SessionFilters from '@/components/sessions/SessionFilters';

function SessionManagement() {
  const [filters, setFilters] = useState({});

  return (
    <SessionFilters
      filters={filters}
      onFilterChange={(newFilters) => {
        setFilters(newFilters);
        dispatch(fetchSessions(newFilters));
      }}
      onReset={() => {
        setFilters({});
        dispatch(resetFilter());
      }}
    />
  );
}
```

---

### SessionCard.jsx

**Purpose:** Individual session card component

**Props:**
```typescript
interface Props {
  session: Session;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
}
```

**Features:**
- Session summary
- Status indicator
- Quick action buttons
- Hover effects

---

## Promotion Components

### PromotionWizard.jsx

**Purpose:** Multi-step wizard for student promotion

**Props:**
```typescript
interface Props {
  type: 'STUDENT' | 'BULK' | 'CLASS' | 'SCHOOL';
  onComplete: (promotionData: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Step-by-step workflow
- Form validation at each step
- Progress indicator
- Preview before submission

**Usage:**
```jsx
import PromotionWizard from '@/components/promotions/PromotionWizard';

function PromotionCenter() {
  const [showWizard, setShowWizard] = useState(false);

  const handleComplete = async (data) => {
    await promotionService.promoteStudent(data);
    setShowWizard(false);
  };

  return (
    <>
      <button onClick={() => setShowWizard(true)}>
        Start Promotion
      </button>
      {showWizard && (
        <PromotionWizard
          type="STUDENT"
          onComplete={handleComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </>
  );
}
```

---

### PromotionHistoryTable.jsx

**Purpose:** Display promotion history with filtering

**Props:**
```typescript
interface Props {
  promotions: PromotionHistory[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onView: (promotion: PromotionHistory) => void;
  onRollback: (promotionId: string) => void;
}
```

**Features:**
- Pagination
- Status filters
- Search by student name
- Rollback action
- View details modal

**Usage:**
```jsx
import PromotionHistoryTable from '@/components/promotions/PromotionHistoryTable';

function PromotionHistory() {
  const { history, pagination, loading } = useSelector(selectHistory);
  const dispatch = useDispatch();

  return (
    <PromotionHistoryTable
      promotions={history}
      total={pagination.total}
      page={pagination.page}
      limit={pagination.limit}
      loading={loading}
      onPageChange={(page) => dispatch(fetchHistory({ page }))}
      onRollback={(id) => dispatch(rollbackPromotion(id))}
    />
  );
}
```

---

### PromotionPreview.jsx

**Purpose:** Preview students before promotion

**Props:**
```typescript
interface Props {
  students: Student[];
  fromClass: Class;
  toClass: Class;
  fromSession: Session;
  toSession: Session;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Student list preview
- Validation checks display
- Warnings for potential issues
- Estimated impact stats

**Usage:**
```jsx
import PromotionPreview from '@/components/promotions/PromotionPreview';

function PromotionWizard() {
  return (
    <PromotionPreview
      students={previewStudents}
      fromClass={selectedFromClass}
      toClass={selectedToClass}
      fromSession={fromSession}
      toSession={toSession}
      onConfirm={handlePromotion}
      onCancel={handleCancel}
    />
  );
}
```

---

### RollbackConfirmation.jsx

**Purpose:** Confirmation dialog for promotion rollback

**Props:**
```typescript
interface Props {
  promotion: PromotionHistory;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Features:**
- Show promotion details
- Reason input field
- Confirmation buttons
- Loading state

**Usage:**
```jsx
import RollbackConfirmation from '@/components/promotions/RollbackConfirmation';

function PromotionHistory() {
  const [rollbackData, setRollbackData] = useState(null);

  const handleRollback = async (reason) => {
    await promotionService.rollbackPromotion(rollbackData.id, reason);
    setRollbackData(null);
  };

  return (
    <RollbackConfirmation
      promotion={rollbackData}
      onConfirm={handleRollback}
      onCancel={() => setRollbackData(null)}
    />
  );
}
```

---

### PromotionReport.jsx

**Purpose:** Display promotion reports with analytics

**Props:**
```typescript
interface Props {
  report: PromotionReport;
  reportType: 'SUMMARY' | 'DETAILED' | 'BY_CLASS';
  loading?: boolean;
  onExport: () => void;
}
```

**Features:**
- Report type selection
- Statistics charts
- Export to PDF/Excel
- Drill-down capabilities

---

## Common Components

### LoadingSpinner.jsx

**Purpose:** Show loading indicator

**Props:**
```typescript
interface Props {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
}
```

**Usage:**
```jsx
<LoadingSpinner loading={isLoading} message="Loading sessions..." />
```

---

### ErrorAlert.jsx

**Purpose:** Display error messages

**Props:**
```typescript
interface Props {
  error: string | Error;
  onDismiss?: () => void;
  autoClose?: boolean;
}
```

**Usage:**
```jsx
<ErrorAlert error={error} onDismiss={() => dispatch(clearError())} />
```

---

### ConfirmDialog.jsx

**Purpose:** Confirmation dialog

**Props:**
```typescript
interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Usage:**
```jsx
<ConfirmDialog
  open={openConfirm}
  title="Delete Session"
  message="Are you sure you want to delete this session?"
  onConfirm={() => handleDelete()}
  onCancel={() => setOpenConfirm(false)}
/>
```

---

## Custom Hooks

### useSession()

**Purpose:** Hook for session operations

**Returns:**
```typescript
{
  sessions: Session[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchSessions: (filters?: any) => Promise<void>;
  createSession: (data: SessionData) => Promise<void>;
  updateSession: (id: string, data: SessionData) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  activateSession: (id: string) => Promise<void>;
  archiveSession: (id: string) => Promise<void>;
}
```

**Usage:**
```jsx
function SessionManagement() {
  const { sessions, loading, fetchSessions } = useSession();

  useEffect(() => {
    fetchSessions();
  }, []);

  return <SessionTable sessions={sessions} loading={loading} />;
}
```

---

### usePromotion()

**Purpose:** Hook for promotion operations

**Returns:**
```typescript
{
  history: PromotionHistory[];
  preview: PreviewData;
  report: ReportData;
  loading: boolean;
  error: string | null;
  fetchHistory: (filters?: any) => Promise<void>;
  promoteStudent: (data: any) => Promise<void>;
  bulkPromote: (data: any) => Promise<void>;
  rollback: (promotionId: string, reason: string) => Promise<void>;
  getPreview: (filters: any) => Promise<void>;
  getReport: (filters: any) => Promise<void>;
}
```

---

### useNotification()

**Purpose:** Hook for notifications

**Returns:**
```typescript
{
  notify: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  clearNotification: () => void;
}
```

---

## State Management (Redux)

### sessionSlice.js

**State Structure:**
```typescript
{
  sessions: Session[];
  currentSession: Session | null;
  dashboard: DashboardData;
  statistics: Statistics;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  filter: FilterParams;
}
```

**Selectors:**
```jsx
selectSessions          // Get all sessions
selectCurrentSession    // Get current session
selectDashboard         // Get dashboard data
selectStatistics        // Get statistics
selectPagination        // Get pagination info
selectLoading           // Get loading state
selectError             // Get error state
selectFilter            // Get current filters
```

---

### promotionSlice.js

**State Structure:**
```typescript
{
  history: PromotionHistory[];
  studentHistory: PromotionHistory[];
  preview: PreviewData;
  report: ReportData;
  currentPromotion: PromotionHistory | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  filter: FilterParams;
}
```

**Selectors:**
```jsx
selectHistory              // Get promotion history
selectStudentHistory       // Get specific student history
selectPreview              // Get preview data
selectReport               // Get report data
selectPagination           // Get pagination
selectLoading              // Get loading state
selectError                // Get error state
```

---

## Best Practices

### Performance Optimization

1. **Memoization**
   ```jsx
   const SessionCard = React.memo(({ session, onClick }) => {
     return <div onClick={onClick}>{session.name}</div>;
   });
   ```

2. **Lazy Loading**
   ```jsx
   const PromotionHistory = React.lazy(() => 
     import('./pages/PromotionHistory')
   );
   ```

3. **Pagination**
   - Always implement pagination for large lists
   - Default limit: 10, max: 100

### Form Handling

1. Use React Hook Form for forms
2. Validate on blur and submit
3. Show field-level errors
4. Disable submit button during submission

### Error Handling

1. Always show error alerts
2. Log errors to console in development
3. Show user-friendly messages
4. Provide recovery actions (Retry, Go Back, etc.)

### State Management

1. Keep Redux state normalized
2. Use selectors for accessing state
3. Dispatch actions, not direct state mutations
4. Handle loading and error states

---

## Accessibility

- Use semantic HTML elements
- Add ARIA labels for screen readers
- Ensure keyboard navigation
- Maintain sufficient color contrast
- Provide alt text for images

---

## Testing

```jsx
import { render, screen } from '@testing-library/react';
import SessionTable from '@/components/sessions/SessionTable';

describe('SessionTable', () => {
  test('renders sessions', () => {
    const sessions = [
      {
        _id: '1',
        sessionName: '2024-25',
        status: 'ACTIVE'
      }
    ];

    render(
      <SessionTable
        sessions={sessions}
        total={1}
        page={1}
        limit={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('2024-25')).toBeInTheDocument();
  });
});
```

---

## Further Reading

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material-UI Components](https://mui.com)
- [React Hook Form](https://react-hook-form.com)