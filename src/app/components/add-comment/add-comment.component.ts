import { RecaptchaService } from './../../common/services/RecaptchaService';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommentCustomValidator } from '../../common/services/ValidatorService/CommentCustomValidator';
import { ImageProcessor } from '../../common/services/ImageService/ImageProcessor';
import { CreateCommentDto } from '../../common/models/CreateCommentDto';
import { UserComment } from '../../common/models/UserComment';
import { CommentUtilityService } from '../../common/services/CommentUtility/CommentUtilityService';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
})
export class AddCommentComponent {
  @Output() commentAdded = new EventEmitter<CreateCommentDto>();
  @Input() parentComment?: UserComment;
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
    toolbar: [['bold', 'italic', 'underline'], ['blockquote'], [{ list: 'ordered' }], ['clean']],
  };

  constructor(
    private fb: FormBuilder,
    private commentValidator: CommentCustomValidator,
    private imageProcessor: ImageProcessor,
    private recaptchaService: RecaptchaService,
    private commentUtilityService: CommentUtilityService
  ) {
    this.addRecordForm = this.fb.group({
      userName: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      homePage: ['', [this.commentValidator.optionalUrlValidator()]],
      text: ['', [Validators.required, this.commentValidator.allowedHtmlValidator()]],
      image: [null],
      textFile: [null],
    });
  }

  

  onImageSelected(event: Event): void {
    this.imageInput = event.target as HTMLInputElement;
    if (this.imageInput.files && this.imageInput.files.length > 0) {
      const file = this.imageInput.files[0];
      const validation = this.commentUtilityService.validateFile(file, ['image/jpeg', 'image/png', 'image/gif'], 500);

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
        .catch(() => {
          this.imageError = 'Error while processing image.';
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
      const validation = this.commentUtilityService.validateFile(file, ['text/plain'], 100);

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

  async onSubmit(): Promise<void> {
    try {
      const isCaptchaValid = await this.recaptchaService.VerifyCaptcha('submit');
      if (!this.isFormValid() || !isCaptchaValid) {
        this.markFormAsTouched();
        return;
      }
      const comment = this.createComment();
      this.commentAdded.emit(comment);
      this.resetFormAndFields();
    } catch (error) {
      console.error('Error while sending comment:', error);
    }
  }
  
  private isFormValid(): boolean {
    return this.addRecordForm.valid;
  }
  
  private markFormAsTouched(): void {
    this.addRecordForm.markAllAsTouched();
  }
  
  private createComment(): CreateCommentDto {
    const cleanText = this.commentUtilityService.sanitizeText(this.text?.value);
    return {
      text: cleanText,
      userName: this.userName?.value,
      email: this.email?.value,
      image: this.selectedImage,
      textFile: this.selectedTextFile,
      parentComment: this.parentComment,
      parentCommentId: this.parentComment?.id,
    };
  }
  
  private resetFormAndFields(): void {
    this.addRecordForm.reset();
    this.imagePreview = null;
    this.textFileContent = '';
    this.selectedImage = null;
    this.selectedTextFile = null;
  
    if (this.imageInput) {
      this.imageInput.value = '';
    }
    if (this.textInput) {
      this.textInput.value = '';
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
