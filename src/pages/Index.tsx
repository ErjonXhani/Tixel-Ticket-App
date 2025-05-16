
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/splash");
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default Index;
