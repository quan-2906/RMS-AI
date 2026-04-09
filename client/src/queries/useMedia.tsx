import { useMutation } from "@tanstack/react-query";
import { mediaApiRequest } from "../apiRequests/media";

export const useUploadMediaMutation = () => {
  return useMutation({
    mutationFn: mediaApiRequest.upload,
  });
};
