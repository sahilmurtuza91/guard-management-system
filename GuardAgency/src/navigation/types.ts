import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OTPVerification: { userId?: string; identifier?: string };
  ResetPassword: { userId?: string; otp?: string };
  Dashboard: undefined;
  Notifications: undefined;
  RequestsList: undefined;
  RequestDetails: { requestId: string };
  ClarificationScreen: { requestId: string; mode?: 'clarify' | 'reject' };
  AssignGuards: { requestId: string };
  AssignmentReview: { requestId: string; selectedGuards: string[]; selectedGuardDetails?: { id: string; name: string; detail: string }[] };
  AssignmentSuccess: { requestId: string; assignedCount?: number };
  GuardsList: undefined;
  GuardProfile: { guardId: string };
  AddGuard: undefined;
  EditGuard: { guardId: string };
  ClientsList: undefined;
  ClientDetails: { clientId: string };
  SitesList: undefined;
  SiteDetails: { siteId: string };
  ShiftCalendar: undefined;
  AttendanceMonitor: undefined;
  LiveGuardsMap: undefined;
  IncidentsList: undefined;
  IncidentDetails: { incidentId: string };
  ReportsDashboard: undefined;
  ReportDetails: { reportId: string };
  AgencyProfile: undefined;
  EditAgencyProfile: undefined;
  TeamMembers: undefined;
  RolesPermissions: undefined;
  NotificationSettings: undefined;
  HelpSupport: undefined;
  MainTabs: undefined;
  AvailabilityCalendar: { guardId: string };
  GuardDocuments: { guardId: string; fromAddGuard?: boolean }; 
  GuardAttendance: { guardId: string };
  ShiftHistory: { guardId: string };
  AddEditSite: { siteId?: string } | undefined;
  SiteMapGeofence: { siteId: string };
  ShiftsList: undefined;
  CreateShift: undefined;
  ShiftDetails: { shiftId: string };
  EditCancelShift: { shiftId: string };
  AttendanceMonitoring: undefined;
  IncidentReports: undefined;
};

export type BottomTabParamList = {
  DashboardTab: undefined;
  RequestsTab: undefined;
  GuardsTab: undefined;
  OperationsTab: undefined;
  ProfileTab: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;