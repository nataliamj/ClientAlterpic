export interface TransformationHistory {
  id_transformacion: number;
  id_imagen: number;
  tipo: string;
  parametros: string;
  orden: number;
  fecha_creacion: string;
  fecha_formateada?: string;
  parametros_parsed?: any;
}

export interface HistoryResponse {
  success: boolean;
  data: TransformationHistory[];
  message?: string;
}