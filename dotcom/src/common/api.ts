import z from 'zod';

export type TokenInfo = z.infer<typeof TokenInfo>;

export const TokenInfo = z.object({
  expiresAt: z.number(),
  token: z.string(),
});

export type PostTokenRequest = z.infer<typeof PostTokenRequest>;

export const PostTokenRequest = z.object({
  username: z.string(),
  password: z.string(),
});

export type PostTokenResponse = z.infer<typeof PostTokenResponse>;

export const PostTokenResponse = z.union([
  z.object({
    success: z.literal(false),
  }),
  z.object({
    success: z.literal(true),
    tokenInfo: TokenInfo,
  }),
]);

export type GetTokenResponse = z.infer<typeof GetTokenResponse>;

export const GetTokenResponse = z.union([
  z.object({
    valid: z.literal(false),
  }),
  z.object({
    valid: z.literal(true),
    tokenInfo: TokenInfo,
  }),
]);

export type PostEmailRequest = z.infer<typeof PostEmailRequest>;

export const PostEmailRequest = z.object({
  subject: z.string(),
  message: z.string(),
});
