import { useMutation } from "@tanstack/react-query";
import http from "@/lib/http";
import { AiChatBodyType, AiChatResType } from "@/schemaValidations/ai.schema";

const aiApiRequest = {
  chat: (body: AiChatBodyType) => http.post<AiChatResType>("/ai/chat", body),
};

export const useAiChatMutation = () => {
  return useMutation({
    mutationFn: aiApiRequest.chat,
  });
};
