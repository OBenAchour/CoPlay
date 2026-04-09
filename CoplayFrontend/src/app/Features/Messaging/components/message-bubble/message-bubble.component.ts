import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from 'src/app/Core/Models/Messaging/Message';
import { MessagingService } from 'src/app/Core/Services/Messaging/messaging.service';
import { ReactionType, REACTION_EMOJIS } from 'src/app/Core/Models/Messaging/ReactionType';

@Component({
  selector: 'app-message-bubble',
  templateUrl: './message-bubble.component.html',
  styleUrls: ['./message-bubble.component.css']
})
export class MessageBubbleComponent implements OnInit {
  @Input() message!: Message;
  @Input() isOwn = false;
  @Input() currentUserId: string = '';

  showReactionMenu = false;
  showOptionsMenu = false;
  reactionSummary: { counts: any; total: number; userReaction?: string } = { counts: {}, total: 0 };

  isEditing = false;
  editContent = '';

  reactionTypes = Object.values(ReactionType) as ReactionType[];
  reactionEmojis = REACTION_EMOJIS;

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.loadReactionSummary();
  }

  loadReactionSummary(): void {
    if (!this.message.messageId) return;
    
    this.messagingService.getReactionSummary(this.message.messageId).subscribe({
      next: (summary) => {
        this.reactionSummary = summary;
      },
      error: (err) => console.error('Error loading reactions:', err)
    });
  }

  toggleReactionMenu(): void {
    this.showReactionMenu = !this.showReactionMenu;
    this.showOptionsMenu = false;
  }

  toggleOptionsMenu(): void {
    this.showOptionsMenu = !this.showOptionsMenu;
    this.showReactionMenu = false;
  }

  addReaction(reactionType: ReactionType): void {
    if (!this.message.messageId) return;
    
    if (this.reactionSummary.userReaction === reactionType.toString()) {
      this.removeReaction();
      return;
    }
    
    this.messagingService.addReaction(this.message.messageId, reactionType).subscribe({
      next: () => {
        this.showReactionMenu = false;
        this.loadReactionSummary();
      },
      error: (err) => console.error('Error adding reaction:', err)
    });
  }

  removeReaction(): void {
    if (!this.message.messageId) return;
    
    this.messagingService.removeReaction(this.message.messageId).subscribe({
      next: () => {
        this.loadReactionSummary();
      },
      error: (err) => console.error('Error removing reaction:', err)
    });
  }

  startEdit(): void {
    this.editContent = this.message.content || '';
    this.isEditing = true;
    this.showOptionsMenu = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editContent = '';
  }

  saveEdit(): void {
    if (!this.message.messageId || !this.editContent.trim()) return;
    
    this.messagingService.updateMessage(this.message.messageId, this.editContent).subscribe({
      next: (updatedMessage) => {
        this.message.content = updatedMessage.content;
        this.message.isEdited = updatedMessage.isEdited;
        this.message.editedAt = updatedMessage.editedAt;
        this.isEditing = false;
      },
      error: (err) => console.error('Error editing message:', err)
    });
  }

  deleteMessage(): void {
    if (!this.message.messageId) return;
    
    if (confirm('Supprimer ce message ?')) {
      this.messagingService.deleteMessage(this.message.messageId).subscribe({
        next: (deletedMessage) => {
          this.message.isDeleted = deletedMessage.isDeleted;
          this.showOptionsMenu = false;
        },
        error: (err) => console.error('Error deleting message:', err)
      });
    }
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  hasUserReacted(): boolean {
    return !!this.reactionSummary.userReaction;
  }

  getDisplayReactions(): { type: ReactionType; count: number }[] {
    const display: { type: ReactionType; count: number }[] = [];
    if (this.reactionSummary.counts) {
      for (const type of Object.values(ReactionType)) {
        const count = this.reactionSummary.counts[type];
        if (count > 0) {
          display.push({ type, count });
        }
      }
    }
    return display;
  }
}