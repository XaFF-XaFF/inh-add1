import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getHistory, saveBattle } from '@/services/history-db';

export function useHistory() {
  return useQuery({ queryKey: ['history'], queryFn: getHistory });
}

export function useSaveBattle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveBattle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['history'] }),
  });
}
