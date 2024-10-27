import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserComment } from '../../common/models/UserComment';
import { User } from '../../common/models/User';
import { QuillModule } from 'ngx-quill';
import { CommentCustomValidator } from '../../common/services/ValidatorService/CommentCustomValidator';
import { ImageProcessor } from '../../common/services/ImageService/ImageProcessor';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent {
  @Output() commentAdded = new EventEmitter<UserComment>();

  addRecordForm: FormGroup;

  captchaImageUrl: string = '';

  selectedImage: File | null = null;
  imageError: string = '';
  imagePreview: string | ArrayBuffer | null = null;

  selectedTextFile: File | null = null;
  textFileError: string = '';
  textFileContent: string = '';
  
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'], 
      ['blockquote'],   
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']                             
    ]
  };

  constructor(
    private fb: FormBuilder,
    private commentValidator: CommentCustomValidator,
    private imageProcessor: ImageProcessor
  ) {
    this.addRecordForm = this.fb.group({
      userName: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      homePage: ['', [this.commentValidator.optionalUrlValidator()]],
      captcha: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      text: ['', [Validators.required, this.commentValidator.allowedHtmlValidator()]],
      image: [null],
      textFile: [null],
    });


    this.refreshCaptcha();
  }

  refreshCaptcha(): void {
    this.captchaImageUrl = `assets/captcha/${Date.now()}.png`;
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validation = this.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 500);

      if (!validation.valid) {
        this.imageError = validation.error!;
        this.selectedImage = null;
        this.addRecordForm.patchValue({ image: null });
        input.value = '';
        this.imagePreview = null;
        return;
      } else {
        this.imageError = '';
      }
      this.imageProcessor.processImage(file, 320, 240).then(resizedBlob => {
        if (resizedBlob) {
          const resizedFile = new File([resizedBlob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          this.selectedImage = resizedFile;
          this.addRecordForm.patchValue({ image: resizedFile });
          
          const previewReader = new FileReader();
          previewReader.onload = () => {
            this.imagePreview = previewReader.result;
          };
          previewReader.readAsDataURL(resizedFile);
        }
      }).catch(error => {
        this.imageError = 'Ошибка при обработке изображения.';
        this.selectedImage = null;
        this.addRecordForm.patchValue({ image: null });
        input.value = '';
      });
    }
  }

  onTextFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validation = this.validateFile(file, ['text/plain'], 100);

      if (!validation.valid) {
        this.textFileError = validation.error!;
        this.selectedTextFile = null;
        this.addRecordForm.patchValue({ textFile: null });
        input.value = '';
        return;
      } else {
        this.textFileError = '';
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.textFileContent = reader.result as string;
        this.selectedTextFile = file;
        this.addRecordForm.patchValue({ textFile: file });
      };
      reader.readAsText(file);
    }
  }

  onSubmit(): void {
    if (this.addRecordForm.valid) {
      const cleanText = DOMPurify.sanitize(this.text?.value, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'blockquote', 'ul', 'ol', 'li', 'a'],
        ALLOWED_ATTR: ['href', 'title', 'target']
      });
      const comment = new UserComment(
        this.text?.value,
        this.captcha?.value,
        new User(this.userName?.value, this.email?.value),
        new Date(),
        this.selectedImage,
        this.selectedTextFile
      );
      this.commentAdded.emit(comment);
      console.log(comment);
      this.addRecordForm.reset();
      this.imagePreview = null;
      this.textFileContent = '';
      this.selectedImage = null;
      this.selectedTextFile = null;

      this.refreshCaptcha();
    } else {
      this.addRecordForm.markAllAsTouched();
    }
  }

  get userName(): AbstractControl | null {
    return this.addRecordForm.get('userName');
  }

  get email(): AbstractControl | null {
    return this.addRecordForm.get('email');
  }

  get homePage(): AbstractControl | null {
    return this.addRecordForm.get('homePage');
  }

  get captcha(): AbstractControl | null {
    return this.addRecordForm.get('captcha');
  }

  get text(): AbstractControl | null {
    return this.addRecordForm.get('text');
  }

  get imageControl(): AbstractControl | null {
    return this.addRecordForm.get('image');
  }

  get textFileControl(): AbstractControl | null {
    return this.addRecordForm.get('textFile');
  }

  openImageLightbox(): void {
  }
}
