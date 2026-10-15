import { Platform } from "react-native";

/*
 * COMO CONFIGURAR:
 * - No navegador: localhost funciona.
 * - Android Emulator: 10.0.2.2 aponta para o PC.
 * - Celular físico: troque DEVICE_IP pelo IPv4 do seu PC,
 *   por exemplo: "192.168.1.15".
 *
 * O celular e o PC precisam estar na mesma rede Wi-Fi.
 */
const DEVICE_IP = "192.168.1.100";

function getBaseUrl() {
  if (Platform.OS === "web") return "http://localhost:8080";
  if (Platform.OS === "android") return `http://${DEVICE_IP}:8080`;
  return `http://${DEVICE_IP}:8080`;
}

export const API = getBaseUrl();

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao consultar ${path}`);
  }
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ${response.status}`);
  }
  return response.json();
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erro ${response.status}`);
  }
  return response.json();
}
