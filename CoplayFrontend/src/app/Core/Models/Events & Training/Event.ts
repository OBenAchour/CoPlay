import { EventStatus } from "./EventStatus";
export interface Event {
  eventId?:     string;
  teamId:       string;
  title:        string;
  startDate:    string;
  endDate?:     string;
  locationId?:  string;
  location?:    Location;     // objet joint
  status?:      EventStatus;
  isPublic?:    boolean;
  attendeeIds?: string[];
}