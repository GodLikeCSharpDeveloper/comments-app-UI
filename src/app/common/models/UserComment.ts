import { User } from './User';

export class UserComment {
  id!: number;
  text: string;
  createdAt: Date;
  captcha: string;
  textFile?: File | null;
  image?: File | null;
  user: User;
  parentCommentId?: number;
  parentComment?: UserComment;
  replies: UserComment[];

  constructor(
    text: string = '',
    captcha: string = '',
    user: User = new User(),
    createdAt: Date = new Date(),
    image?: File | null,
    textFile?: File | null,
    parentComment?: UserComment,
    replies?: UserComment[]
  ) {
    this.text = text;
    this.captcha = captcha;
    this.user = user;
    this.createdAt = createdAt;
    this.image = image;
    this.textFile = textFile;
    this.parentComment = parentComment;
    this.replies = replies || [];
  }
}
