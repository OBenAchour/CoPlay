import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService } from '../../../../Core/Services/Marketplace/listing.service';
import { Listing, ListingType } from '../../../../Core/Models/Marketplace/Listing';
import { NotificationService } from '../../../../Core/Services/Notification/notification.service';
import { ImageService } from '../../../../Core/Services/Marketplace/image.service';

interface ImagePreview {
  file: File;
  url: string;
  preview: string;
  uploading: boolean;
  progress: number;
}

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.css']
})
export class CreateListingComponent implements OnInit {
  listingForm: FormGroup;
  submitting = false;
  error: string | null = null;

  commissionRate = 0;
  commissionAmount = 0;
  totalWithCommission = 0;

  imagePreviews: ImagePreview[] = [];
  maxImages = 6;

  typeOptions = [
    { value: ListingType.SALE, label: 'Vente' },
    { value: ListingType.RENTAL, label: 'Location' },
    { value: ListingType.SERVICE, label: 'Service' }
  ];

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private router: Router,
    private notificationService: NotificationService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.calculateCommission();
    this.listingForm.valueChanges.subscribe(() => {
      this.calculateCommission();
    });
  }

  calculateCommission(): void {
    const type = this.listingForm.get('type')?.value as ListingType;
    const price = this.listingForm.get('price')?.value || 0;

    switch (type) {
      case ListingType.SALE:
        this.commissionRate = 0.05;
        break;
      case ListingType.RENTAL:
        this.commissionRate = 0.10;
        break;
      case ListingType.SERVICE:
        this.commissionRate = 0.15;
        break;
      default:
        this.commissionRate = 0.05;
    }

    this.commissionAmount = price * this.commissionRate;
    this.totalWithCommission = price + this.commissionAmount;
  }

  // ============ GESTION DES IMAGES ============

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = this.imageService.validateImageFile(file);

      if (!validation.valid) {
        this.notificationService.error(`❌ ${validation.error}`);
        return;
      }

      if (this.imagePreviews.length >= this.maxImages) {
        this.notificationService.warning('⚠️ Maximum ' + this.maxImages + ' images autorisées');
        return;
      }

      // Créer la prévisualisation locale
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push({
          file: file,
          url: '',
          preview: e.target.result,
          uploading: false,
          progress: 0
        });
        this.updateImagesArray();
      };
      reader.readAsDataURL(file);
    }
  }

  onImageUpload(image: ImagePreview): void {
    if (image.uploading) return;

    this.setUploadProgress(image, 0);

    this.imageService.uploadImage(image.file).subscribe({
      next: (response) => {
        image.url = response.imageUrl;
        image.uploading = false;
        image.progress = 100;
        this.notificationService.success('📷 Image téléchargée avec succès');
        this.updateImagesArray();
      },
      error: (err) => {
        image.uploading = false;
        image.progress = 0;
        this.notificationService.error('❌ Erreur lors du téléchargement de l\'image');
        console.error(err);
      }
    });
  }

  removeImage(index: number): void {
    const image = this.imagePreviews[index];
    if (image.uploading) {
      this.notificationService.warning('⚠️ Téléchargement en cours, patientez');
      return;
    }

    // Supprimer du tableau uniquement
    this.imagePreviews.splice(index, 1);
    this.updateImagesArray();
  }

  setUploadProgress(image: ImagePreview, progress: number): void {
    image.uploading = true;
    image.progress = progress;
  }

  updateImagesArray(): void {
    const imagesArray = this.imagePreviews
      .filter(img => img.url !== '')
      .map(img => img.url);

    this.listingForm.patchValue({ images: imagesArray });
  }

  clearImages(): void {
    this.imagePreviews = [];
    this.listingForm.patchValue({ images: [] });
  }

  // ============ SOUMISSION ============

  onSubmit(): void {
    if (this.listingForm.invalid) {
      this.listingForm.markAllAsTouched();
      this.notificationService.warning('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.submitting = true;
    this.error = null;

    const formValue = this.listingForm.value;
    const listingData: Partial<Listing> = {
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      price: formValue.price,
      category: formValue.category,
      images: formValue.images || []
    };

    this.listingService.createListing(listingData).subscribe({
      next: (created) => {
        this.submitting = false;
        this.notificationService.success('✅ Annonce créée avec succès !');
        this.router.navigate(['/marketplace', created.listingId]);
      },
      error: (err) => {
        this.submitting = false;
        if (err.error && err.error.message) {
          this.notificationService.error(`❌ Erreur : ${err.error.message}`);
        } else {
          this.notificationService.error('❌ Erreur lors de la création de l\'annonce');
        }
        console.error(err);
      }
    });
  }

  cancel(): void {
    if (confirm('Voulez-vous vraiment annuler ? Les données saisies seront perdues.')) {
      this.router.navigate(['/marketplace']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.listingForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.listingForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    if (field.hasError('maxlength')) {
      return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    }
    if (field.hasError('min')) {
      return `Valeur minimale : ${field.errors?.['min'].min}`;
    }
    return '';
  }

  getTotalImages(): number {
    return this.imagePreviews.length;
  }

  isMaxImagesReached(): boolean {
    return this.getTotalImages() >= this.maxImages;
  }
}
