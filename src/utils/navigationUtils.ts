import { useNavigate } from "react-router-dom";

export const useClientNavigation = () => {
  const navigate = useNavigate();

  const navigateToClientChat = (clientSessionId: string) => {
    navigate(`/chats?selectedChat=${clientSessionId}`);
  };

  const navigateToClientDetail = (clientId: string) => {
    navigate(`/clients?clientId=${clientId}`);
  };

  return {
    navigateToClientChat,
    navigateToClientDetail,
  };
};
