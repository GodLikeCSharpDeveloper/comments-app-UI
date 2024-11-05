import { User } from './User';

export class UserComment {
  id!: number;
  text: string;
  createdAt: Date;
  textFile?: File | null;
  image?: File | null;
  user: User;
  parentCommentId?: number;
  parentComment?: UserComment;
  replies: UserComment[];
  imageUrl?: string;
  textUrl?: string;

  constructor(
    text: string = '',
    user: User = new User(),
    createdAt: Date = new Date(),
    image?: File | null,
    textFile?: File | null,
    parentComment?: UserComment,
    replies?: UserComment[],
    imageUrl?: string,
    textUrl?: string
  ) {
    this.text = text;
    this.user = user;
    this.createdAt = createdAt;
    this.image = image;
    this.textFile = textFile;
    this.parentComment = parentComment;
    this.replies = replies || [];
    this.imageUrl = imageUrl;
    this.textUrl = textUrl;
  }
}
