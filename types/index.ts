// User types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// Emergency contact types
export interface EmergencyContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

// Safety score types
export interface SafetyScore {
  id: number;
  latitude: number;
  longitude: number;
  risk_score: number;
  confidence: number;
  ai_reasoning: string;
  updated_at: string;
}

// Report types
export type IncidentType = 
  | 'harassment'
  | 'theft'
  | 'assault'
  | 'stalking'
  | 'unsafe_area'
  | 'poor_lighting'
  | 'other';

export interface Report {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  description: string;
  photo_url: string | null;
  ai_validated: boolean;
  created_at: string;
}

// Trip types
export type TripStatus = 'active' | 'completed' | 'cancelled' | 'emergency';

export interface Trip {
  id: number;
  user_id: number;
  origin: string;
  destination: string;
  route_data: string; // JSON string
  started_at: string;
  ended_at: string | null;
  status: TripStatus;
}

// SOS types
export type SOSStatus = 'triggered' | 'acknowledged' | 'resolved' | 'false_alarm';

export interface SOSLog {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  triggered_at: string;
  audio_url: string | null;
  video_url: string | null;
  status: SOSStatus;
}

// Media evidence types
export type MediaType = 'audio' | 'video' | 'photo';

export interface MediaEvidence {
  id: number;
  sos_id: number;
  type: MediaType;
  url: string;
  uploaded_at: string;
}

// API Request/Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SafeRouteRequest {
  origin: string;
  destination: string;
  time?: string;
}

export interface RouteOption {
  name: string;
  safety_percent: number;
  danger_score: number;
  color: 'green' | 'yellow' | 'red';
  reasoning: string;
  polyline?: string;
  duration?: string;
  distance?: string;
  steps?: string[];
}

export interface SafeRouteResponse {
  routes: RouteOption[];
}

export interface TriggerSOSRequest {
  latitude: number;
  longitude: number;
  audioUrl?: string;
  videoUrl?: string;
}

export interface TriggerSOSResponse {
  success: boolean;
  sosId: number;
  contactsNotified: number;
}

export interface CommunityReportRequest {
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  description: string;
  photo?: string;
}

export interface CommunityReportResponse {
  report: Report;
  ai_validated: boolean;
}

export interface LiveLocationRequest {
  latitude: number;
  longitude: number;
  tripId?: number;
}

export interface SafetyAlert {
  type: 'danger_zone' | 'route_deviation' | 'stationary_warning';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LiveLocationResponse {
  success: boolean;
  safetyAlert?: SafetyAlert;
}

export interface SafetyScoreResponse {
  risk_score: number;
  confidence: number;
  ai_reasoning: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}
