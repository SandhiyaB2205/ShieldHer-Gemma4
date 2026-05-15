// In-memory data store for prototype
// This simulates a database for the demo/prototype
// In production, replace with a proper database like Supabase, Neon, or Postgres

import type { 
  User, 
  EmergencyContact, 
  Report, 
  SOSLog, 
  Trip, 
  SafetyScore 
} from '@/types';

interface DataStore {
  users: Map<number, User & { password_hash: string }>;
  emergencyContacts: Map<number, EmergencyContact>;
  reports: Map<number, Report>;
  sosLogs: Map<number, SOSLog>;
  trips: Map<number, Trip>;
  safetyScores: Map<string, SafetyScore>; // key is "lat,lng"
  counters: {
    users: number;
    emergencyContacts: number;
    reports: number;
    sosLogs: number;
    trips: number;
    safetyScores: number;
  };
}

// Global store (persists during server lifetime)
const globalStore: DataStore = {
  users: new Map(),
  emergencyContacts: new Map(),
  reports: new Map(),
  sosLogs: new Map(),
  trips: new Map(),
  safetyScores: new Map(),
  counters: {
    users: 0,
    emergencyContacts: 0,
    reports: 0,
    sosLogs: 0,
    trips: 0,
    safetyScores: 0
  }
};

// Seed with demo data
function seedDemoData() {
  if (globalStore.users.size === 0) {
    // Add demo user (password: demo123)
    const demoUser = {
      id: 1,
      name: 'Sarah Johnson',
      email: 'demo@shieldher.app',
      phone: '+1234567890',
      password_hash: '$2a$10$rQnM1pN7K5TQd2q8C8XoTu4H5cYvP7fKjLmN9oR3sT6uV0wX1yZ2a', // demo123
      created_at: new Date().toISOString()
    };
    globalStore.users.set(1, demoUser);
    globalStore.counters.users = 1;

    // Add demo emergency contacts
    const contacts: (EmergencyContact & { id: number })[] = [
      { id: 1, user_id: 1, name: 'Mom', phone: '+1987654321', email: 'mom@example.com', relation: 'Parent' },
      { id: 2, user_id: 1, name: 'Best Friend', phone: '+1122334455', email: 'friend@example.com', relation: 'Friend' },
      { id: 3, user_id: 1, name: 'Local Police', phone: '911', email: '', relation: 'Emergency Service' }
    ];
    contacts.forEach(c => globalStore.emergencyContacts.set(c.id, c));
    globalStore.counters.emergencyContacts = 3;

    // Add demo reports
    const reports: (Report & { id: number })[] = [
      {
        id: 1,
        user_id: 1,
        latitude: 40.7128,
        longitude: -74.006,
        incident_type: 'poor_lighting',
        description: 'Dark alley with broken street lights near parking garage',
        photo_url: null,
        ai_validated: true,
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 2,
        user_id: 1,
        latitude: 40.7138,
        longitude: -74.008,
        incident_type: 'harassment',
        description: 'Group of people catcalling near subway entrance',
        photo_url: null,
        ai_validated: true,
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 3,
        user_id: 1,
        latitude: 40.7148,
        longitude: -74.004,
        incident_type: 'unsafe_area',
        description: 'Abandoned building with suspicious activity',
        photo_url: null,
        ai_validated: false,
        created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      }
    ];
    reports.forEach(r => globalStore.reports.set(r.id, r));
    globalStore.counters.reports = 3;
  }
}

// Initialize with demo data
seedDemoData();

export const db = {
  // Users
  users: {
    findByEmail(email: string) {
      for (const user of globalStore.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    },
    
    findById(id: number): User | null {
      const user = globalStore.users.get(id);
      if (!user) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...safeUser } = user;
      return safeUser;
    },
    
    findByIdWithPassword(id: number) {
      return globalStore.users.get(id) || null;
    },
    
    create(data: { name: string; email: string; phone: string; password_hash: string }): User {
      const id = ++globalStore.counters.users;
      const user = {
        id,
        ...data,
        created_at: new Date().toISOString()
      };
      globalStore.users.set(id, user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  // Emergency Contacts
  emergencyContacts: {
    findByUserId(userId: number): EmergencyContact[] {
      const contacts: EmergencyContact[] = [];
      for (const contact of globalStore.emergencyContacts.values()) {
        if (contact.user_id === userId) contacts.push(contact);
      }
      return contacts;
    },
    
    create(data: Omit<EmergencyContact, 'id'>): EmergencyContact {
      const id = ++globalStore.counters.emergencyContacts;
      const contact = { id, ...data };
      globalStore.emergencyContacts.set(id, contact);
      return contact;
    },
    
    delete(id: number, userId: number): boolean {
      const contact = globalStore.emergencyContacts.get(id);
      if (contact && contact.user_id === userId) {
        globalStore.emergencyContacts.delete(id);
        return true;
      }
      return false;
    }
  },

  // Reports
  reports: {
    findAll(limit = 50): Report[] {
      const reports = Array.from(globalStore.reports.values());
      return reports
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    },
    
    findByUserId(userId: number): Report[] {
      const reports: Report[] = [];
      for (const report of globalStore.reports.values()) {
        if (report.user_id === userId) reports.push(report);
      }
      return reports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    findNearby(lat: number, lng: number, radiusKm = 5): Report[] {
      const reports: Report[] = [];
      for (const report of globalStore.reports.values()) {
        const distance = haversineDistance(lat, lng, report.latitude, report.longitude);
        if (distance <= radiusKm) reports.push(report);
      }
      return reports;
    },
    
    create(data: Omit<Report, 'id' | 'created_at'>): Report {
      const id = ++globalStore.counters.reports;
      const report = { 
        id, 
        ...data, 
        created_at: new Date().toISOString() 
      };
      globalStore.reports.set(id, report);
      return report;
    }
  },

  // SOS Logs
  sosLogs: {
    findByUserId(userId: number): SOSLog[] {
      const logs: SOSLog[] = [];
      for (const log of globalStore.sosLogs.values()) {
        if (log.user_id === userId) logs.push(log);
      }
      return logs.sort((a, b) => 
        new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
      );
    },
    
    create(data: Omit<SOSLog, 'id' | 'triggered_at'>): SOSLog {
      const id = ++globalStore.counters.sosLogs;
      const log = { 
        id, 
        ...data, 
        triggered_at: new Date().toISOString() 
      };
      globalStore.sosLogs.set(id, log);
      return log;
    },
    
    update(id: number, data: Partial<SOSLog>): SOSLog | null {
      const log = globalStore.sosLogs.get(id);
      if (!log) return null;
      const updated = { ...log, ...data };
      globalStore.sosLogs.set(id, updated);
      return updated;
    }
  },

  // Trips
  trips: {
    findActiveByUserId(userId: number): Trip | null {
      for (const trip of globalStore.trips.values()) {
        if (trip.user_id === userId && trip.status === 'active') {
          return trip;
        }
      }
      return null;
    },
    
    create(data: Omit<Trip, 'id'>): Trip {
      const id = ++globalStore.counters.trips;
      const trip = { id, ...data };
      globalStore.trips.set(id, trip);
      return trip;
    },
    
    update(id: number, data: Partial<Trip>): Trip | null {
      const trip = globalStore.trips.get(id);
      if (!trip) return null;
      const updated = { ...trip, ...data };
      globalStore.trips.set(id, updated);
      return updated;
    }
  },

  // Safety Scores
  safetyScores: {
    findByLocation(lat: number, lng: number): SafetyScore | null {
      // Round to 3 decimal places for caching
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      return globalStore.safetyScores.get(key) || null;
    },
    
    upsert(data: Omit<SafetyScore, 'id' | 'updated_at'>): SafetyScore {
      const key = `${data.latitude.toFixed(3)},${data.longitude.toFixed(3)}`;
      const existing = globalStore.safetyScores.get(key);
      
      const score: SafetyScore = {
        id: existing?.id || ++globalStore.counters.safetyScores,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      globalStore.safetyScores.set(key, score);
      return score;
    }
  }
};

// Haversine formula for distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default db;
