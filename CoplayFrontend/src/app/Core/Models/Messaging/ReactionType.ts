export enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  [ReactionType.LIKE]: '👍',
  [ReactionType.LOVE]: '❤️',
  [ReactionType.HAHA]: '😂',
  [ReactionType.WOW]: '😮',
  [ReactionType.SAD]: '😢',
  [ReactionType.ANGRY]: '😠'
};