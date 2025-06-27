import axios from "axios";

export const axiosBaseQuery =
  ({ baseUrl = "", prepareHeaders } = {}) =>
  async ({ url, method, data, params }, api) => {
    try {
      let headers = {};

      if (prepareHeaders) {
        // Pass headers and api (which contains getState, dispatch, etc.)
        headers = prepareHeaders(headers, api) || headers;
      }

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
