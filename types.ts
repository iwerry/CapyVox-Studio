export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export enum TargetLanguage {
  English = 'English',
  Portuguese = 'Portuguese',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Japanese = 'Japanese',
  Korean = 'Korean',
  Catalan = 'Catalan',
}

export enum AppLanguage {
  EN = 'en',
  PT = 'pt',
  ES = 'es',
}

export enum VoiceTone {
  Standard = 'Standard',
  Epic = 'Epic',
  Joyful = 'Joyful',
  Serious = 'Serious',
  Melancholic = 'Melancholic',
  Mysterious = 'Mysterious',
}

export interface ProcessingState {
  isImproving: boolean;
  isGeneratingAudio: boolean;
  error: string | null;
}

export interface AudioResult {
  blob: Blob;
  url: string;
}