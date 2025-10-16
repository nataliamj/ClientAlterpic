export interface ImageFile {
  id: string;
  name: string;
  file: File;
  previewUrl?: string;
  size: number;
  type: string;
  selected: boolean;
}

export interface Transformation {
  id: string;
  name: string;
  type: 'filter' | 'adjustment' | 'format';
  parameters?: any;
}

export interface ImageTransformationConfig {
  imageId: string;
  transformations: Transformation[];
  outputFormat: string;
}

export interface ImageTransformationRequest {
  imageId: string;
  transformations: Transformation[];
  outputFormat: string;
}

export interface BatchTransformationRequest {
  applyToAll: boolean;
  transformations?: Transformation[];
  outputFormat?: string;
  imageConfigs?: ImageTransformationConfig[];
  images?: string[]; // ✅ AGREGAR ESTA PROPIEDAD
}

export interface TransformationProgress {
  total: number;
  processed: number;
  percentage: number;
  status: 'processing' | 'completed' | 'error' | 'idle';
}

export interface TransformedImage {
  id: string;
  originalName: string;
  transformedName: string;
  downloadUrl: string;
  size: number;
  format: string;
}

export interface BatchResult {
  batchId: string;
  images: TransformedImage[];
  totalSize: number;
  imageCount: number;
  downloadZipUrl?: string;
}
export interface DownloadResponse {
  success: boolean;
  message: string;
  batchId?: string;
  downloadUrl?: string;
}