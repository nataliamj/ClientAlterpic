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
  // Cuando applyToAll es true, usamos transformations y outputFormat general
  transformations?: Transformation[];
  outputFormat?: string;
  // Cuando applyToAll es false, usamos imageConfigs para configuraciones individuales
  imageConfigs?: ImageTransformationConfig[];
}

export interface TransformationProgress {
  total: number;
  processed: number;
  percentage: number;
  status: 'processing' | 'completed' | 'error';
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