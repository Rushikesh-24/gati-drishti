export interface DashboardMetrics {
  activeTrains: number;
  predictionsUpdated: number;
  networkAlerts: number;
  predictionConfidence: number;
}

export const mockDashboardMetrics: DashboardMetrics = {
  activeTrains: 1248,
  predictionsUpdated: 18492,
  networkAlerts: 7,
  predictionConfidence: 94,
};
