import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: string;
  rank: string;
  xp: number;
  strikeCount: number;
  safeDaysLeft: number;
  totalWorkouts: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => api.get<Profile>("/me"),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ["profile", "badges"],
    queryFn: () => api.get<Badge[]>("/profile/badges"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => api.put<Profile>("/profile", data),
    onSuccess: (newProfile) => {
      queryClient.setQueryData(["profile", "me"], newProfile);
    },
  });
}

export function useSafeDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<Profile>("/profile/use-safe-day", {}),
    onSuccess: (newProfile) => {
      queryClient.setQueryData(["profile", "me"], newProfile);
    },
  });
}
