import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export function Assignments() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/triage"); }, [navigate]);
  return null;
}