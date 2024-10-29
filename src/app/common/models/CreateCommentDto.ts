export class CreateCommentDto {
  constructor(
    public text: string,
    public captcha: string,
    public userName: string,
    public email: string,
    public homePage?: string,
    public image?: File | null,
    public textFile?: File | null,
    public parentCommentId?: number
  ) {}
}
