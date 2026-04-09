import { MediaType } from "./MediaType";
import { Message } from "./Message";

export interface MessageMedia {
  mediaId?: string;
  message?: Message;
  mediaType: MediaType;
  url: string;
  fileName?: string;
  sizeBytes?: number;
  originalFileName?: string;
}