export interface AuditLog {
  logId?:       string;
  actorId:      string;
  action:       string;
  metaData?:    Record<string, any>;
  performedAt?: string;
}