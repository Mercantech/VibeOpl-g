const API_BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ukendt fejl" }));
    throw new Error(err.detail || `Fejl ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getConfig: () => request<{ discord_url: string }>("/config"),
  getAuthStatus: () => request<{ authenticated: boolean }>("/auth/status"),
  unlock: (password: string) =>
    request<{ ok: boolean }>("/auth/unlock", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  listProjects: () => request<import("./types").ProjectListItem[]>("/projects"),
  getProject: (id: number) => request<import("./types").Project>(`/projects/${id}`),
  createProject: (data: import("./types").ProjectFormData) =>
    request<import("./types").Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: number, data: import("./types").ProjectFormData) =>
    request<import("./types").Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: number) =>
    request<{ ok: boolean }>(`/projects/${id}`, { method: "DELETE" }),
  listComments: (projectId: number) =>
    request<import("./types").Comment[]>(`/projects/${projectId}/comments`),
  createComment: (
    projectId: number,
    data: { author_name: string; author_school: string; author_email: string; body: string }
  ) =>
    request<import("./types").Comment>(`/projects/${projectId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  uploadImage: async (file: File): Promise<{ path: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/uploads/image`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload fejlede" }));
      throw new Error(err.detail);
    }
    return res.json();
  },
};

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/api/media/${path}`;
}
