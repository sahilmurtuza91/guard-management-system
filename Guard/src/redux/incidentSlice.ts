import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IncidentType =
  | 'Theft'
  | 'Unauthorized Entry'
  | 'Fire'
  | 'Medical Emergency'
  | 'Property Damage'
  | 'Suspicious Activity'
  | 'Other';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Reported' | 'Under Review' | 'Resolved' | 'Rejected';

export interface IncidentItem {
  id: string;
  title: string;
  incidentType: IncidentType;
  priority: PriorityLevel;
  location: string;
  dateTime?: string;
  date: string;
  time: string;
  status: IncidentStatus;
  description: string;
  imageUrl?: string;
  reportedBy: string;
}

interface IncidentState {
  incidents: IncidentItem[];
}

const initialState: IncidentState = {
  incidents: [],
};

export const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    addNewIncident: (state, action: PayloadAction<IncidentItem>) => {
      state.incidents.unshift(action.payload);
    },

    setIncidents: (state, action: PayloadAction<IncidentItem[]>) => {
      state.incidents = action.payload;
    },

    updateIncidentStatus: (
      state,
      action: PayloadAction<{ id: string; status: IncidentStatus }>
    ) => {
      const incident = state.incidents.find(
        (inc) => inc.id === action.payload.id
      );
      if (incident) {
        incident.status = action.payload.status;
      }
    },

  },
});

export const { addNewIncident, updateIncidentStatus, setIncidents } = incidentSlice.actions;
export default incidentSlice.reducer;