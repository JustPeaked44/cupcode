export const fields = [
  "Decaf",
  "Shots",
  "Syrup",
  "Milk",
  "Custom",
  "Drink",
] as const;
export type Field = (typeof fields)[number];
export const infoFields = [
  "Customer Name",
  "To-Go / Carrier Bag",
  "Other",
] as const;
export type InputField = Field | (typeof infoFields)[number];
export type Attempt = Record<InputField, string>;
export type Temperature = "Hot" | "Iced" | "Blended";
export interface Mark {
  code: string;
  meaning: string;
  reason: string;
  placement?: "before" | "over";
  modifier?: string;
}
export interface Modification {
  id: string;
  phrase: string;
  field: Field;
  mark: Mark;
  source: string;
  temperatures?: Temperature[];
}
export interface Recipe {
  id: string;
  name: string;
  category: string;
  code: string;
  temperatures: Temperature[];
  sizes: readonly string[];
  ingredients: string[];
  modifications: string[];
  source: string;
}
export interface Beverage {
  id: string;
  recipe: Recipe;
  size: string;
  temperature: Temperature;
  modifications: Modification[];
  markings: Partial<Record<Field, Mark>>;
  phrase: string;
}
export interface Scenario {
  id: string;
  customer: string;
  toGo: boolean;
  bag: boolean;
  beverages: Beverage[];
  dialogue: string;
  signature: string;
  voiceVariant: number;
}
