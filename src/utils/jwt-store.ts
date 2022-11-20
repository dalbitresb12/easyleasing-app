export class JwtStore {
  static readonly key = "JWT_TOKEN";

  static save(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.key, token);
        resolve(true);
      } catch (err) {
        reject(false);
      }
    });
  }

  static get(): Promise<string | null> {
    return new Promise(resolve => {
      const token = localStorage.getItem(this.key);
      resolve(token);
    });
  }

  static async exists(): Promise<boolean> {
    const token = await this.get();
    return token !== null;
  }

  static clear(): Promise<boolean> {
    return new Promise(resolve => {
      localStorage.removeItem(this.key);
      resolve(true);
    });
  }
}
