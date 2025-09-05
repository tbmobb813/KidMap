export interface ValidationError extends Error {
  errors?: string[];
}

export class CustomError extends Error {
  id: string;

  constructor(message: string, id: string) {
    super(message);
    this.id = id;
    this.name = 'CustomError';
  }
}