export interface AuthResult {
  success: boolean;
  error?: string;
  user?: { id: string; name: string; email?: string };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (email === 'test@example.com' && password === 'password') {
    return { success: true, user: { id: '1', name: 'Test User', email } };
  }
  return { success: false, error: 'Invalid email or password' };
}

export async function register(email: string, password: string, name: string, role: string): Promise<AuthResult> {
  if (email && password && name) {
    return { success: true, user: { id: '2', name, email } };
  }
  return { success: false, error: 'Missing registration fields' };
}

export async function logout(): Promise<void> {
  // TODO: Implement logout logic (e.g., clear tokens, call API)
  return;
}