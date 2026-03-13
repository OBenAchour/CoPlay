export interface RefreshToken {
  tokenId?:   string;
  userId:     string;
  tokenHash:  string;
  expiresAt:  string;
  isRevoked?: boolean;
  createdAt?: string;
}