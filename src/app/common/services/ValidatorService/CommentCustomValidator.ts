import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export class CommentCustomValidator {
  optionalUrlValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      const valid = urlPattern.test(control.value);
      return valid ? null : { invalidUrl: { value: control.value } };
    };
  }

  allowedHtmlValidator(): ValidatorFn {
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'blockquote', 'li', 'ol', 'span'];
    const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      let match;
      while ((match = tagRegex.exec(value)) !== null) {
        const tagName = match[1].toLowerCase();
        if (!allowedTags.includes(tagName)) {
          return { invalidHtml: { value: match[0], tagName } };
        }
      }
      return null;
    };
  }

  validateFile(file: File, allowedTypes: string[], maxSizeInKB: number): { valid: boolean, error: string | null } {
    if (!file) {
      return { valid: false, error: 'Файл не выбран.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}.` };
    }

    const fileSizeInKB = file.size / 1024;
    if (fileSizeInKB > maxSizeInKB) {
      return { valid: false, error: `Размер файла превышает допустимые ${maxSizeInKB}KB.` };
    }

    return { valid: true, error: null };
  }
}
