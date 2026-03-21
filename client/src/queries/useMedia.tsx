import { useMutation } from "@tanstack/react-query";
import { mediaApiRequest } from "../app/apiRequests/media";

export const useUploadMediaMutation = () => {
  return useMutation({
    mutationFn: mediaApiRequest.upload,
  });
};
