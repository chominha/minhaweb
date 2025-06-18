import { useState } from "react";

interface UseMutationState<T> {
  loading: boolean;
  data?: T;
  error?: Error | null;
}

type UseMutationResult<T> = [(data: any) => Promise<T | undefined>, UseMutationState<T>];

export default function useMutation<T = any>(
  url: string,
  method: "POST" | "PUT" = "POST"
): UseMutationResult<T> {
  const [state, setState] = useState<UseMutationState<T>>({
    loading: false,
    data: undefined,
    error: null,
  });

  async function mutation(data: any) {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error || 'Something went wrong');
      }
      
      setState(prev => ({ ...prev, data: json }));
      return json;
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error : new Error(String(error)) }));
      return undefined;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }

  return [mutation, { ...state }];
} 