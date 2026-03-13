import { MediaType } from "./MediaType";
export interface MessageMedia {
  mediaId?:   string;
  messageId:  string;
  mediaType:  MediaType;
  url:        string;
  fileName?:  string;
  sizeBytes?: number;
}