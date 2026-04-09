package com.example.coplaybackend.Entities.Messaging;



    public enum ReactionType {
        THUMBS_UP("👍"),
        THUMBS_DOWN("👎"),
        HEART("❤️"),
        LAUGHING("😂"),
        WOW("😮"),
        SAD("😢"),
        CLAP("👏"),
        FIRE("🔥"),
        EYES("👀"),
        THINKING("🤔"),
        HUNDRED("💯"),
        MUSCLE("💪"),
        PARTY("🎉"),
        PRAY("🙏");

        private final String emoji;

        ReactionType(String emoji) {
            this.emoji = emoji;
        }

        public String getEmoji() {
            return emoji;
        }
    }

