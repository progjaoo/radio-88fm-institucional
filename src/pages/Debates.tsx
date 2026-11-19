import { Navigate, useLocation } from "react-router-dom";
import { legacyDebateQuery } from "@/services/video-contents";

export default function Debates() {
  const location = useLocation();
  return <Navigate to={{ pathname: "/conteudos", search: legacyDebateQuery(location.search), hash: location.hash }} replace />;
}
