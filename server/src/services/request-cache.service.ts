const pendingRequests = new Map<
  string,
  Promise<unknown>
>();

export const getOrCreateRequest = async <T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> => {
  const existingRequest =
    pendingRequests.get(key);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const newRequest = request();

  pendingRequests.set(
    key,
    newRequest,
  );

  try {
    return await newRequest;
  } finally {
    pendingRequests.delete(key);
  }
};