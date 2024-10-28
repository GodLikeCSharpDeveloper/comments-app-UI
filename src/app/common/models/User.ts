import { UserComment } from "./UserComment";

export class User {
  id!: number;
  userName: string;
  email: string;
  homePage?: string;
  comments: UserComment[] = [];
  avatarUrl?: string;

  constructor(
    userName: string = '',
    email: string = '',
    homePage?: string,
    avatarUrl?: string,
    comments?: UserComment[]
  ) {
    this.userName = userName;
    this.email = email;
    this.homePage = homePage;
    this.avatarUrl = avatarUrl;
    this.comments = comments || [];
  }
}