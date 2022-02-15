export function JSONParse(data: string, defaultValue: any = null) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}
