import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommentCustomValidator } from '../../common/services/ValidatorService/CommentCustomValidator';
import { ImageProcessor } from '../../common/services/ImageService/ImageProcessor';
import DOMPurify from 'dompurify';
import { CreateCommentDto } from '../../common/models/CreateCommentDto';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent {
  @Output() commentAdded = new EventEmitter<CreateCommentDto>();
  @Input() parentCommentId?: number;
  addRecordForm: FormGroup;

  captchaImageUrl: string = '';

  selectedImage: File | null = null;
  imageError: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  @Input() useLargeTemplate: boolean = true;
  selectedTextFile: File | null = null;
  textFileError: string = '';
  textFileContent: string = '';
  textInput?: HTMLInputElement;
  imageInput?: HTMLInputElement;
  quillModules = {
    toolbar: [['bold', 'italic', 'underline'], ['blockquote'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']],
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

  validateFile(file: File, allowedTypes: string[], maxSizeInKB: number): { valid: boolean; error: string | null } {
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
    this.imageInput = event.target as HTMLInputElement;
    if (this.imageInput.files && this.imageInput.files.length > 0) {
      const file = this.imageInput.files[0];
      const validation = this.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 500);

      if (!validation.valid) {
        this.imageError = validation.error!;
        this.selectedImage = null;
        this.addRecordForm.patchValue({ image: null });
        this.imageInput.value = '';
        this.imagePreview = null;
        return;
      } else {
        this.imageError = '';
      }
      this.imageProcessor
        .processImage(file, 320, 240)
        .then(resizedBlob => {
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
        })
        .catch(error => {
          this.imageError = 'Ошибка при обработке изображения.';
          this.selectedImage = null;
          this.addRecordForm.patchValue({ image: null });
          if (this.imageInput) this.imageInput.value = '';
        });
    }
  }

  onTextFileSelected(event: Event): void {
    this.textInput = event.target as HTMLInputElement;
    if (this.textInput.files && this.textInput.files.length > 0) {
      const file = this.textInput.files[0];
      const validation = this.validateFile(file, ['text/plain'], 100);

      if (!validation.valid) {
        this.textFileError = validation.error!;
        this.selectedTextFile = null;
        this.addRecordForm.patchValue({ textFile: null });
        this.textInput.value = '';
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
        ALLOWED_ATTR: ['href', 'title', 'target'],
      });
      const comment: CreateCommentDto = {
        text: cleanText,
        captcha: this.captcha?.value,
        userName: this.userName?.value,
        email: this.email?.value,
        image: this.selectedImage,
        textFile: this.selectedTextFile,
        parentCommentId: this.parentCommentId
      };
      this.commentAdded.emit(comment);
      console.log(comment);
      this.addRecordForm.reset();
      this.imagePreview = null;
      this.textFileContent = '';
      this.selectedImage = null;
      this.selectedTextFile = null;
      if (this.imageInput) this.imageInput.value = '';
      if (this.textInput) this.textInput.value = '';
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

  openImageLightbox(): void {}
}
