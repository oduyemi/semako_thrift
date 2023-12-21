import { LoginForm } from "../../components/Forms";

const Login = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoginForm onLogin={onLogin} />
    </div>
  );
};

export default Login;
