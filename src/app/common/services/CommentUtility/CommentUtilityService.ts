import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CreateCommentDto } from '../../models/CreateCommentDto';
import { User } from '../../models/User';
import { UserComment } from '../../models/UserComment';
@Injectable({
  providedIn: 'root',
})
export class CommentUtilityService {
  convertCreateCommentDtoToComment(commentDto: CreateCommentDto): UserComment {
    var user = new User(commentDto.userName, commentDto.email, commentDto.homePage);
    var comment = new UserComment(
      commentDto.text,
      user,
      new Date(),
      commentDto.image,
      commentDto.textFile,
      commentDto.parentComment
    );
    return comment;
  }
}
